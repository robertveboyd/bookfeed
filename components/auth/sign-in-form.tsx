"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
    authenticate,
    type AuthenticateState,
} from "@/lib/auth/actions/authenticate"
import { cn } from "@/lib/utils"

const initialState: AuthenticateState = { status: "idle" }

const inputClassName = cn(
    "border-input bg-background w-full rounded-lg border px-3 py-2 text-sm",
    "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
)

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
    const [state, formAction, pending] = useActionState(
        authenticate,
        initialState,
    )

    return (
        <form action={formAction} className="space-y-4">
            {callbackUrl && callbackUrl !== "/" ? (
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
            ) : null}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClassName}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={inputClassName}
                />
            </div>

            {state.status === "error" && (
                <p className="text-destructive text-sm" role="alert">
                    {state.error}
                </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Signing in…" : "Sign in"}
            </Button>
        </form>
    )
}