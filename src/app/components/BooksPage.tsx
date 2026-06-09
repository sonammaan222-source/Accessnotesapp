import { useState, useEffect } from "react";
import {
  Book, User, generateId, getBooks, saveBooks, deleteBook,
  hashPassword, checkPassword, nextBookColor, getPagesForBook, getPages, seedDefaultBooks,
} from "./storage";
import { useTheme } from "./ThemeContext";
import {
  BookOpen, Plus, Search, Pencil, Trash2, Check, X,
  Lock, KeyRound, Moon, Sun, LogOut, ChevronRight, Flame,
  FileText, TrendingUp,
} from "lucide-react";

interface Props {
  user: User | null;
  onOpenBook: (book: Book) => void;
  onSignOut: () => void;
  onOpenSearch: () => void;
}

function BookCard({ book, onOpen, onRename, onDelete, onSetPassword }: {
  book: Book;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onSetPassword: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(book.name);
  const pageCount = getPagesForBook(book.id).length;
  const updated = new Date(book.updatedAt);
  const isToday = new Date().toDateString() === updated.toDateString();
  const dateLabel = isToday ? "Today" : updated.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const save = () => { if (editVal.trim()) onRename(editVal.trim()); setEditing(false); };

  return (
    <div
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {/* Color strip */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg,${book.color},${book.color}88)` }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${book.color}22,${book.color}11)` }}
          >
            <BookOpen size={22} style={{ color: book.color }} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Rename">
              <Pencil size={13} />
            </button>
            <button onClick={onSetPassword} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Set Password">
              <KeyRound size={13} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Title */}
        {editing ? (
          <div className="flex items-center gap-1.5 mb-1">
            <input
              autoFocus value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 text-sm border-b-2 border-primary outline-none bg-transparent text-foreground pb-0.5"
            />
            <button onClick={save} className="text-green-500"><Check size={14} /></button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground"><X size={14} /></button>
          </div>
        ) : (
          <h3 className="text-card-foreground mb-1 truncate" style={{ fontWeight: 700, fontSize: "15px" }}>
            {book.name}
            {book.passwordHash && <Lock size={11} className="inline ml-1.5 text-muted-foreground" />}
          </h3>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1"><FileText size={10} /> {pageCount} page{pageCount !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{dateLabel}</span>
        </div>

        <button
          onClick={onOpen}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all hover:opacity-80 active:scale-[0.97]"
          style={{ backgroundColor: book.color + "18", color: book.color, fontWeight: 600 }}
        >
          Open Book <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function BooksPage({ user, onOpenBook, onSignOut, onOpenSearch }: Props) {
  const { isDark, toggle } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [passwordModal, setPasswordModal] = useState<Book | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [settingPasswordBook, setSettingPasswordBook] = useState<Book | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const reload = () => setBooks(getBooks());
  useEffect(() => { seedDefaultBooks(); reload(); }, []);

  const persist = (updated: Book[]) => { saveBooks(updated); setBooks(updated); };

  const createBook = () => {
    if (!newName.trim()) return;
    const book: Book = {
      id: generateId(), name: newName.trim(), color: nextBookColor(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    persist([...books, book]);
    setNewName(""); setCreating(false);
  };

  const renameBook = (id: string, name: string) =>
    persist(books.map((b) => b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b));

  const removeBook = (id: string) => {
    if (!confirm("Delete this book and all its pages?")) return;
    deleteBook(id); reload();
  };

  const handleOpenBook = (book: Book) => {
    if (book.passwordHash) { setPasswordModal(book); setPasswordInput(""); setPasswordError(false); }
    else onOpenBook(book);
  };

  const submitUnlock = () => {
    if (!passwordModal) return;
    if (checkPassword(passwordInput, passwordModal.passwordHash!)) { const b = passwordModal; setPasswordModal(null); onOpenBook(b); }
    else setPasswordError(true);
  };

  const saveBookPassword = () => {
    if (!settingPasswordBook) return;
    persist(books.map((b) =>
      b.id === settingPasswordBook.id
        ? { ...b, passwordHash: newPassword ? hashPassword(newPassword) : undefined, updatedAt: new Date().toISOString() }
        : b
    ));
    setSettingPasswordBook(null); setNewPassword("");
  };

  const filtered = books.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = getPages().length;

  const displayName = user?.name || "Guest";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Unlock modal */}
      {passwordModal && (
        <Modal onClose={() => setPasswordModal(null)}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <Lock size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-card-foreground" style={{ fontWeight: 700 }}>Password Required</h3>
              <p className="text-xs text-muted-foreground mt-0.5">"{passwordModal.name}" is protected</p>
            </div>
          </div>
          <input
            autoFocus type="password" placeholder="Enter password…"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={(e) => e.key === "Enter" && submitUnlock()}
            className="w-full px-3.5 py-3 rounded-2xl border border-border bg-input-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 mb-2 transition-shadow"
            style={{ borderColor: passwordError ? "var(--destructive)" : undefined }}
          />
          {passwordError && <p className="text-xs text-destructive mb-2">Incorrect password.</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={submitUnlock} className="flex-1 text-white py-2.5 rounded-2xl text-sm hover:opacity-90 transition-opacity" style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>Unlock</button>
            <button onClick={() => setPasswordModal(null)} className="px-4 py-2.5 rounded-2xl text-sm bg-muted text-muted-foreground hover:bg-muted/80">Cancel</button>
          </div>
        </Modal>
      )}

      {/* Set password modal */}
      {settingPasswordBook && (
        <Modal onClose={() => { setSettingPasswordBook(null); setNewPassword(""); }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <KeyRound size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-card-foreground" style={{ fontWeight: 700 }}>Set Password</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Leave blank to remove protection</p>
            </div>
          </div>
          <input
            autoFocus type="password" placeholder="New password (or leave blank)…"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveBookPassword()}
            className="w-full px-3.5 py-3 rounded-2xl border border-border bg-input-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 mb-4 transition-shadow"
          />
          <div className="flex gap-2">
            <button onClick={saveBookPassword} className="flex-1 text-white py-2.5 rounded-2xl text-sm hover:opacity-90 transition-opacity" style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>Save</button>
            <button onClick={() => { setSettingPasswordBook(null); setNewPassword(""); }} className="px-4 py-2.5 rounded-2xl text-sm bg-muted text-muted-foreground">Cancel</button>
          </div>
        </Modal>
      )}

      {/* Header */}
      <header className="bg-card/90 backdrop-blur-xl border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center gap-4">
          <div className="flex items-center gap-2 mr-3 flex-shrink-0">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <Flame size={13} className="text-white" />
            </div>
            <span className="text-foreground hidden sm:block" style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em" }}>
              Note<span className="text-primary">Forge</span>
            </span>
          </div>

          <div className="flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" placeholder="Search books…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
          </div>

          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors"
          >
            <Search size={13} /> Search all pages
            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded ml-1" style={{ fontSize: "10px" }}>⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", fontSize: "11px", fontWeight: 700 }}
              >
                {initials}
              </div>
              <span className="text-sm text-foreground hidden md:block" style={{ fontWeight: 600 }}>{displayName}</span>
              <button onClick={onSignOut} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1" title="Sign Out">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Books", value: books.length, icon: BookOpen, color: "#4f46e5" },
            { label: "Total Pages", value: totalPages, icon: FileText, color: "#10b981" },
            { label: "Active Today", value: books.filter(b => new Date(b.updatedAt).toDateString() === new Date().toDateString()).length, icon: TrendingUp, color: "#f59e0b" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl px-4 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "18" }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <div className="text-foreground" style={{ fontWeight: 700, fontSize: "20px", lineHeight: 1 }}>{value}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>My Books</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {search ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"` : `${books.length} book${books.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm shadow-md shadow-primary/30"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
          >
            <Plus size={16} /> New Book
          </button>
        </div>

        {/* Create input */}
        {creating && (
          <div className="flex items-center gap-2 mb-5 bg-card border-2 border-primary/30 rounded-2xl px-4 py-3.5 shadow-sm">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <BookOpen size={13} className="text-white" />
            </div>
            <input
              autoFocus placeholder="Book name…" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createBook(); if (e.key === "Escape") setCreating(false); }}
              className="flex-1 bg-transparent outline-none text-foreground text-sm"
            />
            <button onClick={createBook} className="text-green-500 p-1 hover:opacity-70"><Check size={17} /></button>
            <button onClick={() => setCreating(false)} className="text-muted-foreground p-1 hover:opacity-70"><X size={17} /></button>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: "linear-gradient(135deg,#eef2ff,#e0e7ff)" }}
            >
              <BookOpen size={36} style={{ color: "#4f46e5" }} />
            </div>
            <h3 className="text-foreground mb-2" style={{ fontWeight: 700, fontSize: "18px" }}>
              {search ? "No books found" : "Create your first book"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {search ? `No books match "${search}"` : "Books help you organize notes by topic, project, or subject. Start with one!"}
            </p>
            {!search && (
              <button
                onClick={() => setCreating(true)}
                className="mt-7 flex items-center gap-2 text-white px-6 py-3 rounded-2xl hover:opacity-90 text-sm shadow-lg shadow-primary/30"
                style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
              >
                <Plus size={16} /> Create your first book
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((book) => (
              <BookCard
                key={book.id} book={book}
                onOpen={() => handleOpenBook(book)}
                onRename={(name) => renameBook(book.id, name)}
                onDelete={() => removeBook(book.id)}
                onSetPassword={() => { setSettingPasswordBook(book); setNewPassword(""); }}
              />
            ))}
            {/* Add book card */}
            <button
              onClick={() => setCreating(true)}
              className="group border-2 border-dashed border-border rounded-2xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-muted-foreground group-hover:text-primary text-sm transition-colors" style={{ fontWeight: 600 }}>New Book</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
