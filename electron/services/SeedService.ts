import { getDb } from '../database/connection'
import { formations } from '../database/schema'

export function seedFormations(): void {
  const db = getDb()
  const existing = db.select().from(formations).all()
  if (existing.length > 0) return

  db.insert(formations).values([
    { name: 'Comptabilité et Gestion Financière', description: 'Maîtrisez les principes comptables et la gestion financière d\'entreprise', duree: '6 mois', frais: 350000, status: 'active' },
    { name: 'Marketing Digital et Réseaux Sociaux', description: 'Stratégies de marketing digital, SEO, SEA et community management', duree: '4 mois', frais: 250000, status: 'active' },
    { name: 'Développement Web Full Stack', description: 'Devenez développeur web maîtrisant React, Node.js et les bases de données', duree: '8 mois', frais: 500000, status: 'active' },
    { name: 'Ressources Humaines et Paie', description: 'Formation complète en gestion RH, administration du personnel et paie', duree: '5 mois', frais: 300000, status: 'active' },
    { name: 'Anglais Professionnel', description: 'Anglais orienté milieu professionnel et préparation TOEIC', duree: '3 mois', frais: 150000, status: 'active' },
    { name: 'Data Science et Analyse de Données', description: 'Analyse de données, machine learning et visualisation avec Python', duree: '6 mois', frais: 450000, status: 'active' }
  ]).run()

  console.log('Formations par défaut créées')
}
