import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { instrumentDrizzle } from '@kubiks/otel-drizzle';

// Create postgres client
const queryClient = postgres(process.env.DATABASE_URL || 'postgres://localhost/ethereal_presence');

// Create drizzle instance
let db = drizzle(queryClient, { schema });

// Add OpenTelemetry instrumentation
db = instrumentDrizzle(db);

export default db;
