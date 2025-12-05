import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create postgres client
const queryClient = postgres(process.env.DATABASE_URL || 'postgres://localhost/ethereal_presence');

// Create drizzle instance
const db = drizzle(queryClient, { schema });

export default db;
