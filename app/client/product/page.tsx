import ProductPage from "@/client/product/page";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    stock?: string;
  }>;
};

export default function Page({ searchParams }: PageProps) {
  return <ProductPage searchParams={searchParams} />;
}
