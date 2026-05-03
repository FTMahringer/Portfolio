import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  ip: text('ip'),
  userAgent: text('user_agent'),
});

export const oidcProviders = sqliteTable('oidc_providers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull().default('oidc'),
  issuerUrl: text('issuer_url').notNull(),
  clientId: text('client_id').notNull(),
  clientSecret: text('client_secret').notNull(),
  redirectUri: text('redirect_uri'),
  allowedEmail: text('allowed_email'),
  enabled: integer('enabled').notNull().default(1),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  colorIndex: integer('color_index').notNull().default(0),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: integer('created_at').notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});
