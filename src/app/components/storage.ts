// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  name: string;
  email: string;
}

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
}

const USERS_KEY = "nf_users";
const SESSION_KEY = "nf_session";

function getStoredUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

/** Register a new account. Returns error string or null on success. */
export function registerUser(name: string, email: string, password: string): string | null {
  const users = getStoredUsers();
  const norm = email.trim().toLowerCase();
  if (users.find((u) => u.email === norm)) return "An account with this email already exists.";
  users.push({ name: name.trim(), email: norm, passwordHash: hashPassword(password) });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, norm);
  return null;
}

/** Sign in. Returns error string or null on success. */
export function signInUser(email: string, password: string): string | null {
  const users = getStoredUsers();
  const norm = email.trim().toLowerCase();
  const found = users.find((u) => u.email === norm);
  if (!found) return "No account found with this email. Please sign up first.";
  if (found.passwordHash !== hashPassword(password)) return "Incorrect password.";
  localStorage.setItem(SESSION_KEY, norm);
  return null;
}

/** Get the currently logged-in user (session). */
export function getUser(): User | null {
  try {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const found = getStoredUsers().find((u) => u.email === email);
    return found ? { name: found.name, email: found.email } : null;
  } catch { return null; }
}

export function removeUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** @deprecated kept for compat — use registerUser / signInUser */
export function saveUser(user: User): void {
  localStorage.setItem(SESSION_KEY, user.email);
}

// ─── Books ───────────────────────────────────────────────────────────────────
export interface Book {
  id: string;
  name: string;
  color: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Page templates ──────────────────────────────────────────────────────────
export type PageTemplate =
  | "plain"
  | "lined"
  | "grid"
  | "dotted"
  | "kraft"
  | "dark";

// ─── Pages ───────────────────────────────────────────────────────────────────
export interface Page {
  id: string;
  bookId: string;
  name: string;
  content: string;
  tags: string[];
  order: number;
  template?: PageTemplate;
  createdAt: string;
  updatedAt: string;
}

// ─── ID ──────────────────────────────────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function hashPassword(pwd: string): string {
  return btoa(encodeURIComponent(pwd));
}

export function checkPassword(pwd: string, hash: string): boolean {
  return hashPassword(pwd) === hash;
}

// ─── Book colors ─────────────────────────────────────────────────────────────
const BOOK_COLORS = [
  "#4f46e5", "#0ea5e9", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];
let colorIdx = 0;
export function nextBookColor(): string {
  return BOOK_COLORS[colorIdx++ % BOOK_COLORS.length];
}

// ─── Storage ─────────────────────────────────────────────────────────────────
const BOOKS_KEY = "nf_books";
const PAGES_KEY = "nf_pages";
const SEEDED_KEY = "nf_seeded";

export function getBooks(): Book[] {
  try { return JSON.parse(localStorage.getItem(BOOKS_KEY) || "[]"); }
  catch { return []; }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function getPages(): Page[] {
  try {
    return (JSON.parse(localStorage.getItem(PAGES_KEY) || "[]") as Page[]).map((p, i) => ({
      tags: [], order: i, ...p,
    }));
  } catch { return []; }
}

export function savePages(pages: Page[]): void {
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
}

export function getPagesForBook(bookId: string): Page[] {
  return getPages().filter((p) => p.bookId === bookId).sort((a, b) => a.order - b.order);
}

export function getPage(pageId: string): Page | undefined {
  return getPages().find((p) => p.id === pageId);
}

export function upsertPage(page: Page): void {
  const pages = getPages();
  const idx = pages.findIndex((p) => p.id === page.id);
  if (idx >= 0) pages[idx] = page; else pages.push(page);
  savePages(pages);
}

export function deletePage(pageId: string): void {
  savePages(getPages().filter((p) => p.id !== pageId));
}

export function deleteBook(bookId: string): void {
  saveBooks(getBooks().filter((b) => b.id !== bookId));
  savePages(getPages().filter((p) => p.bookId !== bookId));
}

// ─── Seed default funny books ────────────────────────────────────────────────
function makeBook(id: string, name: string, color: string, daysAgo = 0): Book {
  const d = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return { id, name, color, createdAt: d, updatedAt: d };
}

function makePage(id: string, bookId: string, name: string, content: string, order: number, tags: string[], template: PageTemplate = "lined"): Page {
  const d = new Date().toISOString();
  return { id, bookId, name, content, tags, order, template, createdAt: d, updatedAt: d };
}

export function seedDefaultBooks(): void {
  if (localStorage.getItem(SEEDED_KEY)) return;

  const b1 = makeBook("seed-b1", "🧠 Big Brain Ideas", "#4f46e5", 3);
  const b2 = makeBook("seed-b2", "😅 Things I'll Do Tomorrow", "#f59e0b", 7);
  const b3 = makeBook("seed-b3", "🌮 Very Important Food Notes", "#10b981", 1);
  const b4 = makeBook("seed-b4", "😤 Conspiracy Theories", "#ef4444", 14);

  const pages: Page[] = [
    makePage("seed-p1", b1.id, "Why Cats Knock Things Over",
      `<h2>The Grand Unified Theory of Cat Destruction</h2><p>After years of meticulous research (and three broken mugs), I have concluded that cats knock things off tables for one reason: <strong>they can.</strong></p><p>My hypothesis is that cats are, in fact, tiny chaos agents sent from another dimension to test our patience and emotional resilience.</p><blockquote>Evidence: My cat made direct eye contact with me before pushing my phone off the nightstand at 3am.</blockquote><h3>Proposed Solutions</h3><ul><li>Nail everything to surfaces</li><li>Accept that chaos is the natural state of the universe</li><li>Get a fish instead</li></ul><p>I have tried none of these. The cat remains in charge.</p>`,
      0, ["cats", "science", "chaos"], "lined"),
    makePage("seed-p2", b1.id, "Idea: Socks That Don't Vanish",
      `<h2>The Missing Sock Problem — A Trillion Dollar Market</h2><p>Every household loses approximately <strong>1.47 socks per week</strong> to the void. Nobody knows where they go. Scientists refuse to study this.</p><p>My startup idea: <em>SockTracker Pro™</em> — a Bluetooth chip woven into each sock so you can find the one that escaped behind the dryer.</p><p>Estimated market size: Everyone who does laundry. So, literally everyone.</p><h3>Potential Challenges</h3><ul><li>Socks are not smart devices</li><li>Neither am I</li><li>The dryer may be sentient and fighting back</li></ul>`,
      1, ["startup", "socks", "million-dollar-idea"], "plain"),

    makePage("seed-p3", b2.id, "Learn Guitar",
      `<h2>Guitar Practice Log — Week 1</h2><p>Day 1: Bought guitar. Very motivated. Watched 4 hours of YouTube tutorials instead of practicing.</p><p>Day 2: Tried one chord. Fingers hurt. Decided to rest fingers. Watched more YouTube.</p><p>Day 3: Rescheduled guitar to "next week" for the 11th time.</p><blockquote>Current skill level: I can make it sound like a cat sitting on it.</blockquote><h3>Revised Schedule</h3><ul><li>Monday: "Definitely start"</li><li>Tuesday: "Actually start"</li><li>Wednesday: "For real this time"</li><li>Rest of week: Netflix</li></ul>`,
      0, ["procrastination", "music", "lies-i-tell-myself"], "kraft"),
    makePage("seed-p4", b2.id, "Exercise Routine",
      `<h2>My Extremely Realistic Fitness Plan</h2><p>5am wake-up. Cold shower. 10km run. Full-body workout. Meditate. Cook healthy breakfast. Read 30 pages. All before 8am.</p><p><em>Current status: Pressed snooze 7 times. Considered the walk to the fridge as cardio.</em></p><h3>Adjustments Made</h3><ul><li>5am → "sometime in the morning"</li><li>Cold shower → shower (temperature unspecified)</li><li>10km run → thinking about running counts right?</li><li>Healthy breakfast → coffee is made of beans. Beans are vegetables.</li></ul>`,
      1, ["fitness", "motivation", "delusion"], "grid"),

    makePage("seed-p5", b3.id, "Pizza Investigation",
      `<h2>Is Pineapple on Pizza Actually Good?</h2><p>I conducted a blind taste test on myself. Results were inconclusive because I could clearly see the pineapple and I have opinions about it.</p><p><strong>Verdict:</strong> Yes. It's good. I will not be taking questions.</p><h3>The Science</h3><p>Sweet + savoury = complex flavour profile. This is food science. Anyone who disagrees is wrong and I have receipts (pizza receipts).</p><blockquote>"The only bad pizza is no pizza." — Me, just now, as a scientific conclusion.</blockquote>`,
      0, ["pizza", "controversial", "science"], "plain"),
    makePage("seed-p6", b3.id, "Ranking Every Snack I Own",
      `<h2>Official Snack Tier List (Subject to Change Based on Hunger Level)</h2><h3>S Tier (Peak existence)</h3><ul><li>Chips with dip combo</li><li>Leftover birthday cake at midnight</li></ul><h3>A Tier (Solid choices)</h3><ul><li>Any cheese that exists</li><li>Crackers (mostly as a cheese delivery vehicle)</li></ul><h3>C Tier (Desperate times)</h3><ul><li>Plain rice cakes</li><li>That granola bar at the back of the drawer since 2022</li></ul><p>This list was compiled with full scientific rigour and zero nutritional consideration.</p>`,
      1, ["snacks", "important", "research"], "dotted"),

    makePage("seed-p7", b4.id, "Birds Aren't Real",
      `<h2>Evidence Log #1: Birds Are Government Surveillance Drones</h2><p>Have you ever noticed that birds disappear at night? Where do they go? I'll tell you where: <strong>charging stations.</strong></p><p>The "bird" on my windowsill held eye contact with me for 47 seconds. That is not normal bird behaviour. That is target acquisition.</p><blockquote>The pigeon outside my office has been there every day for 3 months. I've named him Gerald. Gerald knows things.</blockquote><h3>Supporting Evidence</h3><ul><li>Birds always fly near Wi-Fi towers</li><li>Bird calls have a suspiciously regular rhythm (Morse code?)</li><li>Gerald stares</li></ul>`,
      0, ["conspiracy", "birds", "gerald"], "dark"),
    makePage("seed-p8", b4.id, "Why Is Monday So Monday",
      `<h2>A Philosophical Inquiry into the Nature of Mondays</h2><p>Monday has no right to exist. It shows up uninvited every single week with a smug attitude and a full agenda.</p><p>My theory: Monday is a social construct invented by someone who hated everyone and wanted company in their misery.</p><h3>Proposed Solutions</h3><ul><li>Simply not acknowledge Monday. If we ignore it, maybe it goes away.</li><li>Move all Monday tasks to Tuesday and rename Tuesday "The Second Sunday"</li><li>Make Monday illegal (currently in draft legislation in my head)</li></ul><blockquote>Breaking news: It is Monday again. Nobody asked for this.</blockquote>`,
      1, ["monday", "philosophy", "suffering"], "lined"),
  ];

  const existingBooks = getBooks();
  const existingPages = getPages();

  saveBooks([...existingBooks, b1, b2, b3, b4]);
  savePages([...existingPages, ...pages]);
  localStorage.setItem(SEEDED_KEY, "1");
}
