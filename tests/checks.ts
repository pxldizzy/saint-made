/**
 * One runnable check over the logic that would hurt if it broke:
 * session signing (security) and price/size formatting (money + stock).
 *
 * Run: npm test
 */
import assert from "node:assert/strict";
import {
  ADMIN_SUBJECT,
  checkCredentials,
  createSessionValue,
  readSession,
  safeEqual,
} from "../lib/auth";
import { formatPrice } from "../lib/format";
import { colorsOf, sizesOf, type ProductCardData } from "../lib/product";

const nbsp = String.fromCharCode(160);

async function run() {
  // --- session ---
  const token = await createSessionValue(ADMIN_SUBJECT);
  assert.equal(await readSession(token), ADMIN_SUBJECT, "fresh token must be valid");
  assert.equal(await readSession(undefined), null, "missing token is invalid");
  assert.equal(await readSession("garbage"), null, "malformed token is invalid");

  const [expires, subject, mac] = token.split(".");
  assert.equal(
    await readSession(`${expires}.${subject}.${mac.slice(0, -1)}0`),
    null,
    "tampered signature must be rejected",
  );
  assert.equal(
    await readSession(`${Date.now() - 1000}.${subject}.${mac}`),
    null,
    "expired payload must be rejected",
  );
  assert.equal(
    await readSession(`${expires}.uHACKER.${mac}`),
    null,
    "swapping the subject must be rejected",
  );

  const userToken = await createSessionValue("uabc123");
  assert.equal(await readSession(userToken), "uabc123", "visitor session works");

  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abd"), false);
  assert.equal(safeEqual("abc", "abcd"), false);

  // --- credentials (defaults come from env, see .env.example) ---
  process.env.ADMIN_LOGIN = "admin";
  process.env.ADMIN_PASSWORD = "s3cret";
  assert.equal(checkCredentials("admin", "s3cret"), true);
  assert.equal(checkCredentials("admin", "wrong"), false);
  assert.equal(checkCredentials("root", "s3cret"), false);

  // Production must not fall back to the dev defaults.
  const env = process.env.NODE_ENV;
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  delete process.env.ADMIN_PASSWORD;
  assert.equal(
    checkCredentials("admin", "saintmade"),
    false,
    "no ADMIN_PASSWORD in production means no admin login",
  );
  (process.env as Record<string, string | undefined>).NODE_ENV = env;

  // --- prices are stored in kopecks ---
  assert.equal(formatPrice(1_200_000), `12${nbsp}000 ₽`);
  assert.equal(formatPrice(0), "0 ₽");
  assert.equal(formatPrice(99_50), "100 ₽", "rounds to whole roubles");

  // --- only sizes with stock are offered, in macket order ---
  const product: ProductCardData = {
    id: "1",
    slug: "x",
    title: "X",
    price: 100,
    oldPrice: null,
    isNew: false,
    images: [],
    variants: [
      { size: "L", color: "Черный", colorHex: "#1c1c1c", stock: 2 },
      { size: "XS", color: "Черный", colorHex: "#1c1c1c", stock: 1 },
      { size: "M", color: "Белый", colorHex: "#ffffff", stock: 0 },
      { size: "S", color: "Белый", colorHex: "#ffffff", stock: 5 },
    ],
  };
  assert.deepEqual(sizesOf(product), ["XS", "S", "L"], "sold-out sizes are hidden");
  assert.deepEqual(colorsOf(product), [
    { name: "Черный", hex: "#1c1c1c" },
    { name: "Белый", hex: "#ffffff" },
  ]);

  console.log("all checks passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
