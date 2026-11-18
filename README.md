# BacklogIQ — Husky SmartDesk Product Owner Simulation

An interactive **educational prototype** about developing and refining a product backlog. Husky SmartDesk AI is the fictional product being built; BacklogIQ is the simulated Product Owner assistant.

**What works today:** guided six-step story, stakeholder-request analysis using prewritten rules, manual Product Owner decisions, refinement, release-capacity constraints, scripted QA defects, interactive product preview, optional full workbench, local browser state and export/import.

**What does not exist yet:** true large-language-model analysis, user accounts, shared cloud database, integrations with UW systems, real support-ticket creation, a production authorization system, and real multiuser collaboration. This is a demonstration, not an officially supported UW service.

## Publish to GitHub Pages without coding

1. Go to https://github.com and sign in (or create an account).
2. Select **+ > New repository** (or https://github.com/new).
3. Name it **backlogiq-demo**, choose **Public**, and select **Create repository**. You do not need to initialize the repository with a README, because the upload already contains one.
4. In this ZIP, **extract/unzip the files** on your computer. Do not upload the ZIP itself and expect GitHub to unzip it.
5. In your repository, choose **Add file > Upload files**. Upload **index.html**, **README.md**, and optionally **.nojekyll** (it might be hidden on Windows).
6. Save by committing the files to **main** (the wording may be **Commit changes** or a proposed change flow, depending on your GitHub account).
7. Select **Settings > Pages**, and in **Build and deployment**, select **Deploy from a branch**.
8. Set **Branch = main**, **Folder = /(root)**, and **Save**.
9. Once deployment finishes, GitHub Pages normally provides a link shaped like `https://YOUR-USERNAME.github.io/backlogiq-demo/` (replace the example with your actual username and repository name).
10. Open the link, perform the guided simulation, and try it from a different browser or phone.

Official documentation:
- https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## What happens to data today?

The simulator runs in the browser and currently stores its session locally. Each visitor has their own separate browser session; it is **not shared between devices or users**. The browser can lose its local data if storage is cleared. Export important fictional sessions using the in-app export option.

**Never put passwords, tokens, private student records, company-confidential information or secret API keys in a public GitHub repository.** This is a public educational demo.

## Next step: Build a real MVP

Read `MVP_NEXT_STEPS.md` for a realistic incremental plan. You do not have to rebuild the user interface to start: reuse the current product journey and add secure persistence and a protected backend AI call. Split the self-contained HTML into separate application modules as you scale.
