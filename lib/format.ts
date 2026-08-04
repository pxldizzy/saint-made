/** Prices are stored in kopecks; the macket renders them as "12 000 ₽". */
export function formatPrice(kopecks: number): string {
  const rubles = Math.round(kopecks / 100);
  return `${rubles.toLocaleString("ru-RU")} ₽`;
}

export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
