import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function Page() {
  return (
    <AuthShell
      title="Sign in"
      description="Welcome back to your reading life."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  )
}