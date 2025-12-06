import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

// Key-Value Store Table
export const kvStore = pgTable('kv_store', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for use in application
export type KVStoreEntry = typeof kvStore.$inferSelect;
export type NewKVStoreEntry = typeof kvStore.$inferInsert;
