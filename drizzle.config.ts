import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './supabase/migrations',
  dbCredentials: {
    url: process.env.POSTGRES_URL as string
  },
  migrations: {
    prefix: 'supabase'
  }
});
