import { getDb } from '../database/connection'
import { inscriptions, apprenants, formations } from '../database/schema'
import { eq, and, sql } from 'drizzle-orm'

export const InscriptionService = {
  getAll(filters?: { status?: string; formationId?: number; apprenantId?: number }) {
    const db = getDb()
    let query = db.select({
      id: inscriptions.id,
      apprenantId: inscriptions.apprenantId,
      formationId: inscriptions.formationId,
      dateInscription: inscriptions.dateInscription,
      frais: inscriptions.frais,
      montantPaye: inscriptions.montantPaye,
      creneau: inscriptions.creneau,
      status: inscriptions.status,
      notes: inscriptions.notes,
      dateFin: inscriptions.dateFin,
      createdAt: inscriptions.createdAt,
      updatedAt: inscriptions.updatedAt,
      apprenantNom: apprenants.nom,
      apprenantPrenom: apprenants.prenom,
      apprenantMatricule: apprenants.matricule,
      formationName: formations.name,
      formationDuree: formations.duree
    })
      .from(inscriptions)
      .leftJoin(apprenants, eq(inscriptions.apprenantId, apprenants.id))
      .leftJoin(formations, eq(inscriptions.formationId, formations.id))
      .orderBy(inscriptions.id)

    if (filters?.status) {
      query = (query as any).where(eq(inscriptions.status, filters.status))
    }
    if (filters?.formationId) {
      query = (query as any).where(eq(inscriptions.formationId, filters.formationId))
    }
    if (filters?.apprenantId) {
      query = (query as any).where(eq(inscriptions.apprenantId, filters.apprenantId))
    }
    return query.all()
  },

  getById(id: number) {
    const db = getDb()
    return db.select({
      id: inscriptions.id,
      apprenantId: inscriptions.apprenantId,
      formationId: inscriptions.formationId,
      dateInscription: inscriptions.dateInscription,
      frais: inscriptions.frais,
      montantPaye: inscriptions.montantPaye,
      creneau: inscriptions.creneau,
      status: inscriptions.status,
      notes: inscriptions.notes,
      dateFin: inscriptions.dateFin,
      createdAt: inscriptions.createdAt,
      updatedAt: inscriptions.updatedAt,
      apprenantNom: apprenants.nom,
      apprenantPrenom: apprenants.prenom,
      apprenantMatricule: apprenants.matricule,
      formationName: formations.name,
      formationDuree: formations.duree,
      formationFrais: formations.frais
    })
      .from(inscriptions)
      .leftJoin(apprenants, eq(inscriptions.apprenantId, apprenants.id))
      .leftJoin(formations, eq(inscriptions.formationId, formations.id))
      .where(eq(inscriptions.id, id))
      .get()
  },

  create(data: {
    apprenantId: number; formationId: number; dateInscription: string;
    frais: number; creneau?: string; montantPaye?: number; notes?: string; dateFin?: string
  }) {
    const db = getDb()
    return db.insert(inscriptions).values({
      ...data,
      status: 'inscrit',
      montantPaye: data.montantPaye || 0
    }).returning().get()
  },

  update(id: number, data: {
    status?: string; frais?: number; montantPaye?: number; notes?: string; dateFin?: string
  }) {
    const db = getDb()
    return db.update(inscriptions).set(data).where(eq(inscriptions.id, id)).returning().get()
  },

  delete(id: number) {
    const db = getDb()
    return db.delete(inscriptions).where(eq(inscriptions.id, id)).returning().get()
  },

  getStats() {
    const db = getDb()
    const total = db.select({ count: sql<number>`count(*)` }).from(inscriptions).get()
    const actif = db.select({ count: sql<number>`count(*)` }).from(inscriptions).where(eq(inscriptions.status, 'inscrit')).get()
    const termine = db.select({ count: sql<number>`count(*)` }).from(inscriptions).where(eq(inscriptions.status, 'termine')).get()
    return {
      total: total?.count || 0,
      actif: actif?.count || 0,
      termine: termine?.count || 0
    }
  }
}
