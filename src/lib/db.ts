import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "app.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id              TEXT PRIMARY KEY,
      organizer_token TEXT NOT NULL,
      title           TEXT NOT NULL,
      description     TEXT,
      total_amount    REAL NOT NULL,
      currency        TEXT NOT NULL DEFAULT 'MYR',
      split_mode      TEXT NOT NULL,
      due_date        TEXT,
      organizer_name  TEXT,
      created_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS participants (
      id            TEXT PRIMARY KEY,
      bill_id       TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      name          TEXT NOT NULL,
      amount        REAL NOT NULL,
      paid          INTEGER NOT NULL DEFAULT 0,
      paid_at       TEXT,
      payment_note  TEXT,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_participants_bill ON participants(bill_id);
  `);

  // v2: payment instructions + QR + receipt uploads. Each column is added
  // only if it doesn't already exist, so re-running on an upgraded db is a
  // no-op.
  ensureColumn(d, "bills", "payment_instructions", "TEXT");
  ensureColumn(d, "bills", "payment_qr_path", "TEXT");
  ensureColumn(d, "participants", "receipt_path", "TEXT");
}

interface PragmaColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: unknown;
  pk: number;
}

function ensureColumn(
  d: Database.Database,
  table: string,
  column: string,
  decl: string,
) {
  const cols = d.prepare(`PRAGMA table_info(${table})`).all() as PragmaColumn[];
  if (cols.some((c) => c.name === column)) return;
  d.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl};`);
}
