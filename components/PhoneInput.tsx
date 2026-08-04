"use client";

import { useState } from "react";
import { phoneInputValue } from "@/lib/phone";

/** Keeps the +7 prefix and formats digits as the user types. */
export default function PhoneInput({
  name = "phone",
  defaultValue = "",
  className,
  required = false,
  id,
}: {
  name?: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState(
    defaultValue ? phoneInputValue(defaultValue) : "",
  );

  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      required={required}
      autoComplete="tel"
      placeholder="+7 900 000-00-00"
      value={value}
      onFocus={() => {
        if (!value) setValue("+7 ");
      }}
      onBlur={() => {
        if (value.replace(/\D/g, "").length <= 1) setValue("");
      }}
      onChange={(e) => setValue(phoneInputValue(e.target.value))}
      className={className}
    />
  );
}
