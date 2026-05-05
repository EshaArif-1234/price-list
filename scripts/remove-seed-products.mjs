/**
 * One-time cleanup: removes dashboard products whose `_id` matches built-in demo IDs
 * listed in `lib/data/products.ts`. Safe to run multiple times.
 *
 * Loads `.env.local` from the repo root when vars are missing (same keys as Next.js).
 *
 * Usage (from repo root):
 *   npm run db:remove-seed-products
 *   node scripts/remove-seed-products.mjs
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

/** Reads string literal product ids from PRODUCTS array objects (`id: "…"`). */
function seedProductIdsFromProductsTs() {
  const srcPath = path.join(__dirname, "..", "lib", "data", "products.ts");
  const src = fs.readFileSync(srcPath, "utf8");
  const ids = [];
  const re = /\bid:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    ids.push(m[1]);
  }
  return [...new Set(ids)];
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

const seedIds = seedProductIdsFromProductsTs();
if (seedIds.length === 0) {
  console.error(
    "Could not parse any seed product ids from lib/data/products.ts.",
  );
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const col = client.db(dbName).collection("dashboard_products");
  const result = await col.deleteMany({ _id: { $in: seedIds } });
  console.log(
    `Removed ${result.deletedCount} seed product document(s) from "${dbName}".dashboard_products (matched ${seedIds.length} known seed id(s)).`,
  );
} finally {
  await client.close();
}
