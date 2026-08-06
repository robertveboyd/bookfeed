import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq } from "drizzle-orm"

import { authors, bookAuthors, books } from "../lib/db/schema"
import { GENRES } from "../lib/books/types"
import { AUTHOR_SEED, BOOK_SEED, seedCoverImageId } from "./seed-data"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  const byGenre = BOOK_SEED.reduce<Record<string, number>>((acc, b) => {
    acc[b.genre] = (acc[b.genre] ?? 0) + 1
    return acc
  }, {})

  for (const genre of GENRES) {
    const count = byGenre[genre] ?? 0
    if (count !== 12) {
      throw new Error(`Expected 12 books for ${genre}, got ${count}`)
    }
  }

  const unexpected = Object.keys(byGenre).filter(
    (g) => !(GENRES as readonly string[]).includes(g),
  )
  if (unexpected.length > 0) {
    throw new Error(`Unexpected genres in seed: ${unexpected.join(", ")}`)
  }

  await db.insert(authors).values([...AUTHOR_SEED]).onConflictDoNothing({
    target: authors.openLibraryAuthorKey,
  })

  const authorRows = await db.select().from(authors)
  const authorIdByKey = new Map(
    authorRows
      .filter((a) => a.openLibraryAuthorKey)
      .map((a) => [a.openLibraryAuthorKey!, a.id]),
  )

  for (const book of BOOK_SEED) {
    const { authorKeys, isbn13, coverImageId, ...rest } = book
    const bookValues = {
      ...rest,
      isbn13,
      coverImageId: seedCoverImageId({ coverImageId, isbn13 }),
    }

    await db
      .insert(books)
      .values(bookValues)
      .onConflictDoUpdate({
        target: books.openLibraryWorkKey,
        set: {
          title: bookValues.title,
          description: bookValues.description,
          genre: bookValues.genre,
          isbn13: bookValues.isbn13,
          isbn10: bookValues.isbn10,
          coverImageId: bookValues.coverImageId,
          publishYear: bookValues.publishYear,
          updatedAt: new Date(),
        },
      })

    const [row] = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.openLibraryWorkKey, book.openLibraryWorkKey))
      .limit(1)

    if (!row) continue

    const links = authorKeys.flatMap((key, position) => {
      const authorId = authorIdByKey.get(key)
      if (!authorId) {
        console.warn(`Missing author ${key} for ${book.title}`)
        return []
      }
      return [{ bookId: row.id, authorId, position }]
    })

    if (links.length > 0) {
      await db.insert(bookAuthors).values(links).onConflictDoNothing()
    }
  }

  console.log(
    `Seeded ${AUTHOR_SEED.length} authors and ${BOOK_SEED.length} books across ${GENRES.length} genres.`,
  )
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
