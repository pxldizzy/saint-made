import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Lookbook" };

const SHOTS = [
  { src: "/img/collection-b.webp", alt: "Образ 01 — зимняя коллекция", ratio: "870 / 1089", span: true },
  { src: "/img/collection-a.webp", alt: "Образ 02 — зимняя коллекция", ratio: "870 / 599" },
  { src: "/img/product-main.webp", alt: "Образ 03 — куртка Number 010", ratio: "720 / 1079" },
  { src: "/img/gifts.webp", alt: "Образ 04 — аксессуары", ratio: "1770 / 650", span: true },
];

export default function LookbookPage() {
  return (
    <div className="pt-[120px]">
      <div className="container-sm">
        <h1 className="text-h1 uppercase">Lookbook</h1>
        <p className="text-lead mt-[30px] max-w-[870px] text-graphite uppercase">
          Зима 2023 — образы, снятые в мастерской художника
        </p>
      </div>

      <div className="container-sm mt-[100px] grid gap-[30px] lg:grid-cols-2">
        {SHOTS.map((shot, i) => (
          <Reveal
            key={shot.src}
            delay={i * 80}
            className={shot.span ? "lg:col-span-2" : undefined}
          >
            <figure className="group relative w-full overflow-hidden" style={{ aspectRatio: shot.ratio }}>
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                loading={i === 0 ? undefined : "lazy"}
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 870px"
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease-brand)] group-hover:scale-[1.03]"
              />
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="container-sm mt-[100px]">
        <Link href="/catalog" className="btn-base btn-solid w-[270px] max-w-full">
          В каталог
        </Link>
      </div>
    </div>
  );
}
