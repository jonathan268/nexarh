import { getDb } from '../database/connection'
import { paiementsFormation, inscriptions } from '../database/schema'
import { eq, sql } from 'drizzle-orm'

export const PaiementService = {
  getAll(inscriptionId?: number) {
    const db = getDb()
    let query = db.select().from(paiementsFormation).orderBy(paiementsFormation.id)
    if (inscriptionId) {
      query = (query as any).where(eq(paiementsFormation.inscriptionId, inscriptionId))
    }
    return query.all()
  },

  getById(id: number) {
    const db = getDb()
    return db.select().from(paiementsFormation).where(eq(paiementsFormation.id, id)).get()
  },

  create(data: {
    inscriptionId: number; montant: number; datePaiement: string;
    modePaiement?: string; reference?: string; notes?: string
  }) {
    const db = getDb()

    const result = db.insert(paiementsFormation).values(data).returning().get()

    const totalPaye = db.select({ sum: sql<number>`COALESCE(SUM(montant), 0)` })
      .from(paiementsFormation)
      .where(eq(paiementsFormation.inscriptionId, data.inscriptionId))
      .get()

    db.update(inscriptions)
      .set({ montantPaye: totalPaye?.sum || 0 })
      .where(eq(inscriptions.id, data.inscriptionId))
      .run()

    return result
  },

  delete(id: number) {
    const db = getDb()
    const paiement = db.select().from(paiementsFormation).where(eq(paiementsFormation.id, id)).get()
    if (!paiement) throw new Error('Paiement non trouvé')

    db.delete(paiementsFormation).where(eq(paiementsFormation.id, id)).run()

    const totalPaye = db.select({ sum: sql<number>`COALESCE(SUM(montant), 0)` })
      .from(paiementsFormation)
      .where(eq(paiementsFormation.inscriptionId, paiement.inscriptionId))
      .get()

    db.update(inscriptions)
      .set({ montantPaye: totalPaye?.sum || 0 })
      .where(eq(inscriptions.id, paiement.inscriptionId))
      .run()
  }
}
