# Function Review Report
**Date**: 2025-12-06  
**Scope**: All functions in netlify/functions/, netlify/edge-functions/, lib/, and app/ directories

## Summary

This repository contains two categories of code:
1. **Working/Deployed Functions**: In `netlify/functions/` and `netlify/edge-functions/`
2. **Template/Example Code**: In `lib/` and `app/` directories (not compiled, missing dependencies)

---

## 1. Working Netlify Serverless Functions

### ✅ netlify/functions/health.mts
**Purpose**: Health check endpoint  
**Status**: Working  
**Security**: Good  
**Findings**:
- ✅ Proper TypeScript types
- ✅ Structured health response with status codes
- ✅ Security headers (Cache-Control: no-store)
- ✅ Geo-based health checks
- ⚠️ Minor: `startTime` is module-scoped (resets on cold starts, acceptable for serverless)

**Recommendation**: No changes needed

---

### ⚠️ netlify/functions/hello.mts
**Purpose**: Simple greeting endpoint with geo data  
**Status**: Working  
**Security**: Has vulnerability  
**Findings**:
- ✅ Proper TypeScript types
- ✅ URL parameter parsing
- ✅ Structured JSON response
- 🔴 **XSS Vulnerability**: `name` parameter from query string is not sanitized before being included in JSON response. While JSON context provides some protection, this could still be exploited.

**Recommendation**: Sanitize the `name` parameter before use

---

## 2. Working Netlify Edge Functions

### ⚠️ netlify/edge-functions/geo-personalization.ts
**Purpose**: Inject geo-based welcome banner into HTML  
**Status**: Working  
**Security**: Has vulnerability  
**Findings**:
- ✅ Preserves security headers correctly (X-Frame-Options, CSP, HSTS, etc.)
- ✅ Proper HTML injection after `<body>` tag
- ✅ Excludes API paths appropriately
- ✅ Good CSS animation
- 🔴 **XSS Vulnerability**: `city` and `country` values from `context.geo` are not HTML-escaped before injection into the HTML banner. A malicious proxy or modified geo data could inject malicious scripts.

**Recommendation**: HTML-escape geo data before injection

---

## 3. Template Code in lib/ Directory

**Status**: Not compiled, missing dependencies, excluded from tsconfig.json  
**Note**: According to repository memories, these are Next.js template files not used in production

### lib/db/client.ts
- Missing packages: `drizzle-orm`, `postgres`, `@kubiks/otel-drizzle`
- 🔴 **Security Issue**: DATABASE_URL fallback to `'postgres://localhost/ethereal_presence'` could cause confusion
- Not included in build

### lib/db/schema.ts
- Missing package: `drizzle-orm`
- Password field has no documented hashing
- Schema looks reasonable but unused

### lib/billing/autumn.ts
- Missing packages: `autumn`, `@kubiks/otel-autumn`
- 🔴 **Security Issue**: API key defaults to empty string `""` when `AUTUMN_API_KEY` is not set
- Functions look reasonable but unused

### lib/workflows/onboarding.ts
- Missing packages: `@upstash/workflow`, `@kubiks/otel-upstash-workflow`
- Hardcoded email addresses
- References other unused lib modules
- Not included in build

### lib/email/resend.ts
- Missing packages: `resend`, `@kubiks/otel-resend`
- 🔴 **Security Issue**: No API key validation (undefined if RESEND_API_KEY not set)
- 🔴 **XSS Vulnerability**: Email templates interpolate `name` directly into HTML without escaping
- 🔴 **Security Issue**: `sendResetPasswordEmail` doesn't validate that `resetLink` is safe (could be XSS or phishing)
- Not included in build

### lib/auth/config.ts
- Missing packages: `better-auth`, `@kubiks/otel-better-auth`
- 🔴 **CRITICAL Security Issue**: Secret defaults to hardcoded `"your-secret-key"`
- 🔴 **Security Issue**: OAuth secrets default to empty strings `""`
- Not included in build

---

## 4. Template Code in app/ Directory

**Status**: Not compiled, missing dependencies  
**Note**: Next.js API routes, not used in this Netlify deployment

### app/api/queue/email.ts
- Missing package: `next/server`
- 🔴 **Security Issue**: No input validation on `email` or `subject`
- 🔴 **Security Issue**: No authentication check - anyone can call this endpoint
- ✅ Generic error messages (good for security)
- Not included in build

### app/api/billing/route.ts
- Missing package: `next/server`
- 🔴 **Security Issue**: No authentication check
- 🔴 **Security Issue**: No input validation
- Missing rate limiting
- ✅ Generic error messages (good)
- Not included in build

### app/api/auth/route.ts
- Missing package: `better-auth`
- Simple proxy to better-auth (minimal code)
- Not included in build

---

## Critical Security Issues Summary

### In Production Code (netlify/ directory):
1. **XSS in hello.mts**: Name parameter not sanitized
2. **XSS in geo-personalization.ts**: City/country values not HTML-escaped

### In Template Code (lib/ and app/ directories):
These are NOT in production but should be fixed if ever used:
1. Hardcoded default secrets in auth config
2. Missing input validation in API routes
3. XSS vulnerabilities in email templates
4. No authentication checks in API routes
5. Missing API key validation

---

## Recommendations

### Immediate Action (Production Code):
1. ✅ Fix XSS vulnerability in `netlify/functions/hello.mts`
2. ✅ Fix XSS vulnerability in `netlify/edge-functions/geo-personalization.ts`

### For Template Code (lib/ and app/):
1. Add clear README indicating these are templates/examples
2. Either remove unused code or fix security issues
3. Add input validation to all API routes
4. Never use hardcoded secrets
5. Add authentication checks to protected endpoints

### General:
1. Consider adding ESLint security rules
2. Add automated security scanning to CI/CD
3. Document which code is production vs template
