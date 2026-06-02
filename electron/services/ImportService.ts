import { dialog } from 'electron'
import { readFile } from 'fs/promises'
import { getDb } from '../database/connection'
import { employees } from '../database/schema'

export const ImportService = {
  async importEmployees(): Promise<{ imported: number; errors: string[] }> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })

    if (result.canceled || !result.filePaths.length) {
      return { imported: 0, errors: ['Aucun fichier sélectionné'] }
    }

    const content = await readFile(result.filePaths[0], 'utf-8')
    const lines = content.split('\n').filter(l => l.trim())
    if (lines.length < 2) return { imported: 0, errors: ['Fichier vide'] }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const db = getDb()
    let imported = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row = Object.fromEntries(headers.map((h, idx) => [h, values[idx] || '']))

        const employeeData = {
          employeeNumber: row['Matricule'] || `EMP-${Date.now()}-${i}`,
          firstName: row['Prénom'] || '',
          lastName: row['Nom'] || '',
          email: row['Email'] || null,
          phone: row['Téléphone'] || null,
          hireDate: row['Date embauche'] || new Date().toISOString().slice(0, 10),
          employmentType: row['Type contrat'] || 'CDI',
          baseSalary: parseFloat(row['Salaire'] || '0'),
          status: 'actif'
        }

        if (!employeeData.firstName || !employeeData.lastName) {
          errors.push(`Ligne ${i + 1}: Prénom et Nom requis`)
          continue
        }

        db.insert(employees).values(employeeData).run()
        imported++
      } catch (e: any) {
        errors.push(`Ligne ${i + 1}: ${e.message}`)
      }
    }

    return { imported, errors }
  }
}
