"use server"

import { AuthError } from "next-auth"
import { z } from "zod"

import { signIn } from "@/lib/auth"
import { AuthErrorType } from "@/lib/auth/errors/types"
import { clearReturnTo, getReturnTo } from "@/lib/auth/util/return-to"
import { normalizeEmail } from "@/lib/users/util/normalize"

export type AuthenticateState = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string | null
}

const signInSchema = z.object({
  email: z.email({ message: "Enter a valid email" }),
  password: z.string().min(1, { message: "Enter your password" }),
})

export async function authenticate(
  _prevState: AuthenticateState,
  formData: FormData,
): Promise<AuthenticateState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""))
  const password = String(formData.get("password") ?? "")

  const parsed = signInSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: null,
    }
  }

  const redirectTo = await getReturnTo("/")

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === AuthErrorType.Credentials) {
        return {
          message: "Invalid email or password.",
        }
      }
      return {
        message: "Something went wrong. Please try again.",
      }
    }

    await clearReturnTo()
    throw error
  }

  return {
    message: "Something went wrong. Please try again.",
  }
}