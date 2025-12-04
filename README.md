# Grief VR

A trauma-informed virtual reality platform for therapeutic grief and anxiety support. Built with React, Netlify Functions, and a comprehensive set of Netlify primitives.

## Overview

Grief VR provides personalized, immersive therapeutic experiences through:
- **Immersive VR Environments** - Calming, customizable spaces for emotional regulation
- **AI-Powered Therapeutic Agents** - Interactive guides for psychoeducation and grounding
- **Exposure Therapy Support** - Controlled engagement with grief-related triggers
- **Therapist Collaboration** - Integration with professional counseling workflows

## Architecture

```
├── src/                      # React frontend application
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication forms
│   │   ├── common/          # Shared components (ErrorBoundary, ProtectedRoute)
│   │   └── dashboard/       # Dashboard layout and widgets
│   ├── contexts/            # React context providers (AuthContext)
│   ├── hooks/               # Custom React hooks
│   └── pages/               # Page components
├── lib/                      # Shared backend utilities
│   ├── auth/                # Better Auth configuration
│   ├── audit/               # Audit logging system
│   ├── billing/             # Autumn billing integration
│   ├── blobs/               # Netlify Blobs storage layer
│   ├── db/                  # Drizzle ORM database client
│   ├── email/               # Resend email service
│   ├── env/                 # Environment validation
│   ├── errors/              # Error handling utilities
│   ├── queue/               # QStash job queue
│   ├── uploads/             # File upload security
│   └── workflows/           # Upstash Workflow orchestration
├── netlify/
│   ├── functions/           # Serverless API endpoints
│   └── edge-functions/      # Edge middleware (rate limiting, logging)
└── app/api/                  # Next.js-style API routes
```

## Technology Stack

- **Frontend**: React 19, React Router, Tailwind CSS
- **Backend**: Netlify Functions (serverless), Edge Functions
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (email/password + OAuth)
- **Storage**: Netlify Blobs (distributed blob storage)
- **Billing**: Autumn subscription management
- **Email**: Resend transactional emails
- **Queue**: Upstash QStash job processing
- **Observability**: OpenTelemetry instrumentation

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database
- Netlify CLI (for local development)

### Installation

```bash
# Install dependencies
npm install

# Start local development server
netlify dev
```

The application will be available at http://localhost:8888.

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database (required)
DATABASE_URL=postgres://localhost/grief_vr

# Authentication (required in production)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://your-site.netlify.app

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (optional)
RESEND_API_KEY=

# Billing (optional)
AUTUMN_SECRET_KEY=

# Queue (optional)
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# Observability (optional)
KUBIKS_API_KEY=
```

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-in/email` | POST | Email/password login |
| `/api/auth/sign-up/email` | POST | User registration |
| `/api/auth/sign-out` | POST | Logout |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/forgot-password` | POST | Request password reset |

### Sessions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List user sessions |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/:id` | GET | Get session details |
| `/api/sessions/:id` | PUT | Update session notes |
| `/api/sessions/:id` | DELETE | Delete session |

### Content

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content` | GET | List therapeutic content |
| `/api/content?category=meditation` | GET | Filter by category |
| `/api/content?tags=anxiety,stress` | GET | Search by tags |
| `/api/content/:id` | GET | Get content details |

### Billing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing` | POST | Billing operations (check-access, track-usage, create-checkout) |

### Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |

## Security Features

- **Rate Limiting**: Tiered rate limits based on subscription (anonymous: 30/min, free: 60/min, pro: 200/min)
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Input Validation**: File upload security with MIME type and extension validation
- **Audit Logging**: HIPAA-adjacent logging with PII masking
- **Webhook Verification**: QStash signature verification for job endpoints

## Blob Storage

The application uses Netlify Blobs with six dedicated stores:

| Store | Purpose |
|-------|---------|
| `user-profiles` | Avatar images and profile data |
| `session-recordings` | VR therapy session recordings |
| `therapeutic-content` | Meditation audio, music therapy materials |
| `user-journals` | Journal entries with mood tracking |
| `user-reports` | Generated PDF progress reports |
| `app-config` | Feature flags and A/B testing |

## Edge Functions

Three edge functions run on every API request:

1. **rate-limiter**: Enforces request rate limits
2. **request-logger**: Logs requests with timing and request IDs
3. **geo-context**: Adds geolocation headers for personalization

## Deployment

The project is configured for Netlify deployment with three contexts:

- **Production** (`main` branch): Full production build with security requirements
- **Staging** (`staging` branch): Pre-production testing
- **Development** (`develop` branch): Development environment

```bash
# Deploy to production
netlify deploy --prod

# Create a preview deploy
netlify deploy
```

## Development

### Building

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

### Project Structure Conventions

- Pages in `src/pages/` map to routes (e.g., `DashboardPage.tsx` -> `/dashboard`)
- Serverless functions in `netlify/functions/` map to API routes
- Edge functions in `netlify/edge-functions/` run as middleware
- Shared utilities in `lib/` are bundled with functions

## Contributing

1. Create a feature branch from `develop`
2. Make changes following the existing code style
3. Ensure all security validations pass
4. Submit a pull request to `develop`

## License

Private - All rights reserved.
