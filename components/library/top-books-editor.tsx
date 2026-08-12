"use client"

import { PlusIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"

import { BookCover } from "@/components/catalog/book-cover"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { BookTile } from "@/lib/books/types"
import { saveTopBooks } from "@/lib/users/top-books/actions"
import type { TopBookSlot } from "@/lib/users/top-books/types"
import { cn } from "@/lib/utils"

const MAX_TOP = 5

type TopBooksEditorProps = {
  initialSlots: TopBookSlot[]
  readBooks: BookTile[]
}

function slotsToBooks(slots: TopBookSlot[]): BookTile[] {
  return [...slots]
    .sort((a, b) => a.position - b.position)
    .map((s) => s.book)
}

function moveItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list
  }
  const next = [...list]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item!)
  return next
}

export function TopBooksEditor({
  initialSlots,
  readBooks,
}: TopBooksEditorProps) {
  const router = useRouter()
  const [books, setBooks] = useState(() => slotsToBooks(initialSlots))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    setBooks(slotsToBooks(initialSlots))
  }, [initialSlots])

  const usedIds = useMemo(() => new Set(books.map((b) => b.id)), [books])
  const available = readBooks.filter((b) => !usedIds.has(b.id))
  const canAdd = books.length < MAX_TOP && available.length > 0

  function persist(next: BookTile[]) {
    setError(null)
    const previous = books
    setBooks(next)
    startTransition(async () => {
      const result = await saveTopBooks({
        bookIds: next.map((b) => b.id),
      })
      if (!result.ok) {
        setBooks(previous)
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  function addBook(book: BookTile) {
    if (books.length >= MAX_TOP || usedIds.has(book.id)) return
    setPickerOpen(false)
    persist([...books, book])
  }

  function removeAt(index: number) {
    persist(books.filter((_, i) => i !== index))
  }

  function onDropAt(toIndex: number) {
    if (dragIndex == null) return
    const next = moveItem(books, dragIndex, toIndex)
    setDragIndex(null)
    setOverIndex(null)
    if (next === books) return
    persist(next)
  }

  if (readBooks.length === 0) {
    return (
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Top 5</h2>
          <p className="text-muted-foreground text-sm">
            Finish some books, then pick up to five favorites to show on your
            profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-5 sm:gap-x-4">
          <div className="w-28 sm:w-32">
            <div className="border-border bg-muted/40 flex aspect-[2/3] items-center justify-center rounded-md border border-dashed">
              <PlusIcon className="text-muted-foreground size-8 opacity-50" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Add book</p>
          </div>
        </div>
        <p>
          <Link
            href="/books"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Browse catalog to finish a book →
          </Link>
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Top 5</h2>
        <p className="text-muted-foreground text-sm">
          Pick favorites from books you&apos;ve finished. Drag to reorder.
        </p>
      </div>

      <ul className="flex flex-wrap gap-x-3 gap-y-5 sm:gap-x-4">
        {books.map((book, index) => {
          const authorsLabel = book.authors.join(", ")
          const isDragging = dragIndex === index
          const isOver = overIndex === index && dragIndex !== index

          return (
            <li
              key={book.id}
              className={cn(
                "w-28 sm:w-32",
                isDragging && "opacity-50",
                isOver && "ring-ring rounded-md ring-2 ring-offset-2",
              )}
              draggable={!pending}
              onDragStart={(e) => {
                setDragIndex(index)
                e.dataTransfer.effectAllowed = "move"
                e.dataTransfer.setData("text/plain", String(index))
              }}
              onDragEnd={() => {
                setDragIndex(null)
                setOverIndex(null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                setOverIndex(index)
              }}
              onDragLeave={() => {
                setOverIndex((current) => (current === index ? null : current))
              }}
              onDrop={(e) => {
                e.preventDefault()
                onDropAt(index)
              }}
            >
              <div className="group relative">
                <div className="relative aspect-[2/3] cursor-grab overflow-hidden rounded-md bg-muted shadow-sm active:cursor-grabbing">
                  <BookCover
                    coverImageId={book.coverImageId}
                    title={book.title}
                    size="M"
                  />
                  <span className="bg-background/90 text-muted-foreground absolute top-1.5 left-1.5 rounded px-1 text-[10px] font-medium tabular-nums ring-1 ring-border">
                    #{index + 1}
                  </span>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="secondary"
                    disabled={pending}
                    aria-label={`Remove ${book.title} from Top 5`}
                    className="absolute top-1.5 right-1.5 opacity-100 shadow-sm sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => removeAt(index)}
                  >
                    <XIcon />
                  </Button>
                </div>
                <div className="mt-2 space-y-0.5">
                  <p className="line-clamp-2 text-sm leading-snug font-medium tracking-tight">
                    {book.title}
                  </p>
                  {authorsLabel ? (
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {authorsLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}

        {books.length < MAX_TOP ? (
          <li className="w-28 sm:w-32">
            <button
              type="button"
              disabled={pending || !canAdd}
              onClick={() => setPickerOpen(true)}
              aria-label="Add a book to Top 5"
              className={cn(
                "flex w-full flex-col items-stretch gap-2 text-left",
                canAdd && !pending ? "cursor-pointer" : "cursor-not-allowed opacity-50",
              )}
            >
              <span className="border-border bg-muted/40 hover:bg-muted/70 flex aspect-[2/3] items-center justify-center rounded-md border border-dashed transition-colors">
                <PlusIcon className="text-muted-foreground size-8" />
              </span>
              <span className="text-muted-foreground text-sm">Add book</span>
            </button>
          </li>
        ) : null}
      </ul>

      {!canAdd && books.length < MAX_TOP ? (
        <p className="text-muted-foreground text-sm">
          All of your finished books are already in Top 5.
        </p>
      ) : null}

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <Dialog
        open={pickerOpen}
        onOpenChange={(open) => {
          if (!pending) setPickerOpen(open)
        }}
      >
        <DialogContent
          className="max-h-[min(85vh,40rem)] overflow-y-auto sm:max-w-2xl"
          showCloseButton={!pending}
        >
          <DialogHeader>
            <DialogTitle>Add to Top 5</DialogTitle>
            <DialogDescription>
              Choose a book you&apos;ve finished.
            </DialogDescription>
          </DialogHeader>

          {available.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No more finished books to add.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
              {available.map((book) => {
                const authorsLabel = book.authors.join(", ")
                return (
                  <button
                    key={book.id}
                    type="button"
                    disabled={pending}
                    onClick={() => addBook(book)}
                    className="group/tile text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-muted shadow-sm transition duration-200 group-hover/tile:scale-[1.03] group-hover/tile:shadow-md">
                      <BookCover
                        coverImageId={book.coverImageId}
                        title={book.title}
                        size="M"
                      />
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <p className="line-clamp-2 text-sm leading-snug font-medium tracking-tight">
                        {book.title}
                      </p>
                      {authorsLabel ? (
                        <p className="text-muted-foreground line-clamp-1 text-xs">
                          {authorsLabel}
                        </p>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
