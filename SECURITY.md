# Security Policy

Report security issues responsibly.

## Reporting a Vulnerability

If you discover a potential security vulnerability, please **DO NOT** open a public issue.

### Contact Methods

- Create a private security advisory on GitHub (preferred)
- Email: Use GitHub's security contact feature
- Private issue: Request private issue access from maintainers

### What to Include

Please include:
- Steps to reproduce the vulnerability
- Affected versions/commits
- Any proof-of-concept or exploit details (if possible)
- Your contact information for follow-up

## Response Time

We will:
- Acknowledge receipt within 48 hours
- Provide an initial assessment within 5 business days
- Work with you on remediation and disclosure timeline

## Security Best Practices

When using this project:
- Never commit `.env.local` or `.env` files with real secrets
- Use `.env.example` for documentation only
- Rotate any secrets that were accidentally committed
- Use platform environment variable UI (Vercel/Netlify) for production secrets
- Keep dependencies up to date
- Use HTTPS for all production deployments
