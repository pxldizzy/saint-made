import Image from "next/image";
import Reveal from "@/components/Reveal";

export const metadata = { title: "О бренде" };

const FACTS = [
  { value: "2022", label: "Год основания" },
  { value: "100%", label: "Пошив в России" },
  { value: "4", label: "Коллекции в год" },
];

export default function AboutPage() {
  return (
    <div className="pt-[120px]">
      <div className="container-sm grid gap-x-[30px] gap-y-[50px] lg:grid-cols-2">
        <h1 className="text-h2 text-graphite uppercase">О бренде</h1>
        <p className="text-lead text-graphite uppercase">
          SAINT MADE — одежда, сделанная как произведение искусства
        </p>
      </div>

      <div className="container-sm mt-[100px] grid gap-x-[30px] gap-y-[50px] lg:grid-cols-2">
        <Reveal className="relative aspect-[870/1089] w-full overflow-hidden">
          <Image
            src="/img/collection-b.webp"
            alt="Съёмка коллекции SAINT MADE"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 870px"
            className="object-cover"
          />
        </Reveal>

        <Reveal delay={80} className="flex flex-col gap-[30px]">
          <p className="text-[20px] leading-[27.3px] font-medium">
            Мы делаем вещи небольшими партиями: каждая модель проходит путь от
            эскиза до финальной примерки внутри собственной мастерской. Никаких
            складов на сезон вперёд — только то, что мы готовы носить сами.
          </p>
          <p className="text-[20px] leading-[27.3px] font-medium">
            Основа коллекций — плотный хлопок, шерсть и техничные смеси. Мы
            выбираем ткани, которые держат форму и стареют красиво, а принты
            рисуем вместе с художниками.
          </p>
          <p className="text-[20px] leading-[27.3px] font-medium">
            Каждая вещь маркируется артикулом и составом — вы всегда знаете, из
            чего она сделана и как за ней ухаживать.
          </p>

          <dl className="mt-[20px] grid grid-cols-3 gap-[30px]">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-h2 text-graphite">{fact.value}</dt>
                <dd className="text-body mt-[8px] text-ash uppercase">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </div>
  );
}
