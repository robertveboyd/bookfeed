import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { verifyPassword } from "@/lib/users/util/password"
import { normalizeEmail } from "@/lib/users/util/normalize"
import { signInSchema } from "@/lib/auth/schema"


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = normalizeEmail(String(credentials?.email ?? ""))
        const password = String(credentials?.password ?? "")

        const parsed = signInSchema.safeParse({ email, password })
        if (!parsed.success) return null

        const user = await db.query.users.findFirst({
          where: eq(users.email, parsed.data.email),
        })

        if (!user) return null
        if (!user.passwordHash) return null

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        )
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.username = token.username
      return session
    },
  },
})