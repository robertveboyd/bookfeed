"use server";

import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { AuthError } from "next-auth"

import { signIn } from "@/lib/auth"
import { AuthErrorType } from "@/lib/auth/errors/types"
import { db } from "@/lib/db";
import { users, UsersUnique } from "@/lib/db/schema";
import { normalizeEmail, normalizeUsername } from "@/lib/users/util/normalize"
import { hashPassword } from "@/lib/users/util/password"
import { getPgError, PgCode } from "@/lib/db/errors";

type RegisterStateIdle = { status: "idle" }
type RegisterStateError = { status: "error"; error: string }

export type RegisterState = RegisterStateIdle | RegisterStateError
export type RegisterResult = Exclude<RegisterState, RegisterStateIdle>

const registerSchema = z.object({
    email: z.email({ message: "Enter a valid email" }),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(32, { message: "Username must be at most 32 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, {
            message: "Username can only use letters, numbers, _ and -",
        }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters",
    }),
})

export async function register(
    _prevState: RegisterState,
    formData: FormData,
): Promise<RegisterResult> {
    const email = normalizeEmail(String(formData.get("email") ?? ""))
    const username = normalizeUsername(String(formData.get("username") ?? ""))
    const password = String(formData.get("password") ?? "")

    const parsed = registerSchema.safeParse({ email, username, password })

    if (!parsed.success) {
        return {
            status: "error",
            error: parsed.error.issues[0]?.message ?? "Invalid input",
        }
    }

    const existing = await db.query.users.findFirst({
        where: or(
            eq(users.email, email),
            eq(users.username, username)
        ),
    })

    if (existing) {
        return {
            status: "error",
            error:
                existing.email === email
                    ? "Email already taken"
                    : "Username already taken",
        }
    }

    const passwordHash = await hashPassword(parsed.data.password)

    try {
        await db.insert(users).values({
            email: parsed.data.email,
            username: parsed.data.username,
            name: parsed.data.username,
            passwordHash,
        })
    } catch (error) {
        const pg = getPgError(error)
        if (pg.code === PgCode.UniqueViolation) {
            if (pg.constraint === UsersUnique.email) {
                return { status: "error", error: "Email already taken" }
            }
            if (pg.constraint === UsersUnique.username) {
                return { status: "error", error: "Username already taken" }
            }
            return {
                status: "error",
                error: "Email or username already taken",
            }
        }
        return {
            status: "error",
            error: "Something went wrong. Please try again.",
        }
    }


    try {
        await signIn("credentials", {
          email: parsed.data.email,
          password: parsed.data.password, // plaintext from the form, not the hash
          redirectTo: "/",
        })
      } catch (error) {
        if (error instanceof AuthError) {
          return {
            status: "error",
            error: "Account created, but sign-in failed. Please sign in.",
          }
        }
        throw error // includes NEXT_REDIRECT on success — must rethrow
    }

    return {
        status: "error",
        error: "Something went wrong. Please try again.",
      }
}

