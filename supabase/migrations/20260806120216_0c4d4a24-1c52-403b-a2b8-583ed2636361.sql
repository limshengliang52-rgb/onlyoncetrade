ALTER TABLE public.ea_licenses
  ADD COLUMN IF NOT EXISTS suspend_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspend_requested_by uuid,
  ADD COLUMN IF NOT EXISTS suspend_request_note text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS suspend_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspend_requested_by uuid,
  ADD COLUMN IF NOT EXISTS suspend_request_note text;