"use client";

import { useState } from "react";

/** Macket: 420×71 field, 420×71 solid button, 25×25 consent checkbox. */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <form
      className="w-full max-w-[420px]"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        E-mail для подписки
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Введите e-mail"
        className="field text-center"
      />
      <button
        type="submit"
        disabled={!agreed || done}
        className="btn-base btn-solid mt-5 w-full disabled:opacity-60"
      >
        {done ? "Вы подписаны" : "Подписаться"}
      </button>
      <label className="mt-5 flex cursor-pointer items-start gap-[10px]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-[25px] w-[25px] shrink-0 appearance-none border border-graphite bg-paper transition-colors duration-300 checked:bg-graphite"
        />
        <span className="text-[14px] leading-[19.1px] text-graphite">
          Даю согласие на обработку персональных данных
        </span>
      </label>
    </form>
  );
}
