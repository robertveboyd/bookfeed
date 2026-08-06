/**
 * Download Open Library cover images for seeded books into public/covers/.
 *
 * Saves S / M / L variants as:
 *   public/covers/{coverImageId}-{S|M|L}.jpg
 *
 * Writes lib/books/local-covers.json so coverUrl() can serve local files.
 *
 * Usage:
 *   pnpm covers:fetch
 *   pnpm covers:fetch -- --force
 *   pnpm covers:fetch -- --concurrency 8
 */

import { mkdir, writeFile, access } from "node:fs/promises"
import path from "node:path"

import { COVER_SIZES, type CoverSize } from "../lib/books/cover"
import { BOOK_SEED, seedCoverImageId } from "./seed-data"

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, "public", "covers")
const MANIFEST_PATH = path.join(ROOT, "lib", "books", "local-covers.json")

const COVERS_HOST = "https://covers.openlibrary.org/b"

type Args = {
  force: boolean
  concurrency: number
}

function parseArgs(argv: string[]): Args {
  let force = false
  let concurrency = 6
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = argv[i + 1]
    if (a === "--force") force = true
    else if (a === "--concurrency" && next) {
      concurrency = Number(next)
      i++
    }
  }
  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new Error("Invalid --concurrency")
  }
  return { force, concurrency }
}

function isIsbnCoverId(coverImageId: string): boolean {
  const id = coverImageId.replace(/[-\s]/g, "")
  if (/^\d{13}$/.test(id)) return true
  if (/^\d{9}[\dXx]$/.test(id)) return true
  return false
}

function remoteCoverUrl(coverImageId: string, size: CoverSize): string {
  const kind = isIsbnCoverId(coverImageId) ? "isbn" : "id"
  return `${COVERS_HOST}/${kind}/${coverImageId}-${size}.jpg?default=false`
}

function localCoverPath(coverImageId: string, size: CoverSize): string {
  return path.join(OUT_DIR, `${coverImageId}-${size}.jpg`)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function downloadOne(
  coverImageId: string,
  size: CoverSize,
  force: boolean,
): Promise<"wrote" | "skipped" | "missing"> {
  const dest = localCoverPath(coverImageId, size)
  if (!force && (await fileExists(dest))) return "skipped"

  const url = remoteCoverUrl(coverImageId, size)
  const res = await fetch(url)
  if (!res.ok) return "missing"

  const buf = Buffer.from(await res.arrayBuffer())
  // OL placeholder is a tiny GIF (~43 bytes). Real S covers can be <1KB JPEGs.
  const isGif =
    buf.byteLength >= 6 && buf.subarray(0, 3).toString("ascii") === "GIF"
  if (isGif || buf.byteLength < 100) return "missing"

  await writeFile(dest, buf)
  return "wrote"
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0

  async function worker() {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i]!)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

async function main() {
  const args = parseArgs(process.argv.slice(2).filter((a) => a !== "--"))
  await mkdir(OUT_DIR, { recursive: true })

  const coverIds = [...new Set(BOOK_SEED.map(seedCoverImageId))]
  const jobs = coverIds.flatMap((id) =>
    COVER_SIZES.map((size) => ({ id, size })),
  )

  console.log(
    `Fetching ${jobs.length} cover files (${coverIds.length} books × ${COVER_SIZES.length} sizes)`,
  )
  console.log(`out: ${OUT_DIR}`)
  console.log(
    `mode: concurrency=${args.concurrency}${args.force ? ", force" : ""}`,
  )

  let wrote = 0
  let skipped = 0
  let missing = 0
  let done = 0

  await mapPool(jobs, args.concurrency, async ({ id, size }) => {
    const result = await downloadOne(id, size, args.force)
    if (result === "wrote") wrote++
    else if (result === "skipped") skipped++
    else missing++
    done++
    if (done % 50 === 0 || done === jobs.length) {
      console.log(
        `  … ${done}/${jobs.length} (wrote=${wrote}, skipped=${skipped}, missing=${missing})`,
      )
    }
    // Light pacing so we don't hammer Open Library.
    await new Promise((r) => setTimeout(r, 40))
  })

  const completeIds: string[] = []
  for (const id of coverIds) {
    const hasAll = (
      await Promise.all(
        COVER_SIZES.map((size) => fileExists(localCoverPath(id, size))),
      )
    ).every(Boolean)
    if (hasAll) completeIds.push(id)
  }

  completeIds.sort()
  await writeFile(MANIFEST_PATH, `${JSON.stringify(completeIds, null, 2)}\n`)

  console.log(`\nComplete local covers: ${completeIds.length}/${coverIds.length}`)
  console.log(`Manifest: ${MANIFEST_PATH}`)
  if (missing > 0) {
    console.log(
      `Missing downloads: ${missing} (those ids stay on Open Library fallback in coverUrl)`,
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
