/**
 * Database Schema for Therapist Portal
 * 
 * This is TEMPLATE CODE demonstrating a healthcare SaaS database structure.
 * Includes user management, subscription billing, and feature usage tracking.
 * 
 * Dependencies required: drizzle-orm, postgres
 * See: THERAPIST_PORTAL_TEMPLATE.md for complete setup guide
 */

import { 
  pgTable, 
  text, 
  timestamp, 
  integer, 
  boolean,
  serial,
  decimal
} from 'drizzle-orm/pg-core';

// Users table - Core user accounts for therapists and patients
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(), // Unique email for authentication
  name: text('name'), // Optional display name
  password: text('password').notNull(), // Hashed password (use bcrypt/argon2)
  createdAt: timestamp('created_at').defaultNow(),
});

// Subscriptions table - Manage user billing plans
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  plan: text('plan').notNull(), // Plan tier: 'free', 'pro', 'enterprise'
  status: text('status').notNull(), // Current status: 'active', 'cancelled', 'trial'
  price: decimal('price', { precision: 10, scale: 2 }), // Monthly price in USD
  renewalDate: timestamp('renewal_date'), // Next billing date
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Feature usage tracking - Monitor and enforce usage limits per plan
export const featureUsage = pgTable('feature_usage', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  feature: text('feature').notNull(), // Feature name: 'api_calls', 'storage_gb', 'patients', etc.
  count: integer('count').notNull().default(0), // Current usage count
  limit: integer('limit'), // Max allowed (null = unlimited, e.g., for enterprise plan)
  resetDate: timestamp('reset_date'), // When the counter resets (e.g., monthly)
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
