import { getDb } from '../database/connection'
import { formations } from '../database/schema'
import { eq, like } from 'drizzle-orm'

export const FormationService = {
  getAll(filters?: { search?: string; status?: string }) {
    const db = getDb()
    let query = db.select().from(formations).orderBy(formations.id)
    if (filters?.status) {
      query = (query as any).where(eq(formations.status, filters.status))
    }
    if (filters?.search) {
      query = (query as any).where(like(formations.name, `%${filters.search}%`))
    }
    return query.all()
  },

  getById(id: number) {
    const db = getDb()
    return db.select().from(formations).where(eq(formations.id, id)).get()
  },

  create(data: { name: string; description?: string; duree?: string; frais: number }) {
    const db = getDb()
    return db.insert(formations).values({ ...data, status: 'active' }).returning().get()
  },

  update(id: number, data: { name?: string; description?: string; duree?: string; frais?: number; status?: string }) {
    const db = getDb()
    return db.update(formations).set(data).where(eq(formations.id, id)).returning().get()
  },

  delete(id: number) {
    const db = getDb()
    return db.delete(formations).where(eq(formations.id, id)).returning().get()
  }
}
