# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Greenfield MVP: **Portal de Convocatorias Públicas** — a portal to explore, filter, and bookmark Colombian public-tender data (SECOP I). No application code exists yet; the repo currently holds only the OpenSpec plan.

## Workflow: OpenSpec (spec-driven)

- The approved plan lives in `openspec/changes/add-portal-convocatorias-mvp/` (`proposal.md`, `design.md`, `specs/`, `tasks.md`). Read these before implementing.
- Implement against the checklist in `tasks.md`, checking off items (`- [x]`) as they're completed. Do **not** deviate from the approved specs/design without asking first.
- Use the OpenSpec skills (`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`) for proposing new changes and archiving completed ones.

## Fixed tech stack (partner constraints — do not substitute)

- **API**: Node.js + TypeScript + **Fastify**. **Web**: React + **Vite** + TypeScript.
- **Persistence**: SQLite via **`better-sqlite3`** (synchronous), with versioned migrations.
- **Tests**: **Vitest**.
- **Monorepo** with workspaces: `apps/api`, `apps/web`, `packages/contracts` (shared types/DTOs).
- Auth: **JWT** (HS256).

## Non-negotiable design rules

- **Exactly three domain tables**: `usuarios`, `bookmarks`, `busquedas`. Tender data is **not** persisted — it's fetched live from SECOP. Do not add a local tenders table or sync layer.
- **Hexagonal boundary**: the core depends on the `TenderSource` port, never on concrete HTTP. Adapters: `SodaTenderSource` (primary search/filter via SODA/`datos.gov.co`) and `CromaEnrichmentSource` (optional detail enrichment, gated by `CROMA_API_KEY`).
- Client and saved searches use the **normalized filter model** (`q`, `entidad`, `departamento`, `modalidad`, `valorMin/Max`, `fechaDesde/Hasta`, `estado`, `orden`, `page`, `pageSize`). `SodaTenderSource` translates it to SODA params — the rest of the system never touches raw SODA syntax.

## Language convention

Domain and DB terms stay in **Spanish** (`usuarios`, `busquedas`, `notice_uid`, etc.). Everything else — code identifiers, comments, commit messages, PR descriptions — in **English**.

## Environment / security

- Required at startup: `JWT_SECRET`. Optional: `SODA_APP_TOKEN` (recommended, avoids SODA IP throttling), `CROMA_API_KEY` (enables Croma enrichment). Startup must fail fast if required secrets are missing.
- Never commit secrets. Config comes from the environment.
- Build the SODA `$where` from validated/escaped values from the normalized model — never concatenate raw user input (injection).
- Auth responses and timing must be uniform (avoid user enumeration); return generic messages on invalid credentials.
