# BacklogIQ - Husky SmartDesk Product Owner Simulation

An interactive **educational prototype** about developing and refining a product backlog. Husky SmartDesk AI is the product being built; BacklogIQ is the simulated Product Owner assistant.

**What works today:** guided six-step story, stakeholder-request analysis using prewritten rules, manual Product Owner decisions, refinement, release-capacity constraints, scripted QA defects, interactive product preview, optional full workbench, local browser state and export/import.

**What does not exist yet:** true large-language-model analysis, user accounts, shared cloud database, integrations with UW systems, real support-ticket creation, a production authorization system, and real multiuser collaboration. This is a demonstration, not an officially supported UW service.

## What happens to data today?

The simulator runs in the browser and currently stores its session locally. Each visitor has their own separate browser session; it is **not shared between devices or users**. The browser can lose its local data if storage is cleared. Export important fictional sessions using the in-app export option.

**Never put passwords, tokens, private student records, company-confidential information or secret API keys in a public GitHub repository.** This is a public educational demo.

## Next step: Build a real MVP

Read `MVP_NEXT_STEPS.md` for a realistic incremental plan. You do not have to rebuild the user interface to start: reuse the current product journey and add secure persistence and a protected backend AI call. Split the self-contained HTML into separate application modules as you scale.
