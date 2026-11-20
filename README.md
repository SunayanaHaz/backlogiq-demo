# BacklogIQ Phase 3 — Gemini integration patch

**Development-only patch for the `phase3-ai-backlog` branch.** Keep your Phase 2C GitHub code; upload only the files provided here. The website still uses GitHub Pages and the same Supabase tables.

Features:

1. An authenticated Product Owner selects an existing fictional stakeholder request and chooses **Analyze with Gemini**.
2. A Supabase Edge Function verifies identity and RLS-scoped project/request access, then calls Gemini using the private `GEMINI_API_KEY` secret.
3. The browser displays a temporary suggestion and clarification questions, with an explicit consent prompt.
4. **Use suggestion in editable Draft** populates—but never autosaves—the existing refinement form. The Product Owner reviews and saves manually.

No SQL migration or `index.html` changes are needed. For detailed steps, see **PHASE3_SETUP.md**.

**Don't deploy or merge** until you have tested locally and the function is available in your own Supabase project. The existing Guided Simulation remains scripted rather than a live AI workflow.
