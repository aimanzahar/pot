import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";

export type UploadKind = "qr" | "receipts";

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const UPLOAD_DIR = join(process.cwd(), "data", "uploads");

function safeExt(filename: string | undefined, mime: string): string {
  const fromMime = ALLOWED_TYPES[mime];
  if (fromMime) return fromMime;
  const m = filename?.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m ? m[1].replace("jpeg", "jpg") : "bin";
}

/**
 * Save an uploaded image. Returns the relative path (e.g. `qr/abc.png`) on
 * success. Returns null when the user didn't actually upload a file, or the
 * file is too big / wrong type — we tolerate that silently so optional file
 * fields don't blow up the form.
 */
export async function saveUpload(
  file: unknown,
  kind: UploadKind,
): Promise<string | null> {
  if (!(file instanceof File)) return null;
  if (file.size === 0) return null;
  if (file.size > MAX_BYTES) return null;
  if (!ALLOWED_TYPES[file.type]) return null;

  const ext = safeExt(file.name, file.type);
  const id = nanoid(24);
  const rel = `${kind}/${id}.${ext}`;
  const abs = join(UPLOAD_DIR, rel);

  await mkdir(join(UPLOAD_DIR, kind), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, bytes);

  return rel;
}

/** Best-effort delete of an uploaded file. Swallows missing-file errors. */
export async function deleteUpload(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;
  if (!isSafeRelativePath(relativePath)) return;
  try {
    await unlink(join(UPLOAD_DIR, relativePath));
  } catch {
    // ignore — file may already be gone
  }
}

export function uploadAbsolutePath(relativePath: string): string {
  return join(UPLOAD_DIR, relativePath);
}

/** Public URL for an uploaded file. Respects NEXT_PUBLIC_BASE_PATH. */
export function publicUploadUrl(relativePath: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/api/uploads/${relativePath}`;
}

/**
 * Validates that a relative path is safe: exactly `<kind>/<file>`, no
 * traversal, sensible filename. Used by the upload-serving route.
 */
export function isSafeRelativePath(rel: string): boolean {
  const parts = rel.split("/");
  if (parts.length !== 2) return false;
  const [kind, file] = parts;
  if (kind !== "qr" && kind !== "receipts") return false;
  return /^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(file);
}

export function mimeFor(file: string): string {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
