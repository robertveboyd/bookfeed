import { BOOK_SEED } from "../seed-data/books.ts"

export type BookContext = {
  title: string
  genre: string
}

export type ThreadTurn = {
  /** 0/1 = main back-and-forth. 2 = occasional third-person chime-in. */
  speakerSlot: 0 | 1 | 2
  body: (book: BookContext) => string
}

export type ConversationThread = {
  turns: ThreadTurn[]
}

function titleKey(title: string) {
  return title.trim().toLowerCase()
}

const bookContextByTitle = new Map<string, BookContext>(
  BOOK_SEED.map((book) => [
    titleKey(book.title),
    { title: book.title, genre: book.genre },
  ]),
)

export function getBookContext(title: string): BookContext {
  return (
    bookContextByTitle.get(titleKey(title)) ?? {
      title,
      genre: "Fiction",
    }
  )
}

/** Title-specific threads override genre fallbacks. */
const TITLE_THREADS: Record<string, ConversationThread[]> = {
  [titleKey("Dune")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: () =>
            "ok fine you win. pulling Dune off the shelf this weekend",
        },
        {
          speakerSlot: 1,
          body: () =>
            "worldbuilding yes — but do the banquet politics get easier on a reread?",
        },
        {
          speakerSlot: 0,
          body: () =>
            "second time they click. first pass I was just trying to track who wants to kill Paul",
        },
        {
          speakerSlot: 2,
          body: () => "following this thread — Dune is officially off the shelf now",
        },
      ],
    },
  ],
  [titleKey("Pachinko")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: () =>
            "wait the train thing happened to me too. finished Pachinko and just sat there until the next stop",
        },
        {
          speakerSlot: 1,
          body: () => "which part broke you — the ending or a few chapters before?",
        },
        {
          speakerSlot: 0,
          body: () => "the ending. quietly wrecked me in the best way",
        },
      ],
    },
  ],
  [titleKey("The Seven Husbands of Evelyn Hugo")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: () =>
            "that Evelyn Hugo ending??? I made a noise on the train. people stared",
        },
        {
          speakerSlot: 1,
          body: () =>
            "what kind of noise though — I need to know if I'll embarrass myself",
        },
        {
          speakerSlot: 0,
          body: () => "half gasp half laugh. very undignified. worth it",
        },
      ],
    },
  ],
  [titleKey("A Game of Thrones")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: () =>
            "finally starting A Game of Thrones — I've been dodging this for years",
        },
        {
          speakerSlot: 1,
          body: () =>
            "how far in — and do you need a family tree bookmark yet?",
        },
        {
          speakerSlot: 0,
          body: () =>
            "page 150ish. yes. yes I do. no spoilers from here please",
        },
        {
          speakerSlot: 2,
          body: () =>
            "the POV switching confused me at first too — it clicks around a third in",
        },
      ],
    },
  ],
  [titleKey("Pride and Prejudice")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `Elizabeth in ${book.title} would destroy me in one conversation and I'd thank her`,
        },
        {
          speakerSlot: 1,
          body: () => "the Colin Firth lake scene lives rent-free or the book ending?",
        },
        {
          speakerSlot: 0,
          body: () => "book ending. the letter scene. every time",
        },
      ],
    },
  ],
  [titleKey("The Hobbit")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} is my comfort reset before another epic fantasy slog`,
        },
        {
          speakerSlot: 1,
          body: () => "do you skip the songs or lean into them",
        },
        {
          speakerSlot: 0,
          body: () =>
            "lean in now. used to skim them, now they're half the charm",
        },
      ],
    },
  ],
  [titleKey("Fourth Wing")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `everyone told me ${book.title} was dragon smut with plot and they were right`,
        },
        {
          speakerSlot: 1,
          body: () => "does it fall off in book two or stay good",
        },
        {
          speakerSlot: 0,
          body: () =>
            "no spoilers but Iron Flame picks up the political thread hard",
        },
      ],
    },
  ],
  [titleKey("The Haunting of Hill House")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: () =>
            "absolutely not. I live alone. why would you post about Hill House",
        },
        {
          speakerSlot: 1,
          body: () => "show or book — and be honest about how scared you got",
        },
        {
          speakerSlot: 0,
          body: () =>
            "book. slept with a lamp on. the nursery chapter is evil",
        },
      ],
    },
  ],
  [titleKey("Mexican Gothic")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the fungus imagery in ${book.title} lives in my head rent-free`,
        },
        {
          speakerSlot: 1,
          body: () => "is it more gothic atmosphere or full horror",
        },
        {
          speakerSlot: 0,
          body: () =>
            "atmosphere first, then body horror. don't read it hungry",
        },
      ],
    },
  ],
  [titleKey("Neuromancer")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title}'s slang is half the reason it works. half the reason it's a slog too`,
        },
        {
          speakerSlot: 1,
          body: () => "audiobook or print for your first pass",
        },
        {
          speakerSlot: 0,
          body: () =>
            "print with notes. Libby narrator is good for a reread though",
        },
      ],
    },
  ],
  [titleKey("The Lord of the Rings")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: () =>
            "I marked every journey on the endpaper maps like a complete weirdo",
        },
        {
          speakerSlot: 1,
          body: () => "extended editions energy or book purist",
        },
        {
          speakerSlot: 0,
          body: () =>
            "book purist for Fellowship, weak for the Scouring of the Shire discourse",
        },
      ],
    },
  ],
  [titleKey("Gone Girl")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `Amy in ${book.title} scares me more than most actual crime novels`,
        },
        {
          speakerSlot: 1,
          body: () => "did you trust the diary chapters on first read",
        },
        {
          speakerSlot: 0,
          body: () => "completely. that's what makes the turn so brutal",
        },
      ],
    },
  ],
  [titleKey("The Left Hand of Darkness")]: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the ice trek in ${book.title} made me put on a jacket mid-chapter`,
        },
        {
          speakerSlot: 1,
          body: () => "is the politics slow or worth sticking with",
        },
        {
          speakerSlot: 0,
          body: () => "slow start, then Gethen clicks and you can't stop",
        },
      ],
    },
  ],
}

const GENRE_THREADS: Record<string, ConversationThread[]> = {
  "Science Fiction": [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the worldbuilding in ${book.title} is doing a lot of heavy lifting`,
        },
        {
          speakerSlot: 1,
          body: () => "does the tech jargon ever slow you down",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `first fifty pages yes. after that ${book.title} stops explaining and starts showing`,
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `finished ${book.title} on a flight and stared at the seat back for ten minutes`,
        },
        {
          speakerSlot: 1,
          body: () => "ending land or just leave you hanging",
        },
        {
          speakerSlot: 0,
          body: () => "lands. quietly, then all at once",
        },
        {
          speakerSlot: 2,
          body: (book) =>
            `this ${book.title} convo is making me bump it to the top of my stack`,
        },
      ],
    },
  ],
  Fantasy: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `every map insert in ${book.title} made me stop and zoom in like a nerd`,
        },
        {
          speakerSlot: 1,
          body: () => "are we talking slow-burn epic or page-turner",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} is slow-burn until it isn't — then good luck putting it down`,
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the magic system in ${book.title} actually has rules. refreshing`,
        },
        {
          speakerSlot: 1,
          body: () => "hard magic or soft — and does it matter here",
        },
        {
          speakerSlot: 0,
          body: () =>
            "hard enough to argue about online, which is the sweet spot",
        },
        {
          speakerSlot: 2,
          body: (book) =>
            `noted — adding ${book.title} to the group chat TBR pile`,
        },
      ],
    },
  ],
  Horror: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `I made it three chapters into ${book.title} before checking every window in the house`,
        },
        {
          speakerSlot: 1,
          body: () => "supernatural scare or psychological",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} is psychological until it very much isn't`,
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the audiobook for ${book.title} was a mistake. a great mistake`,
        },
        {
          speakerSlot: 1,
          body: () => "which narrator — I need a good scary listen",
        },
        {
          speakerSlot: 0,
          body: () =>
            "Libby copy whoever they have — pacing sold the dread",
        },
      ],
    },
  ],
  Romance: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} made me grin on public transit like an idiot`,
        },
        {
          speakerSlot: 1,
          body: () => "spicy or closed-door — setting expectations",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} is more tension than explicit but the tension WORKS`,
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the main couple in ${book.title} has chemistry you could bottle`,
        },
        {
          speakerSlot: 1,
          body: () => "enemies-to-lovers or friends-to-lovers",
        },
        {
          speakerSlot: 0,
          body: () =>
            "enemies adjacent. the banter carries the whole middle",
        },
      ],
    },
  ],
  Mystery: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `I guessed the twist in ${book.title} at 60% and I was still wrong`,
        },
        {
          speakerSlot: 1,
          body: () => "fair clues or did it feel like a rug pull",
        },
        {
          speakerSlot: 0,
          body: () =>
            "fair on reread. first pass I missed the obvious breadcrumb",
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} has that noir thing where everyone's lying and I love it`,
        },
        {
          speakerSlot: 1,
          body: () => "cozy mystery or actually dark",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `${book.title} gets darker than the cover suggests`,
        },
      ],
    },
  ],
  "Historical Fiction": [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the research in ${book.title} shows without feeling like a textbook`,
        },
        {
          speakerSlot: 1,
          body: () => "does it drag in the middle or stay propulsive",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `middle sags a little but ${book.title}'s ending pays it off`,
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `finished ${book.title} on the train and missed my stop. whoops`,
        },
        {
          speakerSlot: 1,
          body: () => "which era — and is it depressing historical or hopeful",
        },
        {
          speakerSlot: 0,
          body: () =>
            "bittersweet. the kind of sad that feels honest",
        },
      ],
    },
  ],
  Fiction: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `the prose in ${book.title} is deceptively simple — sneaks up on you`,
        },
        {
          speakerSlot: 1,
          body: () => "literary slow or does the plot move",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `character study first, plot second. ${book.title} earns it though`,
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `that ending in ${book.title} made me put the book down and stare at the wall`,
        },
        {
          speakerSlot: 1,
          body: () => "devastating sad or more bittersweet",
        },
        {
          speakerSlot: 0,
          body: () =>
            "bittersweet with a gut punch. still thinking about it",
        },
      ],
    },
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `started ${book.title} because of this thread — worth the hype?`,
        },
        {
          speakerSlot: 1,
          body: () => "stick through the slow opening if there is one",
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `weekend update: halfway through ${book.title}, no regrets so far`,
        },
        {
          speakerSlot: 2,
          body: (book) =>
            `same — started ${book.title} last night because of this thread`,
        },
      ],
    },
  ],
}

const CHIME_IN_TURNS: ThreadTurn[] = [
  {
    speakerSlot: 2,
    body: (book) => `ok you've sold me on ${book.title} — library hold placed`,
  },
  {
    speakerSlot: 2,
    body: (book) =>
      `following this thread. ${book.title} wasn't on my radar an hour ago`,
  },
  {
    speakerSlot: 2,
    body: () => "same question honestly — glad someone else asked first",
  },
  {
    speakerSlot: 2,
    body: (book) =>
      `this is the kind of ${book.title} talk that ruins my TBR discipline`,
  },
  {
    speakerSlot: 2,
    body: (book) =>
      `reporting back: started ${book.title} because of you two. no regrets yet`,
  },
]

export function maxSpeakerSlot(thread: ConversationThread): number {
  return Math.max(...thread.turns.map((turn) => turn.speakerSlot))
}

/** ~32% of 2-person threads get a third-person chime-in at the end. */
export function maybeAppendChimeIn(
  thread: ConversationThread,
  rng: () => number,
): ConversationThread {
  if (maxSpeakerSlot(thread) >= 2) return thread
  if (rng() > 0.32) return thread

  const chime = CHIME_IN_TURNS[Math.floor(rng() * CHIME_IN_TURNS.length)]!
  return { turns: [...thread.turns, chime] }
}

const ACTIVITY_OPENERS: Partial<Record<string, ConversationThread[]>> = {
  started_reading: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `how far into ${book.title} are you — worth me bumping it up my list?`,
        },
        {
          speakerSlot: 1,
          body: (book) =>
            `I stalled on ${book.title} once at the start — does it pick up?`,
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `people keep saying ${book.title} clicks around a third of the way in`,
        },
      ],
    },
  ],
  finished_reading: [
    {
      turns: [
        {
          speakerSlot: 0,
          body: (book) =>
            `no spoilers but did ${book.title}'s ending land for you?`,
        },
        {
          speakerSlot: 1,
          body: (book) =>
            `better than I expected — ${book.title} stayed with me all evening`,
        },
        {
          speakerSlot: 0,
          body: (book) =>
            `same. ${book.title} has that slow-burn aftertaste`,
        },
      ],
    },
  ],
}

export function pickConversationThread(
  book: BookContext,
  activityType: string,
  rng: () => number,
): ConversationThread {
  const byTitle = TITLE_THREADS[titleKey(book.title)]
  if (byTitle && byTitle.length > 0) {
    return byTitle[Math.floor(rng() * byTitle.length)]!
  }

  const byActivity = ACTIVITY_OPENERS[activityType]
  if (byActivity && byActivity.length > 0 && rng() < 0.35) {
    return byActivity[Math.floor(rng() * byActivity.length)]!
  }

  const byGenre = GENRE_THREADS[book.genre] ?? GENRE_THREADS.Fiction!
  return byGenre[Math.floor(rng() * byGenre.length)]!
}

export function pickThreadParticipants(
  owner: string,
  candidates: string[],
  thread: ConversationThread,
  rng: () => number,
): string[] {
  const count = maxSpeakerSlot(thread) + 1
  const pool = candidates.filter((username) => username !== owner)
  const shuffled = [...pool].sort(() => rng() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export type ThreadCommentDraft = {
  author: string
  body: string
}

export function buildThreadComments(
  thread: ConversationThread,
  book: BookContext,
  participants: string[],
): ThreadCommentDraft[] {
  return thread.turns.map((turn) => ({
    author: participants[turn.speakerSlot]!,
    body: turn.body(book),
  }))
}

/** Curated threads with fixed authors for demo highlights. */
export const CURATED_THREAD_SPECS: Record<
  string,
  { author: string; body: string; daysAgo: number; likedBy?: string[] }[]
> = {
  "maya|dune|reviewed": [
    {
      author: "robert",
      body: "ok fine you win. pulling Dune off the shelf this weekend",
      daysAgo: 3,
      likedBy: ["maya", "sam", "jordan"],
    },
    {
      author: "sam",
      body: "worldbuilding yes — but do the banquet politics get easier on a reread?",
      daysAgo: 2,
      likedBy: ["maya", "lena"],
    },
    {
      author: "robert",
      body: "second time they click. first pass I was just tracking who wants to kill Paul",
      daysAgo: 2,
      likedBy: ["maya", "sam"],
    },
    {
      author: "harper",
      body: "robert report back from the shelf. we'll wait",
      daysAgo: 1,
      likedBy: ["robert", "maya"],
    },
  ],
  "robert|a game of thrones|started_reading": [
    {
      author: "jordan",
      body: "you finally picked up A Game of Thrones — about time",
      daysAgo: 2,
      likedBy: ["robert", "sam", "maya"],
    },
    {
      author: "robert",
      body: "page 150 and I already need a family tree bookmark",
      daysAgo: 2,
      likedBy: ["jordan", "harper"],
    },
    {
      author: "sam",
      body: "does the POV switching click yet or still disorienting?",
      daysAgo: 1,
      likedBy: ["robert", "jordan"],
    },
    {
      author: "robert",
      body: "starting to gel. Tyrion's chapter hooked me — please no spoilers from here",
      daysAgo: 1,
      likedBy: ["sam", "maya", "jordan"],
    },
    {
      author: "maya",
      body: "we'll behave. worth reading before the show or doesn't matter?",
      daysAgo: 1,
      likedBy: ["robert", "sam"],
    },
    {
      author: "harper",
      body: "book first if you can — the foreshadowing hits different",
      daysAgo: 1,
      likedBy: ["robert", "maya"],
    },
  ],
  "robert|pachinko|reviewed": [
    {
      author: "jordan",
      body: "wait the train thing happened to me too. finished Pachinko and just sat there until the next stop",
      daysAgo: 28,
      likedBy: ["robert", "harper", "zoe"],
    },
    {
      author: "zoe",
      body: "which part broke you — the ending or a few chapters before?",
      daysAgo: 27,
      likedBy: ["robert", "jordan"],
    },
    {
      author: "jordan",
      body: "the ending. quietly wrecked me in the best way",
      daysAgo: 26,
      likedBy: ["robert", "zoe"],
    },
  ],
  "lena|the seven husbands of evelyn hugo|reviewed": [
    {
      author: "priya",
      body: "that Evelyn Hugo ending??? I made a noise on the train. people stared",
      daysAgo: 24,
      likedBy: ["lena", "zoe", "ravi"],
    },
    {
      author: "jordan",
      body: "what kind of noise though — I need to know if I'll embarrass myself",
      daysAgo: 23,
      likedBy: ["lena", "priya"],
    },
    {
      author: "priya",
      body: "half gasp half laugh. very undignified. worth it",
      daysAgo: 22,
      likedBy: ["lena", "jordan"],
    },
  ],
}
