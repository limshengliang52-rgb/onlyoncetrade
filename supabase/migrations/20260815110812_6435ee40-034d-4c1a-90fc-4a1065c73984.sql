ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS renewal_pause_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS renewal_pause_requested_by uuid,
  ADD COLUMN IF NOT EXISTS renewal_pause_request_note text,
  ADD COLUMN IF NOT EXISTS renewal_pause_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS renewal_pause_rejected_at timestamptz;