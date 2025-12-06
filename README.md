# Ethereal Presence

A React-based web application built with Vite and deployed on Netlify.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for deployment on Netlify. For detailed deployment instructions and troubleshooting, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

**Important:** The production site should be deployed from the `main` branch. If you encounter deployment errors related to branch references, refer to the deployment documentation.

## Project Structure

- `/app` - Application code
- `/lib` - Shared libraries and utilities
- `/netlify` - Netlify serverless functions and edge functions
- `/docs` - Project documentation

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Netlify deployment configuration and troubleshooting
- [React Overrides](docs/REACT-OVERRIDES.md) - React version override documentation
- [Vercel DNS Configuration](docs/VERCEL_DNS_CONFIGURATION.md) - Vercel custom domain setup and troubleshooting
- [Security Policy](SECURITY.md) - Security best practices and vulnerability reporting

## Security

This project follows security best practices including:
- Input validation and sanitization
- XSS protection with HTML escaping
- Secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- Secret management via environment variables
- Regular dependency audits

For details on reporting vulnerabilities or security practices, see [SECURITY.md](SECURITY.md).