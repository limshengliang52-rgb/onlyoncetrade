-- EA License table for MT5 remote authorization
CREATE TABLE public.ea_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text NOT NULL,
  email text,
  phone text,
  mt5_account_id text NOT NULL,
  uid text,
  product text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','suspended')),
  expires_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mt5_account_id, product)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ea_licenses TO authenticated;
GRANT ALL ON public.ea_licenses TO service_role;

ALTER TABLE public.ea_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ea_licenses" ON public.ea_licenses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ea_licenses_updated_at
  BEFORE UPDATE ON public.ea_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX ea_licenses_lookup_idx ON public.ea_licenses (mt5_account_id, product);
CREATE INDEX ea_licenses_expires_idx ON public.ea_licenses (expires_at);