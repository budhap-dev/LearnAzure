# Learn Azure

A self-paced, scenario-driven course on Microsoft Azure — from cloud basics through
compute, data, networking, security, DevOps, Azure AI, analytics and web and mobile clients — for an experienced engineer who
wants high-to-mid-level command of the platform to work with and guide a team.

- **Read the plan and curriculum:** [PLAN.md](PLAN.md)
- **The app:** `web/` — React 19 + TypeScript + Vite. Works on a phone or a laptop.

## Run it locally

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run verify     # content checks: lessons, quizzes, icons, diagrams, glossary
npm run build      # production build in web/dist
```

## Deploy

Every merge to `main` builds and deploys to GitHub Pages at
https://budhap-dev.github.io/LearnAzure/. The repository's Pages source is set to
*GitHub Actions*, and CI builds with `BASE_PATH=/LearnAzure/`. The app uses hash routing, so
deep links work without a server-side fallback; locally the base path defaults to `/`.

## Keeping content current

Every Monday a GitHub Action ([azure-retirements.yml](.github/workflows/azure-retirements.yml))
reads Microsoft's [Azure Updates feed](https://www.microsoft.com/releasecommunications/api/v2/azure/rss)
and opens an issue labelled `azure-retirements` when a retirement announcement names a service or
runtime version a lesson mentions. Run it locally with `npm run check:retirements -- --days 30`.

## Icons

The Azure icons are Microsoft's official architecture icons, used unmodified under
[Microsoft's terms](https://learn.microsoft.com/azure/architecture/icons/) for training
material.
