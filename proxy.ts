import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SUBJECT, SESSION_COOKIE, readSession } from "@/lib/auth";

/** Guards the whole admin area; a visitor session is not enough. */
export default async function proxy(request: NextRequest) {
  const subject = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (subject === ADMIN_SUBJECT) return NextResponse.next();

  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
