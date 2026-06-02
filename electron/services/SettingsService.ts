import { getDb } from '../database/connection'
import { companySettings } from '../database/schema'
import { eq } from 'drizzle-orm'

export const SettingsService = {
  get() {
    const db = getDb()
    const settings = db.select().from(companySettings).where(eq(companySettings.id, 1)).get()
    if (!settings) throw new Error('Paramètres non trouvés')
    return settings
  },

  update(data: Record<string, unknown>) {
    const db = getDb()
    data.updatedAt = new Date().toISOString()
    const result = db
      .update(companySettings)
      .set(data)
      .where(eq(companySettings.id, 1))
      .returning()
      .get()
    if (!result) throw new Error('Impossible de mettre à jour les paramètres')
    return result
  },

  uploadLogo(filePath: string): string {
    return filePath
  }
}
