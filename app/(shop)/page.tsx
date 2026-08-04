import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getBestsellers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const bestsellers = await getBestsellers(3);
  const [hero, ...rest] = bestsellers;

  return (
    <>
      {/* HERO — macket: full-bleed image 1920×1010, centred title and button */}
      <section className="relative">
        <div className="relative aspect-[1920/1010] min-h-[420px] w-full overflow-hidden">
          <Image
            src="/img/hero.webp"
            alt="Коллекция SAINT MADE"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-between py-[80px] text-center">
            <h1 className="text-h1 container-sm uppercase">
              Summer Saint Collection
            </h1>
            <Link
              href="/catalog"
              className="btn-base btn-solid w-[270px] max-w-[80vw]"
            >
              Перейти
            </Link>
          </div>
        </div>
      </section>

      {/* КОЛЛЕКЦИЯ ЗИМА 2023 */}
      <section className="container-sm mt-[150px]">
        <div className="grid gap-x-[30px] gap-y-[50px] lg:grid-cols-2">
          <Reveal>
            <h2 className="text-h2 text-graphite uppercase">
              Коллекция зима 2023
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-lead text-graphite uppercase">
              Откройте для себя наши последние творения с произведениями
              искусства
            </p>
          </Reveal>
          <Reveal className="relative aspect-[870/599] w-full overflow-hidden">
            <Image
              src="/img/collection-a.webp"
              alt="Образ из зимней коллекции"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 870px"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-brand)] hover:scale-[1.03]"
            />
          </Reveal>
          <Reveal
            delay={80}
            className="relative aspect-[870/1089] w-full overflow-hidden"
          >
            <Image
              src="/img/collection-b.webp"
              alt="Образ из зимней коллекции"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 870px"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-brand)] hover:scale-[1.03]"
            />
          </Reveal>
        </div>
      </section>

      {/* ПОДАРКИ ДЛЯ МУЖЧИН */}
      <section className="mt-[150px]">
        <div className="container-sm grid gap-x-[30px] gap-y-[30px] lg:grid-cols-2">
          <Reveal>
            <h2 className="text-h2 text-graphite uppercase">
              Подарки для мужчин
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-lead text-graphite uppercase">
              уникальные идеи подарков для мужчин кошельки с монограммой SM ремни
              SM и дорожные сумки
            </p>
          </Reveal>
        </div>

        <Reveal className="container-sm mt-[100px] block">
          <div className="relative aspect-[1770/650] min-h-[260px] w-full overflow-hidden">
            <Image
              src="/img/gifts.webp"
              alt="Подарки для мужчин"
              fill
              loading="lazy"
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-[14%] flex justify-center">
              <Link
                href="/catalog"
                className="btn-base w-[270px] max-w-[80vw] bg-paper text-graphite transition-colors duration-300 hover:bg-graphite hover:text-paper"
              >
                Перейти
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* БЕСТСЕЛЛЕРЫ */}
      <section className="container-sm mt-[150px]">
        <Reveal>
          <h2 className="text-h2 text-graphite uppercase">Бестселлеры</h2>
        </Reveal>

        {bestsellers.length > 0 ? (
          <>
            <div className="mt-[100px] grid gap-x-[30px] gap-y-[60px] md:grid-cols-2 lg:grid-cols-4">
              {hero && (
                <Reveal className="md:col-span-2">
                  <ProductCard
                    product={hero}
                    size="wide"
                    sizes="(max-width: 1024px) 100vw, 870px"
                  />
                </Reveal>
              )}
              {rest.map((product, i) => (
                <Reveal key={product.id} delay={80 * (i + 1)}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
            <div className="mt-[30px] flex justify-end">
              <Link
                href="/catalog"
                className="link-underline text-[20px] leading-[27.3px] font-semibold uppercase"
              >
                Смотреть
              </Link>
            </div>
          </>
        ) : (
          <p className="text-body mt-[40px] text-ash uppercase">
            Товары появятся здесь, как только их добавят в админке.
          </p>
        )}
      </section>
    </>
  );
}
