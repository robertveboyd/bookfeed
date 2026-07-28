import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { safeCallbackUrl } from "@/lib/auth/util/callback-url"
import { RETURN_TO_COOKIE, returnToCookieOptions } from "@/lib/auth/util/return-to"
import { guestAuthPaths, protectedPaths } from "@/lib/auth/util/routes"

const guestAuthPages = new Set<string>(guestAuthPaths)

function isProtected(pathname: string) {
  if (pathname === "/") return true
  return protectedPaths.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (!isLoggedIn && isProtected(pathname)) {
    const safe = safeCallbackUrl(pathname, "/")
    const res = NextResponse.redirect(new URL("/sign-in", req.nextUrl))

    if (safe !== "/") {
      res.cookies.set(RETURN_TO_COOKIE, safe, returnToCookieOptions)
    } else {
      res.cookies.delete(RETURN_TO_COOKIE)
    }

    return res
  }

  if (isLoggedIn && guestAuthPages.has(pathname)) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", pathname)
  return NextResponse.next({
    request: { headers: requestHeaders },
  })
})

export const config = {
  matcher: [
    /*
     * Run on app routes; skip Auth.js API + static assets.
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}