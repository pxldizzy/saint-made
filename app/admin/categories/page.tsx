import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Категории" };

const input =
  "h-[44px] w-full border-2 border-graphite px-[12px] text-[16px] leading-[21.9px] focus:border-ink focus:outline-none";
const label = "text-[14px] leading-[19.1px] font-bold uppercase";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  const roots = categories.filter((c) => !c.parentId);

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[36px] leading-[49.2px] font-extrabold uppercase">
        Категории
      </h1>
      <p className="mt-[8px] text-[16px] leading-[21.9px] text-ash uppercase">
        Корневые категории — разделы в шапке сайта, вложенные — вкладки каталога.
      </p>

      <form
        action={saveCategory}
        className="mt-[24px] grid items-end gap-[16px] border-2 border-graphite p-[20px] lg:grid-cols-[1fr_1fr_200px_120px_auto]"
      >
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Название</span>
          <input name="name" required className={input} />
        </label>
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Слаг</span>
          <input name="slug" placeholder="создастся автоматически" className={input} />
        </label>
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Родитель</span>
          <select name="parentId" className={input} defaultValue="">
            <option value="">— корневая —</option>
            {roots.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Порядок</span>
          <input name="sortOrder" type="number" defaultValue={0} className={input} />
        </label>
        <button type="submit" className="btn-base btn-solid h-[44px] px-[20px]">
          Добавить
        </button>
      </form>

      <div className="mt-[24px] overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[16px] leading-[21.9px]">
          <thead>
            <tr className="border-b-2 border-graphite text-left uppercase">
              <th className="py-[12px] pr-[12px] font-bold">Название</th>
              <th className="py-[12px] pr-[12px] font-bold">Слаг</th>
              <th className="py-[12px] pr-[12px] font-bold">Родитель</th>
              <th className="py-[12px] pr-[12px] font-bold">Порядок</th>
              <th className="py-[12px] pr-[12px] font-bold">Товаров</th>
              <th className="py-[12px] font-bold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-line">
                <td className="py-[10px] pr-[12px]">
                  <form action={saveCategory} className="flex items-center gap-[8px]">
                    <input type="hidden" name="id" value={category.id} />
                    <input type="hidden" name="slug" value={category.slug} />
                    <input
                      type="hidden"
                      name="parentId"
                      value={category.parentId ?? ""}
                    />
                    <input
                      name="name"
                      defaultValue={category.name}
                      aria-label="Название категории"
                      className="h-[40px] w-[220px] border-2 border-graphite px-[8px]"
                    />
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={category.sortOrder}
                      aria-label="Порядок"
                      className="h-[40px] w-[70px] border-2 border-graphite px-[8px]"
                    />
                    <button
                      type="submit"
                      className="link-underline text-[14px] font-bold uppercase"
                    >
                      Сохранить
                    </button>
                  </form>
                </td>
                <td className="py-[10px] pr-[12px] text-ash">{category.slug}</td>
                <td className="py-[10px] pr-[12px] uppercase">
                  {category.parent?.name ?? "—"}
                </td>
                <td className="py-[10px] pr-[12px]">{category.sortOrder}</td>
                <td className="py-[10px] pr-[12px]">{category._count.products}</td>
                <td className="py-[10px]">
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <button
                      type="submit"
                      className="link-underline text-[14px] font-bold text-ash uppercase transition-colors duration-200 hover:text-ink"
                    >
                      Удалить
                      {category._count.children > 0
                        ? ` (и ${category._count.children} вложенных)`
                        : ""}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
