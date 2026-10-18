# AlgoZee Robo — Netlify adapter

This package preserves frontend files exactly as uploaded and replaces the
Cloudflare-only `cloudflare:workers` imports used by API/auth/database modules.
It runs standard Next.js builds on Netlify. It has NOT been deployed or
end-to-end tested against your accounts.

## Steps
1. Upload the CONTENTS of this folder into the existing GitHub repository.
   Review the diff; do not add secrets or `.env` files. Commit and push.
2. Netlify → Project configuration → Developer settings → Build settings:
   Base directory: repository root; Build command `pnpm exec next build`;
   Publish directory `.next`. `netlify.toml` includes these defaults.
3. Netlify → Environment variables: add the following as server-only secrets:
   - `CLOUDFLARE_ACCOUNT_ID` (Cloudflare account ID)
   - `CLOUDFLARE_D1_DATABASE_ID` (EXISTING, migrated D1 database ID)
   - `CLOUDFLARE_D1_API_TOKEN` (restricted D1 SQL query permission token)
   - `CONFIG_ENCRYPTION_KEY` (base64 32-byte AES-GCM key used by existing config)
   - `ADMIN_EMAIL`, `ROBO_ADMIN_PASSWORD_HASH` (if admin login is wanted)
   - `GEMINI_API_KEY`, `GEMINI_MODEL` (for configured chat)
   - applicable communications / automation integration secrets.
4. Ensure D1 schema/migrations have already been applied to the remote database.
5. Deploy WITHOUT CACHE and inspect the build log. Test login, subscription,
   chat, conversations, automation, and communications before real usage.

## Limitations / security
- Cloudflare D1 remains the underlying DB (via Cloudflare's REST API). Netlify
  does NOT provision a new DB. Access requires valid Cloudflare credentials.
- D1 HTTP statements execute independently. This adapter does NOT implement
  atomic multi-statement transactions; do not rely on cross-statement atomicity.
- The D1 HTTP API may differ subtly from native D1 (especially SQLite blobs),
  and this adapter has not been integration tested. Additional changes may be
  required after checking Netlify logs and runtime functionality.
- API credentials are sensitive: configure via Netlify environment variables,
  not in source, frontend, or GitHub.
- Deploying a site does not automatically grant external email/WhatsApp access.
