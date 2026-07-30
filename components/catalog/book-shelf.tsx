"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useRef } from "react"

import { BookTile } from "@/components/catalog/book-tile"
import { Button } from "@/components/ui/button"
import type { BookShelf as BookShelfData } from "@/lib/books/types"
import { cn } from "@/lib/utils"

type BookShelfProps = {
  shelf: BookShelfData
  className?: string
}

export function BookShelf({ shelf, className }: BookShelfProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollByPage(direction: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <section className={cn("space-y-3", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{shelf.genre}</h2>

      <div className="group/shelf relative">
        {/* Cover-height band so chevrons center on images without translate transforms */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-[10.5rem] items-center justify-between px-1 opacity-0 transition-opacity group-hover/shelf:opacity-100 focus-within:opacity-100 sm:h-48 md:flex md:h-[13.5rem]">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Scroll ${shelf.genre} left`}
            onClick={() => scrollByPage(-1)}
            className="bg-background/90 pointer-events-auto size-9 rounded-full shadow-md backdrop-blur-sm"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Scroll ${shelf.genre} right`}
            onClick={() => scrollByPage(1)}
            className="bg-background/90 pointer-events-auto size-9 rounded-full shadow-md backdrop-blur-sm"
          >
            <ChevronRightIcon />
          </Button>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          {shelf.books.map((book) => (
            <BookTile key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  )
}
