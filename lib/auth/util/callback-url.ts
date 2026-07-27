import { guestAuthPaths } from "@/lib/auth/util/routes"

function pathnameOnly(path: string) {
    // "/sign-in?x=1" or "/register#hash" → path without query/hash
    return path.split("?", 1)[0].split("#", 1)[0] ?? path
}

export function safeCallbackUrl(value: unknown, fallback = "/"): string {
    if (typeof value !== "string" || !value) return fallback

    // Relative paths only — block "//evil.com" and absolute URLs
    if (!value.startsWith("/") || value.startsWith("//")) return fallback

    const path = pathnameOnly(value)

    const isDisallowed = guestAuthPaths.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )

    if (isDisallowed) return fallback

    return path;
}

export function signInHref(callbackUrl: unknown = "/"): string {
    const safe = safeCallbackUrl(callbackUrl, "/")
    if (safe === "/") return "/sign-in"
    return `/sign-in?callbackUrl=${encodeURIComponent(safe)}`
}