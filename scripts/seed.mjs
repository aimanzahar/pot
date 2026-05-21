// Seeds a sample bill so we can exercise the public + admin pages
// without going through the server-action form. Dev-only helper.

import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(join(DATA_DIR, "app.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    organizer_token TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    total_amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'MYR',
    split_mode TEXT NOT NULL,
    due_date TEXT,
    organizer_name TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    payment_note TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_participants_bill ON participants(bill_id);
`);

const slug = nanoid(10);
const token = nanoid(32);
const now = new Date().toISOString();
const due = new Date();
due.setDate(due.getDate() + 7);
const dueISO = due.toISOString().slice(0, 10);

db.prepare(
  `INSERT INTO bills (id, organizer_token, title, description, total_amount, currency, split_mode, due_date, organizer_name, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(
  slug,
  token,
  "Friday dinner @ Mamak",
  "6 of us, roti + teh tarik. Senang je.",
  144,
  "MYR",
  "equal",
  dueISO,
  "Aiman",
  now,
);

const names = ["Aiman", "Mei Ling", "Raj", "Priya", "Daniel", "Siti"];
const per = Math.round((144 / names.length) * 100) / 100; // 24.00
const insP = db.prepare(
  `INSERT INTO participants (id, bill_id, name, amount, paid, paid_at, payment_note, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);
let allocated = 0;
names.forEach((n, i) => {
  const amt = i === names.length - 1 ? Math.round((144 - allocated) * 100) / 100 : per;
  allocated = Math.round((allocated + per) * 100) / 100;
  // First two are paid, rest unpaid
  const paid = i < 2 ? 1 : 0;
  const paidAt = paid ? new Date(Date.now() - (i + 1) * 15 * 60_000).toISOString() : null;
  insP.run(nanoid(12), slug, n, amt, paid, paidAt, paid ? "paid via DuitNow" : null, now);
});

console.log(JSON.stringify({ slug, token, billUrl: `/b/${slug}`, adminUrl: `/b/${slug}/admin?token=${token}` }, null, 2));
