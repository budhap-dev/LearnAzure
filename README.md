# Learn Azure

A self-paced, scenario-driven course on Microsoft Azure — from cloud basics through
compute, data, networking, security, DevOps and Azure AI — for an experienced engineer who
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

- **GitHub Pages (live):** every merge to `main` builds and deploys to
  https://budhap-dev.github.io/LearnAzure/. The repository's Pages source is set to
  *GitHub Actions*, and CI builds with `BASE_PATH=/LearnAzure/`.
- **Vercel:** import the repo, set the root directory to `web`, framework Vite. No other
  configuration is needed (the app uses hash routing, and the base path defaults to `/`).

## Icons

The Azure icons are Microsoft's official architecture icons, used unmodified under
[Microsoft's terms](https://learn.microsoft.com/azure/architecture/icons/) for training
material.
