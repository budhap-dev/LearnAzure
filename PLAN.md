# Learn Azure — the plan

A self-paced, scenario-driven course on Microsoft Azure for an experienced engineer
(18 years: .NET, then React / React Native / TypeScript, Node APIs, SQL Server) who wants
high-to-mid-level command of Azure — from first principles through DevOps and Azure AI —
in order to work with, and guide, a team. Not a coding course: the goal is *judgement*
(which service, why, what it costs, what can go wrong), backed by real scenarios.

The course is a React + TypeScript web app that works on a phone or a laptop. It is
hosted on GitHub Pages at https://budhap-dev.github.io/LearnAzure/. Source: https://github.com/budhap-dev/LearnAzure

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
| 9 | Architecture and leading a team ✅ | 5 | Reference architectures, landing zones, migration, governance, certification map, capstone scenarios |
| 10 | Data and analytics ✅ | 8 | Fabric and OneLake, Data Factory and mirroring, lakehouse and warehouse, real-time analytics, Power BI, Purview, choosing a platform |
| 11 | Web and mobile clients | 7 | Backend for frontend, edge caching, customer sign-in, push, real-time, files, messaging and maps, shipping mobile apps |

Around 78 lessons. Modules are built one at a time; each is verified end-to-end before the
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

### Module 9 — Architecture and leading a team — **shipped**

| Id | Lesson |
|----|--------|
| 9.1 | Reference architectures you will meet most |
| 9.2 | Landing zones and governance at scale |
| 9.3 | Migrating an existing estate |
| 9.4 | Certifications and how to keep learning |
| 9.5 | Capstone scenarios - design reviews you can run |

Leading Azure work across an organisation, released one lesson per PR (#42-#46). It starts from
fourteen microservices for five developers and ends with designs that start from reference
architectures, a landing zone run by a platform team with audit-first policy, vending and
FinOps, a data-centre exit planned per workload, certifications chosen by role, and design
reviews that record their decisions.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 32 new glossary terms (522 in total).

With Module 9 the first planned course was complete: 9 modules, 63 lessons, v1.0.0. Modules 10
and 11 extend it into the two biggest gaps left: analytics, and what web and mobile clients
need from Azure.

### Module 10 — Data and analytics — **shipped**

| Id | Lesson |
|----|--------|
| 10.1 | The analytics landscape - from transactions to insight |
| 10.2 | Microsoft Fabric and OneLake |
| 10.3 | Getting data in - Data Factory, mirroring and change data capture |
| 10.4 | Lakehouse, warehouse and modelling for analytics |
| 10.5 | Real-time analytics - Eventstreams, Eventhouse and Stream Analytics |
| 10.6 | Power BI - semantic models, Direct Lake and embedding |
| 10.7 | Data governance with Microsoft Purview |
| 10.8 | Choosing an analytics platform - Fabric, Databricks or Synapse |

Turning the shop's data into answers without slowing the shop down. It starts from finance's
Monday-morning report locking the orders database during checkout and ends with mirrored
data in OneLake, a medallion lakehouse, a shared semantic model behind every report, a live
view of the clickstream, Purview knowing where personal data lives, and a platform choice
recorded as a decision. Written for a SQL Server professional: Module 3 covered the stores
an application runs on; this module covers what happens to that data afterwards.

Released one lesson per PR (#57-#64). The stories that run through it: a Monday report slowing
checkout, a throttled F8, a four-hour nightly copy, two revenue figures at one board meeting,
twenty unseen minutes of failed payments, forty reports with eleven revenue measures, an
erasure request nobody could answer, and three platform requests in one week.

Every lesson has an 8-question quiz; the module test is 14 scenario questions plus 10 drawn
at random from the lesson quizzes. 65 new glossary terms (587 in total).

Glossary term ownership (each term is defined once, in the lesson that owns it):

| Lesson | Terms |
|--------|-------|
| 10.1 | Data lake, Lakehouse, Medallion architecture, ELT, Batch processing, Business intelligence |
| 10.2 | Microsoft Fabric, OneLake, Fabric capacity, Capacity unit, Fabric workspace, OneLake shortcut, Delta Lake, Parquet, Smoothing and throttling |
| 10.3 | Azure Data Factory, Data pipeline, Copy activity, Dataflow Gen2, Mirroring, Change data capture, Incremental load, Integration runtime, On-premises data gateway |
| 10.4 | Fabric Lakehouse, Fabric Warehouse, SQL analytics endpoint, Apache Spark, Notebook, Star schema, Fact table, Dimension table, Slowly changing dimension |
| 10.5 | Real-Time Intelligence, Eventstream, Eventhouse, Fabric Activator, Azure Stream Analytics, Windowing, Hot path and cold path, Azure Data Explorer |
| 10.6 | Power BI, Semantic model, DAX, Import mode, DirectQuery, Direct Lake, Row-level security, Power BI Embedded, Power BI Pro |
| 10.7 | Microsoft Purview, Data map, Unified Catalog, Data lineage, Data classification, Sensitivity label, Data steward, Data loss prevention |
| 10.8 | Azure Databricks, Unity Catalog, Azure Synapse Analytics, Dedicated SQL pool, Serverless SQL pool, Data mesh, Data product |

Existing terms this module links to rather than redefines: OLTP, OLAP, Data warehouse, ETL
(3.7), Hierarchical namespace (3.1), Azure Event Hubs, Apache Kafka (5.4), KQL (6.2), Data
residency (1.3), Reservation (shared), Microsoft Entra ID (shared).

### Module 11 — Web and mobile clients — **in progress**

| Id | Lesson |
|----|--------|
| 11.1 | The client-facing toolkit and the backend for frontend |
| 11.2 | Delivering the front end fast - Front Door, caching and assets |
| 11.3 | Customer sign-in with Entra External ID |
| 11.4 | Push notifications with Notification Hubs |
| 11.5 | Real-time updates - SignalR Service and Web PubSub |
| 11.6 | Files, messaging and maps |
| 11.7 | Shipping and watching mobile apps |

What the shop's React web app and React Native app need from Azure beyond an API. Written for
a React and React Native lead who knows the client side well: each lesson is about the Azure side
and the judgement calls, mapped to tools they already use (Firebase, Auth0, Pusher, Expo,
CodePush, SendGrid, Twilio, Google Maps). Released one lesson per PR.

Glossary term ownership (each term is defined once, in the lesson that owns it):

| Lesson | Terms |
|--------|-------|
| 11.1 | Backend for frontend, API versioning, Minimum supported app version, Offline-first, Optimistic UI, GraphQL, Cross-origin resource sharing, Idempotency key |
| 11.2 | Cache-Control header, Content hashing, Cache purge, Cache key, Origin server, Compression, Core Web Vitals, Front Door rule set |
| 11.3 | External tenant, User flow, PKCE, MSAL, Social sign-in, Native authentication, Refresh token, Secure device storage |
| 11.4 | Azure Notification Hubs, Apple Push Notification service, Firebase Cloud Messaging, Device token, Device installation, Tag expression, Notification template, Silent notification |
| 11.5 | WebSocket, Server-sent events, Polling, Azure SignalR Service, Azure Web PubSub, SignalR hub, SignalR serverless mode, SignalR unit |
| 11.6 | Valet key pattern, Azure Communication Services, Email authentication, Alphanumeric sender ID, Azure Maps, Geocoding, Geofence, Malware scanning |
| 11.7 | Visual Studio App Center, Code signing, Over-the-air update, Expo Application Services, Fastlane, Crash reporting, Symbolication, Beta testing track |

Existing terms this module links to rather than redefines: Static Web Apps, Client-side routing,
Edge cache (2.3), Point of presence (1.3), Azure Front Door, Web application firewall (4.2),
Microsoft Entra External ID, OAuth 2.0 and OpenID Connect, Identity provider (4.4), Shared access
signature, Blob storage (3.1), Azure Event Grid (5.3), Azure API Management, Rate limiting (5.5),
Application Insights (1.8), OpenTelemetry, Sampling (6.3), Feature flag, Azure App Configuration
(4.6), Canary release, Ring-based deployment, Dark launch (7.7), Semantic versioning (7.2),
Idempotent (1.5), Azure Functions, Serverless (1.2), Microsoft Defender for Cloud (4.7).

## App architecture

```
web/                          Vite + React 19 + TypeScript (hash routing: works on any static host)
  src/content/lessons/*.md    one Markdown file per lesson, with frontmatter
  src/data/syllabus.ts        modules and lessons: ids, titles, summaries, objectives, minutes
  src/data/quizzes/<id>.json  the lesson quiz (6-10 questions, each with an explanation)
  src/data/exams/module-N.json scenario questions for the module test
  src/data/glossary/<id>.json the terms each lesson introduces, linked to the lessons that teach them
  src/lib/                    theme, progress (localStorage), search, quiz pooling, glossary review scheduling, version
  src/components/             Layout, Markdown renderer, Diagram, AzureIcon, Quiz, Exam, ThemePicker
  src/routes/                 Home, Syllabus, Module, Lesson, Quiz, ModuleTest, FinalTest, Glossary, Review, Search, BuildStatus, About
  public/azure-icons/*.svg    the official Microsoft Azure architecture icons (see terms below)
  scripts/verify-content.mjs  fails the build if any lesson, quiz, icon, diagram or glossary link is broken
  scripts/check-azure-retirements.mjs  weekly: flags Azure retirement announcements that touch a lesson
```

### Glossary review

`#/glossary/review` turns the glossary into flashcards with Leitner-style spaced repetition
(`src/lib/review.ts`). A term moves up a box on "Good" (two on "Easy") and comes back after
1, 3, 7, 16, 35 or 90 days; "Again" drops it to box 0 and repeats it later in the same session.
Sessions hold up to 20 cards and introduce at most 10 new terms a day, taken in course order from
the lessons the learner has opened, one module, or the whole glossary. The schedule is stored in
the progress record, so it counts towards the streak and travels with export and import.

### Study goals

The home and progress pages show **Today** and **This week** (`src/lib/goals.ts`,
`src/components/StudyGoals.tsx`). The learner picks a weekly goal of 60, 90, 120 (default), 180 or
240 minutes; the daily target is that over five study days, rounded up to 5. Today's checklist
ticks itself from what actually happened: minutes studied, a lesson learned (quiz passed or marked
learned), and a glossary review session. The week shows minutes against the goal, Monday-to-Sunday
dots, lessons learned, and a status (new week, on track, behind, goal met) with a catch-up pace.
Minutes come from `src/lib/studyTimer.ts`: time counts only while the tab is visible, the learner
is on a lesson, quiz, test or glossary page, and has scrolled, tapped or typed in the last three
minutes. The per-day log and the goal live in the progress record, so they export and import with it.

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
on every deployment.

## Delivery workflow

- `main` is protected: changes arrive only through pull requests, force-pushes and deletion
  are blocked, and the CI build must pass before merging.
- Every PR bumps the version, runs `npm run verify` (content checks), `tsc`, lint and the
  production build.
- Merged branches are deleted automatically.
- CI deploys `main` to GitHub Pages after the build passes; pull requests build and verify
  only.
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
