import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

async function drop() {
  const url =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL_UNPOOLED or DATABASE_URL is not set. Use .env.local.",
    )
  }

  const sql = neon(url)

  // Wipes tables, enums, indexes — everything in public.
  await sql`DROP SCHEMA public CASCADE`
  await sql`CREATE SCHEMA public`
  await sql`GRANT ALL ON SCHEMA public TO public`
  await sql`GRANT ALL ON SCHEMA public TO CURRENT_USER`

  console.log(
    [
      "Dropped schema public and recreated it empty.",
      "",
      "Next:",
      "  pnpm db:push",
      "  pnpm db:seed",
      "  pnpm db:seed:demo",
    ].join("\n"),
  )
}

drop().catch((err) => {
  console.error(err)
  process.exit(1)
})
