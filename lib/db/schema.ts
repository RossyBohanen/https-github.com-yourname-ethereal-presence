import { 
  pgTable, 
  text, 
  timestamp, 
  integer, 
  boolean,
  serial,
  decimal
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Subscriptions table for billing
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  plan: text('plan').notNull(), // 'free', 'pro', 'enterprise'
  status: text('status').notNull(), // 'active', 'cancelled', 'trial'
  price: decimal('price', { precision: 10, scale: 2 }),
  renewalDate: timestamp('renewal_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Feature usage for billing
export const featureUsage = pgTable('feature_usage', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  feature: text('feature').notNull(), // 'api_calls', 'storage', etc.
  count: integer('count').notNull().default(0),
  limit: integer('limit'), // null for unlimited
  resetDate: timestamp('reset_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
