import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { SignInFooter } from "@/components/auth/sign-in-footer"
import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function Page() {
  return (
    <AuthShell
      title="Sign in"
      description="Welcome back to your reading life."
      footer={<SignInFooter />}
    >
      <SignInForm />
    </AuthShell>
  )
}
