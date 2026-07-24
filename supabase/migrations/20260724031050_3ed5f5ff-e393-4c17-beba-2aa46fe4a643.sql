
-- Track additional payment info + source (stripe vs manual) on subscriptions
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'stripe';

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_session_id_key
  ON public.payments (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
