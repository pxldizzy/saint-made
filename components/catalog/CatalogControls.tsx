"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { GridFourIcon, GridSixIcon, PlusIcon } from "@/components/icons";

export type FilterOptions = {
  types: { slug: string; name: string }[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  /** Real price range of the catalogue, in roubles. */
  minPrice: number;
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

  /** Checkbox + label as one unbreakable chip — chips wrap, text never does. */
  const checkbox = (key: string, value: string, label: string) => (
    <label
      key={value}
      className="flex shrink-0 cursor-pointer items-center gap-[8px] whitespace-nowrap"
    >
      <input
        type="checkbox"
        checked={isOn(key, value)}
        onChange={() => toggleMulti(key, value)}
        className="h-[20px] w-[20px] shrink-0 appearance-none border-2 border-graphite bg-paper transition-colors duration-300 checked:bg-graphite xl:h-[25px] xl:w-[25px]"
      />
      <span className="text-[clamp(14px,1.04vw,20px)] leading-[1.366] font-semibold text-graphite uppercase">
        {label}
      </span>
    </label>
  );

  // Price range: starts at the cheapest and ends at the most expensive product.
  const { minPrice, maxPrice } = options;
  const clamp = (n: number) => Math.min(Math.max(n, minPrice), maxPrice);
  const from = clamp(Number(params.get("min")) || minPrice);
  const to = clamp(Number(params.get("max")) || maxPrice);
  const [range, setRange] = useState<[number, number]>([from, to]);
  // The committed value is read from a ref: pointerup can fire before React
  // re-renders, and a stale closure would push the previous bounds.
  const rangeRef = useRef<[number, number]>([from, to]);
  const span = Math.max(maxPrice - minPrice, 1);
  const pct = (v: number) => ((v - minPrice) / span) * 100;

  const commitRange = ([lo, hi]: [number, number]) =>
    push((p) => {
      if (lo > minPrice) p.set("min", String(lo));
      else p.delete("min");
      if (hi < maxPrice) p.set("max", String(hi));
      else p.delete("max");
    });

  const setBound = (index: 0 | 1, value: number) => {
    const next: [number, number] = [...range];
    next[index] = clamp(value);
    if (next[0] > next[1]) next[index === 0 ? 1 : 0] = next[index];
    rangeRef.current = next;
    setRange(next);
    return next;
  };

  const legendClass =
    "mb-[20px] text-[clamp(14px,1.04vw,20px)] leading-[1.366] font-extrabold text-graphite uppercase";
  const chipsClass = "flex flex-wrap gap-x-[30px] gap-y-[12px]";

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
          {/* Macket columns: 853 / 310 / 146 / 270 at x = 75 / 978 / 1338 / 1575 —
              the gutters are folded into the track widths as padding. */}
          <div className="grid gap-x-[50px] gap-y-[40px] pt-[30px] pb-[20px] xl:grid-cols-[minmax(0,903fr)_minmax(0,360fr)_minmax(0,237fr)_minmax(0,270fr)] xl:gap-x-0">
            <fieldset className="xl:pr-[50px]">
              <legend className={legendClass}>
                По типу
              </legend>
              <div className={chipsClass}>
                {options.types.map((t) => checkbox("type", t.slug, t.name))}
              </div>
            </fieldset>

            <fieldset className="xl:pr-[50px]">
              <legend className={legendClass}>
                По цвету
              </legend>
              <div className={chipsClass}>
                {options.colors.map((c) => checkbox("color", c.name, c.name))}
              </div>
            </fieldset>

            <fieldset className="xl:pr-[91px]">
              <legend className={legendClass}>
                По размеру
              </legend>
              <div className={chipsClass}>
                {options.sizes.map((s) => checkbox("size", s, s))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendClass}>
                По стоимости
              </legend>

              {/* Macket: 270px track at y=372 with 15px ticks at both ends,
                  two 120x42 fields below. The range spans the real prices. */}
              <div className="relative h-[15px] w-full max-w-[270px]">
                <span className="absolute top-1/2 h-[2px] w-full -translate-y-1/2 bg-line" />
                <span
                  className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink"
                  style={{ left: `${pct(range[0])}%`, right: `${100 - pct(range[1])}%` }}
                />
                <input
                  type="range"
                  aria-label="Цена от"
                  min={minPrice}
                  max={maxPrice}
                  value={range[0]}
                  onChange={(e) => setBound(0, Number(e.target.value))}
                  onPointerUp={() => commitRange(rangeRef.current)}
                  onKeyUp={() => commitRange(rangeRef.current)}
                  onBlur={() => commitRange(rangeRef.current)}
                  className="range-track absolute inset-0 w-full"
                />
                <input
                  type="range"
                  aria-label="Цена до"
                  min={minPrice}
                  max={maxPrice}
                  value={range[1]}
                  onChange={(e) => setBound(1, Number(e.target.value))}
                  onPointerUp={() => commitRange(rangeRef.current)}
                  onKeyUp={() => commitRange(rangeRef.current)}
                  onBlur={() => commitRange(rangeRef.current)}
                  className="range-track absolute inset-0 w-full"
                />
              </div>

              <div className="mt-[24px] flex flex-wrap items-center gap-[30px]">
                {([0, 1] as const).map((i) => (
                  <label key={i} className="flex flex-col">
                    <span className="sr-only">{i === 0 ? "Цена от" : "Цена до"}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={minPrice}
                      max={maxPrice}
                      value={range[i]}
                      onChange={(e) => setBound(i, Number(e.target.value))}
                      onBlur={() => commitRange(rangeRef.current)}
                      className="h-[42px] w-[110px] border-2 border-graphite px-[10px] text-center text-[16px] leading-[21.9px] font-semibold text-graphite focus:border-ink focus:outline-none xl:w-[120px]"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
