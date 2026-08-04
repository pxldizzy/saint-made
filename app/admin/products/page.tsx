import Image from "next/image";
import Link from "next/link";
import { deleteProduct, toggleProductHidden } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Товары" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; stock?: string; hidden?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] }),
    prisma.product.findMany({
      where: {
        ...(q ? { title: { contains: q } } : {}),
        ...(sp.category ? { categoryId: sp.category } : {}),
        ...(sp.hidden === "1" ? { isHidden: true } : {}),
        ...(sp.stock === "low" ? { variants: { some: { stock: { lte: 2 } } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
  ]);

  const inputClass =
    "h-[44px] border-2 border-graphite px-[12px] text-[16px] leading-[21.9px] focus:border-ink focus:outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-[20px]">
        <h1 className="text-[36px] leading-[49.2px] font-extrabold uppercase">
          Товары
        </h1>
        <Link href="/admin/products/new" className="btn-base btn-solid h-[52px]">
          Добавить товар
        </Link>
      </div>

      <form className="mt-[24px] flex flex-wrap items-center gap-[12px]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          className={`${inputClass} min-w-[240px] flex-1`}
        />
        <select
          name="category"
          defaultValue={sp.category ?? ""}
          aria-label="Категория"
          className={inputClass}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? "— " : ""}
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="stock"
          defaultValue={sp.stock ?? ""}
          aria-label="Остатки"
          className={inputClass}
        >
          <option value="">Любые остатки</option>
          <option value="low">Заканчивается (≤2)</option>
        </select>
        <select
          name="hidden"
          defaultValue={sp.hidden ?? ""}
          aria-label="Видимость"
          className={inputClass}
        >
          <option value="">Все товары</option>
          <option value="1">Только скрытые</option>
        </select>
        <button type="submit" className="btn-base btn-outline h-[44px] px-[20px]">
          Применить
        </button>
      </form>

      <p className="mt-[16px] text-[14px] leading-[19.1px] text-ash uppercase">
        Найдено: {products.length}
      </p>

      <div className="mt-[16px] overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-[16px] leading-[21.9px]">
          <thead>
            <tr className="border-b-2 border-graphite text-left uppercase">
              <th className="py-[12px] pr-[12px] font-bold">Товар</th>
              <th className="py-[12px] pr-[12px] font-bold">Категория</th>
              <th className="py-[12px] pr-[12px] font-bold">Цена</th>
              <th className="py-[12px] pr-[12px] font-bold">Остаток</th>
              <th className="py-[12px] pr-[12px] font-bold">Статус</th>
              <th className="py-[12px] font-bold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={product.id} className="border-b border-line align-middle">
                  <td className="py-[12px] pr-[12px]">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center gap-[12px] transition-opacity duration-200 hover:opacity-60"
                    >
                      <span className="relative block h-[56px] w-[40px] shrink-0 overflow-hidden bg-line">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="font-bold uppercase">{product.title}</span>
                    </Link>
                  </td>
                  <td className="py-[12px] pr-[12px] uppercase">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="py-[12px] pr-[12px] whitespace-nowrap">
                    {formatPrice(product.price)}
                  </td>
                  <td
                    className={`py-[12px] pr-[12px] font-bold ${stock === 0 ? "text-ink" : stock <= 5 ? "text-ash" : ""}`}
                  >
                    {stock}
                  </td>
                  <td className="py-[12px] pr-[12px] uppercase">
                    {product.isHidden ? "Скрыт" : "На сайте"}
                  </td>
                  <td className="py-[12px]">
                    <div className="flex flex-wrap gap-[12px]">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="link-underline text-[14px] leading-[19.1px] font-bold uppercase"
                      >
                        Изменить
                      </Link>
                      <form action={toggleProductHidden}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="link-underline text-[14px] leading-[19.1px] font-bold text-ash uppercase transition-colors duration-200 hover:text-ink"
                        >
                          {product.isHidden ? "Показать" : "Скрыть"}
                        </button>
                      </form>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="link-underline text-[14px] leading-[19.1px] font-bold text-ash uppercase transition-colors duration-200 hover:text-ink"
                        >
                          Удалить
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="py-[40px] text-center text-[16px] leading-[21.9px] text-ash uppercase">
            Ничего не найдено
          </p>
        )}
      </div>
    </div>
  );
}
