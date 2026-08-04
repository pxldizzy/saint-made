import { formatPrice } from "@/lib/format";

/** Plain SVG bar chart — no charting dependency, bars grow in on mount. */
export default function BarChart({
  data,
  height = 220,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <p className="text-[16px] leading-[21.9px] text-ash uppercase">
        Нет продаж за период
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const step = 100 / data.length;
  const barWidth = Math.max(step * 0.55, 0.6);
  const labelEvery = Math.ceil(data.length / 12);

  return (
    <figure>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="h-[220px] w-full"
        role="img"
        aria-label={`График продаж: максимум ${formatPrice(max)}`}
      >
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1="0"
            x2="100"
            y1={height - t * height}
            y2={height - t * height}
            stroke="#bfbfbf"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 10);
          return (
            <rect
              key={d.label + i}
              x={i * step + (step - barWidth) / 2}
              y={height - h}
              width={barWidth}
              height={h}
              fill="#1c1c1c"
              style={{
                transformOrigin: `0 ${height}px`,
                animation: `bar-grow .6s var(--ease-brand) both`,
                animationDelay: `${Math.min(i * 25, 600)}ms`,
              }}
            >
              <title>{`${d.label}: ${formatPrice(d.value)}`}</title>
            </rect>
          );
        })}
      </svg>

      <figcaption className="mt-[10px] flex justify-between text-[12px] leading-[19.1px] text-ash">
        {data.map((d, i) =>
          i % labelEvery === 0 ? <span key={d.label + i}>{d.label}</span> : null,
        )}
      </figcaption>
    </figure>
  );
}
