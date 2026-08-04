"use client";

import { useActionState } from "react";
import {
  changePassword,
  updateProfile,
  type AccountState,
} from "@/app/(shop)/account/actions";

const INITIAL: AccountState = { error: "" };

const field =
  "h-[52px] w-full border-2 border-graphite px-[16px] text-[16px] leading-[21.9px] font-semibold text-graphite placeholder:text-ash focus:border-ink focus:outline-none transition-colors duration-300";
const label = "text-[14px] leading-[19.1px] font-bold uppercase text-ash";

function Message({ state }: { state: AccountState }) {
  if (!state.error && !state.ok) return null;
  return (
    <p
      role="status"
      className={`text-body font-bold uppercase ${state.error ? "text-ink" : "text-ash"}`}
    >
      {state.error || state.ok}
    </p>
  );
}

export default function ProfileForms({
  user,
}: {
  user: { name: string; email: string; phone: string };
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    INITIAL,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    INITIAL,
  );

  return (
    <div className="flex flex-col gap-[50px]">
      <form action={profileAction} className="max-w-[560px]">
        <h3 className="text-column-title text-graphite">Личные данные</h3>

        <div className="mt-[24px] flex flex-col gap-[20px]">
          <label className="flex flex-col gap-[8px]">
            <span className={label}>Имя и фамилия</span>
            <input name="name" defaultValue={user.name} required className={field} />
          </label>
          <label className="flex flex-col gap-[8px]">
            <span className={label}>E-mail</span>
            <input
              name="email"
              type="email"
              defaultValue={user.email}
              required
              className={field}
            />
          </label>
          <label className="flex flex-col gap-[8px]">
            <span className={label}>Телефон</span>
            <input
              name="phone"
              type="tel"
              defaultValue={user.phone}
              required
              className={field}
            />
          </label>

          <Message state={profileState} />

          <button
            type="submit"
            disabled={profilePending}
            className="btn-base btn-solid h-[52px] self-start"
          >
            {profilePending ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </form>

      <form action={passwordAction} className="max-w-[560px]">
        <h3 className="text-column-title text-graphite">Смена пароля</h3>

        <div className="mt-[24px] flex flex-col gap-[20px]">
          <label className="flex flex-col gap-[8px]">
            <span className={label}>Текущий пароль</span>
            <input
              name="current"
              type="password"
              autoComplete="current-password"
              required
              className={field}
            />
          </label>
          <label className="flex flex-col gap-[8px]">
            <span className={label}>Новый пароль</span>
            <input
              name="next"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={field}
            />
          </label>
          <label className="flex flex-col gap-[8px]">
            <span className={label}>Повторите новый</span>
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className={field}
            />
          </label>

          <Message state={passwordState} />

          <button
            type="submit"
            disabled={passwordPending}
            className="btn-base btn-outline h-[52px] self-start"
          >
            {passwordPending ? "Меняем…" : "Изменить пароль"}
          </button>
        </div>
      </form>
    </div>
  );
}
