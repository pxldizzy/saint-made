"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";

type Status = "idle" | "sending" | "done";

export type CheckoutUser = { name: string; email: string; phone: string } | null;
export type CheckoutAddress = {
  id: string;
  title: string;
  city: string;
  street: string;
  apartment: string;
  isDefault: boolean;
};

const formatAddress = (a: CheckoutAddress) =>
  [a.city, a.street, a.apartment && `кв. ${a.apartment}`].filter(Boolean).join(", ");

export default function CheckoutForm({
  user,
  addresses,
}: {
  user: CheckoutUser;
  addresses: CheckoutAddress[];
}) {
  const { lines, total, ready, clear } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const selected = addresses.find((a) => a.id === addressId);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");

    const data = new FormData(e.currentTarget);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        address: data.get("address"),
        comment: data.get("comment"),
        lines: lines.map((l) => ({
          productId: l.productId,
          size: l.size,
          color: l.color,
          qty: l.qty,
        })),
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(payload.error ?? "Не удалось оформить заказ");
      setStatus("idle");
      return;
    }

    setOrderId(payload.id);
    setStatus("done");
    clear();
  }

  if (status === "done") {
    return (
      <div className="container-sm pt-[120px] pb-[60px] text-center">
        <h1 className="text-h2 uppercase">Заказ №{orderId} принят</h1>
        <p className="text-body mt-[30px] text-ash uppercase">
          Мы свяжемся с вами для подтверждения.
        </p>
        <Link href="/catalog" className="btn-base btn-solid mt-[40px]">
          Продолжить покупки
        </Link>
      </div>
    );
  }

  if (ready && lines.length === 0) {
    return (
      <div className="container-sm pt-[120px]">
        <h1 className="text-h2 uppercase">Оформление заказа</h1>
        <p className="text-body mt-[30px] text-ash uppercase">
          Сначала добавьте товары в корзину.
        </p>
        <Link href="/catalog" className="btn-base btn-solid mt-[40px]">
          В каталог
        </Link>
      </div>
    );
  }

  const field =
    "h-[71px] w-full border-2 border-graphite px-[24px] text-[16px] leading-[21.9px] font-semibold text-graphite placeholder:text-ash focus:border-ink focus:outline-none transition-colors duration-300";

  return (
    <div className="container-sm pt-[120px]">
      <h1 className="text-h2 uppercase">Оформление заказа</h1>

      <div className="mt-[60px] grid gap-[60px] lg:grid-cols-[1fr_420px]">
        <form onSubmit={submit} className="flex flex-col gap-[20px]">
          <label>
            <span className="text-body font-bold uppercase">Имя и фамилия</span>
            <input name="name" required minLength={2} defaultValue={user?.name ?? ""} className={`${field} mt-[10px]`} placeholder="Иван Иванов" />
          </label>
          <label>
            <span className="text-body font-bold uppercase">Телефон</span>
            <input name="phone" required type="tel" defaultValue={user?.phone ?? ""} className={`${field} mt-[10px]`} placeholder="+7 900 000-00-00" />
          </label>
          <label>
            <span className="text-body font-bold uppercase">E-mail</span>
            <input name="email" type="email" defaultValue={user?.email ?? ""} className={`${field} mt-[10px]`} placeholder="you@example.com" />
          </label>
          {addresses.length > 0 && (
            <fieldset>
              <legend className="text-body font-bold uppercase">
                Сохранённые адреса
              </legend>
              <div className="mt-[10px] flex flex-wrap gap-[12px]">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAddressId(a.id)}
                    aria-pressed={a.id === addressId}
                    className={`border-2 px-[16px] py-[10px] text-left text-[14px] leading-[19.1px] font-semibold uppercase transition-colors duration-300 ${
                      a.id === addressId
                        ? "border-ink text-ink"
                        : "border-line text-ash hover:border-graphite hover:text-graphite"
                    }`}
                  >
                    {a.title || "Адрес"}
                    <span className="mt-[4px] block font-medium normal-case">
                      {formatAddress(a)}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAddressId("")}
                  aria-pressed={addressId === ""}
                  className={`border-2 px-[16px] py-[10px] text-[14px] leading-[19.1px] font-semibold uppercase transition-colors duration-300 ${
                    addressId === ""
                      ? "border-ink text-ink"
                      : "border-line text-ash hover:border-graphite hover:text-graphite"
                  }`}
                >
                  Другой адрес
                </button>
              </div>
            </fieldset>
          )}

          <label>
            <span className="text-body font-bold uppercase">Адрес доставки</span>
            <input
              name="address"
              required
              minLength={5}
              key={addressId}
              defaultValue={selected ? formatAddress(selected) : ""}
              className={`${field} mt-[10px]`}
              placeholder="Город, улица, дом, квартира"
            />
          </label>
          <label>
            <span className="text-body font-bold uppercase">Комментарий</span>
            <textarea
              name="comment"
              rows={4}
              className={`${field} h-auto py-[20px]`}
              placeholder="Пожелания к доставке"
            />
          </label>

          {error && (
            <p role="alert" className="text-body font-bold text-ink uppercase">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-base btn-solid mt-[10px] w-full"
          >
            {status === "sending" ? "Отправляем…" : "Подтвердить заказ"}
          </button>
        </form>

        <aside className="h-fit border-2 border-graphite p-[30px]">
          <h2 className="text-column-title">Ваш заказ</h2>
          <ul className="mt-[30px] flex flex-col gap-[16px]">
            {lines.map((l) => (
              <li
                key={`${l.productId}${l.size}${l.color}`}
                className="text-body flex justify-between gap-4 uppercase"
              >
                <span>
                  {l.title} · {l.size} × {l.qty}
                </span>
                <span className="font-bold whitespace-nowrap">
                  {formatPrice(l.price * l.qty)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-[30px] flex justify-between border-t border-line pt-[16px] text-[20px] leading-[27.3px] font-bold uppercase">
            <span>К оплате</span>
            <span>{formatPrice(total)}</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
