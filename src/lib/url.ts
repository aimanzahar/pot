import "server-only";
import { headers } from "next/headers";

/**
 * Returns the absolute origin (no trailing slash) used for building share URLs.
 *
 * Order:
 *   1. `PUBLIC_APP_URL` env var — explicit override, used for tunnel /
 *      production deployments so share links always point at the public URL
 *      even when the form was submitted via localhost.
 *   2. `x-forwarded-host` request header — for typical reverse proxies.
 *   3. `host` request header — local dev fallback.
 */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
