# Ethereal Presence - Monetization Stack

Complete setup for building a monetized SaaS application with subscription billing, user authentication, job queues, and email notifications.

## 🏗️ Stack Overview

### Database & ORM
- **Drizzle ORM** - Type-safe database queries with PostgreSQL
- **Schema**: Users, Subscriptions, Feature Usage tracking
- **Instrumentation**: All queries traced via `@kubiks/otel-drizzle`

### Authentication
- **Better Auth** - Complete auth system with email/OAuth
- **Providers**: Google, GitHub, Email/Password
- **Instrumentation**: Auth flows tracked via `@kubiks/otel-better-auth`

### Billing & Monetization
- **Autumn** - Subscription management and feature gating
- **Features**: Plan management, usage tracking, checkout flows
- **Instrumentation**: Billing operations tracked via `@kubiks/otel-autumn`

### Email Service
- **Resend** - Transactional email service
- **Uses**: Onboarding, upgrades, password resets
- **Instrumentation**: Email sends tracked via `@kubiks/otel-resend`

### Job Queue
- **Upstash QStash** - Serverless job queue
- **Uses**: Async email sends, analytics, subscription checks
- **Instrumentation**: Jobs tracked via `@kubiks/otel-upstash-queues`

### Workflows
- **Upstash Workflows** - Long-running background workflows
- **Uses**: Onboarding sequences, subscription renewals, follow-ups
- **Instrumentation**: Workflows tracked via `@kubiks/otel-upstash-workflow`

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/ethereal_presence

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://yourapp.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Resend (Email)
RESEND_API_KEY=

# QStash (Job Queue)
QSTASH_TOKEN=
QSTASH_BASE_URL=https://yourapp.com

# Autumn (Billing)
AUTUMN_API_KEY=
```

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `name` - User display name
- `password` - Hashed password
- `createdAt` - Account creation timestamp

### Subscriptions Table
- `id` - Primary key
- `userId` - Reference to user
- `plan` - 'free', 'pro', 'enterprise'
- `status` - 'active', 'cancelled', 'trial'
- `price` - Monthly subscription price
- `renewalDate` - Next renewal timestamp
- `createdAt` / `updatedAt` - Timestamps

### Feature Usage Table
- `id` - Primary key
- `userId` - Reference to user
- `feature` - Feature identifier
- `count` - Current usage count
- `limit` - Monthly limit (null for unlimited)
- `resetDate` - When the counter resets

## 🚀 API Endpoints

### Authentication
```
POST /api/auth/[...auth_routes] - Better Auth routes
GET /api/auth/[...auth_routes] - Better Auth routes
```

### Billing
```
POST /api/billing
{
  "action": "check-access" | "track-usage" | "create-checkout",
  "customerId": "user_id",
  "featureId": "feature_name",
  "productId": "product_id"
}
```

### Job Queue (QStash handles via webhooks)
```
POST /api/queue/email - Send email from queue
POST /api/queue/analytics - Track analytics
```

## 📈 Monitoring & Observability

All operations are automatically instrumented and sent to Kubiks:

### Database Queries
- All Drizzle ORM queries tracked with SQL statement
- Duration and status captured
- Slow query detection

### Authentication Events
- Login/signup attempts
- OAuth callbacks
- Session management
- Password resets

### Billing Operations
- Feature access checks
- Usage tracking
- Subscription changes
- Checkout events

### Email Sends
- Recipients tracked
- Subject and template info
- Delivery status

### Job Queue
- Job scheduling and execution
- Retry attempts
- Job completion status

### Workflows
- Step execution times
- Error handling
- State transitions

## 💳 Billing Flow

1. **User Signs Up** → Trigger onboarding workflow
2. **Workflow Sends Welcome Email** → Via Resend
3. **Create Free Trial** → Via Autumn
4. **Track Feature Usage** → Log to database
5. **Check Feature Limits** → Via Autumn before operations
6. **Upgrade via Checkout** → Link to Stripe payment
7. **Update Subscription** → Change plan in database
8. **Send Upgrade Email** → Notify user

## 🔄 Async Operations

### Queued Jobs (QStash)
- Email sending
- Analytics processing
- Subscription renewals

### Workflows (Upstash Workflows)
- Multi-step onboarding
- Scheduled emails
- Recurring tasks

## 🧪 Testing Locally

```bash
# Start development server
npm run dev

# Test auth
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test billing
curl -X POST http://localhost:3000/api/billing \
  -H "Content-Type: application/json" \
  -d '{"action":"check-access","customerId":"user_1","featureId":"api_calls"}'
```

## 📊 Kubiks Dashboard

Monitor your entire monetization stack:

- **Authentication**: Track signup/login rates
- **Billing**: Monitor subscription revenue
- **Email**: Track delivery and engagement
- **Jobs**: Monitor queue processing
- **Database**: Slow queries and errors
- **Workflows**: Step execution times

All data flows automatically to Kubiks for analysis.

## 🔐 Security Notes

1. **Database**: Use strong passwords and SSL connections
2. **Secrets**: Store in environment variables, never commit
3. **API Keys**: Rotate regularly
4. **Webhooks**: Verify signatures from QStash/Autumn
5. **Billing**: PCI compliance via Stripe/Autumn

## 🚀 Deployment

When deploying to production:

1. Set all environment variables in your hosting provider
2. Run database migrations
3. Configure custom domain for `BETTER_AUTH_URL`
4. Update webhook URLs for QStash
5. Enable monitoring in Kubiks dashboard

Your monetization stack is now fully observable! 🎉
