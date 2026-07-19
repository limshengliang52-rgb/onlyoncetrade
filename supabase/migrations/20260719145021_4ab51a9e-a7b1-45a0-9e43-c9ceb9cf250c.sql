-- Add products array to subscriptions (which markets a UID is authorized for)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS products text[] NOT NULL DEFAULT ARRAY['xau']::text[];

-- Backfill: basic -> {xau}, access/pro -> {xau,btc}
UPDATE public.subscriptions
SET products = CASE
  WHEN plan::text IN ('access','pro') THEN ARRAY['xau','btc']::text[]
  ELSE ARRAY['xau']::text[]
END
WHERE products IS NULL OR array_length(products, 1) IS NULL;

CREATE INDEX IF NOT EXISTS subscriptions_products_gin ON public.subscriptions USING GIN (products);