"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  authenticate,
  type AuthenticateState,
} from "@/lib/auth/actions/authenticate"

const initialState: AuthenticateState = {
  errors: {},
  message: null,
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  )

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        <Field data-invalid={!!state.errors?.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!state.errors?.email || undefined}
          />
          <FieldError>{state.errors?.email?.[0]}</FieldError>
        </Field>

        <Field data-invalid={!!state.errors?.password || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.errors?.password || undefined}
          />
          <FieldError>{state.errors?.password?.[0]}</FieldError>
        </Field>

        {state.message && <FieldError>{state.message}</FieldError>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  )
}