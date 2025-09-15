# Contributing

Thanks for helping improve the NDIS Support Chatbot.

## How We Work
- Use short-lived branches: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`.
- Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- One focused PR per change. Keep PRs small and easy to review.

## Development Setup
- Node 20+, pnpm or npm.
- Postgres 16+ (with pgvector when the DB layer lands).
- Copy `.env.example` to `.env` and fill values when present.

## PR Checklist
- [ ] Code builds locally (`pnpm build` or `npm run build`).
- [ ] Lint passes.
- [ ] Tests pass (when present).
- [ ] No secrets included.
- [ ] Docs/configs updated if behavior changed.

## Issue Guidance
- **Bug:** steps to reproduce, expected vs actual, logs.
- **Feature:** user story, acceptance criteria, any security/a11y impacts.

## Accessibility and Security
- Follow WCAG 2.1 AA for UI.
- Validate inputs (e.g., Zod) and keep external content sources allowlisted.
