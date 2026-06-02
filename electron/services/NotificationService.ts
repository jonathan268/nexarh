import { getDb } from '../database/connection'
import { notifications, employees, leaveRequests, contracts, companySettings, payslips, interns, inscriptions, apprenants, formations } from '../database/schema'
import { eq, and, lt, gt, sql } from 'drizzle-orm'
import { format, addDays, parseISO, endOfMonth, differenceInDays } from 'date-fns'

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  relatedId: number | null
  relatedType: string | null
  eventDate: string
  isRead: number
  createdAt: string
}

function insertIfNotExists(type: string, title: string, message: string, relatedId: number | null, relatedType: string | null, eventDate: string) {
  const db = getDb()
  const existing = db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.type, type),
        relatedId ? eq(notifications.relatedId, relatedId) : sql`1=1`,
        eq(notifications.eventDate, eventDate)
      )
    )
    .get()

  if (!existing) {
    db.insert(notifications).values({
      type, title, message, relatedId, relatedType, eventDate
    }).run()
  }
}

function generatePayNotifications(today: string, payDay: number) {
  const db = getDb()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const payDate = payDay > 28
    ? endOfMonth(new Date(currentYear, currentMonth))
    : new Date(currentYear, currentMonth, payDay)

  const payDateStr = format(payDate, 'yyyy-MM-dd')
  const diff = differenceInDays(parseISO(payDateStr), parseISO(today))

  if (diff === 3 || diff === 1 || diff === 0) {
    const label = diff === 0 ? "aujourd'hui" : diff === 1 ? 'demain' : `dans ${diff} jours`
    const periodLabel = format(payDate, 'MMMM yyyy')

    const employeeCount = db
      .select()
      .from(employees)
      .where(eq(employees.status, 'actif'))
      .all().length

    insertIfNotExists('pay_day', 'Paiement des salaires',
      `Le paiement des salaires de ${periodLabel} est prévu ${label} (${employeeCount} employé${employeeCount > 1 ? 's' : ''} actif${employeeCount > 1 ? 's' : ''}).`,
      null, 'payroll', payDateStr)
  }
}

function generateLeaveReturnNotifications(today: string) {
  const db = getDb()
  const targets = [3, 1, 0]

  for (const daysBefore of targets) {
    const targetDate = format(addDays(parseISO(today), daysBefore), 'yyyy-MM-dd')

    const returns = db
      .select()
      .from(leaveRequests)
      .where(
        and(
          eq(leaveRequests.status, 'approuve'),
          eq(leaveRequests.endDate, targetDate)
        )
      )
      .all()

    for (const leave of returns) {
      const employee = db
        .select()
        .from(employees)
        .where(eq(employees.id, leave.employeeId))
        .get()

      const label = daysBefore === 0 ? "aujourd'hui" : daysBefore === 1 ? 'demain' : `dans ${daysBefore} jours`

      insertIfNotExists('leave_return', 'Retour de congé',
        `${employee?.firstName || ''} ${employee?.lastName || 'Employé'} est attendu(e) de retour de congé ${label}.`,
        leave.id, 'leave', targetDate)
    }
  }
}

function generateContractEndNotifications(today: string) {
  const db = getDb()
  const targets = [3, 1, 0]

  for (const daysBefore of targets) {
    const targetDate = format(addDays(parseISO(today), daysBefore), 'yyyy-MM-dd')

    const ending = db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.status, 'actif'),
          eq(contracts.endDate, targetDate)
        )
      )
      .all()

    for (const contract of ending) {
      const employee = db
        .select()
        .from(employees)
        .where(eq(employees.id, contract.employeeId))
        .get()

      const label = daysBefore === 0 ? "aujourd'hui" : daysBefore === 1 ? 'demain' : `dans ${daysBefore} jours`

      insertIfNotExists('contract_end', 'Fin de contrat',
        `Le contrat de ${employee?.firstName || ''} ${employee?.lastName || 'Employé'} se termine ${label}.`,
        contract.id, 'contract', targetDate)
    }
  }
}

function generateInternEndNotifications(today: string) {
  const db = getDb()
  const targets = [7, 3, 1, 0]

  for (const daysBefore of targets) {
    const targetDate = format(addDays(parseISO(today), daysBefore), 'yyyy-MM-dd')

    const ending = db
      .select()
      .from(interns)
      .where(
        and(
          eq(interns.status, 'actif'),
          eq(interns.endDate, targetDate)
        )
      )
      .all()

    for (const intern of ending) {
      const typeLabel = intern.type === 'professionnel' ? 'Stage Professionnel' : 'Stage Académique'
      const label = daysBefore === 0 ? "aujourd'hui" : daysBefore === 1 ? 'demain' : `dans ${daysBefore} jours`

      insertIfNotExists('intern_end', 'Fin de stage',
        `Le ${typeLabel} de ${intern.firstName} ${intern.lastName} se termine ${label}.`,
        intern.id, 'intern', targetDate)
    }
  }
}

function generateFormationEndNotifications(today: string) {
  const db = getDb()
  const targets = [7, 3, 1, 0]

  for (const daysBefore of targets) {
    const targetDate = format(addDays(parseISO(today), daysBefore), 'yyyy-MM-dd')

    const ending = db
      .select({
        id: inscriptions.id,
        dateFin: inscriptions.dateFin,
        apprenantNom: apprenants.nom,
        apprenantPrenom: apprenants.prenom,
        formationName: formations.name
      })
      .from(inscriptions)
      .leftJoin(apprenants, eq(inscriptions.apprenantId, apprenants.id))
      .leftJoin(formations, eq(inscriptions.formationId, formations.id))
      .where(
        and(
          sql`${inscriptions.status} != 'termine'`,
          eq(inscriptions.dateFin, targetDate)
        )
      )
      .all()

    for (const insc of ending) {
      const label = daysBefore === 0 ? "aujourd'hui" : daysBefore === 1 ? 'demain' : `dans ${daysBefore} jours`

      insertIfNotExists('formation_end', 'Fin de formation',
        `La formation "${insc.formationName}" de ${insc.apprenantPrenom} ${insc.apprenantNom} se termine ${label}.`,
        insc.id, 'inscription', targetDate)
    }
  }
}

function generateUnpaidFeesNotifications(today: string) {
  const db = getDb()

  const unpaid = db
    .select({
      id: inscriptions.id,
      apprenantNom: apprenants.nom,
      apprenantPrenom: apprenants.prenom,
      formationName: formations.name,
      frais: inscriptions.frais,
      montantPaye: inscriptions.montantPaye,
      reste: sql<number>`${inscriptions.frais} - COALESCE(${inscriptions.montantPaye}, 0)`
    })
    .from(inscriptions)
    .leftJoin(apprenants, eq(inscriptions.apprenantId, apprenants.id))
    .leftJoin(formations, eq(inscriptions.formationId, formations.id))
    .where(
      and(
        sql`${inscriptions.status} != 'termine'`,
        sql`${inscriptions.frais} > COALESCE(${inscriptions.montantPaye}, 0)`
      )
    )
    .all()

  const eventDate = today
  for (const insc of unpaid) {
    const reste = (insc.frais || 0) - (insc.montantPaye || 0)
    insertIfNotExists('unpaid_fees', 'Frais de formation impayés',
      `${insc.apprenantPrenom} ${insc.apprenantNom} a un solde de ${reste.toLocaleString()} XAF sur "${insc.formationName}".`,
      insc.id, 'inscription', eventDate)
  }
}

export const NotificationService = {
  getAll() {
    const db = getDb()
    return db
      .select()
      .from(notifications)
      .orderBy(sql`${notifications.createdAt} DESC`)
      .all() as Notification[]
  },

  getUnread() {
    const db = getDb()
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, 0))
      .orderBy(sql`${notifications.createdAt} DESC`)
      .all() as Notification[]
  },

  getUnreadCount(): number {
    const db = getDb()
    const result = db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.isRead, 0))
      .get()
    return result?.count || 0
  },

  markRead(id: number) {
    const db = getDb()
    db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id)).run()
  },

  markAllRead() {
    const db = getDb()
    db.update(notifications).set({ isRead: 1 }).where(eq(notifications.isRead, 0)).run()
  },

  delete(id: number) {
    const db = getDb()
    db.delete(notifications).where(eq(notifications.id, id)).run()
  },

  addBackupNotification(backupPath: string) {
    const db = getDb()
    const today = format(new Date(), 'yyyy-MM-dd')
    db.insert(notifications).values({
      type: 'backup_done',
      title: 'Sauvegarde hebdomadaire',
      message: `La sauvegarde automatique de la semaine a été créée avec succès.`,
      relatedType: 'backup',
      eventDate: today
    }).run()
  },

  scanAndGenerate() {
    const db = getDb()
    const today = format(new Date(), 'yyyy-MM-dd')

    const settings = db.select().from(companySettings).where(eq(companySettings.id, 1)).get()
    const payDay = settings?.payDay || 5

    generatePayNotifications(today, payDay)
    generateLeaveReturnNotifications(today)
    generateContractEndNotifications(today)
    generateInternEndNotifications(today)
    generateFormationEndNotifications(today)
    generateUnpaidFeesNotifications(today)
  }
}
