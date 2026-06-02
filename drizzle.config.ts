import type { Config } from 'drizzle-kit'

export default {
  schema: './electron/database/schema.ts',
  out: './electron/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './nexarh.db'
  }
} satisfies Config
