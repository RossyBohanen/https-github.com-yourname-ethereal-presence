# Security Policy

## Overview

This document outlines the security practices, policies, and guidelines for the Ethereal Presence project. Security is a continuous process, and this policy helps ensure that all code, configurations, and practices meet high security standards.

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to the repository maintainers
3. Provide detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a timeline for addressing the issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

We only support the latest version deployed on the `main` branch.

## Security Best Practices

### 1. Input Validation and Sanitization

All user inputs must be validated and sanitized before processing:

#### Current Implementations

**Netlify Functions (netlify/functions/hello.mts)**
- Query parameters are sanitized using `sanitizeInput()` function
- Control characters are removed using regex: `/[\x00-\x1F\x7F-\x9F]/g`
- Input length is limited to 100 characters to prevent abuse
- JSON.stringify() provides automatic escaping for special characters

**Edge Functions (netlify/edge-functions/geo-personalization.ts)**
- HTML output is escaped using `escapeHtml()` function
- Escapes: `&`, `<`, `>`, `"`, `'`, and backticks
- Prevents XSS attacks through geo data injection

#### Guidelines for New Code
- Always validate input length, type, and format
- Use allowlists (whitelists) rather than denylists (blacklists) when possible
- Sanitize based on context (HTML, SQL, JSON, etc.)
- Never trust data from external sources, including:
  - Query parameters
  - POST body data
  - Headers
  - Third-party APIs (including geo data)
  - File uploads

### 2. Cross-Site Scripting (XSS) Prevention

**Implemented Protections:**
- HTML escaping for all dynamic content in HTML context
- Content Security Policy (CSP) headers configured in netlify.toml
- Input sanitization for control characters
- JSON context for API responses (provides automatic escaping)

**Guidelines:**
- Never insert user input directly into HTML without escaping
- Use framework-provided sanitization (React escapes by default)
- Set appropriate Content-Type headers
- Implement strict CSP policies
- Avoid `dangerouslySetInnerHTML` in React unless absolutely necessary

### 3. Secret Management

**Critical Rules:**
- **NEVER** commit secrets to the repository
- **NEVER** hardcode API keys, passwords, or tokens in source code
- Use `.env.local` for local development (already in .gitignore)
- Use Netlify UI for production environment variables

**Environment Variables:**
- Store all secrets in Netlify's environment variables UI
- Use `.env.example` to document required variables (without values)
- Secrets should be:
  - Randomly generated with sufficient entropy
  - Rotated regularly
  - Unique per environment (dev/staging/production)

**Current .gitignore Protection:**
```
.env
.env.local
.env.*.local
```

### 4. Dependency Security

**Current Status:**
- npm audit: 0 vulnerabilities found
- All dependencies are up to date

**Best Practices:**
- Run `npm audit` regularly to check for vulnerabilities
- Update dependencies promptly when security patches are released
- Review dependency changes before upgrading
- Use `npm audit fix` to automatically fix vulnerabilities when safe
- Avoid dependencies with known security issues or poor maintenance

**Regular Maintenance:**
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically (if possible)
npm audit fix

# Check for outdated packages
npm outdated

# Update all dependencies to latest safe versions
npm update
```

### 5. Security Headers

Security headers are configured in `netlify.toml` and applied to all responses:

#### Implemented Headers

```toml
X-Frame-Options = "DENY"
# Prevents clickjacking by denying iframe embedding

X-Content-Type-Options = "nosniff"
# Prevents MIME type sniffing

X-XSS-Protection = "1; mode=block"
# Enables browser XSS filter (legacy browsers)

Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
# Enforces HTTPS for 1 year, including subdomains

Referrer-Policy = "strict-origin-when-cross-origin"
# Controls referrer information sent with requests

Permissions-Policy = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
# Restricts browser features that can be used

Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.netlify.com; frame-ancestors 'none'"
# Defines approved sources for content types
```

#### CSP Policy Breakdown

- `default-src 'self'`: Only load resources from same origin by default
- `script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com`: Allow scripts from same origin, inline scripts (for Tailwind), and Tailwind CDN
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Allow styles from same origin, inline styles, and Google Fonts
- `font-src 'self' https://fonts.gstatic.com`: Allow fonts from same origin and Google Fonts
- `img-src 'self' data: https:`: Allow images from same origin, data URIs, and any HTTPS source
- `connect-src 'self' https://api.netlify.com`: Allow connections to same origin and Netlify API
- `frame-ancestors 'none'`: Prevent embedding in frames (redundant with X-Frame-Options but more modern)

**Note on 'unsafe-inline':**
Currently using `'unsafe-inline'` for scripts and styles due to Tailwind CDN and inline styles. For improved security:
- Consider moving to a build-time Tailwind setup
- Use CSP nonces for inline scripts
- Use CSS modules or styled-components instead of inline styles

### 6. Authentication and Authorization

**Current Status:**
- No authentication implemented in production code
- Template code in `lib/` and `app/` directories contains auth examples but is not deployed

**Guidelines for Future Implementation:**
- Use established authentication libraries (OAuth, JWT, etc.)
- Never roll your own cryptography
- Implement proper session management
- Use secure, HttpOnly cookies for session tokens
- Implement CSRF protection for state-changing operations
- Use strong password hashing (bcrypt, argon2, etc.)
- Implement rate limiting on authentication endpoints
- Add multi-factor authentication (MFA) support when possible

### 7. Rate Limiting

**Current Status:**
- No rate limiting implemented yet

**Recommendations:**
- Implement rate limiting on all API endpoints
- Use Netlify's rate limiting features or a service like Cloudflare
- Consider different limits for:
  - Authentication endpoints: 5 requests per minute
  - API endpoints: 100 requests per minute
  - Health checks: No limit
- Return proper HTTP 429 (Too Many Requests) status codes
- Include Retry-After header in rate limit responses

### 8. HTTPS and Transport Security

**Current Implementation:**
- Netlify provides automatic HTTPS for all deployments
- HSTS header enforces HTTPS for 1 year
- HSTS includes subdomains and preload flag

**Best Practices:**
- Never use HTTP in production
- All external resources (CDNs, APIs) must use HTTPS
- Consider HSTS preloading for additional security
- Regularly check SSL/TLS configuration with tools like SSL Labs

### 9. Error Handling and Information Disclosure

**Best Practices:**
- Never expose stack traces in production
- Return generic error messages to users
- Log detailed errors server-side only
- Don't expose:
  - Database schema or query details
  - Server paths or configuration
  - Version numbers (unless necessary)
  - Internal IP addresses or hostnames

**Current Implementation:**
- Health endpoint exposes minimal information
- Error responses use generic messages
- No debug information in production

### 10. Logging and Monitoring

**Guidelines:**
- Log security-relevant events:
  - Authentication attempts (success and failure)
  - Authorization failures
  - Input validation failures
  - Rate limit violations
- Never log sensitive information:
  - Passwords or password hashes
  - API keys or tokens
  - Credit card numbers or PII
  - Session tokens
- Use structured logging (JSON format)
- Implement log retention policies
- Monitor logs for suspicious patterns

### 11. Build and Deployment Security

**Current Practices:**
- Build runs on Netlify's infrastructure
- Deploy from `main` branch only for production
- Deploy previews for pull requests (safe for testing)
- No secrets in build output

**Best Practices:**
- Review all pull requests before merging
- Use branch protection rules
- Require status checks to pass before merging
- Use automated security scanning (CodeQL, npm audit)
- Keep build dependencies up to date
- Minimize attack surface in production builds

## Security Scanning

### CodeQL Analysis

CodeQL is configured to scan the codebase for security vulnerabilities:
- Runs automatically on pull requests and main branch commits
- Focuses on common security issues (XSS, SQL injection, etc.)
- Check the latest scan results in the GitHub Security tab

### Manual Security Review

Regular security reviews should include:
1. Code review focusing on security concerns
2. Dependency audit (`npm audit`)
3. Configuration review (netlify.toml, CSP, etc.)
4. Secret scanning (check for accidentally committed secrets)
5. Testing security controls (input validation, XSS protection, etc.)

## Security Checklist for New Features

Before deploying new features, ensure:

- [ ] All user inputs are validated and sanitized
- [ ] Output is properly escaped for the context (HTML, JSON, etc.)
- [ ] No secrets or sensitive data in source code
- [ ] Dependencies have no known vulnerabilities
- [ ] Security headers are properly configured
- [ ] Error handling doesn't expose sensitive information
- [ ] Authentication and authorization are properly implemented
- [ ] Rate limiting is configured (if applicable)
- [ ] HTTPS is enforced
- [ ] Logging doesn't capture sensitive information
- [ ] Code has been reviewed for security issues
- [ ] CodeQL scan passes with no new alerts
- [ ] Security tests are passing

## Incident Response

In case of a security incident:

1. **Contain**: Immediately mitigate the threat (disable affected endpoint, rotate compromised credentials, etc.)
2. **Assess**: Determine the scope and impact of the incident
3. **Notify**: Inform affected users if personal data was compromised
4. **Fix**: Deploy a fix as quickly as possible
5. **Review**: Conduct a post-mortem to prevent similar incidents
6. **Document**: Update this security policy with lessons learned

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Netlify Security](https://www.netlify.com/security/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## Updates to This Policy

This security policy is a living document and should be updated:
- When new security features are added
- When vulnerabilities are discovered and fixed
- When security best practices evolve
- At least quarterly during security reviews

**Note:** Review and update this document regularly to ensure it reflects current practices. Check the git history of this file for the most recent changes.
