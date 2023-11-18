import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  console.log("Inside middleware");
  if (url.pathname === "/") {
    url.pathname = "/expenses";
    return NextResponse.redirect(url);
  }
}
