import Link from "next/link"

export function SignInFooter() {
  return (
    <>
      Don&apos;t have an account?{" "}
      <Link
        href="/register"
        className="text-foreground font-medium underline-offset-4 hover:underline"
      >
        Create one
      </Link>
    </>
  )
}
