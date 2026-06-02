import { BackupService } from './BackupService'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

function getMarkerPath(): string {
  return join(app.getPath('userData'), '.last-weekly-backup')
}

function getWeekId(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (86400000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

function alreadyBackedUpThisWeek(): boolean {
  try {
    if (!existsSync(getMarkerPath())) return false
    return readFileSync(getMarkerPath(), 'utf-8') === getWeekId()
  } catch {
    return false
  }
}

function markBackedUp(): void {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) return
  writeFileSync(getMarkerPath(), getWeekId(), 'utf-8')
}

export const BackupScheduler = {
  start(): void {
    if (process.env.NODE_ENV === 'test') return

    const tryBackup = () => {
      const now = new Date()
      const day = now.getDay()
      const hour = now.getHours()
      const minutes = now.getMinutes()

      // Vendredi à partir de 17h30 (fin de semaine)
      if (day === 5 && (hour > 17 || (hour === 17 && minutes >= 30))) {
        if (!alreadyBackedUpThisWeek()) {
          console.log('[BackupScheduler] Sauvegarde hebdomadaire automatique...')
          BackupService.export()
            .then((path) => {
              console.log(`[BackupScheduler] Sauvegarde réussie : ${path}`)
              markBackedUp()
              const { NotificationService } = require('./NotificationService')
              NotificationService.addBackupNotification(path)
            })
            .catch((err) => {
              console.error('[BackupScheduler] Échec de la sauvegarde :', err)
            })
        }
      }
    }

    tryBackup()
    setInterval(tryBackup, 60 * 60 * 1000)
  },

  stop(): void {
    // Cleanup si besoin
  }
}
