# Learn Azure — the plan

A self-paced, scenario-driven course on Microsoft Azure for an experienced engineer
(18 years: .NET, then React / React Native / TypeScript, Node APIs, SQL Server) who wants
high-to-mid-level command of Azure — from first principles through DevOps and Azure AI —
in order to work with, and guide, a team. Not a coding course: the goal is *judgement*
(which service, why, what it costs, what can go wrong), backed by real scenarios.

The course is a React + TypeScript web app that works on a phone or a laptop. It will be
hosted on Vercel or as an Azure Static Web App. Source: https://github.com/budhap-dev/LearnAzure

## Who it is for, and how it teaches

Every lesson follows the same shape so it is predictable to read on a phone:

1. **Why this matters** — a real-life scenario that the lesson resolves.
2. **The idea** — the concept, in plain words, with a diagram using the real Azure icons.
3. **In practice** — how it looks in Azure: what you create, what it costs, what breaks.
4. **Map it to what you know** — analogies to React, Node, SQL Server and on-prem work.
5. **Guiding your team** — what to tell a team, the questions to ask in a design review.
6. **Key takeaways** — five lines you should be able to say from memory.
7. **Check yourself** — a 6-10 question quiz. 80 % marks the lesson as learned.

Each module ends with a **module test** (scenario questions plus a random draw from the
lesson quizzes, timed, graded). A **final learning test** draws from the whole course.

## Curriculum

| # | Module | Lessons | Theme |
|---|--------|---------|-------|
| 1 | Cloud and Azure foundations ✅ | 8 | What cloud is, how Azure is organised, cost, SLAs |
| 2 | Compute and hosting ✅ | 7 | VMs, App Service, Static Web Apps, Functions, containers, AKS |
| 3 | Storage and data ✅ | 7 | Storage accounts, Azure SQL, Cosmos DB, Redis, choosing a store |
| 4 | Networking, identity and security 🚧 | 8 | VNets, load balancing, private endpoints, Entra ID, RBAC, Key Vault, Defender |
| 5 | Integration and messaging | 6 | Service Bus, Event Grid, Event Hubs, API Management, Logic Apps |
| 6 | Observability and reliability | 6 | Monitor, Log Analytics, App Insights, alerts, Well-Architected, HA/DR |
| 7 | DevOps on Azure | 8 | Azure DevOps vs GitHub, pipelines, GitHub Actions, IaC with Bicep/Terraform, environments, release strategies |
| 8 | Azure AI | 8 | Azure OpenAI and AI Foundry, AI Services, AI Search, RAG, agents, responsible AI, cost and security of AI |
| 9 | Architecture and leading a team | 5 | Reference architectures, landing zones, migration, governance, certification map, capstone scenarios |

Around 63 lessons. Modules are built one at a time; each is verified end-to-end before the
next starts.

### Module 1 — Cloud and Azure foundations — **shipped**

| Id | Lesson |
|----|--------|
| 1.1 | Why cloud, and why Azure |
| 1.2 | IaaS, PaaS, SaaS and serverless |
| 1.3 | Azure's global footprint |
| 1.4 | How Azure is organised |
| 1.5 | Azure Resource Manager and how you talk to Azure |
| 1.6 | Pricing, cost and the free tier |
| 1.7 | SLAs, reliability vocabulary and the Well-Architected Framework |
| 1.8 | Your first real workload on Azure |

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes, over 25 minutes. 97 glossary terms.

### Module 2 — Compute and hosting — **shipped**

| Id | Lesson |
|----|--------|
| 2.1 | Virtual machines and scale sets |
| 2.2 | App Service - the PaaS home for web apps and APIs |
| 2.3 | Static Web Apps for React and React Native web |
| 2.4 | Azure Functions and serverless thinking |
| 2.5 | Containers - Registry, Container Instances and Container Apps |
| 2.6 | Azure Kubernetes Service - when you really need it |
| 2.7 | Choosing compute - a decision guide |

Every way Azure runs code, each lesson naming what the service is for, what it costs, how it
scales and what it cannot do. The module ends with a decision guide for design reviews.

### Module 3 — Storage and data — **shipped**

| Id | Lesson |
|----|--------|
| 3.1 | Storage accounts - blobs, files, queues and tables |
| 3.2 | Azure SQL for the SQL Server professional |
| 3.3 | Cosmos DB - planet-scale NoSQL |
| 3.4 | Caching with Azure Cache for Redis |
| 3.5 | Open-source databases - PostgreSQL and MySQL on Azure |
| 3.6 | Backup, recovery and data protection |
| 3.7 | Choosing a data store - a decision guide |

Where data lives and how to choose, written for a SQL Server professional. Each store lesson
names the data shape it suits, its cost driver, its scale model and what breaks; 3.6 argues
that nobody has a backup until they have restored from it; 3.7 is the decision guide for
design reviews.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 88 new glossary terms (249 in total).

### Module 4 — Networking, identity and security — **in progress, one lesson per PR**

| Id | Lesson | Status |
|----|--------|--------|
| 4.1 | Virtual networks, subnets and network security groups | shipped |
| 4.2 | Load Balancer, Application Gateway, Front Door and Traffic Manager | shipped |
| 4.3 | Private endpoints, DNS and hybrid connectivity | planned |
| 4.4 | Microsoft Entra ID - the identity backbone | planned |
| 4.5 | Role-based access control and managed identities | planned |
| 4.6 | Key Vault, secrets and App Configuration | planned |
| 4.7 | Defender for Cloud, Sentinel and the security baseline | planned |
| 4.8 | Zero trust and securing a web workload end to end | planned |

Glossary term ownership, so each lesson PR defines its own terms and no others:

- **4.1**: Virtual network, Subnet, CIDR notation, Network security group, Service tag,
  Application security group, VNet peering, Hub-and-spoke, User-defined route, NAT gateway,
  Public IP address, Azure Bastion, Azure Firewall.
- **4.2**: Load balancing, Azure Load Balancer, Application Gateway, Web application firewall,
  Azure Front Door, Traffic Manager, Health probe, Layer 4 and layer 7, TLS termination,
  DDoS Protection.
- **4.3**: Private endpoint, Private Link, Private DNS zone, Service endpoint, VPN Gateway,
  ExpressRoute.
- **4.4-4.8**: assigned when 4.4 starts. Existing terms to extend rather than duplicate:
  Microsoft Entra ID, Tenant, Role-based access control, Managed identity, Key Vault.

The module test is written with 4.8.

## App architecture

```
web/                          Vite + React 19 + TypeScript (hash routing: works on any static host)
  src/content/lessons/*.md    one Markdown file per lesson, with frontmatter
  src/data/syllabus.ts        modules and lessons: ids, titles, summaries, objectives, minutes
  src/data/quizzes/<id>.json  the lesson quiz (6-10 questions, each with an explanation)
  src/data/exams/module-N.json scenario questions for the module test
  src/data/glossary.json      every term the course uses, linked to the lessons that teach it
  src/lib/                    theme, progress (localStorage), search, quiz pooling, version
  src/components/             Layout, Markdown renderer, Diagram, AzureIcon, Quiz, Exam, ThemePicker
  src/routes/                 Home, Syllabus, Module, Lesson, Quiz, ModuleTest, FinalTest, Glossary, Search, About
  public/azure-icons/*.svg    the official Microsoft Azure architecture icons (see terms below)
  scripts/verify-content.mjs  fails the build if any lesson, quiz, icon, diagram or glossary link is broken
```

### Markdown conventions used in lessons

| Syntax | Renders as |
|--------|------------|
| `![App Service](az:app-service)` | the real Azure icon with a label chip |
| ```` ```diagram ```` + JSON | an animated architecture diagram built from Azure icons |
| `> [!SCENARIO]`, `> [!TIP]`, `> [!NOTE]`, `> [!WARNING]`, `> [!TEAM]` | coloured callouts |
| `==important words==` | highlighted text |
| `[term](gl:slug)` | a link into the glossary |
| `[1.4](lesson:1.4)` | a link to another lesson |

### Themes

Ten themes, chosen from the header and remembered on the device: System, Light, Dark,
Azure (default), Midnight, Ocean, Sunset, Forest, Paper and High contrast. Animations respect
`prefers-reduced-motion`.

### Version

The footer shows `v<package version> · build <CI run number> · <short sha> · <date>`. The
package version is bumped in every pull request; the build number and sha are injected by CI
(or by Vercel's environment) on every deployment.

## Delivery workflow

- `main` is protected: changes arrive only through pull requests, force-pushes and deletion
  are blocked, and the CI build must pass before merging.
- Every PR bumps the version, runs `npm run verify` (content checks), `tsc`, lint and the
  production build.
- Merged branches are deleted automatically.
- CI deploys `main` to Azure Static Web Apps when the `AZURE_STATIC_WEB_APPS_API_TOKEN`
  secret exists; until then it builds and verifies only. Vercel can be pointed at `web/`
  directly.
- A module is "done" when: every lesson renders, every quiz passes verification, the module
  test exists, glossary terms and diagrams are in place, and a full read-through has been
  done for clarity.
- From Module 4, lessons can ship one per PR while the module is `in-progress` (see
  CONTENT-GUIDE.md, "Releasing one lesson at a time"). Each lesson PR bumps the patch
  version; completing a module bumps the minor version.

## Azure icons — terms

The icons in `web/public/azure-icons/` are Microsoft's official Azure architecture icons.
Microsoft permits their use in architectural diagrams, training materials or documentation;
they are unmodified and used only for that purpose. See
https://learn.microsoft.com/azure/architecture/icons/ for the terms.
