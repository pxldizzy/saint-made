"use client";

import Link from "next/link";
import { useActionState } from "react";
import PhoneInput from "@/components/PhoneInput";
import { registerAction, type FormState } from "../login/actions";

const INITIAL: FormState = { error: "" };

const inputClass =
  "h-[71px] w-full border-2 border-paper bg-transparent px-[24px] text-center text-[16px] leading-[21.9px] font-semibold uppercase text-paper placeholder:text-steel focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.25)] transition-shadow duration-300";

/**
 * Same dark panel as the macket's MAIN LOGIN. An account needs a name, a
 * password and at least one contact — e-mail or phone.
 */
export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, INITIAL);

  return (
    <div className="container-sm flex justify-center py-[139px]">
      <form
        action={formAction}
        className="w-full max-w-[870px] bg-graphite px-[40px] py-[37px] sm:px-[120px]"
      >
        <h1 className="text-h2 text-center text-paper uppercase">
          Регистрация
        </h1>

        <div className="mt-[50px] flex flex-col gap-[20px]">
          <label className="block">
            <span className="sr-only">Имя и фамилия</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Имя и фамилия"
              className={inputClass}
            />
          </label>

          <p className="text-center text-[14px] leading-[19.1px] font-semibold text-muted uppercase">
            Укажите e-mail или телефон — по нему вы будете входить
          </p>

          <label className="block">
            <span className="sr-only">E-mail</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Введите e-mail"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="sr-only">Телефон</span>
            <PhoneInput className={inputClass} />
          </label>

          <label className="block">
            <span className="sr-only">Пароль</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Пароль (от 8 символов)"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="sr-only">Повторите пароль</span>
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Повторите пароль"
              className={inputClass}
            />
          </label>
        </div>

        {state.error && (
          <p
            role="alert"
            className="mt-[20px] text-center text-[16px] leading-[21.9px] font-semibold text-paper uppercase"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-base mt-[42px] w-full bg-paper font-semibold text-graphite transition-opacity duration-300 hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Создаём…" : "Зарегистрироваться"}
        </button>

        <p className="mt-[43px] text-center">
          <Link
            href="/login"
            className="link-underline text-[16px] leading-[21.9px] font-semibold text-paper uppercase"
          >
            Уже есть аккаунт? Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
