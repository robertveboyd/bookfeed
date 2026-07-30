import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq } from "drizzle-orm"

import { authors, bookAuthors, books } from "../lib/db/schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

type BookSeed = {
  openLibraryWorkKey: string
  title: string
  description: string
  genre: "Fiction" | "Fantasy" | "Science Fiction" | "Horror"
  isbn13: string
  isbn10?: string
  publishYear: number
  authorKeys: string[]
}

const AUTHOR_SEED = [
  { openLibraryAuthorKey: "OL21594A", name: "Jane Austen" },
  { openLibraryAuthorKey: "OL20187A", name: "Harper Lee" },
  { openLibraryAuthorKey: "OL26176A", name: "F. Scott Fitzgerald" },
  { openLibraryAuthorKey: "OL23919A", name: "Herman Melville" },
  { openLibraryAuthorKey: "OL18319A", name: "Emily Brontë" },
  { openLibraryAuthorKey: "OL2162284A", name: "Charlotte Brontë" },
  { openLibraryAuthorKey: "OL22220A", name: "Fyodor Dostoyevsky" },
  { openLibraryAuthorKey: "OL39505A", name: "J. D. Salinger" },
  { openLibraryAuthorKey: "OL34221A", name: "Toni Morrison" },
  { openLibraryAuthorKey: "OL42774A", name: "Ralph Ellison" },
  { openLibraryAuthorKey: "OL234662A", name: "Chinua Achebe" },
  { openLibraryAuthorKey: "OL39491A", name: "Virginia Woolf" },
  { openLibraryAuthorKey: "OL26320A", name: "J.R.R. Tolkien" },
  { openLibraryAuthorKey: "OL234664A", name: "C. S. Lewis" },
  { openLibraryAuthorKey: "OL25712A", name: "Ursula K. Le Guin" },
  { openLibraryAuthorKey: "OL2676165A", name: "George R. R. Martin" },
  { openLibraryAuthorKey: "OL1394221A", name: "Patrick Rothfuss" },
  { openLibraryAuthorKey: "OL1394222A", name: "Brandon Sanderson" },
  { openLibraryAuthorKey: "OL26737A", name: "Neil Gaiman" },
  { openLibraryAuthorKey: "OL27320A", name: "Terry Pratchett" },
  { openLibraryAuthorKey: "OL23919C", name: "J. K. Rowling" },
  { openLibraryAuthorKey: "OL1394224A", name: "Scott Lynch" },
  { openLibraryAuthorKey: "OL1394223A", name: "Joe Abercrombie" },
  { openLibraryAuthorKey: "OL118077A", name: "George Orwell" },
  { openLibraryAuthorKey: "OL189047A", name: "Frank Herbert" },
  { openLibraryAuthorKey: "OL31247A", name: "William Gibson" },
  { openLibraryAuthorKey: "OL161167A", name: "Isaac Asimov" },
  { openLibraryAuthorKey: "OL52266A", name: "Aldous Huxley" },
  { openLibraryAuthorKey: "OL2622896A", name: "Dan Simmons" },
  { openLibraryAuthorKey: "OL2676166A", name: "Neal Stephenson" },
  { openLibraryAuthorKey: "OL7115215A", name: "Andy Weir" },
  { openLibraryAuthorKey: "OL448910A", name: "Philip K. Dick" },
  { openLibraryAuthorKey: "OL20187B", name: "Douglas Adams" },
  { openLibraryAuthorKey: "OL22018A", name: "Ray Bradbury" },
  { openLibraryAuthorKey: "OL27695A", name: "Mary Shelley" },
  { openLibraryAuthorKey: "OL246338A", name: "Bram Stoker" },
  { openLibraryAuthorKey: "OL21582A", name: "Stephen King" },
  { openLibraryAuthorKey: "OL2650461A", name: "Shirley Jackson" },
  { openLibraryAuthorKey: "OL22020A", name: "William Peter Blatty" },
  { openLibraryAuthorKey: "OL2641540A", name: "Anne Rice" },
  { openLibraryAuthorKey: "OL22021A", name: "H. P. Lovecraft" },
  { openLibraryAuthorKey: "OL6932577A", name: "Silvia Moreno-Garcia" },
  { openLibraryAuthorKey: "OL6932578A", name: "Josh Malerman" },
] as const

const BOOK_SEED: BookSeed[] = [
  // Fiction (12)
  {
    openLibraryWorkKey: "OL66544W",
    title: "Pride and Prejudice",
    description:
      "A classic novel of manners following Elizabeth Bennet and Mr. Darcy.",
    genre: "Fiction",
    isbn13: "9780141439518",
    isbn10: "0141439513",
    publishYear: 1813,
    authorKeys: ["OL21594A"],
  },
  {
    openLibraryWorkKey: "OL3140822W",
    title: "To Kill a Mockingbird",
    description:
      "A young girl confronts racial injustice in the American South.",
    genre: "Fiction",
    isbn13: "9780061120084",
    isbn10: "0061120081",
    publishYear: 1960,
    authorKeys: ["OL20187A"],
  },
  {
    openLibraryWorkKey: "OL468431W",
    title: "The Great Gatsby",
    description: "Wealth, love, and illusion in Jazz Age Long Island.",
    genre: "Fiction",
    isbn13: "9780743273565",
    isbn10: "0743273567",
    publishYear: 1925,
    authorKeys: ["OL26176A"],
  },
  {
    openLibraryWorkKey: "OL102749W",
    title: "Moby-Dick",
    description: "Captain Ahab’s obsessive hunt for the white whale.",
    genre: "Fiction",
    isbn13: "9780142437247",
    isbn10: "0142437247",
    publishYear: 1851,
    authorKeys: ["OL23919A"],
  },
  {
    openLibraryWorkKey: "OL35392W",
    title: "Wuthering Heights",
    description: "A stormy tale of love and revenge on the Yorkshire moors.",
    genre: "Fiction",
    isbn13: "9780141439556",
    isbn10: "0141439556",
    publishYear: 1847,
    authorKeys: ["OL18319A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF06W",
    title: "Jane Eyre",
    description:
      "An orphaned governess finds love — and a dark secret — at Thornfield.",
    genre: "Fiction",
    isbn13: "9780141441146",
    publishYear: 1847,
    authorKeys: ["OL2162284A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF07W",
    title: "Crime and Punishment",
    description: "A desperate student commits murder and wrestles with guilt.",
    genre: "Fiction",
    isbn13: "9780140449136",
    publishYear: 1866,
    authorKeys: ["OL22220A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF08W",
    title: "The Catcher in the Rye",
    description:
      "Holden Caulfield drifts through New York after leaving prep school.",
    genre: "Fiction",
    isbn13: "9780316769488",
    publishYear: 1951,
    authorKeys: ["OL39505A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF09W",
    title: "Beloved",
    description:
      "A mother is haunted by the child she killed to spare from slavery.",
    genre: "Fiction",
    isbn13: "9781400033416",
    publishYear: 1987,
    authorKeys: ["OL34221A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF10W",
    title: "Invisible Man",
    description:
      "A nameless narrator confronts identity and invisibility in America.",
    genre: "Fiction",
    isbn13: "9780679732761",
    publishYear: 1952,
    authorKeys: ["OL42774A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF11W",
    title: "Things Fall Apart",
    description:
      "Okonkwo’s world collides with colonial change in Igbo society.",
    genre: "Fiction",
    isbn13: "9780385474542",
    publishYear: 1958,
    authorKeys: ["OL234662A"],
  },
  {
    openLibraryWorkKey: "OLSEEDF12W",
    title: "Mrs Dalloway",
    description: "One June day in London, Clarissa Dalloway prepares a party.",
    genre: "Fiction",
    isbn13: "9780156628709",
    publishYear: 1925,
    authorKeys: ["OL39491A"],
  },

  // Fantasy (12)
  {
    openLibraryWorkKey: "OL45804W",
    title: "The Hobbit",
    description: "Bilbo Baggins is swept into an unexpected adventure.",
    genre: "Fantasy",
    isbn13: "9780547928227",
    isbn10: "054792822X",
    publishYear: 1937,
    authorKeys: ["OL26320A"],
  },
  {
    openLibraryWorkKey: "OL27448W",
    title: "The Lord of the Rings",
    description: "A fellowship journeys to destroy the One Ring.",
    genre: "Fantasy",
    isbn13: "9780618640157",
    publishYear: 1954,
    authorKeys: ["OL26320A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY03W",
    title: "The Lion, the Witch and the Wardrobe",
    description: "Four siblings enter Narnia through a wardrobe.",
    genre: "Fantasy",
    isbn13: "9780064471046",
    publishYear: 1950,
    authorKeys: ["OL234664A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY04W",
    title: "A Wizard of Earthsea",
    description: "A young mage unleashes a shadow he must learn to face.",
    genre: "Fantasy",
    isbn13: "9780547773742",
    publishYear: 1968,
    authorKeys: ["OL25712A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY05W",
    title: "A Game of Thrones",
    description: "Noble houses vie for power as winter approaches.",
    genre: "Fantasy",
    isbn13: "9780553386790",
    publishYear: 1996,
    authorKeys: ["OL2676165A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY06W",
    title: "The Name of the Wind",
    description: "Kvothe recounts how he became a legendary figure.",
    genre: "Fantasy",
    isbn13: "9780756404741",
    publishYear: 2007,
    authorKeys: ["OL1394221A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY07W",
    title: "Mistborn: The Final Empire",
    description:
      "A street urchin joins a crew planning to overthrow an immortal lord.",
    genre: "Fantasy",
    isbn13: "9780765350381",
    publishYear: 2006,
    authorKeys: ["OL1394222A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY08W",
    title: "American Gods",
    description: "Old gods clash with new as Shadow Moon walks America.",
    genre: "Fantasy",
    isbn13: "9780062572233",
    publishYear: 2001,
    authorKeys: ["OL26737A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY09W",
    title: "Good Omens",
    description: "An angel and a demon team up to prevent the apocalypse.",
    genre: "Fantasy",
    isbn13: "9780060853983",
    publishYear: 1990,
    authorKeys: ["OL26737A", "OL27320A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY10W",
    title: "Harry Potter and the Sorcerer's Stone",
    description:
      "A boy discovers he is a wizard and begins school at Hogwarts.",
    genre: "Fantasy",
    isbn13: "9780590353427",
    publishYear: 1997,
    authorKeys: ["OL23919C"],
  },
  {
    openLibraryWorkKey: "OLSEEDY11W",
    title: "The Lies of Locke Lamora",
    description:
      "Gentleman bastards pull elaborate heists in a fantasy Venice.",
    genre: "Fantasy",
    isbn13: "9780553588941",
    publishYear: 2006,
    authorKeys: ["OL1394224A"],
  },
  {
    openLibraryWorkKey: "OLSEEDY12W",
    title: "The Blade Itself",
    description:
      "A barbarian, a crippled inquisitor, and a vain swordsman collide.",
    genre: "Fantasy",
    isbn13: "9780441017966",
    publishYear: 2006,
    authorKeys: ["OL1394223A"],
  },

  // Science Fiction (12)
  {
    openLibraryWorkKey: "OL1168007W",
    title: "Nineteen Eighty-Four",
    description: "A dystopian novel about totalitarianism and surveillance.",
    genre: "Science Fiction",
    isbn13: "9780451524935",
    isbn10: "0451524934",
    publishYear: 1949,
    authorKeys: ["OL118077A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS02W",
    title: "Dune",
    description:
      "On the desert planet Arrakis, factions fight for control of spice.",
    genre: "Science Fiction",
    isbn13: "9780441172719",
    publishYear: 1965,
    authorKeys: ["OL189047A"],
  },
  {
    openLibraryWorkKey: "OL27258W",
    title: "Neuromancer",
    description:
      "A washed-up console cowboy is hired for one last cyberspace run.",
    genre: "Science Fiction",
    isbn13: "9780441569595",
    publishYear: 1984,
    authorKeys: ["OL31247A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS04W",
    title: "Foundation",
    description: "A mathematician plots to shorten a galactic dark age.",
    genre: "Science Fiction",
    isbn13: "9780553293357",
    publishYear: 1951,
    authorKeys: ["OL161167A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS05W",
    title: "Brave New World",
    description: "An engineered society values comfort over freedom.",
    genre: "Science Fiction",
    isbn13: "9780060850524",
    publishYear: 1932,
    authorKeys: ["OL52266A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS06W",
    title: "The Left Hand of Darkness",
    description:
      "An envoy navigates politics on a planet of ambisexual people.",
    genre: "Science Fiction",
    isbn13: "9780441478125",
    publishYear: 1969,
    authorKeys: ["OL25712A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS07W",
    title: "Hyperion",
    description: "Pilgrims share stories on the way to meet the Shrike.",
    genre: "Science Fiction",
    isbn13: "9780553283686",
    publishYear: 1989,
    authorKeys: ["OL2622896A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS08W",
    title: "Snow Crash",
    description: "A virus threatens both the Metaverse and the real world.",
    genre: "Science Fiction",
    isbn13: "9780553380958",
    publishYear: 1992,
    authorKeys: ["OL2676166A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS09W",
    title: "The Martian",
    description: "An astronaut stranded on Mars fights to survive.",
    genre: "Science Fiction",
    isbn13: "9780553418026",
    publishYear: 2011,
    authorKeys: ["OL7115215A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS10W",
    title: "Do Androids Dream of Electric Sheep?",
    description: "A bounty hunter tracks rogue androids on a ruined Earth.",
    genre: "Science Fiction",
    isbn13: "9780345404473",
    publishYear: 1968,
    authorKeys: ["OL448910A"],
  },
  {
    openLibraryWorkKey: "OLSEEDS11W",
    title: "The Hitchhiker's Guide to the Galaxy",
    description: "Earth is demolished; Arthur Dent hitchhikes the galaxy.",
    genre: "Science Fiction",
    isbn13: "9780345391803",
    publishYear: 1979,
    authorKeys: ["OL20187B"],
  },
  {
    openLibraryWorkKey: "OLSEEDS12W",
    title: "Fahrenheit 451",
    description: "Firemen burn books in a future that forbids reading.",
    genre: "Science Fiction",
    isbn13: "9781451673319",
    publishYear: 1953,
    authorKeys: ["OL22018A"],
  },

  // Horror (12)
  {
    openLibraryWorkKey: "OL893491W",
    title: "Frankenstein",
    description: "A scientist creates life — and faces the consequences.",
    genre: "Horror",
    isbn13: "9780141439471",
    isbn10: "0141439475",
    publishYear: 1818,
    authorKeys: ["OL27695A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH02W",
    title: "Dracula",
    description: "Count Dracula brings ancient evil to Victorian England.",
    genre: "Horror",
    isbn13: "9780141439846",
    publishYear: 1897,
    authorKeys: ["OL246338A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH03W",
    title: "The Shining",
    description:
      "A family winters in a haunted hotel that preys on the father.",
    genre: "Horror",
    isbn13: "9780307743657",
    publishYear: 1977,
    authorKeys: ["OL21582A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH04W",
    title: "It",
    description:
      "A shape-shifting evil returns to prey on the children of Derry.",
    genre: "Horror",
    isbn13: "9781501142970",
    publishYear: 1986,
    authorKeys: ["OL21582A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH05W",
    title: "Carrie",
    description: "A telekinetic girl unleashes vengeance on her tormentors.",
    genre: "Horror",
    isbn13: "9780307743664",
    publishYear: 1974,
    authorKeys: ["OL21582A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH06W",
    title: "The Haunting of Hill House",
    description:
      "Four seekers spend a summer in a house that may be alive.",
    genre: "Horror",
    isbn13: "9780143039983",
    publishYear: 1959,
    authorKeys: ["OL2650461A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH07W",
    title: "We Have Always Lived in the Castle",
    description: "Two sisters live in isolation after a family poisoning.",
    genre: "Horror",
    isbn13: "9780143035428",
    publishYear: 1962,
    authorKeys: ["OL2650461A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH08W",
    title: "The Exorcist",
    description: "A mother seeks help when her daughter appears possessed.",
    genre: "Horror",
    isbn13: "9780061007224",
    publishYear: 1971,
    authorKeys: ["OL22020A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH09W",
    title: "Interview with the Vampire",
    description: "A vampire tells his centuries-long story to a reporter.",
    genre: "Horror",
    isbn13: "9780345337665",
    publishYear: 1976,
    authorKeys: ["OL2641540A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH10W",
    title: "At the Mountains of Madness",
    description: "An Antarctic expedition uncovers ancient cosmic horror.",
    genre: "Horror",
    isbn13: "9780812974416",
    publishYear: 1936,
    authorKeys: ["OL22021A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH11W",
    title: "Mexican Gothic",
    description:
      "A socialite investigates her cousin’s alarming letters from a grim estate.",
    genre: "Horror",
    isbn13: "9780525620785",
    publishYear: 2020,
    authorKeys: ["OL6932577A"],
  },
  {
    openLibraryWorkKey: "OLSEEDH12W",
    title: "Bird Box",
    description:
      "Survivors must navigate blind when a sight-borne terror appears.",
    genre: "Horror",
    isbn13: "9780062259660",
    isbn10: "0062259660",
    publishYear: 2014,
    authorKeys: ["OL6932578A"],
  },
]

async function seed() {
  const byGenre = BOOK_SEED.reduce<Record<string, number>>((acc, b) => {
    acc[b.genre] = (acc[b.genre] ?? 0) + 1
    return acc
  }, {})
  for (const [genre, count] of Object.entries(byGenre)) {
    if (count !== 12) {
      throw new Error(`Expected 12 books for ${genre}, got ${count}`)
    }
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
    const { authorKeys, isbn13, ...rest } = book
    const bookValues = {
      ...rest,
      isbn13,
      coverImageId: isbn13,
    }

    await db.insert(books).values(bookValues).onConflictDoNothing({
      target: books.openLibraryWorkKey,
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
    `Seeded ${AUTHOR_SEED.length} authors and ${BOOK_SEED.length} books (${Object.entries(
      byGenre,
    )
      .map(([g, n]) => `${g}: ${n}`)
      .join(", ")}).`,
  )
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
