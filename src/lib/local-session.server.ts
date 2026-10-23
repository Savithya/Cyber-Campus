import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { cookies } from "next/headers";
import type { Session } from "./types";
import { isResearch } from "./config.server";
type LocalRecord = { session: Session; tokenHash: string; submitKey?: string };
const cookieName = "cc_local";
async function secret() {
  const raw = process.env.LOCAL_SESSION_SECRET;
  if (raw && /^[a-f0-9]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  if (raw && raw.trim().length > 0) {
    return createHash("sha256").update(raw.trim()).digest();
  }
  if (isResearch()) {
    throw new Error(
      "Set LOCAL_SESSION_SECRET to 64 random hex characters for local practice sessions.",
    );
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return createHash("sha256").update("cyber-campus-demo-local-secret-fallback").digest();
  }
  await mkdir(".demo-data", { recursive: true });
  try {
    return await readFile(".demo-data/secret.bin");
  } catch {
    const s = randomBytes(32);
    await writeFile(".demo-data/secret.bin", s, { flag: "wx" }).catch(() => {});
    return readFile(".demo-data/secret.bin");
  }
}
export async function readLocal(): Promise<LocalRecord | null> {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return null;
  try {
    const b = Buffer.from(value, "base64url");
    const d = createDecipheriv(
      "aes-256-gcm",
      await secret(),
      b.subarray(0, 12),
    );
    d.setAuthTag(b.subarray(12, 28));
    const record = JSON.parse(
      inflateRawSync(Buffer.concat([d.update(b.subarray(28)), d.final()]), {
        maxOutputLength: 100000,
      }).toString(),
    ) as LocalRecord;
    if (
      record.session.status === "draft" &&
      Date.parse(record.session.draftExpiresAt) < Date.now()
    ) {
      await writeLocal(null);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}
export async function writeLocal(record: LocalRecord | null) {
  const jar = await cookies();
  if (!record) {
    jar.delete(cookieName);
    return;
  }
  const iv = randomBytes(12),
    c = createCipheriv("aes-256-gcm", await secret(), iv);
  const encrypted = Buffer.concat([
    c.update(deflateRawSync(Buffer.from(JSON.stringify(record)))),
    c.final(),
  ]);
  const value = Buffer.concat([iv, c.getAuthTag(), encrypted]).toString(
    "base64url",
  );
  if (value.length > 3800)
    throw new Error(
      "This local practice session is full. Your saved first scores remain unchanged. Start a new practice session to continue.",
    );
  jar.set(cookieName, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 86400,
  });
}
