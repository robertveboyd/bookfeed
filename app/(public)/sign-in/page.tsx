import type { Metadata } from "next"
import Link from "next/link"

import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function Page() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to Bookfeed
        </h1>
        <p className="text-muted-foreground text-sm">
          Use the email and password for your account.
        </p>
      </div>

      <SignInForm />

      <p className="text-muted-foreground text-sm">
        Or{" "}
        <Link href="/books" className="text-primary font-medium hover:underline">
          browse the catalog
        </Link>
        .
      </p>
      <p className="text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
        .
      </p>
    </div>
  )
}