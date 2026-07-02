INSERT INTO users (name, role, is_totp_setup, totp_secret)
VALUES
  ('alice', 'ADMIN', false, NULL),
  ('bob', 'USER', false, NULL),
  ('carol', 'USER', false, NULL)
ON CONFLICT (name) DO NOTHING;
