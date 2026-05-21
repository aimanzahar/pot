import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  basePath: basePath || undefined,
  experimental: {
    serverActions: {
      // Need headroom above the 5 MB per-file upload limit for QR codes
      // and receipts in createBill / markPaid / updatePaymentInfo actions.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
