# BacklogIQ Phase 3 — Gemini AI setup (no Copilot)

**Status:** Locally implemented and mock-tested. Not yet pushed to GitHub, deployed to Supabase, or tested with a real Gemini key. The live Phase 2C website remains unchanged.

## Files

- `cloud.html`: updated Cloud Projects page, including Analyze with Gemini, AI preview, Apply to editable Draft, and Discard. This replaces ONLY the repository-root `cloud.html` on a new development branch.
- `supabase/functions/analyze-backlog/index.ts`: server-side Supabase Edge Function that validates the signed-in user, checks project/request ownership with existing Supabase RLS, calls Gemini, and returns a proposed backlog item.
- `supabase/config.toml`: function-level configuration. The Edge Function **verifies JWTs in its code** via `/auth/v1/user`; the gateway's legacy `verify_jwt` check is set to false to support publishable keys. Do not disable authentication checks inside the function.
- `tests/phase3_test.cjs`: mocked server tests (no real credentials).

**No new database tables or migrations are needed in this phase.** The Phase 2C `backlog_items` table remains unchanged. Gemini suggestions are temporary until a Product Owner clicks Apply and then saves the Draft.

## Step 1 — Create a development branch on GitHub

1. Open `https://github.com/SunayanaHaz/backlogiq-demo`.
2. Click the branch selector (`main`), type **`phase3-ai-backlog`**, and choose **Create branch from main**.
3. Upload only the files from this package to that branch, preserving the folder structure. Replace `cloud.html` on **the development branch**, not `main`. You do not need to upload or replace `index.html` or the existing Phase 2C files.
4. Do not merge yet.

If using GitHub's web Upload files option: you may need to create the `supabase/functions/analyze-backlog/` directory using **Add file → Create new file** and enter the complete path as the filename. Uploading a folder from an extracted ZIP may work when dragging the folder into GitHub's upload area; check the final file paths before committing.

## Step 2 — Store the replacement Gemini key in Supabase

1. Open your existing Supabase project at `https://supabase.com/dashboard/project/dzrgdnvavypdokxcsbqr`.
2. Open **Edge Functions → Secrets** (sometimes under **Project Settings → Edge Functions → Secrets**).
3. Add a secret named **`GEMINI_API_KEY`**, and paste your newly created Google AI Studio key in Supabase's secret **Value** field.
4. Save. **Never paste the key into ChatGPT, `cloud.html`, GitHub, or screenshots.**
5. Optionally add `GEMINI_MODEL` with value `gemini-2.5-flash-lite` if that model is available to your account. Without this setting, the function defaults to `gemini-2.5-flash-lite`. Model and free-tier availability can change; choose an eligible free-tier model in Google AI Studio and change `GEMINI_MODEL` if necessary.

Supabase ordinarily supplies `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Edge Functions. If your project only supplies new-format keys, check that `SUPABASE_PUBLISHABLE_KEY` is available as an environment secret. Do not put a **service-role** or **secret** key in place of the publishable/anon key in this function.

## Step 3 — Deploy the Edge Function, without CLI

1. Supabase Dashboard → **Edge Functions** → **Deploy a new function** (or **Create function**) → **Via Editor**.
2. Name the function **exactly** `analyze-backlog`.
3. Open `supabase/functions/analyze-backlog/index.ts` from this package, copy the entire source into the Supabase editor, and click **Deploy**.
4. In the function's **Details/Settings**, turn **off** *Verify JWT with legacy secret* (sometimes labeled **Verify JWT**). This is intentional **only for this function**, since the function validates the bearer token using Supabase Auth and checks project/request ownership with RLS itself. Do not remove or bypass those checks.
5. Confirm the Edge Function appears as deployed. Do not test with a secret or bearer token in a screenshot.

If you deploy through the Supabase CLI instead, keep `supabase/config.toml` in your project and use `supabase functions deploy analyze-backlog --project-ref dzrgdnvavypdokxcsbqr`, with the CLI logged in to your own account. Do not commit `.env` or other secret-bearing files.

## Step 4 — Test the frontend *before merging*

1. Download the `phase3-ai-backlog` development branch as a ZIP and extract it on your Windows computer.
2. Open Command Prompt in the extracted repository folder containing `cloud.html` and run `py -m http.server 8000`.
3. Open `http://localhost:8000/cloud.html` in your browser.
4. Connect using your **Supabase project URL and public publishable key**; sign in to Account A.
5. Select **Husky SmartDesk AI**, choose an existing *fictional* stakeholder request, and click **Analyze with Gemini**.
6. Approve sending **fictional** request data and project goal to Google.
7. An AI suggestion should appear with a proposed title, item type, priority, acceptance criteria, rationale, and clarification questions.
8. Click **Use suggestion in editable Draft**. Verify the fields populate but nothing is automatically saved.
9. Edit a field, click **Save as Draft**, and reload the page to verify it persists.
10. Click Analyze again and then **Discard**; no new backlog item should be saved.
11. Repeat with Account B's own fictional project. Account B must not see Account A's requests or recommendations.

**Never use real student, patient, employee, or company-confidential data.** Gemini receives the project name, goal, stakeholder/source label, and selected request text; Google may process that data under its current API terms.

## Step 5 — Check known limitations before merging

- The free-tier API may reach provider limits (HTTP 429). The app displays a retry-later message.
- A model unavailable to your Google AI Studio project may generate an error. Confirm free-tier entitlement and update `GEMINI_MODEL` in Supabase Secrets if necessary.
- Gemini suggestions are probabilistic, not validated facts; Product Owner must review everything.
- No per-user quota, billing-limit enforcement, audit logs, or external-access readiness has been implemented. Test with fictional data on a controlled pilot only.
- Phase 2C direct cross-account API negative tests were deferred; they remain necessary before a real-user launch.
- Revoke the previously shared Supabase Account B session, if you have not already done so.
- Client-side login session remains browser-local in this prototype.

## Verification performed here

- `node --check` passed for extracted `cloud.html` JavaScript.
- `node tests/phase3_test.cjs` passed mock tests for rejecting bad tokens, cross-account project/request access, missing IDs, improper origins, incomplete AI responses, free-tier limits, and successful structured output.
- **No live Gemini call, Supabase Edge Function deployment, real RLS API verification, or GitHub merge has been performed by this package.**

## Reference documentation

- https://supabase.com/docs/guides/functions/quickstart-dashboard
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/functions/auth
- https://ai.google.dev/gemini-api/docs/structured-output
