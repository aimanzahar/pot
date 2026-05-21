import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  isSafeRelativePath,
  mimeFor,
  uploadAbsolutePath,
} from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const rel = path.join("/");

  if (!isSafeRelativePath(rel)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(uploadAbsolutePath(rel));
    const arrayBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeFor(rel),
        // Filenames are content-addressed nanoids — safe to cache hard.
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
