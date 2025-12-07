# Grief VR: Immersive Trauma-Informed Healing Platform

A React-based web application for immersive trauma-informed healing, built with Vite and deployed on Netlify.

## About

Grief VR is an immersive trauma-informed healing platform designed to help individuals process grief and trauma through virtual reality experiences. The platform emphasizes compassionate, evidence-based approaches to healing.

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

## Branding

The project features a custom logo design representing the Grief VR platform:
- **Logo**: VR headset with an integrated heart symbol (see `favicon.svg`)
- **Color Scheme**: Gradient purple/indigo (#6366f1 to #8b5cf6) with slate accents
- **Design Philosophy**: Combines technology (VR headset) with compassion (heart) to represent trauma-informed healing

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Netlify deployment configuration and troubleshooting
- [Configuration Verification](docs/CONFIGURATION_VERIFICATION.md) - Verification that the site is ready for Grief VR deployment
- [React Overrides](docs/REACT-OVERRIDES.md) - React version override documentation
- [Vercel DNS Configuration](docs/VERCEL_DNS_CONFIGURATION.md) - Vercel custom domain setup and troubleshooting

## Security

- [CVE-2025-66478 Evaluation](CVE-2025-66478_EVALUATION.md) - React2Shell vulnerability assessment (✅ Not vulnerable)
- [Security Verification](SECURITY_VERIFICATION.md) - XSS vulnerability fixes and verification