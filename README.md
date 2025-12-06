# Ethereal Presence

A modern web application built with React 19, Vite, and TypeScript, featuring user authentication, job queue management, email services, and analytics.

## 🚀 Features

- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety across the application
- **Vite**: Fast development and optimized production builds
- **Better Auth**: Secure authentication with OAuth support (Google, GitHub)
- **QStash Integration**: Reliable job queue for background tasks
- **Email Service**: Transactional emails via Resend
- **Edge Functions**: Geo-personalization with Netlify Edge
- **OpenTelemetry**: Observability and monitoring

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (for production)

## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence.git
cd https-github.com-yourname-ethereal-presence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it for your local environment:

```bash
cp .env.example .env.local
```

**Important**: Never commit `.env.local` or any file containing secrets!

Edit `.env.local` and set the following required variables:

```bash
# Required for local development
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=your-database-connection-string

# Optional services (leave empty if not using)
QSTASH_TOKEN=your-qstash-token
RESEND_API_KEY=your-resend-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

See `.env.example` for a complete list of available configuration options.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## 🧪 Testing

*(Testing infrastructure to be added)*

```bash
# Run tests (when available)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📁 Project Structure

```
.
├── app/                    # Application routes and API endpoints
│   └── api/               # API route handlers
├── lib/                   # Shared libraries and utilities
│   ├── auth/             # Authentication configuration
│   ├── billing/          # Billing integration (Autumn)
│   ├── db/               # Database client and schema
│   ├── email/            # Email service (Resend)
│   ├── queue/            # Job queue (QStash)
│   └── workflows/        # Business logic workflows
├── netlify/              # Netlify-specific functions
│   └── edge-functions/   # Edge function handlers
├── docs/                 # Documentation
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── vite.config.ts        # Vite configuration
```

## 🔧 Environment Variables

All environment variables are documented in `.env.example`. Key variables include:

- **`QSTASH_TOKEN`**: Required for job queue functionality. Get from [Upstash Console](https://console.upstash.com/qstash)
- **`QSTASH_BASE_URL`**: Your application's public URL for QStash callbacks
- **`BETTER_AUTH_SECRET`**: Secret key for session encryption (generate a strong random string)
- **`DATABASE_URL`**: PostgreSQL connection string
- **`RESEND_API_KEY`**: API key for email service

**Note**: If `QSTASH_TOKEN` is not set, job queue functions will return descriptive errors instead of attempting to connect to Upstash.

## 🚀 Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Project Settings
4. Deploy!

**Important**: Update the homepage URL in your repository settings and set `QSTASH_BASE_URL` to your production URL.

### Netlify

1. Connect your repository in [Netlify](https://netlify.com)
2. Configure environment variables in Site Settings > Environment Variables
3. Deploy!

The project includes `netlify.toml` for automatic configuration.

## 📝 Configuration Notes

### Repository Homepage URL

The repository homepage URL needs to be configured correctly:

1. Go to GitHub repository Settings > General
2. Update the "Website" field with your deployed URL
3. Update `QSTASH_BASE_URL` in your environment variables to match

### QStash Callbacks

When deploying to production, ensure:

1. `QSTASH_BASE_URL` points to your production domain
2. Your API routes are publicly accessible for QStash callbacks
3. QStash webhooks are configured in the Upstash Console

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🔒 Security

For security vulnerabilities, please review our [Security Policy](SECURITY.md) and report issues responsibly.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for React 19
- Upstash for QStash
- Vercel and Netlify for hosting platforms
- All contributors to this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RossyBohanen/https-github.com-yourname-ethereal-presence/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)

---

Built with ❤️ using React 19 and modern web technologies