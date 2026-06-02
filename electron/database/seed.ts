import { initDatabase, getDb } from './connection'
import { users, companySettings, leaveTypes } from './schema'
import bcrypt from 'bcryptjs'

async function seed(): Promise<void> {
  console.log('Initialisation de la base de données...')
  initDatabase()
  const db = getDb()

  const existingAdmin = db.select().from(users).where({ username: 'admin' }).get()
  if (!existingAdmin) {
    const hash = await bcrypt.hash('nexarh2024', 12)
    db.insert(users)
      .values({
        username: 'admin',
        passwordHash: hash,
        role: 'admin',
        isActive: 1
      })
      .run()
    console.log('Admin par défaut créé : admin / nexarh2024')
  }

  const existingSettings = db.select().from(companySettings).where({ id: 1 }).get()
  if (!existingSettings) {
    db.insert(companySettings)
      .values({
        companyName: 'Mon Entreprise',
        currency: 'XAF',
        workingHoursPerDay: 8,
        workingDaysPerMonth: 26,
        overtimeRate: 1.5,
        transportRate: 26000
      })
      .run()
    console.log('Configuration entreprise créée')
  }

  const existingLeaveTypes = db.select().from(leaveTypes).all()
  if (existingLeaveTypes.length === 0) {
    db.insert(leaveTypes).values([
      { name: 'Congé annuel', maxDaysPerYear: 30, isPaid: 1, color: '#10B981' },
      { name: 'Congé maladie', maxDaysPerYear: 90, isPaid: 1, color: '#F59E0B' },
      { name: 'Congé maternité', maxDaysPerYear: 98, isPaid: 1, color: '#EF4444' },
      { name: 'Congé paternité', maxDaysPerYear: 10, isPaid: 1, color: '#4F6EF7' },
      { name: 'Congé sans solde', maxDaysPerYear: 30, isPaid: 0, color: '#6B7280' }
    ]).run()
    console.log('Types de congés créés')
  }

  console.log('Seed terminé avec succès !')
}

seed().catch(console.error)
