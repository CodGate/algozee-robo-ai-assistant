# AlgoZee hybrid setup

## Working application
- `/`: customer chat and confirmed enquiry form.
- `/admin`: owner-only workspace. ADMIN_EMAIL must match the authenticated administrator.
- Order reads and changes are authorized server-side. Customer submission is separate.
- Customer consent is required before saving enquiries. AI never directly submits an order.

## Easy activation through the dashboard
Open /admin, then Settings. Enter your Gemini key/model and n8n production webhook URL/header secret. Save connections. Values are encrypted at rest using AES-GCM with a separate server runtime key. Existing secrets are never returned to the browser. Blank fields preserve existing values. Disconnect buttons remove the relevant connection. Test a customer message and confirmed enquiry after saving.

## Required runtime values (secrets stay server-side)
- CONFIG_ENCRYPTION_KEY: base64-encoded 32-byte encryption key; already configured in this private deployment. Do not rotate without migrating stored encrypted settings.
- ADMIN_EMAIL: authorized admin email; already configured in this private deployment.
- GEMINI_API_KEY: obtain through your own Google AI Studio account.
- GEMINI_MODEL: choose a currently available model your account can use; default gemini-2.5-flash.
- N8N_WEBHOOK_URL: HTTPS production webhook URL from your n8n instance.
- N8N_WEBHOOK_SECRET: a long random secret matching n8n Header Auth.

No Gemini key or n8n service was available during implementation. Guided responses and enquiry submission work without them. A configured connection is only marked successful after its request succeeds. AI input is sent to your selected provider; review its data terms before processing real customer information.

## n8n installation and activation
1. Use your own n8n Cloud account or separately host n8n. This Site cannot run n8n itself.
2. Import workflows/AlgoZee_Enquiry_Workflow.json in n8n.
3. Create Header Auth credentials: name X-AlgoZee-Secret; value a strong secret. Attach them to Confirmed enquiry.
4. Publish/activate the workflow and copy its production URL.
5. Open admin Settings and save N8N WEBHOOK URL and N8N WEBHOOK SECRET. No redeploy is needed for dashboard-saved settings.
6. Submit a dummy enquiry. Check the saved order and n8n execution. Only a matching accepted/eventId response counts as acknowledgment.

The included workflow validates the event and acknowledges receipt. It does NOT send email, update a CRM, or make calls. Add your chosen notification/CRM nodes and credentials before claiming those actions. Preserve eventId as the deduplication key; use a durable unique-key store before adding side effects or retries. The initial bridge has no notification side effects, so receipt retries do not send duplicate messages.

## Access and testing
This deployment remains private. Customer and admin UI are separate, but the demo is not yet accessible to anonymous clients. Publish public access only after reviewing protections, provider quotas, rate limiting, and administrator configuration. Do not expose n8n's editor to customers.

Test flow: customer chat -> enquiry form -> review -> confirm -> database record -> optional n8n acknowledgment -> admin status update.
AI provider failure returns a clearly labeled guided fallback. n8n failure leaves the enquiry saved with failed automation status. Administrator can retry a failed/unconfigured event through POST /api/automation/retry with {id:orderId}.

## Local setup
Node.js >=22.13 and pnpm required. Run pnpm install, pnpm run build, then apply the SQL migrations once in filename order using the README's local D1 migration command. Set administrator and integration environment values securely. Run pnpm start. Local preview does not simulate hosted ChatGPT identity; admin is intentionally denied without authenticated identity.
