# Therapist Portal Template Documentation

## Overview

The `lib/` and `app/` directories contain template code for a comprehensive **Therapist Portal** backend system. This is example/reference code that demonstrates how to implement a full-featured healthcare platform with authentication, billing, database management, and workflows.

## ⚠️ Important: Template Code Only

**These files are NOT currently active in the Grief VR application.** They serve as:

- Reference implementations for future features
- Templates for backend functionality
- Examples of best practices for healthcare SaaS architecture

## Architecture

### Backend Libraries (`lib/`)

The `lib/` directory contains core backend functionality:

```
lib/
├── auth/          # Authentication using better-auth
├── billing/       # Subscription billing with Autumn
├── db/            # Database schema and client (PostgreSQL with Drizzle ORM)
├── email/         # Email functionality with Resend
└── workflows/     # Background job processing with Upstash Workflow
```

### API Routes (`app/`)

The `app/` directory contains Next.js-style API routes:

```
app/
└── api/
    ├── auth/      # Authentication endpoints
    ├── billing/   # Billing and subscription endpoints
    └── queue/     # Background job queue endpoints
```

## Features Included

### 1. Authentication (`lib/auth/`)
- User registration and login
- Session management
- Better Auth integration
- OpenTelemetry instrumentation

### 2. Database Schema (`lib/db/`)
- **Users table**: User accounts and profiles
- **Subscriptions table**: Plan management (free, pro, enterprise)
- **Feature usage table**: Usage tracking and limits
- Drizzle ORM for type-safe database operations
- PostgreSQL with connection pooling

### 3. Billing (`lib/billing/`)
- Autumn billing integration
- Subscription management
- Usage-based pricing
- Payment processing
- OpenTelemetry instrumentation

### 4. Email (`lib/email/`)
- Resend email service integration
- Transactional emails
- Email templates
- OpenTelemetry instrumentation

### 5. Workflows (`lib/workflows/`)
- Onboarding automation
- Background job processing
- Upstash Workflow integration
- Multi-step workflows with error handling

## Required Dependencies

To activate this code, you would need to install the following dependencies:

### Core Dependencies
```json
{
  "dependencies": {
    "better-auth": "^1.0.0",
    "drizzle-orm": "^0.33.0",
    "postgres": "^3.4.0",
    "autumn": "^1.0.0",
    "resend": "^4.0.0",
    "@upstash/workflow": "^1.0.0"
  }
}
```

### OpenTelemetry Instrumentation
```json
{
  "dependencies": {
    "@kubiks/otel-better-auth": "latest",
    "@kubiks/otel-autumn": "latest",
    "@kubiks/otel-drizzle": "latest",
    "@kubiks/otel-resend": "latest",
    "@kubiks/otel-upstash-workflow": "latest"
  }
}
```

## Database Schema

### Users
```typescript
- id: serial (primary key)
- email: text (unique, required)
- name: text
- password: text (required)
- createdAt: timestamp
```

### Subscriptions
```typescript
- id: serial (primary key)
- userId: integer (foreign key to users)
- plan: text (free, pro, enterprise)
- status: text (active, cancelled, trial)
- price: decimal
- renewalDate: timestamp
- createdAt: timestamp
- updatedAt: timestamp
```

### Feature Usage
```typescript
- id: serial (primary key)
- userId: integer (foreign key to users)
- feature: text (e.g., api_calls, storage)
- count: integer
- limit: integer (null for unlimited)
- resetDate: timestamp
- updatedAt: timestamp
```

## Integration Guide

### Step 1: Install Dependencies
```bash
npm install better-auth drizzle-orm postgres autumn resend @upstash/workflow
npm install @kubiks/otel-better-auth @kubiks/otel-autumn @kubiks/otel-drizzle @kubiks/otel-resend @kubiks/otel-upstash-workflow
```

### Step 2: Configure Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
AUTH_SECRET=your-secret-key
AUTH_URL=https://yourdomain.com

# Billing
AUTUMN_API_KEY=your-autumn-api-key

# Email
RESEND_API_KEY=your-resend-api-key

# Workflows
UPSTASH_WORKFLOW_URL=your-upstash-url
UPSTASH_WORKFLOW_TOKEN=your-upstash-token
```

### Step 3: Update TypeScript Configuration
Remove `lib` and `app` from the `exclude` array in `tsconfig.json`:

```json
{
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Migrate from Vite to Next.js (Optional)
This template code is designed for Next.js. To use it, you would need to:
1. Install Next.js: `npm install next`
2. Update the project structure to follow Next.js conventions
3. Configure `next.config.js`
4. Update build scripts in `package.json`

Alternatively, adapt the code to work with Netlify Functions instead of Next.js API routes.

### Step 5: Run Database Migrations
```bash
# Generate migrations
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit push:pg
```

### Step 6: Test the Integration
```bash
# Start development server
npm run dev

# Test authentication
curl http://localhost:3000/api/auth/session

# Test billing
curl http://localhost:3000/api/billing
```

## Security Considerations

### Input Validation
All user inputs in this template code should be validated and sanitized before use.

### Authentication
- Use strong password hashing (bcrypt/argon2)
- Implement rate limiting on auth endpoints
- Use secure session management
- Enable HTTPS only in production

### Database
- Use parameterized queries (provided by Drizzle ORM)
- Implement row-level security
- Regular backups
- Encrypted connections

### API Security
- Implement CORS properly
- Use API rate limiting
- Validate all inputs
- Implement proper error handling

## Testing Recommendations

### Unit Tests
```bash
# Test authentication flows
npm test lib/auth

# Test database operations
npm test lib/db

# Test billing logic
npm test lib/billing
```

### Integration Tests
```bash
# Test API endpoints
npm test app/api

# Test workflows
npm test lib/workflows
```

### Load Tests
- Test subscription creation at scale
- Test concurrent user authentication
- Test workflow processing capacity

## Monitoring and Observability

This template includes OpenTelemetry instrumentation for:
- Authentication events
- Database queries
- Billing operations
- Email sends
- Workflow execution

Configure your observability platform (e.g., Datadog, New Relic, Honeycomb) to collect and visualize these traces.

## Future Enhancements

Potential additions to this template:
- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Audit logging
- Data export functionality
- Therapist-specific features:
  - Patient management
  - Appointment scheduling
  - Session notes
  - HIPAA compliance features
  - Secure messaging
  - Progress tracking

## Support and Contributions

This template is provided as-is for reference purposes. For questions or contributions:
1. Review the code in `lib/` and `app/`
2. Check the inline comments for implementation details
3. Refer to the official documentation for each dependency

## License

This template code follows the same license as the main Grief VR project.

---

**Last Updated**: 2025-12-07
**Status**: Template/Reference Code Only
**Active in Production**: No
