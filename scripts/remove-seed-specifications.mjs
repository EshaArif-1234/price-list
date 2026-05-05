/**
 * One-time cleanup: removes dashboard specification templates whose `_id` starts with `seed-`
 * (former baked-in defaults). Safe to run multiple times.
 *
 * Loads `.env.local` from the repo root when vars are missing (same keys as Next.js).
 *
 * Usage (from repo root):
 *   npm run db:remove-seed-specifications
 *   node scripts/remove-seed-specifications.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env.local */
  }
}

loadEnvLocal();

const uri = process.env.MONGODB_URI?.trim();
const dbName =
  process.env.MONGODB_DB_NAME?.trim() || "price_list";

if (!uri) {
  console.error(
    "Missing MONGODB_URI. Set it or create .env.local at the project root.",
  );
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const col = client.db(dbName).collection("dashboard_specifications");
  const result = await col.deleteMany({
    _id: { $regex: /^seed-/ },
  });
  console.log(
    `Removed ${result.deletedCount} legacy seed specification template(s) from "${dbName}".dashboard_specifications`,
  );
} finally {
  await client.close();
}
