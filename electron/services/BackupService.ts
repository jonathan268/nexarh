import { getSqliteDb } from '../database/connection'
import { app, dialog } from 'electron'
import { join } from 'path'
import { copyFileSync, existsSync, unlinkSync } from 'fs'
import { format } from 'date-fns'

export const BackupService = {
  async export(): Promise<string> {
    const db = getSqliteDb()

    const backupDir = join(app.getPath('documents'), 'NexaRH-Backups')
    const { mkdirSync } = await import('fs')
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss')
    const backupPath = join(backupDir, `nexarh-backup-${timestamp}.db`)

    db.backup(backupPath)

    return backupPath
  },

  async import(filePath: string): Promise<boolean> {
    if (!existsSync(filePath)) {
      throw new Error('Fichier de sauvegarde non trouvé')
    }

    const db = getSqliteDb()
    db.close()

    const { getDb, initDatabase } = await import('../database/connection')
    const dbPath = join(app.getPath('userData'), 'nexarh.db')

    copyFileSync(filePath, dbPath)

    initDatabase()

    return true
  }
}
