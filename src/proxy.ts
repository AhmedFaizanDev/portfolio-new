import { NextRequest, NextResponse } from "next/server";

// curl/wget get the plain-text site; browsers get the React one.
export function proxy(req: NextRequest) {
  if (/curl|wget|httpie/i.test(req.headers.get("user-agent") ?? "")) {
    return NextResponse.rewrite(new URL("/plain", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };
