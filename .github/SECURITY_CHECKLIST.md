# Security Review Checklist

Use this checklist when reviewing code changes or adding new features to ensure security best practices are followed.

## Input Validation

- [ ] All user inputs are validated for type, format, and length
- [ ] Input sanitization is applied based on context (HTML, SQL, JSON, etc.)
- [ ] Query parameters are validated and sanitized
- [ ] POST body data is validated
- [ ] File uploads (if any) are validated for type and size
- [ ] Numeric inputs are checked for valid ranges
- [ ] String inputs have maximum length limits

## Output Encoding

- [ ] HTML output is properly escaped using `escapeHtml()` or similar
- [ ] JSON responses use `JSON.stringify()` for automatic escaping
- [ ] URL parameters are properly encoded
- [ ] Database queries use parameterized statements (if applicable)
- [ ] No user input is directly inserted into HTML/SQL/JavaScript

## Authentication & Authorization

- [ ] Authentication is required for protected endpoints
- [ ] Authorization checks verify user permissions
- [ ] Session management is secure (HttpOnly cookies, secure flag)
- [ ] Password requirements are enforced (if applicable)
- [ ] CSRF protection is implemented for state-changing operations
- [ ] Failed authentication attempts are rate-limited
- [ ] Password reset flows are secure and time-limited

## Secret Management

- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] Environment variables are used for all secrets
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] Production secrets are stored in Netlify UI
- [ ] Secret values have sufficient entropy (random generation)
- [ ] Secrets are unique per environment
- [ ] Old secrets are rotated after exposure

## Dependencies

- [ ] `npm audit` shows 0 vulnerabilities
- [ ] All dependencies are from trusted sources
- [ ] Dependencies are kept up to date
- [ ] Unused dependencies have been removed
- [ ] Dependency versions are pinned or use safe ranges
- [ ] New dependencies have been security scanned

## Headers & Transport

- [ ] Security headers are configured (see netlify.toml)
- [ ] CSP policy is appropriate for the application
- [ ] HTTPS is enforced (HSTS header)
- [ ] X-Frame-Options prevents clickjacking
- [ ] X-Content-Type-Options prevents MIME sniffing
- [ ] Appropriate cache headers are set
- [ ] CORS policy is restrictive (if applicable)

## Error Handling

- [ ] Error messages don't expose sensitive information
- [ ] Stack traces are not shown in production
- [ ] Generic error messages are returned to users
- [ ] Detailed errors are logged server-side only
- [ ] Database errors don't expose schema details
- [ ] File path information is not exposed

## Logging & Monitoring

- [ ] Security events are logged (auth failures, etc.)
- [ ] No sensitive data is logged (passwords, tokens, PII)
- [ ] Logs are structured and parseable
- [ ] Error logs include sufficient context for debugging
- [ ] Log retention policy is defined
- [ ] Suspicious patterns trigger alerts

## Rate Limiting

- [ ] API endpoints have appropriate rate limits
- [ ] Authentication endpoints are rate-limited aggressively
- [ ] Rate limit responses include proper HTTP status (429)
- [ ] Retry-After header is included in rate limit responses
- [ ] Rate limits are tested and validated

## XSS Prevention

- [ ] All dynamic HTML content is escaped
- [ ] `dangerouslySetInnerHTML` is not used (or justified)
- [ ] CSP policy restricts inline scripts (or uses nonces)
- [ ] User-generated content is sanitized
- [ ] React's automatic escaping is not bypassed
- [ ] Template strings don't include raw user input

## Injection Prevention

- [ ] SQL queries use parameterized statements (if applicable)
- [ ] NoSQL queries are properly escaped (if applicable)
- [ ] Command execution is avoided or properly sanitized
- [ ] Path traversal is prevented (file operations)
- [ ] XML/LDAP injection is prevented (if applicable)

## Data Protection

- [ ] Sensitive data is encrypted in transit (HTTPS)
- [ ] Sensitive data is encrypted at rest (if stored)
- [ ] PII handling complies with regulations (GDPR, etc.)
- [ ] Data minimization is practiced
- [ ] Data retention policies are followed
- [ ] Secure deletion is implemented when needed

## Testing

- [ ] Security-focused unit tests are included
- [ ] Integration tests cover security controls
- [ ] Input validation edge cases are tested
- [ ] Authentication/authorization flows are tested
- [ ] Error handling is tested
- [ ] CodeQL scan passes with no new alerts

## Code Review

- [ ] Code has been reviewed by another developer
- [ ] Security concerns are addressed in review
- [ ] No obvious security vulnerabilities present
- [ ] Follows project security guidelines
- [ ] Changes are minimal and focused
- [ ] Security implications are documented

## Documentation

- [ ] Security features are documented
- [ ] Configuration requirements are documented
- [ ] Known limitations are documented
- [ ] Security considerations are noted in README
- [ ] SECURITY.md is updated if needed

## Deployment

- [ ] Production secrets are configured in Netlify UI
- [ ] Build process doesn't expose secrets
- [ ] Security headers are verified in production
- [ ] HTTPS is enforced in production
- [ ] Monitoring and alerting are configured
- [ ] Rollback plan is in place

## Post-Deployment

- [ ] Security headers are verified with browser tools
- [ ] CSP violations are monitored
- [ ] Error rates are monitored
- [ ] Performance impact is measured
- [ ] User feedback is collected
- [ ] Incident response plan is ready

## Notes

- This checklist should be updated as new security practices are adopted
- Not all items apply to every change - use judgment
- When in doubt, consult SECURITY.md or ask for a security review
- Security is everyone's responsibility

## Quick Reference

Common security functions in this codebase:
- `sanitizeInput(input: string)`: Remove control characters, limit length
- `escapeHtml(unsafe: string)`: Escape HTML entities
- Environment variables: Use `process.env.VARIABLE_NAME` with fallbacks
