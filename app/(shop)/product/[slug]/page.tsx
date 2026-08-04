import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import Reveal from "@/components/Reveal";
import WishlistButton from "@/components/product/WishlistButton";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { productCardSelect } from "@/lib/queries";
import type { ProductCardData } from "@/lib/product";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isHidden: false },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      category: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product?.title ?? "Товар",
    description: product?.description.split("\n")[0],
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = (await prisma.product.findMany({
    where: {
      isHidden: false,
      id: { not: product.id },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    select: productCardSelect,
  })) as ProductCardData[];

  const specs = product.description.split("\n").filter(Boolean);

  return (
    <div className="container-sm pt-[120px]">
      {/* Macket: gallery block 900 wide, 120 gutter, info column 750 */}
      <div className="grid gap-[30px] lg:grid-cols-[minmax(0,900fr)_minmax(0,750fr)] lg:gap-x-[6.78%]">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <div className="flex items-start justify-between gap-[30px]">
            <h1 className="text-h2 uppercase">{product.title}</h1>
            <WishlistButton productId={product.id} title={product.title} />
          </div>

          <p className="text-h3 mt-[10px]">
            {formatPrice(product.price)}
            {product.oldPrice ? (
              <span className="ml-[20px] text-ash line-through">
                {formatPrice(product.oldPrice)}
              </span>
            ) : null}
          </p>

          <ProductPurchase
            product={{
              id: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              image: product.images[0]?.url ?? "",
            }}
            variants={product.variants}
          />

          {specs.length > 0 && (
            <ul className="mt-[60px] flex flex-col gap-[20px]">
              {specs.map((line) => (
                <li
                  key={line}
                  className="text-[20px] leading-[27.3px] font-medium uppercase"
                >
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-[150px]">
          <Reveal>
            <h2 className="text-h2 text-graphite uppercase">
              Также может понравиться
            </h2>
          </Reveal>
          <div className="mt-[100px] grid grid-cols-2 gap-x-[30px] gap-y-[60px] md:grid-cols-3 xl:grid-cols-4">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
