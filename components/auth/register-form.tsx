"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  register,
  type RegisterState,
} from "@/lib/users/actions/register"

const initialState: RegisterState = {
  errors: {},
  message: null,
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState)

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        <Field data-invalid={!!state.errors?.username || undefined}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            aria-invalid={!!state.errors?.username || undefined}
          />
          <FieldDescription>
            Letters, numbers, _ and - (3–32 characters)
          </FieldDescription>
          <FieldError>{state.errors?.username?.[0]}</FieldError>
        </Field>

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
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={!!state.errors?.password || undefined}
          />
          <FieldError>{state.errors?.password?.[0]}</FieldError>
        </Field>

        {state.message && <FieldError>{state.message}</FieldError>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  )
}