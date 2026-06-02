import { getDb } from '../database/connection'
import { apprenants } from '../database/schema'
import { eq, like, sql } from 'drizzle-orm'
import { generate } from './MatriculeGenerator'

export const ApprenantService = {
  getAll(filters?: { search?: string; status?: string }) {
    const db = getDb()
    let query = db.select().from(apprenants).orderBy(apprenants.id)
    if (filters?.status) {
      query = (query as any).where(eq(apprenants.status, filters.status))
    }
    if (filters?.search) {
      const s = `%${filters.search}%`
      query = (query as any).where(
        sql`${apprenants.nom} LIKE ${s} OR ${apprenants.prenom} LIKE ${s} OR ${apprenants.email} LIKE ${s} OR ${apprenants.matricule} LIKE ${s}`
      )
    }
    return query.all()
  },

  getById(id: number) {
    const db = getDb()
    return db.select().from(apprenants).where(eq(apprenants.id, id)).get()
  },

  async create(data: {
    nom: string; prenom: string; email?: string; telephone?: string;
    adresse?: string; dateNaissance?: string; niveauEtude?: string
  }) {
    const db = getDb()
    const matricule = await generate('APP')
    return db.insert(apprenants).values({ ...data, matricule, status: 'actif' }).returning().get()
  },

  update(id: number, data: {
    nom?: string; prenom?: string; email?: string; telephone?: string;
    adresse?: string; dateNaissance?: string; niveauEtude?: string; status?: string
  }) {
    const db = getDb()
    return db.update(apprenants).set(data).where(eq(apprenants.id, id)).returning().get()
  },

  delete(id: number) {
    const db = getDb()
    return db.delete(apprenants).where(eq(apprenants.id, id)).returning().get()
  }
}
