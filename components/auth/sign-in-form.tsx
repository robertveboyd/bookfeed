"use client"

import { useActionState, useState } from "react"

import { PasswordInput } from "@/components/auth/password-input"
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
import { type SignInValues } from "@/lib/auth/schema"
import { updateField } from "@/lib/forms/update-field"

const initialState: AuthenticateState = {
  errors: {},
  message: null,
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  )

  const [fields, setFields] = useState<SignInValues>({
    email: "",
    password: "",
  })

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        <Field data-invalid={!!state.errors?.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            value={fields.email}
            onChange={updateField(setFields, "email")}
            type="email"
            autoComplete="email"
            autoFocus
            required
            aria-invalid={!!state.errors?.email || undefined}
          />
          <FieldError>{state.errors?.email?.[0]}</FieldError>
        </Field>

        <Field data-invalid={!!state.errors?.password || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            value={fields.password}
            onChange={updateField(setFields, "password")}
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
