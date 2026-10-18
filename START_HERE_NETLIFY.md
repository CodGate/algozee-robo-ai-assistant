# AlgoZee Robo - Netlify startup and access notes

- `/` now displays the **existing approved** Robo workspace immediately, without a login gate.
- `/login` is the separate existing email/password sign-in screen for provisioned customers/admins.
- `/admin` and `/admin/subscriptions` remain protected, and API authorization has NOT been bypassed.
- The workspace UI (`components/zevo/workspace.tsx`) and stylesheet (`app/globals.css`) are byte-for-byte identical to the reference frontend archive. No visual redesign has been applied.
- For guests, the workspace is visible, but protected chat, history, business data, and subscription API requests may respond `401` until sign-in; rendering the UI does not grant free API access.
- Customer email invitation / magic-link delivery, subscriptions and approval automation still require implementation or verification; do not claim these are operational.
- The existing password-based login requires a configured database and administrator credentials. See `NETLIFY_SETUP.md`.
- Keep `SITE_URL` set to the production Netlify URL; never add secrets to GitHub.

## Deploy
Replace the previous repo contents with this archive (without putting them in a nested directory), commit and push with GitHub Desktop. Netlify builds the linked branch. Verify `/` first, then `/login`, then authentication, subscription and each protected feature separately.
