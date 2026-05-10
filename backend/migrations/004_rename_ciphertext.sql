-- CoreHealth migration 004 — rename misleading ciphertext column
-- The `ciphertext` column in hereditary_signals was named in anticipation of
-- client-side E2E encryption that has not yet been implemented.
-- Until encryption is added, the column stores plaintext — rename it to reflect reality.
-- Idempotent: silently skips if column was already renamed (e.g. was applied as 003 on live DB).
DO $$ BEGIN
  ALTER TABLE hereditary_signals RENAME COLUMN ciphertext TO condition_payload;
EXCEPTION WHEN undefined_column THEN NULL; END $$;
COMMENT ON COLUMN hereditary_signals.condition_payload IS 'Plaintext for now. TODO before launch: replace with client-side encrypted blob and implement proper E2EE key management.';
