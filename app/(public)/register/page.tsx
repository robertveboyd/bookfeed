import type { Metadata } from "next"
import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create account",
}

export default function Page() {
  return (
    <AuthShell
      title="Create account"
      description="Track books and share what you’re reading."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}