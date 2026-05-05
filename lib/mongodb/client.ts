import { type MongoClientOptions, MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

/** Tuned for serverless: short-lived functions, occasional cold starts. */
const clientOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 15_000,
  connectTimeoutMS: 15_000,
  socketTimeoutMS: 45_000,
};

/**
 * Cached MongoDB client for Next.js (serverless-friendly).
 * Set `MONGODB_URI` from Atlas → Connect → Drivers (SRV connection string).
 *
 * If connect fails once, the cached promise is cleared so the next request can
 * retry (a stuck rejected promise would otherwise break login/catalog until cold start).
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!globalForMongo.mongoClientPromise) {
    const created = new MongoClient(uri, clientOptions).connect();
    globalForMongo.mongoClientPromise = created.catch((err: unknown) => {
      globalForMongo.mongoClientPromise = undefined;
      throw err;
    });
  }
  return globalForMongo.mongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const name = process.env.MONGODB_DB_NAME?.trim() || "price_list";
  return client.db(name);
}
