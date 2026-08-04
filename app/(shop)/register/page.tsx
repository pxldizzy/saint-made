"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type FormState } from "../login/actions";

const INITIAL: FormState = { error: "" };

const inputClass =
  "h-[71px] w-full border-2 border-paper bg-transparent px-[24px] text-center text-[16px] leading-[21.9px] font-semibold uppercase text-paper placeholder:text-steel focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.25)] transition-shadow duration-300";

const FIELDS = [
  { name: "name", type: "text", placeholder: "Имя и фамилия", label: "Имя и фамилия", autoComplete: "name" },
  { name: "email", type: "email", placeholder: "Введите e-mail", label: "E-mail", autoComplete: "email" },
  { name: "phone", type: "tel", placeholder: "+7 900 000-00-00", label: "Телефон", autoComplete: "tel" },
  { name: "password", type: "password", placeholder: "Пароль (от 8 символов)", label: "Пароль", autoComplete: "new-password" },
  { name: "confirm", type: "password", placeholder: "Повторите пароль", label: "Повторите пароль", autoComplete: "new-password" },
];

/** Same dark panel as the macket's MAIN LOGIN, with the fields registration needs. */
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

        <div className="mt-[60px] flex flex-col gap-[20px]">
          {FIELDS.map((field) => (
            <label key={field.name} className="block">
              <span className="sr-only">{field.label}</span>
              <input
                name={field.name}
                type={field.type}
                required
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </label>
          ))}
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
