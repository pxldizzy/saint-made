import Link from "next/link";
import { notFound } from "next/navigation";
import CatalogControls, {
  type FilterOptions,
} from "@/components/catalog/CatalogControls";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { prisma } from "@/lib/prisma";
import { productCardSelect } from "@/lib/queries";
import type { ProductCardData } from "@/lib/product";

export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;

const asArray = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const slug = section?.[0];
  if (!slug) return { title: "Каталог" };
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category?.name ?? "Каталог" };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ section?: string[] }>;
  searchParams: Promise<Search>;
}) {
  const { section } = await params;
  const sp = await searchParams;
  const sectionSlug = section?.[0];

  const current = sectionSlug
    ? await prisma.category.findFirst({
        where: { slug: sectionSlug, parentId: null },
        include: { children: { orderBy: { sortOrder: "asc" } } },
      })
    : null;

  if (sectionSlug && !current) notFound();

  const tabs = current
    ? current.children
    : await prisma.category.findMany({
        where: { parentId: { not: null } },
        orderBy: { sortOrder: "asc" },
        distinct: ["name"],
      });

  const types = asArray(sp.type);
  const colors = asArray(sp.color);
  const sizes = asArray(sp.size);
  const min = Number(sp.min) || 0;
  const max = Number(sp.max) || 0;
  const view = sp.view === "6" ? 6 : 4;
  const sort = typeof sp.sort === "string" ? sp.sort : "new";

  const inSection = current
    ? { categoryId: { in: current.children.map((c) => c.id) } }
    : {};

  const products = (await prisma.product.findMany({
    where: {
      isHidden: false,
      ...inSection,
      ...(types.length ? { category: { slug: { in: types } } } : {}),
      ...(colors.length || sizes.length
        ? {
            variants: {
              some: {
                stock: { gt: 0 },
                ...(colors.length ? { color: { in: colors } } : {}),
                ...(sizes.length ? { size: { in: sizes } } : {}),
              },
            },
          }
        : {}),
      ...(min ? { price: { gte: min * 100 } } : {}),
      ...(max ? { price: { lte: max * 100 } } : {}),
    },
    orderBy:
      sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
          ? { price: "desc" }
          : { createdAt: "desc" },
    select: productCardSelect,
  })) as ProductCardData[];

  const [colorRows, sizeRows, priceMax] = await Promise.all([
    prisma.variant.findMany({
      distinct: ["color"],
      select: { color: true, colorHex: true },
      orderBy: { color: "asc" },
    }),
    prisma.variant.findMany({
      distinct: ["size"],
      select: { size: true },
    }),
    prisma.product.aggregate({ _max: { price: true } }),
  ]);

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
  const options: FilterOptions = {
    types: tabs.map((t) => ({ slug: t.slug, name: t.name })),
    colors: colorRows
      .filter((c) => c.color)
      .map((c) => ({ name: c.color, hex: c.colorHex || "#1c1c1c" })),
    sizes: sizeRows
      .map((s) => s.size.toUpperCase())
      .sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)),
    maxPrice: Math.round((priceMax._max.price ?? 0) / 100),
  };

  const gridClass =
    view === 6
      ? "grid gap-x-[30px] gap-y-[100px] grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
      : "grid gap-x-[30px] gap-y-[100px] grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="container-sm pt-[40px]">
      {/* Category tabs — macket: centred row, 20/700, active #1c1c1c */}
      {tabs.length > 0 && (
        <nav aria-label="Категории" className="mb-[60px]">
          <ul className="flex flex-wrap justify-center gap-x-[30px] gap-y-[10px]">
            {tabs.map((tab) => {
              const active = types.includes(tab.slug);
              return (
                <li key={tab.id}>
                  <Link
                    href={
                      active
                        ? `/catalog${sectionSlug ? `/${sectionSlug}` : ""}`
                        : `/catalog${sectionSlug ? `/${sectionSlug}` : ""}?type=${tab.slug}`
                    }
                    data-active={active}
                    className={`link-underline text-[20px] leading-[27.3px] font-bold uppercase transition-colors duration-300 hover:text-graphite ${
                      active ? "text-graphite" : "text-ash"
                    }`}
                  >
                    {tab.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <CatalogControls options={options} />

      {products.length === 0 ? (
        <p className="text-body py-[100px] text-center text-ash uppercase">
          По выбранным фильтрам ничего не нашлось
        </p>
      ) : (
        <div className={`${gridClass} mt-[33px]`}>
          {products.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 5) * 60}>
              <ProductCard
                product={product}
                size={view === 6 ? "sm" : "lg"}
                priority={i < 4}
                sizes={
                  view === 6
                    ? "(max-width: 768px) 50vw, 270px"
                    : "(max-width: 768px) 50vw, 420px"
                }
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
