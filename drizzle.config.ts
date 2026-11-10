import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/data/datasources/local/db/schema.ts',
  out: './src/data/datasources/local/db/drizzle',
});

