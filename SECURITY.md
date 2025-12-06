# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Ethereal Presence seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **Using GitHub's Security Advisory feature** (recommended)
   - Go to the repository's Security tab
   - Click "Report a vulnerability"
   - Fill in the details of the vulnerability

2. **Emailing the security team**
   - Send an email to: SECURITY@github.com
   - Include "Ethereal Presence Security Vulnerability" in the subject line

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

After submitting a vulnerability report:

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Assessment**: We will assess the vulnerability and determine its severity
3. **Updates**: We will keep you informed about our progress
4. **Resolution**: We aim to resolve critical vulnerabilities within 7 days
5. **Disclosure**: We will coordinate with you on public disclosure timing

## Security Best Practices

When using Ethereal Presence:

### Environment Variables
- Never commit `.env.local`, `.env`, or any file containing secrets
- Use strong, unique values for all secret keys
- Rotate secrets regularly
- Use different secrets for different environments

### API Keys and Tokens
- Store all API keys and tokens in environment variables
- Never hardcode secrets in source code
- Use appropriate access scopes for OAuth applications
- Rotate API keys if they may have been exposed

### Deployment
- Enable HTTPS for all production deployments
- Use secure headers (CSP, HSTS, etc.)
- Keep dependencies up to date
- Enable Dependabot security alerts
- Review and address security advisories promptly

### Authentication
- Use strong password requirements
- Enable multi-factor authentication when available
- Implement proper session management
- Use secure, httpOnly cookies for session tokens

## Known Security Considerations

### QStash Token
The QStash token provides access to your message queue. Keep it secure:
- Never commit it to source control
- Rotate immediately if exposed
- Use environment variables only
- Monitor QStash usage for anomalies

### Database Access
Database credentials provide full access to application data:
- Use strong passwords
- Restrict network access
- Use read-only credentials where possible
- Enable database encryption at rest

### OAuth Credentials
OAuth client IDs and secrets authenticate your application:
- Use separate credentials for development and production
- Restrict redirect URIs to known domains
- Rotate secrets if exposed
- Monitor OAuth application usage

## Incident Response

If you believe your deployment has been compromised:

1. **Immediately rotate** all secrets and API keys
2. **Review logs** for suspicious activity
3. **Update dependencies** to latest secure versions
4. **Contact us** if the vulnerability is in core code
5. **Document** the incident for future reference

## Security Updates

Security updates will be:
- Released as soon as possible after a fix is available
- Announced in the repository's Security Advisories
- Documented in the CHANGELOG with `[SECURITY]` prefix
- Tagged with appropriate severity levels

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Contact

For security-related questions that are not vulnerabilities:
- Open a GitHub discussion in the Security category
- Tag the issue with the `security` label

Thank you for helping keep Ethereal Presence and our users safe!
