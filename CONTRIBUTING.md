# Contributing

Thanks for wanting to contribute!

## Run locally

1. Copy environment variables:
   ```
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```
   npm ci
   ```
3. Run development server:
   ```
   npm run dev
   ```

## Branching

- Feature branches: `feat/<short-description>`
- Fix branches: `fix/<short-description>`
- Chore branches: `chore/<short-description>`

## PR Checklist

- [ ] Code builds: `npm run build`
- [ ] Type-checks: `tsc`
- [ ] Lint passes (if applicable)
- [ ] Tests added/updated
- [ ] No secrets in commits
- [ ] Add entry to CHANGELOG if behavior changes

## Consolidating related PRs

If you have multiple small PRs targeting the same area (e.g., QStash hardening), prefer a single consolidated PR:
- Create a branch named `feat/qstash-hardening`
- Combine the changes, fix conflicts, add tests and documentation
- Use a clear PR description that explains the motivation, changes, and manual steps (rotate secrets, env updates)

## Code Style

- Use TypeScript strict mode
- Follow existing code conventions
- Add JSDoc comments for public APIs
- Validate inputs defensively, especially for server-side operations
