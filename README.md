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

- **Azure Static Web Apps:** create a Free-plan Static Web App, add its deployment token as
  the `AZURE_STATIC_WEB_APPS_API_TOKEN` repository secret, and every merge to `main` deploys.
- **Vercel:** import the repo, set the root directory to `web`, framework Vite. No other
  configuration is needed (the app uses hash routing).

## Icons

The Azure icons are Microsoft's official architecture icons, used unmodified under
[Microsoft's terms](https://learn.microsoft.com/azure/architecture/icons/) for training
material.
