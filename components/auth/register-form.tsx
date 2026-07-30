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
  register,
  type RegisterState,
} from "@/lib/users/actions/register"
import { type RegisterValues } from "@/lib/users/schema"
import { updateField } from "@/lib/forms/update-field"

const initialState: RegisterState = {
  errors: {},
  message: null,
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState)

  const [fields, setFields] = useState<RegisterValues>({
    username: "",
    email: "",
    password: "",
  })

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        <Field data-invalid={!!state.errors?.username || undefined}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            value={fields.username}
            onChange={updateField(setFields, "username")}
            type="text"
            autoComplete="username"
            autoFocus
            required
            aria-invalid={!!state.errors?.username || undefined}
          />
          <FieldError>{state.errors?.username?.[0]}</FieldError>
        </Field>

        <Field data-invalid={!!state.errors?.email || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            value={fields.email}
            onChange={updateField(setFields, "email")}
            type="email"
            autoComplete="email"
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
