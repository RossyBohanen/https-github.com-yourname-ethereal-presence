# Contributing to Ethereal Presence

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (for local development)
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence.git
   cd https-github.com-yourname-ethereal-presence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and fill in your local configuration. **Never commit `.env.local` to the repository.**

4. **Set up the database**
   - Create a PostgreSQL database
   - Update `DATABASE_URL` in `.env.local`
   - Run migrations (if applicable)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build the project**
   ```bash
   npm run build
   ```

7. **Run tests** (if available)
   ```bash
   npm test
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following these patterns:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

Examples:
- `feature/add-user-profile`
- `fix/qstash-null-handling`
- `docs/update-readme`

### Making Changes

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, self-documenting code
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   - Ensure the build succeeds: `npm run build`
   - Run tests: `npm test` (if available)
   - Test in your local environment

4. **Commit your changes**
   - Write clear, descriptive commit messages
   - Use conventional commit format when possible:
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation
     - `refactor:` for code refactoring
     - `test:` for test changes

   Example:
   ```bash
   git commit -m "feat: add input validation to QStash wrapper"
   ```

5. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

### Before Submitting

- [ ] Code builds successfully (`npm run build`)
- [ ] All tests pass (if tests exist)
- [ ] No linting errors
- [ ] No secrets or sensitive data committed
- [ ] Environment variables use placeholders
- [ ] Documentation updated if needed

### PR Checklist

When opening a pull request:

1. **Title**: Clear and descriptive
2. **Description**: Include:
   - Summary of changes
   - Motivation/context
   - Related issues (if any)
   - Testing performed
   - Screenshots (for UI changes)

3. **Changes**:
   - Keep PRs focused and reasonably sized
   - One logical change per PR
   - Address review feedback promptly

### Consolidation Guidance

When consolidating multiple related changes:

1. **Group related changes** into a single PR when they:
   - Address the same issue or feature
   - Have interdependencies
   - Form a logical unit of work

2. **Include comprehensive testing** for all consolidated changes

3. **Document all changes** clearly in the PR description with a checklist

4. **List manual actions** required after merge (e.g., environment variable updates, secret rotation)

## Code Style

- **TypeScript**: Use strict mode, add types, avoid `any`
- **Formatting**: Follow existing code formatting
- **Comments**: Add JSDoc for public APIs and complex logic
- **Naming**: Use descriptive names, follow existing conventions
- **Error Handling**: Use proper error handling, avoid silent failures
- **Security**: Never commit secrets, validate inputs, use safe operations

## Testing

- Write tests for new functionality
- Maintain or improve code coverage
- Test edge cases and error conditions
- Mock external dependencies appropriately

## Security

- See [SECURITY.md](./SECURITY.md) for security guidelines
- Never commit secrets, API keys, or sensitive data
- Use environment variables for configuration
- Validate and sanitize all inputs
- Report security vulnerabilities privately (see SECURITY.md)

## Questions?

If you have questions:
- Check existing documentation
- Look at similar code in the repository
- Open an issue for discussion
- Reach out to maintainers

Thank you for contributing! 🎉
