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
| 4 | Networking, identity and security ✅ | 8 | VNets, load balancing, private endpoints, Entra ID, RBAC, Key Vault, Defender |
| 5 | Integration and messaging ✅ | 6 | Service Bus, Event Grid, Event Hubs, API Management, Logic Apps |
| 6 | Observability and reliability ✅ | 6 | Monitor, Log Analytics, App Insights, alerts, Well-Architected, HA/DR |
| 7 | DevOps on Azure ✅ | 8 | Azure DevOps vs GitHub, pipelines, GitHub Actions, IaC with Bicep/Terraform, environments, release strategies |
| 8 | Azure AI ✅ | 8 | Azure OpenAI and Microsoft Foundry, AI Services, AI Search, RAG, agents, responsible AI, cost and security of AI |
| 9 | Architecture and leading a team 🚧 | 5 | Reference architectures, landing zones, migration, governance, certification map, capstone scenarios |

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

### Module 4 — Networking, identity and security — **shipped**

| Id | Lesson |
|----|--------|
| 4.1 | Virtual networks, subnets and network security groups |
| 4.2 | Load Balancer, Application Gateway, Front Door and Traffic Manager |
| 4.3 | Private endpoints, DNS and hybrid connectivity |
| 4.4 | Microsoft Entra ID - the identity backbone |
| 4.5 | Role-based access control and managed identities |
| 4.6 | Key Vault, secrets and App Configuration |
| 4.7 | Defender for Cloud, Sentinel and the security baseline |
| 4.8 | Zero trust and securing a web workload end to end |

How traffic flows and who may do what, released one lesson per PR (#4-#12). The network half
moves the shop from public endpoints to private ones behind a single front door; the identity
half removes every stored secret it can and puts admin rights behind PIM. 4.8 walks an
attacker through the finished design and sets a minimum bar for every workload.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 64 new glossary terms (313 in total).

### Module 5 — Integration and messaging — **shipped**

| Id | Lesson |
|----|--------|
| 5.1 | Messaging patterns - queues, topics, events and streams |
| 5.2 | Service Bus - enterprise messaging |
| 5.3 | Event Grid - reacting to what happens |
| 5.4 | Event Hubs - high-volume streaming |
| 5.5 | API Management - one front door for your APIs |
| 5.6 | Logic Apps and low-code integration |

How the shop's systems talk without being tied together, released one lesson per PR (#13-#18).
It starts from a Black Friday checkout that did five things in line and ends with one call plus
events: Service Bus for business messages with the outbox and dead-letter ownership, Event Grid
for reactions and partner webhooks, Event Hubs for the clickstream, API Management in front of
every API, and Logic Apps replacing a nightly manual job.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 41 new glossary terms (354 in total).

### Module 6 — Observability and reliability — **shipped**

| Id | Lesson |
|----|--------|
| 6.1 | Azure Monitor - metrics, logs and the data platform |
| 6.2 | Log Analytics and just enough KQL |
| 6.3 | Application Insights for web apps and APIs |
| 6.4 | Alerts, action groups and on-call that works |
| 6.5 | High availability and disaster recovery patterns |
| 6.6 | The Well-Architected review in practice |

Seeing what the shop is doing and keeping it running, released one lesson per PR (#19-#24).
It starts from forty-five minutes of clicking through portal blades and ends with one
workspace per environment, end-to-end traces, a handful of symptom alerts on SLOs, a drilled
22-minute regional failover, and a quarterly Well-Architected review that produces owned risks
and decision records.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 35 new glossary terms (389 in total).

### Module 7 — DevOps on Azure — **shipped**

| Id | Lesson |
|----|--------|
| 7.1 | DevOps on Azure - the landscape and the two toolchains |
| 7.2 | Repos, branching and pull-request policies |
| 7.3 | Azure Pipelines - YAML, agents, stages and environments |
| 7.4 | GitHub Actions for Azure |
| 7.5 | Infrastructure as code - Bicep and Terraform |
| 7.6 | Secrets, identities and security in the pipeline |
| 7.7 | Release strategies - slots, blue-green, canary and feature flags |
| 7.8 | Quality gates, testing and DevOps metrics |

Shipping the shop repeatably, released one lesson per PR (#25-#32). It starts from a Friday
laptop deployment and ends with the pipeline as the only way to production: trunk-based
branching behind protected main, YAML pipelines and Actions deploying through federated
identities per environment, Bicep with what-if on every pull request, a scanned and attested
supply chain, canary-then-swap releases that roll back in seconds, and DORA metrics that show
the improvement. 7.2 also fixed `==highlight==` markers that contained inline code.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 46 new glossary terms (435 in total).

### Module 8 — Azure AI — **shipped**

| Id | Lesson |
|----|--------|
| 8.1 | The Azure AI landscape |
| 8.2 | Azure OpenAI and Foundry Models |
| 8.3 | Microsoft Foundry - projects, hubs and the developer loop |
| 8.4 | Azure AI Services - vision, speech, language and documents |
| 8.5 | Azure AI Search and retrieval-augmented generation |
| 8.6 | Agents, tools and orchestration |
| 8.7 | Responsible AI, content safety and evaluation |
| 8.8 | Cost, security and operations for AI workloads |

Adding AI to the shop without the usual mistakes, released one lesson per PR (#34-#41). It
starts from a whiteboard of six "AI" ideas and ends with invoices read by Document
Intelligence, descriptions written in batch by a small model, a shopping assistant that answers
from AI Search with citations and acts on orders only with the shopper's identity, layered
content safety and an evaluation gate in the pipeline, and every model call going through an AI
gateway that meters, limits and caches. 8.3 uses the product's current name, Microsoft Foundry.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 55 new glossary terms (490 in total).

### Module 9 — Architecture and leading a team — **in progress, one lesson per PR**

| Id | Lesson | Status |
|----|--------|--------|
| 9.1 | Reference architectures you will meet most | shipped |
| 9.2 | Landing zones and governance at scale | planned |
| 9.3 | Migrating an existing estate | planned |
| 9.4 | Certifications and how to keep learning | planned |
| 9.5 | Capstone scenarios - design reviews you can run | planned |

Glossary term ownership, so each lesson PR defines its own terms and no others:

- **9.1**: Azure Architecture Center, Reference architecture, Reliable Web App pattern,
  Microservices, Modular monolith, Cloud design pattern.
- **9.2**: Cloud Adoption Framework, Azure landing zone, Platform team, Subscription vending,
  Policy initiative, Policy effect, FinOps, Azure Resource Graph.
- **9.3**: Azure Migrate, Migration strategy, Dependency analysis, Migration wave, Strangler fig
  pattern, Azure Arc.
- **9.4**: Microsoft Learn, Role-based certification, Certification renewal, Applied Skills,
  AZ-104, AZ-305, AZ-400.
- **9.5**: Design review, Non-functional requirements, Architecture trade-off, Pre-mortem,
  Technical debt.
- Existing terms are extended, never redefined: Well-Architected Framework, Well-Architected
  Review, Architecture decision record, Three-tier architecture, Hub-and-spoke, Management group,
  Subscription, Azure Policy, Tag, Chargeback, Cost Management, Budget, Lift and shift, Azure
  Hybrid Benefit, Azure Database Migration Service, Azure Site Recovery, AZ-900.

The module test is written with 9.5.

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
  src/routes/                 Home, Syllabus, Module, Lesson, Quiz, ModuleTest, FinalTest, Glossary, Search, BuildStatus, About
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
