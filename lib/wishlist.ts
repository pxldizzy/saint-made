"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sm-wishlist";
const EMPTY: string[] = [];

/** Same external-store pattern as the cart — see lib/cart.tsx. */
let ids: string[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    ids = read();
    hydrated = true;
  }
  listeners.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      ids = read();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWishlist() {
  const current = useSyncExternalStore(
    subscribe,
    () => ids,
    () => EMPTY,
  );

  const toggle = useCallback((id: string) => {
    ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable — keep the in-memory list for this session
    }
    emit();
  }, []);

  return {
    ids: current,
    ready: hydrated,
    toggle,
    has: (id: string) => current.includes(id),
  };
}
