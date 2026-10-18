# Robo by AlgoZee — manual subscriptions

## Implemented
Simple chat workspace; business profile and saved conversations per customer; browser English/Urdu voice; Gemini backend connection. Robo now uses its own email/password login, hashed passwords and expiring server sessions. ChatGPT authentication is removed.

Admin panel /admin/subscriptions: create customer, record received payment, activate/renew access, set plan name/duration/message allowance, reset password, suspend/restore account, review latest payment records. AI endpoints enforce expiry and message allowance on the server, including concurrent requests. Successful provider replies consume allowance; provider failures are refunded. Renewals extend from the later of current expiry and now, reset usage to zero and replace allowance. Suspended accounts lose sessions immediately. Restoring an account does not extend its subscription.

No payment gateway, automatic charges, automatic email, customer self-registration or self-service password recovery. Admin shares credentials and handles resets. Payment records do not prove receipt: verify payment yourself before activation. Suggested 30 days/300 messages in the form are editable defaults, not published sales plans.

## Hosting activation
This project still uses Cloudflare Workers and D1. A custom domain can be attached to compatible hosting; generic PHP-only shared hosting is not sufficient without porting the backend.
1. Retain existing database and encryption secrets. Apply 0003_zevo_customer_workspace.sql and 0004_robo_manual_subscriptions.sql to D1 using the hosting migration workflow. Existing runtime secrets/data are not in this ZIP.
2. Set ADMIN_EMAIL to your administrator email. Run `node scripts/robo-password-hash.mjs` in a private interactive terminal. Save its hash output as the runtime secret ROBO_ADMIN_PASSWORD_HASH. Never place the plaintext password in the project. The admin account is created on the first successful login. Changing this bootstrap secret later does not change an already-created account password.
3. Deploy over HTTPS. Secure session cookies require HTTPS. The cloudflare connecting-IP header is trusted only when served behind Cloudflare; do not expose the worker backend through an untrusted proxy.
4. Sign in as admin, configure Gemini at /admin, create a customer, verify manual payment and activate their plan. Customer sign-in uses the account you created.
5. Test a second customer, expiry, quota exhaustion, suspension and renewal on deployed hosting before selling access. New login IDs do not migrate histories saved under old platform accounts automatically.

## Voice and answer limits
Browser speech support varies; Urdu playback needs a matching installed voice. Tap to speak; final transcripts submit automatically. Audio may use remote browser speech services. No full-duplex or wake-word support. Business knowledge is text you supply; website crawling, document upload, live web search, CRM and WhatsApp actions are not connected. Review important decisions.

## Validation
TypeScript, production build, password hashing/verification and SQLite subscription limit/expiry checks are tested locally. Real D1 authentication/session behavior, provider calls and device voice need deployed end-to-end validation. Browser visual QA is unavailable here.


## Contacts, SIM calls, WhatsApp and email
Apply drizzle/0005_robo_contacts.sql to D1 before using Contacts & Communication. Names, international phone numbers and emails are private to each account. Voice contact search is in that page (not the general chat composer). Duplicate matches require a manual choice. Speech recognition depends on browser support.

SIM calls currently use tel: links to open the mobile dialer. They do not automatically connect, use desktop SIMs, or log completed calls. A separate Android app with appropriate phone permissions is required for that capability.

Draft links work without messaging API credentials and require Send in the external app. Direct sending is implemented server-side via Meta WhatsApp Cloud API and Resend email. No live credentials are included or verified. Email comes from a verified business sender, not an automatically connected Gmail inbox.

Set Cloudflare secret ROBO_COMMUNICATIONS_JSON to an object keyed by each customer's robo_users.id. Never expose this secret in browser code or commit it. Example shape with placeholders:
```json
{"CUSTOMER_USER_ID":{"whatsappToken":"META_TOKEN","phoneNumberId":"META_PHONE_NUMBER_ID","graphVersion":"CURRENT_SUPPORTED_META_VERSION","resendKey":"RESEND_API_KEY","from":"Business <hello@verified-domain.example>","dailyLimit":20}}
```
Use a currently supported graphVersion in vNUMBER.0 format. Each customer must have their own authorized sender credentials. Configure a verified sending domain in Resend. Meta account setup and recipient permissions are required. Free-form WhatsApp text only works during an eligible 24-hour customer service window; user confirms that window here, and Meta enforces its rules. Approved outbound templates and webhook delivery tracking are not implemented. Meeting emails send text only, not calendar invitations.

An active subscription is required for direct sends (administrators exempt). Combined WhatsApp/email attempts are capped per account per UTC day (default 20, maximum 100); rejected or uncertain attempts also count. This limits attempts, not exact spending. No automatic retries. Reused request IDs cannot duplicate a recorded send; email additionally uses provider idempotency. A timeout is marked unknown: check provider logs before retrying. Accepted means provider accepted, not delivered.

Before production: test two-account contact isolation, migration, mobile dialer, microphone, a permitted WhatsApp recipient and verified email recipient. Credentials and live provider tests are still needed.
