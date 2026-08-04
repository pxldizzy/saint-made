"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { GridFourIcon, GridSixIcon, PlusIcon } from "@/components/icons";

export type FilterOptions = {
  types: { slug: string; name: string }[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  maxPrice: number;
};

const SORTS = [
  { value: "new", label: "Сначала новые" },
  { value: "price-asc", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
];

/**
 * Macket: "ФИЛЬТР" row at y=262 with a plus icon and two grid toggles;
 * the panel below (y=319…504) holds four groups.
 */
export default function CatalogControls({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(
    Boolean(params.get("type") || params.get("color") || params.get("size") || params.get("max")),
  );

  const view = params.get("view") === "6" ? "6" : "4";
  const sort = params.get("sort") ?? "new";

  const push = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggleMulti = (key: string, value: string) =>
    push((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => p.append(key, v));
    });

  const isOn = (key: string, value: string) => params.getAll(key).includes(value);

  const checkbox = (key: string, value: string, label: string) => (
    <label key={value} className="flex cursor-pointer items-center gap-[8px]">
      <input
        type="checkbox"
        checked={isOn(key, value)}
        onChange={() => toggleMulti(key, value)}
        className="h-[25px] w-[25px] shrink-0 appearance-none border-2 border-graphite bg-paper transition-colors duration-300 checked:bg-graphite"
      />
      <span className="text-[20px] leading-[27.3px] font-semibold text-graphite uppercase">
        {label}
      </span>
    </label>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-[35px] gap-y-4 py-[10px]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-[5px] text-[20px] leading-[27.3px] font-bold text-graphite uppercase transition-opacity duration-300 hover:opacity-60"
        >
          <PlusIcon open={open} className="h-[16px] w-[16px]" />
          Фильтр
        </button>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            aria-label="Сетка по 4 товара"
            aria-pressed={view === "4"}
            onClick={() => push((p) => p.delete("view"))}
            className={`transition-colors duration-300 ${
              view === "4" ? "text-ink" : "text-ash hover:text-graphite"
            }`}
          >
            <GridFourIcon className="h-[17px] w-[25px]" />
          </button>
          <button
            type="button"
            aria-label="Сетка по 6 товаров"
            aria-pressed={view === "6"}
            onClick={() => push((p) => p.set("view", "6"))}
            className={`transition-colors duration-300 ${
              view === "6" ? "text-ink" : "text-ash hover:text-graphite"
            }`}
          >
            <GridSixIcon className="h-[17px] w-[25px]" />
          </button>
        </div>

        <label className="ml-auto flex items-center gap-[10px]">
          <span className="sr-only">Сортировка</span>
          <select
            value={sort}
            onChange={(e) =>
              push((p) =>
                e.target.value === "new"
                  ? p.delete("sort")
                  : p.set("sort", e.target.value),
              )
            }
            className="cursor-pointer appearance-none bg-transparent text-[20px] leading-[27.3px] font-bold text-graphite uppercase transition-opacity duration-300 hover:opacity-60 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className={`grid transition-all duration-500 ease-[var(--ease-brand)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-x-[30px] gap-y-[40px] pt-[30px] pb-[20px] lg:grid-cols-[853fr_310fr_146fr_264fr]">
            <fieldset>
              <legend className="mb-[20px] text-[20px] leading-[27.3px] font-extrabold text-graphite uppercase">
                По типу
              </legend>
              <div className="grid grid-cols-2 gap-x-[30px] gap-y-[10px] sm:grid-cols-3 xl:grid-cols-5">
                {options.types.map((t) => checkbox("type", t.slug, t.name))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-[20px] text-[20px] leading-[27.3px] font-extrabold text-graphite uppercase">
                По цвету
              </legend>
              <div className="grid grid-cols-2 gap-x-[30px] gap-y-[10px]">
                {options.colors.map((c) => checkbox("color", c.name, c.name))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-[20px] text-[20px] leading-[27.3px] font-extrabold text-graphite uppercase">
                По размеру
              </legend>
              <div className="grid grid-cols-2 gap-x-[30px] gap-y-[10px]">
                {options.sizes.map((s) => checkbox("size", s, s))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-[20px] text-[20px] leading-[27.3px] font-extrabold text-graphite uppercase">
                По стоимости
              </legend>
              <div className="flex flex-wrap items-center gap-[30px]">
                <label className="flex flex-col">
                  <span className="sr-only">Цена от</span>
                  <input
                    type="number"
                    min={0}
                    defaultValue={params.get("min") ?? ""}
                    placeholder="0,00"
                    onBlur={(e) =>
                      push((p) =>
                        e.target.value
                          ? p.set("min", e.target.value)
                          : p.delete("min"),
                      )
                    }
                    className="h-[42px] w-[120px] border-2 border-graphite px-[10px] text-[16px] leading-[21.9px] font-semibold text-graphite focus:outline-none"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="sr-only">Цена до</span>
                  <input
                    type="number"
                    min={0}
                    defaultValue={params.get("max") ?? ""}
                    placeholder={String(options.maxPrice)}
                    onBlur={(e) =>
                      push((p) =>
                        e.target.value
                          ? p.set("max", e.target.value)
                          : p.delete("max"),
                      )
                    }
                    className="h-[42px] w-[120px] border-2 border-graphite px-[10px] text-[16px] leading-[21.9px] font-semibold text-graphite focus:outline-none"
                  />
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
