# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Ethereal Presence seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using one of the following methods:

1. **GitHub Security Advisories** (Recommended)
   - Go to the repository's Security tab
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**
   - Send an email to: SECURITY@github.com
   - Include "SECURITY" in the subject line
   - Include the repository name in the body

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, privilege escalation)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Any potential mitigations you've identified

### Response Timeline

- **Initial Response**: Within 48 hours of receiving the report
- **Status Update**: Within 7 days with an assessment of the vulnerability
- **Fix Timeline**: Depends on severity and complexity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium/Low: 30-90 days

### Disclosure Policy

- We request that you do not publicly disclose the vulnerability until we've had a chance to address it
- Once a fix is released, we will credit you in the security advisory (unless you prefer to remain anonymous)
- We follow coordinated disclosure practices

## Security Best Practices for Contributors

When contributing to this project:

1. **Never commit secrets**: Use environment variables for all sensitive data
2. **Validate inputs**: Always validate and sanitize user inputs
3. **Use dependencies wisely**: Keep dependencies up to date and review security advisories
4. **Follow least privilege**: Grant only the minimum necessary permissions
5. **Handle errors safely**: Don't expose sensitive information in error messages
6. **Review before merge**: Have security-conscious peer reviews for all PRs

## Known Security Considerations

- This application uses environment variables for configuration. Ensure `.env.local` is never committed.
- The QStash integration requires proper token management. Never expose QSTASH_TOKEN in client-side code.
- OpenTelemetry headers may contain API keys. Store them securely and rotate regularly.

## Security Updates

Subscribe to this repository to receive notifications about security updates. Critical security patches will be clearly marked in release notes.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
