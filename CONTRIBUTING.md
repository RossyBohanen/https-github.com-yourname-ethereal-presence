# Contributing to Ethereal Presence

Thank you for your interest in contributing to Ethereal Presence! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/https-github.com-yourname-ethereal-presence.git
   cd https-github.com-yourname-ethereal-presence
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   # DO NOT commit .env.local - it contains secrets!
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build the Project**
   ```bash
   npm run build
   ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names that reflect the work being done:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions or modifications
- `chore/description` - Maintenance tasks

Example: `feature/add-user-authentication` or `fix/qstash-null-handling`

### Consolidating Related PRs

When working on a larger feature that spans multiple PRs:

1. Create a tracking issue that lists all related PRs
2. Use consistent branch prefixes (e.g., `feature/auth-*`)
3. Keep PRs small and focused on a single concern
4. Reference the tracking issue in each PR description
5. Before final merge, consider consolidating into a single PR if appropriate

### Pull Request Process

Before submitting a PR, ensure:

**Code Quality Checklist:**
- [ ] Code follows existing style and conventions
- [ ] All new code has appropriate TypeScript types
- [ ] No console.log or debug statements remain
- [ ] All linter warnings are resolved
- [ ] Code has been tested locally

**Testing Checklist:**
- [ ] Existing tests pass: `npm run build`
- [ ] Manual testing completed for changed features
- [ ] Edge cases have been considered

**Documentation Checklist:**
- [ ] README.md updated if user-facing changes were made
- [ ] JSDoc comments added for new functions/classes
- [ ] .env.example updated if new environment variables were added

**Security Checklist:**
- [ ] No secrets or API keys committed
- [ ] Input validation added where appropriate
- [ ] Error messages don't expose sensitive information

**Git Checklist:**
- [ ] Commit messages are clear and descriptive
- [ ] No merge commits (rebase if needed)
- [ ] PR description explains what and why

### Code Style

- Use TypeScript for all new code
- Follow existing formatting patterns in the codebase
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

Currently, the project uses build-time TypeScript checking. When making changes:

1. Ensure TypeScript compiles without errors
2. Test changed functionality manually
3. Verify no regressions in existing features

## Reporting Issues

When reporting issues:

- Use a clear, descriptive title
- Provide steps to reproduce
- Include relevant environment details (OS, Node version, etc.)
- Add screenshots for UI-related issues
- Check if the issue already exists

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md). Do NOT open a public issue.

## Getting Help

- Open a discussion for questions
- Check existing issues for similar problems
- Review documentation in the `docs/` directory

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
