
# AITrade Access 授权系统

## 1. 启用 Lovable Cloud
存储用户、订阅、白名单、支付记录。

## 2. 数据库结构（migration）

- `profiles` — 用户资料（id → auth.users, email, created_at）
- `app_role` enum: `admin`, `member`
- `user_roles(user_id, role)` — 角色表（避免提权攻击），配 `has_role()` security definer 函数
- `subscriptions` — 授权记录
  - id, user_id, mt5_uid (unique index active), plan (basic/access/managed), status (active/expired/cancelled), started_at, expires_at, stripe_session_id, created_at, updated_at
- `payments` — 支付流水（stripe_session_id, user_id, amount, currency, status, created_at）

RLS：
- 用户读自己 profiles / subscriptions / payments
- Admin 可读写全部（用 has_role）
- 公开 API 用 service_role 查询白名单

触发器：新用户自动建 profile。

## 3. 认证
- Email/密码 + Google 登录（`supabase--configure_social_auth`）
- 管理员：数据库手动 insert `user_roles(user_id,'admin')`

## 4. Stripe 支付
- 用 `enable_stripe_payments`（推荐 Paddle 用户是马来西亚 RM 定价，但先跑 recommend）
- 三档产品：Basic RM199 / Access RM299 / Managed（联系）
- Checkout 流程：用户登录 → 选套餐 → 填 MT5 UID → 创建 Checkout Session → 支付成功
- Webhook `/api/public/webhooks/stripe`：验签 → 写 payment → 建/续 subscription（今天起 +30 天，如已有 active 则在 expires_at 上 +30 天）

## 5. 公开 EA 查询 API
`GET /api/public/check?uid=XXXXX`
返回：
```json
{ "authorized": true, "expires_at": "2026-08-17T...", "plan": "access" }
```
只查 `status='active' AND expires_at > now()`。用 service_role 内部查询，只返回必要字段。
加入定时任务思路：查询时顺便把过期的置为 expired（惰性）。

## 6. 前端路由
- `/` — 现有落地页（更新 CTA 按钮：登录后购买）
- `/auth` — 登录/注册（Email + Google）
- `/_authenticated/dashboard` — 用户端
  - 我的订阅（UID、套餐、到期时间、剩余天数）
  - 购买/续费按钮
  - 提交/修改 MT5 UID
- `/_authenticated/checkout/$plan` — 填 UID → Stripe Checkout
- `/_authenticated/checkout/success` — 支付回跳
- `/_authenticated/admin` — 管理后台（仅 admin）
  - 用户列表
  - 所有订阅（搜索 UID / email、手动开通/续期/停用）
  - 支付流水
  - 手动添加白名单（无需支付，用于测试或线下客户）

## 7. 首页更新
- 顶部导航加"登录/控制台"
- 三个套餐按钮 → 未登录跳 `/auth`，已登录跳 `/checkout/{plan}`
- Managed 保留 WhatsApp

## 8. 技术细节
- Server functions: `getMySubscription`, `createCheckoutSession(plan, mt5_uid)`, `adminListSubscriptions`, `adminUpsertSubscription`, `adminExpireSubscription`
- Server route: `/api/public/webhooks/stripe`（HMAC 验签）、`/api/public/check`（CORS 允许所有，EA 直接 GET）
- 到期计算：`new_expires = max(now, current_expires) + 30 days`

## 交付顺序
1. 启用 Cloud + Google 登录
2. 创建 schema + RLS + 角色
3. Auth 页面 + 用户 dashboard
4. Stripe 集成 + checkout + webhook
5. 公开 check API
6. Admin 后台
7. 首页 CTA 接通
