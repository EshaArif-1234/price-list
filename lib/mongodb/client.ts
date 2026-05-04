import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

/**
 * Cached MongoDB client for Next.js (serverless-friendly).
 * Set `MONGODB_URI` from Atlas → Connect → Drivers (SRV connection string).
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalForMongo.mongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const name = process.env.MONGODB_DB_NAME?.trim() || "price_list";
  return client.db(name);
}
