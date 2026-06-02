import Database from 'better-sqlite3'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { join } from 'path'
import { app } from 'electron'

let db: BetterSQLite3Database<typeof schema> | null = null
let sqliteDb: Database.Database | null = null

export function initDatabase(): BetterSQLite3Database<typeof schema> {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'nexarh.db')

  sqliteDb = new Database(dbPath)

  sqliteDb.pragma('journal_mode = WAL')
  sqliteDb.pragma('foreign_keys = ON')
  sqliteDb.pragma('busy_timeout = 5000')

  db = drizzle(sqliteDb, { schema })

  createTables()

  return db
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return sqliteDb
}

function createTables(): void {
  if (!sqliteDb) return

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'rh',
      employee_id INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      manager_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department_id INTEGER,
      base_salary REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      date_of_birth TEXT,
      gender TEXT,
      national_id TEXT UNIQUE,
      position_id INTEGER,
      department_id INTEGER,
      hire_date TEXT NOT NULL,
      employment_type TEXT NOT NULL DEFAULT 'CDI',
      status TEXT DEFAULT 'actif',
      base_salary REAL NOT NULL,
      bank_account TEXT,
      photo_path TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      contract_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      duration_months INTEGER,
      gross_salary REAL NOT NULL,
      net_salary REAL,
      status TEXT DEFAULT 'actif',
      document_path TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intern_number TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      school_name TEXT NOT NULL,
      study_level TEXT,
      specialty TEXT,
      department_id INTEGER,
      supervisor_id INTEGER,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      monthly_allowance REAL DEFAULT 0,
      status TEXT DEFAULT 'actif',
      mission TEXT,
      evaluation_note REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payroll_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_month INTEGER NOT NULL,
      period_year INTEGER NOT NULL,
      employee_id INTEGER,
      status TEXT DEFAULT 'brouillon',
      total_gross REAL DEFAULT 0,
      total_net REAL DEFAULT 0,
      total_deductions REAL DEFAULT 0,
      validated_by INTEGER,
      validated_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payslips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payroll_period_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      base_salary REAL NOT NULL,
      worked_days INTEGER NOT NULL DEFAULT 26,
      overtime_hours REAL DEFAULT 0,
      overtime_amount REAL DEFAULT 0,
      gross_salary REAL NOT NULL,
      cnps_employee REAL DEFAULT 0,
      cnps_employer REAL DEFAULT 0,
      irpp REAL DEFAULT 0,
      cfc REAL DEFAULT 0,
      fne REAL DEFAULT 0,
      transport_allowance REAL DEFAULT 0,
      housing_allowance REAL DEFAULT 0,
      meal_allowance REAL DEFAULT 0,
      performance_bonus REAL DEFAULT 0,
      advance_deduction REAL DEFAULT 0,
      other_deductions REAL DEFAULT 0,
      other_bonuses REAL DEFAULT 0,
      total_deductions REAL NOT NULL,
      total_bonuses REAL NOT NULL,
      net_salary REAL NOT NULL,
      pdf_path TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leave_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      max_days_per_year INTEGER,
      is_paid INTEGER DEFAULT 1,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      leave_type_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_days INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'en_attente',
      approved_by INTEGER,
      approved_at TEXT,
      rejection_reason TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL DEFAULT 'Mon Entreprise',
      company_address TEXT,
      company_phone TEXT,
      company_email TEXT,
      tax_id TEXT,
      cnps_number TEXT,
      logo_path TEXT,
      currency TEXT DEFAULT 'XAF',
      working_hours_per_day REAL DEFAULT 8,
      working_days_per_month INTEGER DEFAULT 26,
      overtime_rate REAL DEFAULT 1.5,
      transport_rate REAL DEFAULT 26000,
      pay_day INTEGER DEFAULT 5,
      cnps_ceiling REAL DEFAULT 750000,
      cnps_employee_rate REAL DEFAULT 0.028,
      cnps_employer_rate REAL DEFAULT 0.162,
      cfc_rate REAL DEFAULT 0.01,
      fne_rate REAL DEFAULT 0.01,
      irpp_brackets TEXT DEFAULT '[]',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      related_id INTEGER,
      related_type TEXT,
      event_date TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      user_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      leave_type_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      days_allocated INTEGER NOT NULL,
      days_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS formations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duree TEXT,
      frais REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS apprenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT,
      telephone TEXT,
      adresse TEXT,
      date_naissance TEXT,
      niveau_etude TEXT,
      status TEXT DEFAULT 'actif',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apprenant_id INTEGER NOT NULL,
      formation_id INTEGER NOT NULL,
      date_inscription TEXT NOT NULL,
      frais REAL NOT NULL DEFAULT 0,
      montant_paye REAL DEFAULT 0,
      status TEXT DEFAULT 'inscrit',
      notes TEXT,
      date_fin TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS paiements_formation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inscription_id INTEGER NOT NULL,
      montant REAL NOT NULL,
      date_paiement TEXT NOT NULL,
      mode_paiement TEXT DEFAULT 'especes',
      reference TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'present',
      check_in TEXT,
      check_out TEXT,
      hours_worked REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Insert default leave types if empty
    INSERT OR IGNORE INTO leave_types (id, name, max_days_per_year, is_paid, color) VALUES
      (1, 'Congé annuel', 30, 1, '#10B981'),
      (2, 'Congé maladie', 90, 1, '#F59E0B'),
      (3, 'Congé maternité', 98, 1, '#EF4444'),
      (4, 'Congé paternité', 10, 1, '#4F6EF7'),
      (5, 'Congé sans solde', 30, 0, '#6B7280');

    -- Insert default company settings if empty
    INSERT OR IGNORE INTO company_settings (id, company_name) VALUES (1, 'Mon Entreprise');

    -- Create default admin user (password: nexarh2024)
    INSERT OR IGNORE INTO users (id, username, password_hash, role, is_active)
    VALUES (1, 'admin', '$2a$12$s85px4iipzq4WXcb0aqT/uVHw71RZ7pvyMtGXkdoCaz/0339zjc1e', 'admin', 1);
  `)

  // Migrations for existing databases
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN pay_day INTEGER DEFAULT 5`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE payroll_periods ADD COLUMN employee_id INTEGER`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE payroll_periods ADD COLUMN paid_at TEXT`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN cnps_ceiling REAL DEFAULT 750000`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN cnps_employee_rate REAL DEFAULT 0.028`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN cnps_employer_rate REAL DEFAULT 0.162`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN cfc_rate REAL DEFAULT 0.01`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN fne_rate REAL DEFAULT 0.01`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE company_settings ADD COLUMN irpp_brackets TEXT DEFAULT '[]'`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE interns ADD COLUMN type TEXT DEFAULT 'academique'`) } catch {}
  try { sqliteDb.exec(`ALTER TABLE inscriptions ADD COLUMN creneau TEXT DEFAULT '09H-12H'`) } catch {}

  // Fix existing data where datetime('now') was stored as literal string
  const dateFixTables = [
    'audit_log', 'departments', 'positions', 'employees', 'contracts',
    'interns', 'leave_requests', 'leave_balances', 'attendance', 'notifications',
    'formations', 'apprenants', 'inscriptions', 'paiements_formation'
  ]
  for (const table of dateFixTables) {
    try {
      sqliteDb.exec(`UPDATE ${table} SET created_at = datetime('now') WHERE created_at = 'datetime(''now'')'`)
    } catch {}
    try {
      sqliteDb.exec(`UPDATE ${table} SET updated_at = datetime('now') WHERE updated_at = 'datetime(''now'')'`)
    } catch {}
  }
}
