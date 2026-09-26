# Content guide — how lessons, quizzes and glossary entries are written

Read this before writing or editing any lesson. `npm run verify` in `web/` enforces most of it.

## The learner

An engineer with ~18 years' experience: .NET early on, then React / React Native / TypeScript,
Node APIs, SQL Server. Wants **high-to-mid-level** Azure judgement (which service, why, cost,
risks, how to guide a team) - not code walkthroughs. Reads on a phone as often as a laptop.

## Voice

- Plain, confident, friendly. Short sentences. One idea per paragraph.
- Concrete before abstract: start from a situation, then name the concept.
- Analogies to the learner's world (React, Node, SQL Server, on-prem servers, npm) are the
  bridge - use them deliberately, once per concept, and keep them accurate.
- No filler, no hype. Say what it costs and what goes wrong.
- British spelling (organise, colour), except in Azure product names.
- Bold the first mention of an important concept; highlight the *one sentence* to remember
  with `==double equals==`.

## Lesson file: `web/src/content/lessons/<id>.md`

```
---
id: "1.1"
title: "Why cloud, and why Azure"
---
```

The title must match `web/src/data/syllabus.json` exactly. Then these `##` sections, in order
(the first two and the last are required by the verifier):

1. `## Why this matters` - opens with a `> [!SCENARIO]` callout: a real situation with a
   name, a company, a pressure. 80-150 words.
2. `## The idea` (or a more specific title) - the concept, plain words, one diagram or a
   table. This is the core; may be split into 2-3 `##` sections.
3. `## In practice` - what you actually create in Azure, what it costs, what breaks.
4. `## Map it to what you know` - the analogies. A small table works well.
5. `## Guiding your team` - a `> [!TEAM]` callout: 3-5 questions to ask in a design review
   or advice to give.
6. `## Key takeaways` - 4-6 bullets a reader should be able to say from memory.

Length: 700-1200 words (verifier requires at least 600). Every lesson has at least one
diagram or Azure icon reference.

### Syntax

| Write | Get |
|---|---|
| `![App Service](az:app-service)` | the official icon with a label chip; slug from `web/src/data/icons.ts` |
| `> [!SCENARIO] Title` / `[!TIP]` / `[!NOTE]` / `[!WARNING]` / `[!TEAM]` / `[!EXAMPLE]` / `[!IMPORTANT]` | a coloured callout (title optional) |
| `==remember this==` | highlighted text |
| `[resource group](gl:resource-group)` | a link to the glossary term (slug = lower-case, non-alphanumerics to `-`) |
| `[lesson 1.4](lesson:1.4)` | a link to a lesson |
| GFM tables | rendered tables, scrollable on phones |

### Diagrams

A fenced block with language `diagram` holding JSON:

```json
{
  "title": "Where the pieces live",
  "caption": "One sentence on what to notice.",
  "nodes": [
    { "id": "user", "icon": "user", "label": "Shopper", "sub": "browser or phone", "x": 0, "y": 0 },
    { "id": "web", "icon": "static-web-apps", "label": "React app", "sub": "Static Web Apps", "x": 1, "y": 0 },
    { "id": "api", "icon": "app-service", "label": "Node API", "sub": "App Service", "x": 2, "y": 0 },
    { "id": "db", "icon": "azure-sql", "label": "Orders DB", "sub": "Azure SQL", "x": 3, "y": 0 }
  ],
  "edges": [
    { "from": "user", "to": "web", "label": "HTTPS" },
    { "from": "web", "to": "api", "label": "REST" },
    { "from": "api", "to": "db", "label": "TDS 1433" }
  ],
  "groups": [
    { "label": "Resource group: rg-shop-prod", "nodes": ["web", "api", "db"], "tone": "blue" }
  ]
}
```

- `x`/`y` are grid columns/rows (0-based). Keep to at most 5 columns so it fits a phone when
  scaled. No two nodes on the same cell.
- `icon` is an Azure icon slug, or `user`, `internet`, `onprem` for generic shapes.
- Labels: at most ~16 characters; `sub` at most ~22. Edge labels short.
- `tone`: `blue` (default), `green`, `amber`, `purple`, `grey`. Group labels are drawn at the bottom-left of the box, so avoid routing an edge into a group's bottom-left corner.
- A group is one rectangle spanning its members' rows and columns. **No non-member may sit
  inside that span** - it would look like part of the group. The verifier rejects this, so
  place outsiders in a row or column the group does not cover.

## Quiz: `web/src/data/quizzes/<id>.json`

6-10 questions, ids `<lesson>-q1`…, each:

```json
{
  "id": "1.1-q1",
  "topic": "elasticity",
  "scenario": "optional one-sentence situation",
  "stem": "The question, as a full sentence?",
  "options": ["Four options", "in plausible", "random order", "one correct"],
  "answer": 2,
  "explanation": "Why the right answer is right AND why the tempting wrong one is wrong. 1-3 sentences."
}
```

Rules: 3-5 options (4 is the norm); no "all of the above"; wrong options must be plausible
to someone who half-read the lesson; explanations teach, they do not just restate; at least
a third of the questions are scenario-based ("Your team wants to…").

## Module test: `web/src/data/exams/module-<n>.json`

```json
{ "module": 1, "minutes": 25, "poolFromLessons": 10, "questions": [ ... ] }
```

At least 8 (ideally 10-14) **scenario** questions, ids `m1-q1`…, every one with a
`scenario`. They cut across lessons: "Given this situation, which is the best decision and
why". The test adds `poolFromLessons` random lesson-quiz questions.

## Glossary: `web/src/data/glossary/<lesson>.json`

One file per lesson that introduces terms (3-10 entries each). Each entry:

```json
{
  "term": "Resource group",
  "aliases": ["RG"],
  "definition": "One-to-three plain sentences. What it is, what it is for, one gotcha.",
  "example": "rg-shop-prod holds the web app, the API and the database for the shop.",
  "icon": "resource-group",
  "lessons": ["1.4", "1.8"],
  "related": ["Subscription", "Resource"]
}
```

- `lessons`: the lesson that owns the file must be listed; most relevant first.
- `related`: exact terms that exist somewhere in the glossary (any file).
- Terms are unique across all files. Check `grep -ri '"term": "X"' web/src/data/glossary` before adding.
- `icon` optional; only when there is an obvious Azure icon.

## Releasing one lesson at a time

A module can ship lesson by lesson. In `syllabus.json` set the module's `status` to
`"in-progress"` and give each shipped lesson `"status": "ready"`. The app then shows those
lessons, lists the rest as coming soon, and keeps the module test closed. Links to lessons
or modules that have not shipped render as plain text, so a lesson can point ahead safely.
The verifier checks each ready lesson as if its module were complete. With the last lesson,
add the module test, set the module to `"ready"` and remove the per-lesson statuses.

Every lesson PR still needs: the lesson, its quiz, its glossary file (terms from the
module's ownership list in PLAN.md), final syllabus summary, objectives and icons, and the
visual checks.

## Definition of done for a module

- `npm run verify`, `npx tsc -b`, `npm run lint`, `npm run build` all pass.
- Every lesson read end to end in the browser on a narrow viewport: diagrams fit, callouts
  render, links resolve, the quiz runs, the module test runs.
- Syllabus summaries and objectives for the module are final.
- PLAN.md's curriculum table matches what shipped.
