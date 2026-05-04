export type ProductBrand = "Ambassador" | "Imported";

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  /** One or more taxonomy labels from Dashboard → Categories. */
  categories: string[];
  price: number;
  /** ISO 4217 code; catalog defaults to PKR. */
  currency: string;
  description: string;
  /** Public path, data URL (local demo), or remote URL (e.g. Cloudinary). */
  image: string;
  stock: number;
  brand: ProductBrand;
  specifications: ProductSpecification[];
};
