# Ethereal Presence

A modern web application built with React 19, TypeScript, and Vite, featuring serverless functions via Netlify and background job processing with QStash.

## Features

- ⚛️ **React 19** - Latest React with concurrent features
- 🎯 **TypeScript** - Full type safety
- ⚡ **Vite** - Fast development and optimized builds
- 🔌 **Netlify Functions** - Serverless API endpoints
- 📬 **QStash Integration** - Reliable background job processing
- 📊 **OpenTelemetry** - Observability and tracing
- 🔐 **Better Auth** - Authentication with OAuth support
- 💳 **Billing Integration** - Autumn payment processing
- 📧 **Email Service** - Resend email delivery

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Netlify or Vercel account for deployment

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence.git
cd https-github.com-yourname-ethereal-presence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it with your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values. See [Environment Variables](#environment-variables) section for details.

**⚠️ IMPORTANT**: Never commit `.env.local` or any file containing secrets to version control!

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## Environment Variables

All required environment variables are documented in `.env.example`. Key variables include:

### Required for Core Functionality

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for authentication (generate a secure random string)
- `BETTER_AUTH_URL` - Your application URL

### Background Jobs (QStash)

- `QSTASH_TOKEN` - Get from [Upstash Console](https://console.upstash.com/qstash)
- `QSTASH_BASE_URL` - Your deployed application URL

**Note**: If `QSTASH_TOKEN` is not set, background job functions will fail gracefully with descriptive errors.

### Optional Services

- `RESEND_API_KEY` - For email functionality
- `AUTUMN_API_KEY` - For billing/payments
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- OpenTelemetry configuration for production monitoring

See `.env.example` for complete documentation.

## Project Structure

```
├── app/                  # Application source code
├── lib/                  # Server-side libraries
│   ├── auth/            # Authentication logic
│   ├── billing/         # Payment processing
│   ├── db/              # Database utilities
│   ├── email/           # Email services
│   ├── queue/           # Background job queue (QStash)
│   └── workflows/       # Business logic workflows
├── netlify/
│   ├── edge-functions/  # Edge runtime functions
│   └── functions/       # Serverless functions
├── docs/                # Documentation
├── .env.example         # Environment variable template
├── netlify.toml         # Netlify configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Development

### TypeScript Type Checking

The project uses TypeScript with strict mode enabled. Run type checking with:

```bash
npx tsc --noEmit
```

### Linting and Code Quality

Follow the existing code style in the project. Key conventions:

- Use TypeScript for all new code
- Add JSDoc comments for public APIs
- Validate inputs in server-side code
- Handle errors gracefully with descriptive messages

## Testing

Run the build to verify TypeScript compilation:

```bash
npm run build
```

Manual testing should be performed for changed functionality.

## Deployment

### Vercel Deployment

1. Import the repository in Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

**Important**: Update the repository homepage URL in:
- GitHub repository settings
- Vercel project settings
- `QSTASH_BASE_URL` and `BETTER_AUTH_URL` environment variables

### Netlify Deployment

The project includes Netlify configuration in `netlify.toml`:

1. Import the repository in Netlify
2. Configure environment variables in Site Settings > Environment Variables
3. Deploy!

**Vercel is the primary deployment target.** Verify the homepage URL after deployment.

## Background Jobs

The application uses QStash for reliable background job processing:

- **Email Jobs**: Schedule email delivery with `scheduleEmailJob()`
- **Analytics Jobs**: Process analytics with `scheduleAnalyticsJob()`
- **Subscription Checks**: Daily subscription validation with `scheduleSubscriptionCheck()`

All job functions return a `Promise<PublishResult>` with `{ ok, id?, error? }` for proper error handling.

## Security

- Review our [Security Policy](SECURITY.md) for vulnerability reporting
- Never commit secrets or API keys
- Keep dependencies up to date
- The Kubiks API key found in a previous commit should be rotated immediately

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence/issues)
- 💬 [Discussions](https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence/discussions)

## Acknowledgments

- React team for React 19
- Upstash for QStash
- Netlify for serverless functions
- All contributors to this project