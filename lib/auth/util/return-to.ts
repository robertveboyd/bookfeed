import { cookies } from "next/headers";

import { safeCallbackUrl } from "@/lib/auth/util/callback-url"

export const RETURN_TO_COOKIE = "auth.return_to";

export const returnToCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
}

/** For Server Actions / Server Components (next/headers cookies) */
export async function setReturnTo(path: unknown) {
    const safe = safeCallbackUrl(path, "/")
    const jar = await cookies()
    if (safe === "/") {
        jar.delete(RETURN_TO_COOKIE)
        return
    }
    jar.set(RETURN_TO_COOKIE, safe, returnToCookieOptions)
}

export async function getReturnTo(fallback = "/") {
    const jar = await cookies()
    return safeCallbackUrl(jar.get(RETURN_TO_COOKIE)?.value, fallback)
}
export async function clearReturnTo() {
    const jar = await cookies()
    jar.delete(RETURN_TO_COOKIE)
}