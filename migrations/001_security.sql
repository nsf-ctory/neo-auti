-- Apply manually after review. PostgreSQL 14+.
BEGIN;
CREATE TABLE IF NOT EXISTS auti_users (
  id uuid PRIMARY KEY,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);
CREATE TABLE IF NOT EXISTS auti_access_tokens (
  token_hash text PRIMARY KEY CHECK (length(token_hash) = 64),
  user_id uuid NOT NULL REFERENCES auti_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auti_access_tokens_user_idx ON auti_access_tokens(user_id);
CREATE TABLE IF NOT EXISTS auti_voice_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auti_users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > started_at)
);
CREATE INDEX IF NOT EXISTS auti_voice_sessions_active_idx ON auti_voice_sessions(user_id, expires_at) WHERE ended_at IS NULL;
CREATE TABLE IF NOT EXISTS auti_daily_usage (
  user_id uuid NOT NULL REFERENCES auti_users(id) ON DELETE CASCADE,
  usage_day date NOT NULL,
  session_starts integer NOT NULL DEFAULT 0 CHECK (session_starts >= 0),
  reserved_seconds integer NOT NULL DEFAULT 0 CHECK (reserved_seconds >= 0),
  PRIMARY KEY(user_id, usage_day)
);
COMMIT;
