"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  register,
  type RegisterState,
} from "@/lib/users/actions/register"
import { cn } from "@/lib/utils"

const initialState: RegisterState = { status: "idle" }

const inputClassName = cn(
  "border-input bg-background w-full rounded-lg border px-3 py-2 text-sm",
  "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
)

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    register,
    initialState,
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClassName}
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClassName}
        />
      </div>

      {state.status === "error" && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  )
}