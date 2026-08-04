"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "./actions";

const INITIAL: FormState = { error: "" };

const inputClass =
  "h-[71px] w-full border-2 border-paper bg-transparent px-[24px] text-center text-[16px] leading-[21.9px] font-semibold uppercase text-paper placeholder:text-steel focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,255,0.25)] transition-shadow duration-300";

/**
 * Macket "MAIN LOGIN": dark panel 870×551, 630×71 inputs with white outline,
 * white solid submit button. These credentials open the admin panel.
 */
function LoginForm() {
  const params = useSearchParams();
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <form
      action={formAction}
      className="w-full max-w-[870px] bg-graphite px-[40px] py-[37px] sm:px-[120px]"
    >
      {/* Empty by default: the action sends admins to /admin and visitors to /account. */}
      <input type="hidden" name="next" value={params.get("next") ?? ""} />

      <h1 className="text-h2 text-center text-paper uppercase">Войти</h1>

      <label className="mt-[112px] block">
        <span className="sr-only">E-mail или телефон</span>
        <input
          name="login"
          required
          autoComplete="username"
          placeholder="E-mail или телефон"
          className={inputClass}
        />
      </label>

      <label className="mt-[30px] block">
        <span className="sr-only">Пароль</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Введите пароль"
          className={inputClass}
        />
      </label>

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
        className="btn-base mt-[52px] w-full bg-paper font-semibold text-graphite transition-opacity duration-300 hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Входим…" : "Войти"}
      </button>

      <p className="mt-[30px] text-center">
        <Link
          href="/contacts"
          className="link-underline text-[16px] leading-[21.9px] font-semibold text-paper uppercase"
        >
          Забыли пароль?
        </Link>
      </p>

      <p className="mt-[30px] text-center">
        <Link
          href="/register"
          className="link-underline text-[16px] leading-[21.9px] font-semibold text-paper uppercase"
        >
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container-sm flex justify-center py-[139px]">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
