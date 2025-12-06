# Contributing to Ethereal Presence

Thank you for your interest in contributing to Ethereal Presence! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Local Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/https-github.com-yourname-ethereal-presence.git
   cd https-github.com-yourname-ethereal-presence
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your local configuration. **Never commit this file!**

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

5. **Build the Project**
   ```bash
   npm run build
   ```

## Development Workflow

### Branch Naming Conventions

Use descriptive branch names that indicate the type of change:

- `feature/short-description` - New features
- `fix/short-description` - Bug fixes
- `docs/short-description` - Documentation updates
- `refactor/short-description` - Code refactoring
- `test/short-description` - Test additions or updates
- `chore/short-description` - Maintenance tasks

Examples:
- `feature/add-user-profile`
- `fix/email-validation-bug`
- `docs/update-readme`

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update documentation as needed

3. **Test Your Changes**
   - Ensure all existing tests pass
   - Add new tests for new functionality
   - Test in both development and production builds

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add user profile feature"
   ```
   
   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Test additions or updates
   - `chore:` - Maintenance tasks

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template

## Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventional commit format
- [ ] No secrets or sensitive data committed
- [ ] `.env.local` and other local config files not included
- [ ] CHANGELOG.md updated (for significant changes)
- [ ] PR description clearly explains the changes

## Consolidating Related PRs

When you have multiple related PRs:

1. **Create a consolidation branch**
   ```bash
   git checkout -b consolidate/feature-name main
   ```

2. **Cherry-pick or merge related PRs**
   ```bash
   git cherry-pick <commit-hash>
   # or
   git merge feature/branch-1
   git merge feature/branch-2
   ```

3. **Resolve conflicts and test thoroughly**

4. **Create a single consolidated PR** with a clear description of all changes

## Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs

## Testing

- Write tests for new features and bug fixes
- Ensure tests are clear and maintainable
- Test edge cases and error conditions
- Run the full test suite before submitting

## Security

- Never commit secrets, API keys, or passwords
- Use environment variables for sensitive data
- Report security vulnerabilities privately (see SECURITY.md)
- Follow security best practices

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Review the documentation
3. Open a new issue with the `question` label
4. Join our community discussions

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct (see CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

By contributing to Ethereal Presence, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
