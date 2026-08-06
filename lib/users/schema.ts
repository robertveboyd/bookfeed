import { z } from "zod"

export const registerSchema = z.object({
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

export type RegisterValues = z.infer<typeof registerSchema>
