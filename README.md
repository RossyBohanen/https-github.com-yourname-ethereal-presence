# Ethereal Presence

A Next.js application with OpenTelemetry instrumentation powered by Kubiks.

## Features

- ✅ Next.js 16+ with App Router
- ✅ OpenTelemetry automatic instrumentation
- ✅ Kubiks integration for telemetry collection
- ✅ TypeScript support
- ✅ Automatic trace collection

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Environment Setup

The `.env.local` file contains your OpenTelemetry configuration:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.kubiks.app
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_HEADERS=x-kubiks-key=YOUR_API_KEY
OTEL_SERVICE_NAME=ethereal-presence
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## OpenTelemetry Configuration

The `instrumentation.ts` file at the root of your project automatically registers OpenTelemetry when the application starts. This enables:

- Automatic HTTP request tracing
- Performance monitoring
- Error tracking
- Custom span creation

All telemetry data is sent to Kubiks for visualization and analysis.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Kubiks Documentation](https://docs.kubiks.ai/)
