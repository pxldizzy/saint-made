"use client";

import Image from "next/image";
import { useState } from "react";

/** Macket: thumbs 150×226 at x=75, main image 720×1079 at x=255. */
export default function ProductGallery({
  images,
  title,
}: {
  images: { url: string; alt: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const shown = images.length ? images : [{ url: "", alt: title }];

  return (
    <div className="flex gap-[3.333%]">
      {shown.length > 1 && (
        <ul className="flex w-[16.667%] shrink-0 flex-col gap-[47px]">
          {shown.map((img, i) => (
            <li key={img.url + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === active}
                className={`relative block aspect-[150/226] w-full overflow-hidden border transition-all duration-300 ${
                  i === active
                    ? "border-ink opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="150px"
                  loading="lazy"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative aspect-[720/1079] min-w-0 flex-1 overflow-hidden bg-[#f4f4f4]">
        {shown.map((img, i) => (
          <Image
            key={img.url + i}
            src={img.url}
            alt={i === active ? img.alt || title : ""}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 720px"
            className={`object-cover transition-opacity duration-500 ease-[var(--ease-brand)] ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
