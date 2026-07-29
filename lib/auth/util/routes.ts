/** Sign-in / register — guest-only auth UI */
export const guestAuthPaths = ["/sign-in", "/register"] as const

/** App routes that require a session (feed is exact "/") */
export const protectedPaths = ["/library", "/profile", "/books"] as const

