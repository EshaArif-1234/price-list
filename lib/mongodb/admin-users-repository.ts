import bcrypt from "bcryptjs";

import type { AdminUserPublic } from "@/lib/dashboard/admin-user-public";
import { DEFAULT_ADMIN_EMAIL } from "@/lib/dashboard/admin-user-public";

import { getMongoDb } from "./client";

export const ADMIN_USERS_COLLECTION = "dashboard_admin_users";

const DEFAULT_ADMIN_PASSWORD = "admin@123456";

type AdminUserDoc = {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export async function ensureDefaultAdminUser(): Promise<void> {
  const db = await getMongoDb();
  const col = db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION);
  const email = DEFAULT_ADMIN_EMAIL.toLowerCase();
  const existing = await col.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await col.insertOne({
    _id: crypto.randomUUID(),
    email,
    passwordHash,
    createdAt: new Date(),
  });
}

export async function listAdminUsersPublic(): Promise<AdminUserPublic[]> {
  await ensureDefaultAdminUser();
  const db = await getMongoDb();
  const docs = await db
    .collection<AdminUserDoc>(ADMIN_USERS_COLLECTION)
    .find({})
    .sort({ email: 1 })
    .toArray();
  return docs.map((d) => ({ id: d._id, email: d.email }));
}

export async function findAdminByEmail(
  email: string,
): Promise<AdminUserDoc | null> {
  await ensureDefaultAdminUser();
  const db = await getMongoDb();
  return db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION).findOne({
    email: email.trim().toLowerCase(),
  });
}

export async function verifyAdminPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}

export async function createAdminUser(
  email: string,
  plainPassword: string,
): Promise<AdminUserPublic> {
  const db = await getMongoDb();
  const col = db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION);
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    throw new Error("Invalid email.");
  }
  if (plainPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const dup = await col.findOne({ email: normalized });
  if (dup) throw new Error("This email is already registered.");

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const id = crypto.randomUUID();
  await col.insertOne({
    _id: id,
    email: normalized,
    passwordHash,
    createdAt: new Date(),
  });
  return { id, email: normalized };
}

export async function updateAdminUser(
  id: string,
  patch: { email?: string; password?: string },
): Promise<void> {
  const db = await getMongoDb();
  const col = db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION);
  const $set: Partial<Pick<AdminUserDoc, "email" | "passwordHash">> = {};

  if (patch.email !== undefined) {
    const normalized = patch.email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      throw new Error("Invalid email.");
    }
    const dup = await col.findOne({
      email: normalized,
      _id: { $ne: id },
    });
    if (dup) throw new Error("This email is already in use.");
    $set.email = normalized;
  }

  if (patch.password !== undefined) {
    if (patch.password.length > 0 && patch.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    if (patch.password.length > 0) {
      $set.passwordHash = await bcrypt.hash(patch.password, 10);
    }
  }

  if (Object.keys($set).length === 0) return;

  const result = await col.updateOne({ _id: id }, { $set });
  if (result.matchedCount === 0) throw new Error("Account not found.");
}

export async function deleteAdminUser(id: string): Promise<void> {
  const db = await getMongoDb();
  const col = db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION);
  const count = await col.countDocuments();
  if (count <= 1) {
    throw new Error("You cannot delete the last admin account.");
  }
  const result = await col.deleteOne({ _id: id });
  if (result.deletedCount === 0) throw new Error("Account not found.");
}
