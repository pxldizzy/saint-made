"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { saveProduct, uploadImage } from "@/app/admin/actions";

export type ProductFormData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  categoryId: string;
  isNew: boolean;
  isHidden: boolean;
  images: string[];
  variants: { size: string; color: string; colorHex: string; stock: number }[];
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const input =
  "h-[44px] w-full border-2 border-graphite px-[12px] text-[16px] leading-[21.9px] focus:border-ink focus:outline-none";
const label = "text-[14px] leading-[19.1px] font-bold uppercase";

export default function ProductForm({
  product,
  categories,
}: {
  product: ProductFormData;
  categories: { id: string; name: string; parentName: string | null }[];
}) {
  const [images, setImages] = useState<string[]>(product.images);
  const [variants, setVariants] = useState(product.variants);
  const [uploadError, setUploadError] = useState("");
  const [uploading, startUpload] = useTransition();

  const updateVariant = (i: number, patch: Partial<(typeof variants)[number]>) =>
    setVariants((prev) => prev.map((v, n) => (n === i ? { ...v, ...patch } : v)));

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError("");
    startUpload(async () => {
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.set("file", file);
        try {
          const url = await uploadImage(data);
          setImages((prev) => [...prev, url]);
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : "Не удалось загрузить файл");
        }
      }
    });
  }

  return (
    <form action={saveProduct} className="mt-[24px] flex flex-col gap-[30px]">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="images" value={images.join("\n")} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      <section className="grid gap-[20px] lg:grid-cols-2">
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Название</span>
          <input name="title" defaultValue={product.title} required className={input} />
        </label>

        <label className="flex flex-col gap-[8px]">
          <span className={label}>Слаг (ссылка)</span>
          <input
            name="slug"
            defaultValue={product.slug}
            placeholder="создастся из названия"
            className={input}
          />
        </label>

        <label className="flex flex-col gap-[8px]">
          <span className={label}>Цена, ₽</span>
          <input
            name="price"
            defaultValue={product.price}
            required
            inputMode="decimal"
            className={input}
          />
        </label>

        <label className="flex flex-col gap-[8px]">
          <span className={label}>Старая цена, ₽</span>
          <input
            name="oldPrice"
            defaultValue={product.oldPrice}
            inputMode="decimal"
            className={input}
          />
        </label>

        <label className="flex flex-col gap-[8px]">
          <span className={label}>Категория</span>
          <select name="categoryId" defaultValue={product.categoryId} className={input}>
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.parentName} → ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-[30px]">
          <label className="flex items-center gap-[10px]">
            <input
              type="checkbox"
              name="isNew"
              defaultChecked={product.isNew}
              className="h-[20px] w-[20px] appearance-none border-2 border-graphite checked:bg-graphite"
            />
            <span className={label}>Новинка</span>
          </label>
          <label className="flex items-center gap-[10px]">
            <input
              type="checkbox"
              name="isHidden"
              defaultChecked={product.isHidden}
              className="h-[20px] w-[20px] appearance-none border-2 border-graphite checked:bg-graphite"
            />
            <span className={label}>Скрыть с сайта</span>
          </label>
        </div>
      </section>

      <label className="flex flex-col gap-[8px]">
        <span className={label}>Описание</span>
        <textarea
          name="description"
          defaultValue={product.description}
          rows={5}
          className="w-full border-2 border-graphite p-[12px] text-[16px] leading-[21.9px] focus:border-ink focus:outline-none"
        />
      </label>

      <section>
        <h2 className={label}>Фотографии</h2>

        <div className="mt-[12px] flex flex-wrap gap-[12px]">
          {images.map((url, i) => (
            <div key={url + i} className="w-[110px]">
              <div className="relative aspect-[150/226] overflow-hidden bg-line">
                <Image src={url} alt="" fill sizes="110px" className="object-cover" />
              </div>
              <div className="mt-[6px] flex justify-between text-[12px] leading-[19.1px] uppercase">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() =>
                    setImages((prev) => {
                      const next = [...prev];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      return next;
                    })
                  }
                  className="disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, n) => n !== i))}
                  className="font-bold"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[16px] flex flex-wrap items-center gap-[16px]">
          <label className="btn-base btn-outline h-[44px] cursor-pointer px-[20px] text-[14px]">
            {uploading ? "Загружаем…" : "Загрузить файлы"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
            />
          </label>
          <AddByUrl onAdd={(url) => setImages((prev) => [...prev, url])} />
        </div>
        {uploadError && (
          <p role="alert" className="mt-[10px] text-[14px] font-bold uppercase">
            {uploadError}
          </p>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <h2 className={label}>Размеры, цвета и остатки</h2>
          <button
            type="button"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { size: "M", color: "Черный", colorHex: "#1c1c1c", stock: 0 },
              ])
            }
            className="btn-base btn-outline h-[40px] px-[16px] text-[14px]"
          >
            Добавить строку
          </button>
        </div>

        <div className="mt-[12px] overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[16px] leading-[21.9px]">
            <thead>
              <tr className="border-b-2 border-graphite text-left text-[14px] uppercase">
                <th className="py-[8px] pr-[12px]">Размер</th>
                <th className="py-[8px] pr-[12px]">Цвет</th>
                <th className="py-[8px] pr-[12px]">HEX</th>
                <th className="py-[8px] pr-[12px]">Остаток</th>
                <th className="py-[8px]" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i} className="border-b border-line">
                  <td className="py-[8px] pr-[12px]">
                    <select
                      value={v.size}
                      onChange={(e) => updateVariant(i, { size: e.target.value })}
                      aria-label="Размер"
                      className="h-[40px] border-2 border-graphite px-[8px]"
                    >
                      {SIZES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-[8px] pr-[12px]">
                    <input
                      value={v.color}
                      onChange={(e) => updateVariant(i, { color: e.target.value })}
                      aria-label="Цвет"
                      className="h-[40px] w-[160px] border-2 border-graphite px-[8px]"
                    />
                  </td>
                  <td className="py-[8px] pr-[12px]">
                    <input
                      type="color"
                      value={v.colorHex || "#1c1c1c"}
                      onChange={(e) => updateVariant(i, { colorHex: e.target.value })}
                      aria-label="Цвет в HEX"
                      className="h-[40px] w-[56px] border-2 border-graphite"
                    />
                  </td>
                  <td className="py-[8px] pr-[12px]">
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, { stock: Number(e.target.value) || 0 })
                      }
                      aria-label="Остаток"
                      className="h-[40px] w-[90px] border-2 border-graphite px-[8px]"
                    />
                  </td>
                  <td className="py-[8px]">
                    <button
                      type="button"
                      onClick={() =>
                        setVariants((prev) => prev.filter((_, n) => n !== i))
                      }
                      className="link-underline text-[14px] font-bold uppercase"
                    >
                      Убрать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {variants.length === 0 && (
            <p className="py-[20px] text-[14px] text-ash uppercase">
              Без размеров товар нельзя купить — добавьте хотя бы одну строку.
            </p>
          )}
        </div>
      </section>

      <div className="flex gap-[16px]">
        <button type="submit" className="btn-base btn-solid h-[52px]">
          Сохранить
        </button>
      </div>
    </form>
  );
}

function AddByUrl({ onAdd }: { onAdd: (url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <span className="flex items-center gap-[8px]">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="/img/product-1.webp или https://…"
        aria-label="Ссылка на изображение"
        className="h-[44px] w-[280px] border-2 border-graphite px-[12px] text-[16px] focus:border-ink focus:outline-none"
      />
      <button
        type="button"
        onClick={() => {
          if (url.trim()) onAdd(url.trim());
          setUrl("");
        }}
        className="btn-base btn-outline h-[44px] px-[16px] text-[14px]"
      >
        Добавить
      </button>
    </span>
  );
}
