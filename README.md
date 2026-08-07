# AITrade Access

制作一个专业、高质感的 AITrade EA 订阅网站，主题是 MT5 EA 自动交易权限服务。网站名称为 AITrade Access，主要卖点是会员通过 UID 授权方式开通 EA 使用权限，不是一次性卖文件。整体风格要偏高端、金融科技感、深色背景、金色点缀、简洁可信，不要太像普通课程网站。首页需要包含以下内容：第一屏说明「付月费开通 EA 权限，让系统按策略自动执行交易」，说明会员开通后把 EA 挂在自己的 MT5 账户，系统根据策略信号、风险比例和每日亏损保护自动执行。需要展示开通流程三步骤：1. 提交 MT5 UID，会员付款后提交交易账号 UID，我们把账号加入授权白名单；2. 开通 EA 权限，系统按月授权，到期自动停止权限，可选择黄金、BTC 或指定策略版本；3. 挂上 EA 自动执行，EA 按预设策略和风控执行交易，会员可以查看运行状态、风险设置与更新通知。需要有功能卖点：UID 授权管理、月费订阅权限、EA 策略版本更新、每日亏损保护、黄金 / BTC 模式、实盘前 Demo 验证。订阅方案需要三个卡片：Basic Access，优惠价 RM100，原价 RM299 划掉，适合先测试一个品种，包含 1 个 MT5 UID 授权、BTC 或黄金二选一、建议 500 USD 起始资金、默认风控参数；Pro Access，优惠价 RM299，原价 RM399 划掉，适合同时跑两个品种，包含 1 个 MT5 UID 授权、BTC 与黄金同时开启、建议 500 USD 起始资金、优先参数检查，并突出推荐；Managed Setup，价格写预约开通，适合需要协助安装与检查的人，包含远程 MT5 安装、账户风险检查、EA 权限配置、运行状态确认。页面必须清楚写出风险说明：EA 是执行工具，不是收益保证；交易结果会受市场、点差、滑点、网络和策略表现影响；建议先用 Demo 或小资金验证。还要特别加入「建议最低起始资金：500 USD」的说明，解释这是为了让 EA 的风控、止损距离和 MT5 最小手数有足够空间正常运行，低过 500 USD 也许可以挂上 EA，但实际风险比例可能会被最小手数放大，不适合直接实盘放大。最后需要一个 CTA 区块：提交 UID，开通你的 EA 月费权限，按钮为 WhatsApp 申请开通。整体设计要 responsive，手机也要好看，价格原价划掉要做得像精致折扣标签，横线可以稍微倾斜，有促销感但不要廉价。

11:38

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://onlyoncetrade.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fa1380a5-91bf-45f9-8a53-6acb38a612f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
