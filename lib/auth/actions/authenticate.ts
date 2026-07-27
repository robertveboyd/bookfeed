"use server"

import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/auth/util/callback-url"
import { AuthErrorType } from "../errors/types";

type AuthenticateIdleState = { status: "idle" }
type AuthenticateErrorState = { status: "error", error: string }

export type AuthenticateState = 
 | AuthenticateIdleState
 | AuthenticateErrorState

 export type AuthenticateResult = Exclude<AuthenticateState, AuthenticateIdleState>;

 export async function authenticate(
    _prevState: AuthenticateState,
    formData: FormData,
 ): Promise<AuthenticateResult> {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: safeCallbackUrl(formData.get("callbackUrl"), "/"),
        })
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === AuthErrorType.Credentials) {
              return {
                status: "error",
                error: "Invalid email or password.",
              }
            }
            return {
              status: "error",
              error: "Something went wrong. Please try again.",
            }
          }
          throw error 
    }
    return {
        status: "error",
        error: "Something went wrong. Please try again.",
    }
 }