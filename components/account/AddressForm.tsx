"use client";

import { useActionState, useState } from "react";
import { saveAddress, type AccountState } from "@/app/(shop)/account/actions";

const INITIAL: AccountState = { error: "" };

const field =
  "h-[52px] w-full border-2 border-graphite px-[16px] text-[16px] leading-[21.9px] font-semibold text-graphite placeholder:text-ash focus:border-ink focus:outline-none transition-colors duration-300";
const label = "text-[14px] leading-[19.1px] font-bold uppercase text-ash";

export type AddressValues = {
  id: string;
  title: string;
  city: string;
  street: string;
  apartment: string;
};

const EMPTY: AddressValues = { id: "", title: "", city: "", street: "", apartment: "" };

export default function AddressForm({
  address,
  onDone,
}: {
  address?: AddressValues;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveAddress, INITIAL);
  const [open, setOpen] = useState(Boolean(address));
  const values = address ?? EMPTY;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-base btn-outline h-[52px]"
      >
        Добавить адрес
      </button>
    );
  }

  return (
    <form action={formAction} className="max-w-[560px] border-2 border-graphite p-[24px]">
      <input type="hidden" name="id" value={values.id} />

      <div className="flex flex-col gap-[20px]">
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Название (дом, работа)</span>
          <input
            name="title"
            defaultValue={values.title}
            placeholder="Дом"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Город</span>
          <input name="city" defaultValue={values.city} required className={field} />
        </label>
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Улица и дом</span>
          <input name="street" defaultValue={values.street} required className={field} />
        </label>
        <label className="flex flex-col gap-[8px]">
          <span className={label}>Квартира</span>
          <input name="apartment" defaultValue={values.apartment} className={field} />
        </label>

        {(state.error || state.ok) && (
          <p
            role="status"
            className={`text-body font-bold uppercase ${state.error ? "text-ink" : "text-ash"}`}
          >
            {state.error || state.ok}
          </p>
        )}

        <div className="flex flex-wrap gap-[16px]">
          <button
            type="submit"
            disabled={pending}
            className="btn-base btn-solid h-[52px]"
          >
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDone?.();
            }}
            className="link-underline text-body font-bold text-ash uppercase"
          >
            Отмена
          </button>
        </div>
      </div>
    </form>
  );
}
