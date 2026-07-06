# Graph Report - .  (2026-07-04)

## Corpus Check
- Corpus is ~28,966 words - fits in a single context window. You may not need a graph.

## Summary
- 422 nodes · 765 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.84)
- Token cost: 136,401 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API App & Auth Routes|API App & Auth Routes]]
- [[_COMMUNITY_Tender Source & Adapters|Tender Source & Adapters]]
- [[_COMMUNITY_Web SPA Client & Pages|Web SPA Client & Pages]]
- [[_COMMUNITY_Domain Architecture Concepts|Domain Architecture Concepts]]
- [[_COMMUNITY_Caveman Compress Engine|Caveman Compress Engine]]
- [[_COMMUNITY_API Package Dependencies|API Package Dependencies]]
- [[_COMMUNITY_Compress Benchmark & Validation|Compress Benchmark & Validation]]
- [[_COMMUNITY_Caveman Skill Suite|Caveman Skill Suite]]
- [[_COMMUNITY_Web Package Dependencies|Web Package Dependencies]]
- [[_COMMUNITY_Monorepo Root Config|Monorepo Root Config]]
- [[_COMMUNITY_Base TypeScript Config|Base TypeScript Config]]
- [[_COMMUNITY_Web TypeScript Config|Web TypeScript Config]]
- [[_COMMUNITY_Contracts Package Config|Contracts Package Config]]
- [[_COMMUNITY_API TypeScript Config|API TypeScript Config]]
- [[_COMMUNITY_OpenSpec Workflow Commands|OpenSpec Workflow Commands]]
- [[_COMMUNITY_TTL Cache|TTL Cache]]
- [[_COMMUNITY_Package TypeScript Config|Package TypeScript Config]]
- [[_COMMUNITY_Prettier Config|Prettier Config]]
- [[_COMMUNITY_Compress Package Init|Compress Package Init]]
- [[_COMMUNITY_Vitest Setup|Vitest Setup]]

## God Nodes (most connected - your core abstractions)
1. `TenderSummary` - 19 edges
2. `TenderFilters` - 16 edges
3. `TenderDetail` - 16 edges
4. `validate()` - 14 edges
5. `buildApp()` - 13 edges
6. `compress_file()` - 12 edges
7. `SodaTenderSource` - 12 edges
8. `compilerOptions` - 12 edges
9. `TenderSource` - 11 edges
10. `Page` - 11 edges

## Surprising Connections (you probably didn't know these)
- `packages/contracts (shared types/DTOs)` --conceptually_related_to--> `Fastify REST API (apps/api)`  [INFERRED]
  README.md → openspec/changes/add-portal-convocatorias-mvp/proposal.md
- `Web SPA HTML shell` --implements--> `React + Vite Web (apps/web)`  [INFERRED]
  apps/web/index.html → openspec/changes/add-portal-convocatorias-mvp/proposal.md
- `packages/contracts (shared types/DTOs)` --conceptually_related_to--> `React + Vite Web (apps/web)`  [INFERRED]
  README.md → openspec/changes/add-portal-convocatorias-mvp/proposal.md
- `TenderService (cache + degradation)` --calls--> `TenderSource port`  [EXTRACTED]
  README.md → openspec/changes/add-portal-convocatorias-mvp/design.md
- `openspec-apply-change skill` --references--> `Implementation tasks checklist`  [INFERRED]
  .claude/skills/openspec-apply-change/SKILL.md → openspec/changes/add-portal-convocatorias-mvp/tasks.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Caveman Token-Efficiency Skill Suite** — _agents_skills_caveman_skill_caveman_mode, _agents_skills_caveman_commit_skill_caveman_commit, _agents_skills_caveman_review_skill_caveman_review, _agents_skills_caveman_compress_skill_caveman_compress, _agents_skills_caveman_stats_skill_caveman_stats, _agents_skills_caveman_help_skill_caveman_help [EXTRACTED 0.90]
- **Cavecrew Subagent Presets** — _agents_skills_cavecrew_skill_cavecrew_investigator, _agents_skills_cavecrew_skill_cavecrew_builder, _agents_skills_cavecrew_skill_cavecrew_reviewer [EXTRACTED 0.90]
- **OPSX Change Lifecycle** — _claude_commands_opsx_explore_opsx_explore, _claude_commands_opsx_propose_opsx_propose, _claude_commands_opsx_apply_opsx_apply, _claude_commands_opsx_archive_opsx_archive [EXTRACTED 0.90]
- **TenderSource hexagonal port and adapters** — openspec_changes_add_portal_convocatorias_mvp_design_tendersource_port, openspec_changes_add_portal_convocatorias_mvp_design_sodatendersource, openspec_changes_add_portal_convocatorias_mvp_design_cromaenrichmentsource, readme_tenderservice [EXTRACTED 0.95]
- **Three domain tables (SQLite schema)** — openspec_changes_add_portal_convocatorias_mvp_design_usuarios, openspec_changes_add_portal_convocatorias_mvp_design_bookmarks_table, openspec_changes_add_portal_convocatorias_mvp_design_busquedas_table, openspec_changes_add_portal_convocatorias_mvp_design_better_sqlite3 [EXTRACTED 0.95]
- **OpenSpec spec-driven workflow skills** — claude_skills_openspec_explore_skill_openspec_explore, claude_skills_openspec_propose_skill_openspec_propose, claude_skills_openspec_apply_change_skill_openspec_apply_change, claude_skills_openspec_archive_change_skill_openspec_archive_change [INFERRED 0.85]

## Communities (22 total, 3 thin omitted)

### Community 0 - "API App & Auth Routes"
Cohesion: 0.09
Nodes (43): buildApp(), authPlugin, AuthPluginOpts, fastify, @fastify/jwt, FastifyInstance, FastifyJWT, authRoutes() (+35 more)

### Community 1 - "Tender Source & Adapters"
Cohesion: 0.09
Nodes (24): BuildOverrides, upstreamUnavailable(), CromaEnrichmentSource, CromaOptions, normalize(), NULLISH, TenderEnrichment, TenderSource (+16 more)

### Community 2 - "Web SPA Client & Pages"
Cohesion: 0.09
Nodes (33): api, clearToken(), getToken(), onUnauthorized(), request(), setToken(), setUnauthorizedHandler(), App() (+25 more)

### Community 3 - "Domain Architecture Concepts"
Cohesion: 0.08
Nodes (35): AI-First session executive summary, Web SPA HTML shell, Project tech-stack constraints, openspec-apply-change skill, openspec-archive-change skill, openspec-explore skill, openspec-propose skill, Claude Code CLI (+27 more)

### Community 4 - "Caveman Compress Engine"
Cohesion: 0.12
Nodes (27): main(), print_usage(), backup_dir_for(), build_compress_prompt(), build_fix_prompt(), call_claude(), compress_file(), is_sensitive_path() (+19 more)

### Community 5 - "API Package Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, better-sqlite3, fastify, @fastify/cors, @fastify/helmet, @fastify/jwt, fastify-plugin, @fastify/rate-limit (+19 more)

### Community 6 - "Compress Benchmark & Validation"
Cohesion: 0.16
Nodes (22): benchmark_pair(), count_tokens(), main(), print_table(), Path, count_bullets(), extract_code_blocks(), extract_headings() (+14 more)

### Community 7 - "Caveman Skill Suite"
Cohesion: 0.10
Nodes (26): cavecrew README, Cavecrew Delegation Guide, cavecrew-builder, cavecrew-investigator, cavecrew-reviewer, Context Compression via Compressed Subagent Output, caveman-commit README, caveman-commit Skill (+18 more)

### Community 8 - "Web Package Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, @portal/contracts, react, react-dom, react-router-dom, devDependencies, jsdom, @testing-library/react (+16 more)

### Community 9 - "Monorepo Root Config"
Cohesion: 0.11
Nodes (18): devDependencies, eslint, prettier, @types/node, typescript, typescript-eslint, vitest, name (+10 more)

### Community 10 - "Base TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, resolveJsonModule (+4 more)

### Community 11 - "Web TypeScript Config"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, jsx, lib, module, moduleResolution, noEmit, target (+3 more)

### Community 12 - "Contracts Package Config"
Cohesion: 0.17
Nodes (11): devDependencies, typescript, exports, main, name, private, scripts, build (+3 more)

### Community 13 - "API TypeScript Config"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, rootDir, types, extends, include

### Community 14 - "OpenSpec Workflow Commands"
Cohesion: 0.53
Nodes (6): openspec CLI, OPSX Apply Command, Spec-Driven Workflow, OPSX Archive Command, OPSX Explore Command, OPSX Propose Command

### Community 16 - "Package TypeScript Config"
Cohesion: 0.33
Nodes (5): compilerOptions, outDir, rootDir, extends, include

### Community 17 - "Prettier Config"
Cohesion: 0.40
Nodes (4): printWidth, semi, singleQuote, trailingComma

## Knowledge Gaps
- **144 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `name` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenderSummary` connect `Tender Source & Adapters` to `API App & Auth Routes`, `Web SPA Client & Pages`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `TenderDetail` connect `Tender Source & Adapters` to `Web SPA Client & Pages`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `TenderFilters` connect `Tender Source & Adapters` to `API App & Auth Routes`, `Web SPA Client & Pages`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `Caveman compress scripts.  This package provides tools to compress natural langu`, `Split YAML frontmatter from body. Returns (frontmatter, body).      Memory files`, `Resolve the out-of-tree backup directory for a given source file.      Backups m` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API App & Auth Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.08953418027828192 - nodes in this community are weakly interconnected._
- **Should `Tender Source & Adapters` be split into smaller, more focused modules?**
  _Cohesion score 0.09433962264150944 - nodes in this community are weakly interconnected._
- **Should `Web SPA Client & Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.08973172987974098 - nodes in this community are weakly interconnected._