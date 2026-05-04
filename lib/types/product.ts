export type ProductBrand = "Ambassador" | "Imported";

export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  currency: string;
  description: string;
  /** Path under `public`, e.g. `/images/product-placeholder.svg` */
  image: string;
  stock: number;
  brand: ProductBrand;
  specifications: ProductSpecification[];
};
