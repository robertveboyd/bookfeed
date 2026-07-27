import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

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
        const signInUrl = new URL("/sign-in", req.nextUrl)
        signInUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(signInUrl)
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