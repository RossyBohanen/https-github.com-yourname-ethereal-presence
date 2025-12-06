# Ethereal Presence

A modern web application built with React 19, TypeScript, and Vite, featuring robust integrations with authentication, database, email services, and job queue management.

## Features

- **Authentication**: Secure authentication with Better Auth supporting email/password and OAuth providers (Google, GitHub)
- **Database**: PostgreSQL with Drizzle ORM
- **Email Service**: Transactional emails via Resend
- **Job Queue**: Async job processing with QStash (Upstash)
- **Billing**: Payment processing with Autumn
- **Observability**: OpenTelemetry instrumentation for monitoring and tracing
- **Deployment**: Optimized for Netlify and Vercel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database
- API keys for third-party services (see Environment Variables below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence.git
   cd https-github.com-yourname-ethereal-presence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration. See [Environment Variables](#environment-variables) below.

4. **Set up the database**
   - Create a PostgreSQL database
   - Update `DATABASE_URL` in `.env.local`
   - Run migrations if applicable

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

All environment variables should be set in `.env.local` for local development. For production deployments, set these in your hosting platform's environment variable settings (Netlify or Vercel).

⚠️ **NEVER commit `.env.local` or any file containing real secrets to the repository!**

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for authentication (use a strong random string)
- `BETTER_AUTH_URL` - Your application URL (e.g., `http://localhost:3000` for dev)

### Optional Service Integration

- `QSTASH_TOKEN` - Upstash QStash token for job queue (get from [console.upstash.com](https://console.upstash.com/qstash))
- `QSTASH_BASE_URL` - Base URL for QStash callbacks (usually your app URL)
- `RESEND_API_KEY` - Resend API key for sending emails
- `AUTUMN_API_KEY` - Autumn API key for billing
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - For GitHub OAuth

### OpenTelemetry (Optional)

- `OTEL_EXPORTER_OTLP_ENDPOINT` - OpenTelemetry collector endpoint
- `OTEL_EXPORTER_OTLP_PROTOCOL` - Protocol (usually `http/protobuf`)
- `OTEL_EXPORTER_OTLP_HEADERS` - Headers for authentication
- `OTEL_SERVICE_NAME` - Service name for traces

See `.env.example` for a complete template.

## QStash Behavior

The QStash job queue integration is designed to be resilient:

- **When `QSTASH_TOKEN` is not set**: All queue operations return structured error responses instead of throwing exceptions. The application continues to function, but background jobs will not be scheduled.
- **Input Validation**: All schedule functions validate their inputs and return detailed error messages for invalid data.
- **Error Handling**: All publish operations are wrapped in try/catch blocks and return a `PublishResult` object with `ok`, `id`, and `error` fields.

Example usage:
```typescript
import { scheduleEmailJob } from '@/lib/queue/qstash';

const result = await scheduleEmailJob('user@example.com', 'Welcome!', '5m');
if (result.ok) {
  console.log('Email scheduled:', result.id);
} else {
  console.error('Failed to schedule:', result.error);
}
```

## Deployment

### Netlify

This project is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify UI (Site Settings > Environment Variables)
3. Deploy!

**Netlify Build Note**: The build command is `npm run build` and the publish directory is `dist`.

### Vercel

For Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings
3. **Important**: Add a `vercel.json` with a rewrite rule to fix the homepage routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
4. Deploy!

## Project Structure

```
.
├── app/              # Application pages/routes
├── lib/              # Server-side library code
│   ├── auth/         # Authentication configuration
│   ├── billing/      # Billing integration (Autumn)
│   ├── db/           # Database client and schema
│   ├── email/        # Email service (Resend)
│   ├── queue/        # Job queue (QStash)
│   └── workflows/    # Workflow definitions
├── netlify/          # Netlify functions
├── docs/             # Documentation
├── *.tsx, *.ts       # React components and TypeScript files
├── .env.example      # Environment variable template
└── package.json      # Dependencies and scripts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests (if configured)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Security

For security concerns, please see [SECURITY.md](./SECURITY.md). Do not open public issues for security vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- Documentation: See the `docs/` directory
- Issues: [GitHub Issues](https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence/issues)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security: [SECURITY.md](./SECURITY.md)

---

**Copyright © 2025 RossyBohanen**