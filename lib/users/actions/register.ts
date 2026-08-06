"use server"

import { eq, or } from "drizzle-orm"
import { AuthError } from "next-auth"
import { z } from "zod"

import { signIn } from "@/lib/auth"
import { clearReturnTo, getReturnTo } from "@/lib/auth/util/return-to"
import { getPgError, PgCode } from "@/lib/db/errors"
import { db } from "@/lib/db"
import { users, UsersUnique } from "@/lib/db/schema"
import { normalizeEmail, normalizeUsername } from "@/lib/users/util/normalize"
import { hashPassword } from "@/lib/users/util/password"
import { registerSchema } from "@/lib/users/schema"

export type RegisterState = {
  errors?: {
    username?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string | null
}

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""))
  const username = normalizeUsername(String(formData.get("username") ?? ""))
  const password = String(formData.get("password") ?? "")

  const parsed = registerSchema.safeParse({ email, username, password })
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: null,
    }
  }

  const existing = await db.query.users.findFirst({
    where: or(eq(users.email, email), eq(users.username, username)),
  })

  if (existing) {
    if (existing.email === email) {
      return { errors: { email: ["Email already taken"] }, message: null }
    }
    return { errors: { username: ["Username already taken"] }, message: null }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  try {
    await db.insert(users).values({
      email: parsed.data.email,
      username: parsed.data.username,
      passwordHash,
    })
  } catch (error) {
    const pg = getPgError(error)
    if (pg.code === PgCode.UniqueViolation) {
      if (pg.constraint === UsersUnique.email) {
        return { errors: { email: ["Email already taken"] }, message: null }
      }
      if (pg.constraint === UsersUnique.username) {
        return {
          errors: { username: ["Username already taken"] },
          message: null,
        }
      }
      return {
        message: "Email or username already taken",
      }
    }
    return {
      message: "Something went wrong. Please try again.",
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
      return {
        message: "Account created, but sign-in failed. Please sign in.",
      }
    }
    await clearReturnTo()
    throw error
  }

  return {
    message: "Something went wrong. Please try again.",
  }
}