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
}
