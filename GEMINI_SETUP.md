# Robo by AlgoZee — Gemini backend setup

## Scope and interface lock
This package preserves the reference UI (all existing `components/`, `app/` UI files and CSS are not changed). Changes are limited to the Gemini agent, chat API, assistant-actions backend, and a new SQL migration. The UI chat input is the interface for new text commands; there are **no new UI controls**.

## Configure
1. Deploy with an appropriate Cloudflare Workers/Vinext environment and a D1 binding named `DB`. A GitHub upload alone does not deploy the app.
2. Apply all migrations in the `drizzle/` directory, including `0005_robo_contacts.sql` and new `0006_robo_assistant_actions.sql`. Use your Cloudflare D1 deployment workflow; make backups before altering a production database.
3. Set `GEMINI_API_KEY` as a **server-side secret** and `GEMINI_MODEL=gemini-2.5-flash` (or another Gemini model supporting function calling). Never commit credentials.
4. Configure any required admin and session secrets used by the existing app; set up users and active subscriptions in the existing admin interface.
5. For direct email/WhatsApp delivery, provide the existing per-user `ROBO_COMMUNICATIONS_JSON` provider settings (Resend or WhatsApp Cloud API); consult existing communication API for field names.

## Chat commands
- “Find Ali in my contacts” -> `search_contacts` (requires a saved contact).
- “Draft an email to Ali saying the meeting is at 3 pm” -> `prepare_message`; Robo displays the exact recipient and message and supplies `CONFIRM SEND <id>`. Send is **never automatic**.
- “Create a task: prepare the agenda tomorrow at 2pm” -> `create_task`. For date-dependent commands, tell Robo your timezone. Stored tasks do not push notifications.
- “Show my open tasks” -> `list_tasks`.
- “Mark task <id> complete” -> `complete_task`.

For WhatsApp, after `CONFIRM SEND <id>`, Robo requests `CONFIRM WINDOW <id>`; issue that confirmation **only** when the contact has initiated a business conversation within the last 24 hours. Outside the service window, approved templates are required and this implementation does not send templates.

## Current boundaries
- Gemini general conversation, contact search, message preparation, explicit confirmation and tasks work **when properly deployed and configured**; live behavior remains unverified without a real environment.
- The pre-existing Contacts page can create/search/delete contacts and prepare and send communication using provider credentials.
- **Not included:** Google Calendar OAuth and live event scheduling, actual scheduled reminder delivery/push, arbitrary n8n workflow execution by chat, full autonomous web search or phone calls. Those require separate integrations, credentials and testing.
- Gemini API credentials alone cannot activate email, WhatsApp or calendar actions. Gemini answers are not guaranteed accurate.

## Validation
Run `node tests/verify-project.mjs`. This is a code/syntax/static-integrity check, **not** an end-to-end browser or provider integration test. Test customer authentication, D1 migrations, subscriptions, Gemini tool calls, provider permission and delivery status in staging before production use.
