# Security Policy

## Reporting a Vulnerability

We take the security of Ethereal Presence seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by:

1. **Email**: Send details to [security contact placeholder - update with actual contact]
2. **GitHub Security Advisories**: Use the [Security tab](https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence/security/advisories) to privately report vulnerabilities

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity and complexity

## Security Best Practices

### For Contributors

- **Never commit secrets**: API keys, tokens, passwords, or sensitive data
- **Use environment variables**: Store configuration in `.env.local` (never committed)
- **Validate inputs**: Always validate and sanitize user inputs
- **Use parameterized queries**: Prevent SQL injection
- **Escape outputs**: Prevent XSS attacks
- **Keep dependencies updated**: Run `npm audit` regularly
- **Review security warnings**: Address Dependabot alerts promptly

### For Deployers

- **Rotate secrets after exposure**: If any secret is accidentally committed, rotate immediately
- **Use secure environment variable management**: 
  - Vercel: Use Environment Variables in project settings
  - Netlify: Use Site Settings > Environment Variables
- **Enable branch protection**: Require reviews for main branch
- **Enable Dependabot**: Auto-update dependencies with known vulnerabilities
- **Enable CodeQL**: Automated security scanning
- **Use HTTPS**: Ensure all production traffic uses HTTPS
- **Set secure headers**: Configure security headers (CSP, HSTS, etc.)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

*We currently support only the main branch. Once we release versioned releases, this table will be updated.*

## Known Security Considerations

### Environment Variables

- `.env.local` is gitignored but **must never be committed**
- All sensitive values in `.env.example` are placeholders
- If `.env.local` was ever committed, all secrets must be rotated

### QStash Integration

- QStash token must be kept secure
- Input validation is implemented for all queue operations
- Failed operations return structured errors without exposing internals

### Database

- Connection strings must use secure credentials
- Use connection pooling for production
- Never log database credentials

### Authentication

- Session secrets must be cryptographically secure
- OAuth client secrets must be kept private
- Implement rate limiting for authentication endpoints

### Third-Party Services

- API keys for Resend, Autumn, and other services must be secured
- Use separate keys for development and production
- Rotate keys regularly

## Incident Response

If a security incident occurs:

1. **Assess the impact**: Determine scope and severity
2. **Contain the issue**: Take immediate action to limit damage
3. **Notify affected parties**: If user data is compromised
4. **Patch the vulnerability**: Deploy fix as quickly as possible
5. **Post-mortem**: Document what happened and how to prevent recurrence

## Security Updates

Security updates will be:
- Released as soon as possible after discovery
- Documented in release notes
- Communicated through GitHub Security Advisories (for severe issues)

## Questions?

For non-security-related questions, please open a regular GitHub issue. For security concerns, follow the reporting process above.

---

**Last Updated**: 2025-12-06
