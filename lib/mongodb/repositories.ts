import type { DashboardCategoryRow } from "@/lib/dashboard/category-catalog";
import { normalizeProduct, productSeed } from "@/lib/dashboard/product-catalog";
import type { DashboardSpecificationRow } from "@/lib/dashboard/specification-catalog";
import { SPECIFICATION_DEFAULT_SEED } from "@/lib/dashboard/specification-catalog";
import type { Product } from "@/lib/types/product";

import { getMongoDb } from "./client";

export const COLLECTIONS = {
  products: "dashboard_products",
  categories: "dashboard_categories",
  specifications: "dashboard_specifications",
} as const;

/** Stored without duplicate `id` field — `_id` matches `Product.id`. */
type ProductDoc = Omit<Product, "id"> & { _id: string };

type CategoryDoc = { _id: string; name: string };

type SpecificationDoc = { _id: string; key: string; value: string };

export async function listProducts(): Promise<Product[]> {
  const db = await getMongoDb();
  const col = db.collection<ProductDoc>(COLLECTIONS.products);
  if ((await col.countDocuments()) === 0) {
    const seed = productSeed();
    if (seed.length > 0) {
      await col.insertMany(
        seed.map((p) => {
          const { id, ...fields } = p;
          return { _id: id, ...fields };
        }),
      );
    }
    return seed;
  }
  const docs = await col.find({}).toArray();
  const out: Product[] = [];
  for (const doc of docs) {
    const { _id, ...rest } = doc;
    const raw = { ...rest, id: _id };
    const p = normalizeProduct(raw);
    if (p) out.push(p);
  }
  return out;
}

export async function insertProduct(product: Product): Promise<void> {
  const db = await getMongoDb();
  const { id, ...fields } = product;
  await db.collection<ProductDoc>(COLLECTIONS.products).insertOne({
    _id: id,
    ...fields,
  });
}

export async function replaceProduct(product: Product): Promise<void> {
  const db = await getMongoDb();
  const { id, ...fields } = product;
  const result = await db
    .collection<ProductDoc>(COLLECTIONS.products)
    .updateOne({ _id: id }, { $set: fields });
  if (result.matchedCount === 0) {
    throw new Error("Product not found");
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<ProductDoc>(COLLECTIONS.products).deleteOne({
    _id: id,
  });
}

export async function listCategories(): Promise<DashboardCategoryRow[]> {
  const db = await getMongoDb();
  const col = db.collection<CategoryDoc>(COLLECTIONS.categories);
  const docs = await col.find({}).sort({ name: 1 }).toArray();
  return docs.map((d) => ({
    id: String(d._id),
    name: String(d.name),
  }));
}

export async function insertCategory(row: DashboardCategoryRow): Promise<void> {
  const db = await getMongoDb();
  await db.collection<CategoryDoc>(COLLECTIONS.categories).insertOne({
    _id: row.id,
    name: row.name,
  });
}

export async function updateCategory(row: DashboardCategoryRow): Promise<void> {
  const db = await getMongoDb();
  const result = await db
    .collection<CategoryDoc>(COLLECTIONS.categories)
    .updateOne({ _id: row.id }, { $set: { name: row.name } });
  if (result.matchedCount === 0) {
    throw new Error("Category not found");
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<CategoryDoc>(COLLECTIONS.categories).deleteOne({
    _id: id,
  });
}

export async function listSpecifications(): Promise<DashboardSpecificationRow[]> {
  const db = await getMongoDb();
  const col = db.collection<SpecificationDoc>(COLLECTIONS.specifications);
  if ((await col.countDocuments()) === 0) {
    await col.insertMany(
      SPECIFICATION_DEFAULT_SEED.map((s) => ({
        _id: s.id,
        key: s.key,
        value: s.value,
      })),
    );
    return [...SPECIFICATION_DEFAULT_SEED];
  }
  const docs = await col.find({}).toArray();
  return docs.map((d) => ({
    id: String(d._id),
    key: String(d.key),
    value: String(d.value),
  }));
}

export async function insertSpecification(
  row: DashboardSpecificationRow,
): Promise<void> {
  const db = await getMongoDb();
  await db.collection<SpecificationDoc>(COLLECTIONS.specifications).insertOne({
    _id: row.id,
    key: row.key,
    value: row.value,
  });
}

export async function updateSpecification(
  row: DashboardSpecificationRow,
): Promise<void> {
  const db = await getMongoDb();
  const result = await db
    .collection<SpecificationDoc>(COLLECTIONS.specifications)
    .updateOne({ _id: row.id }, { $set: { key: row.key, value: row.value } });
  if (result.matchedCount === 0) {
    throw new Error("Specification not found");
  }
}

export async function deleteSpecification(id: string): Promise<void> {
  const db = await getMongoDb();
  await db.collection<SpecificationDoc>(COLLECTIONS.specifications).deleteOne({
    _id: id,
  });
}
