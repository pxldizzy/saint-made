"use client";

import { useMemo, useSyncExternalStore } from "react";

export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
};

type State = {
  lines: CartLine[];
  ready: boolean;
  /** Set for a moment after an item is added — drives the "added" animation. */
  lastAdded: string | null;
};

const STORAGE_KEY = "sm-cart";
const EMPTY: State = { lines: [], ready: false, lastAdded: null };

export const lineKey = (l: Pick<CartLine, "productId" | "size" | "color">) =>
  `${l.productId}|${l.size}|${l.color}`;

/**
 * localStorage is an external store, so the cart lives outside React and is
 * read through useSyncExternalStore. That also keeps browser tabs in sync.
 */
let state: State = EMPTY;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // private mode or quota exceeded — the cart still works for this session
  }
}

function subscribe(listener: () => void) {
  if (!state.ready) setState({ lines: readStorage(), ready: true });
  listeners.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) setState({ lines: readStorage() });
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

function commit(lines: CartLine[], lastAdded: string | null = state.lastAdded) {
  writeStorage(lines);
  setState({ lines, lastAdded });
}

export function addLine(line: Omit<CartLine, "qty">, qty = 1) {
  const key = lineKey(line);
  const found = state.lines.find((l) => lineKey(l) === key);
  const lines = found
    ? state.lines.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + qty } : l))
    : [...state.lines, { ...line, qty }];

  commit(lines, key);
  setTimeout(() => {
    if (state.lastAdded === key) setState({ lastAdded: null });
  }, 1600);
}

export function setLineQty(key: string, qty: number) {
  commit(
    qty <= 0
      ? state.lines.filter((l) => lineKey(l) !== key)
      : state.lines.map((l) => (lineKey(l) === key ? { ...l, qty } : l)),
  );
}

export function removeLine(key: string) {
  commit(state.lines.filter((l) => lineKey(l) !== key));
}

export function clearCart() {
  commit([]);
}

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    const count = snapshot.lines.reduce((n, l) => n + l.qty, 0);
    const total = snapshot.lines.reduce((n, l) => n + l.qty * l.price, 0);
    // The mutators live outside React, so they are stable by construction.
    return {
      ...snapshot,
      count,
      total,
      add: addLine,
      setQty: setLineQty,
      remove: removeLine,
      clear: clearCart,
    };
  }, [snapshot]);
}
