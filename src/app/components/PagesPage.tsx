import { useState, useEffect } from "react";
import { Book, Page, PageTemplate, generateId, getPagesForBook, upsertPage, deletePage } from "./storage";
import { useTheme } from "./ThemeContext";
import { PageTemplatePicker } from "./PageTemplatePicker";
import {
  ArrowLeft, Plus, Search, FileText, Pencil, Trash2,
  ExternalLink, Check, X, Moon, Sun, Flame, Tag, Clock,
} from "lucide-react";

interface Props {
  book: Book;
  onBack: () => void;
  onOpenPage: (page: Page) => void;
  onOpenSearch: () => void;
}

const TEMPLATE_LABELS: Record<PageTemplate, { emoji: string; label: string }> = {
  plain:  { emoji: "📄", label: "Clean" },
  lined:  { emoji: "📓", label: "Lined" },
  grid:   { emoji: "📐", label: "Grid" },
  dotted: { emoji: "🔵", label: "Dotted" },
  kraft:  { emoji: "📜", label: "Kraft" },
  dark:   { emoji: "🌙", label: "Dark" },
};

function PageCard({ page, bookColor, onOpen, onRename, onDelete }: {
  page: Page;
  bookColor: string;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(page.name);
  const updated = new Date(page.updatedAt);
  const isToday = new Date().toDateString() === updated.toDateString();
  const dateLabel = isToday ? "Today" : updated.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const preview = page.content
    ? page.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90)
    : null;

  const save = () => { if (editVal.trim()) onRename(editVal.trim()); setEditing(false); };

  const tmpl = page.template || "plain";
  const tmplInfo = TEMPLATE_LABELS[tmpl];

  // Visual thumbnail behind the card header based on template
  const ThumbnailBg = () => {
    if (tmpl === "lined") return (
      <div className="absolute inset-0 overflow-hidden rounded-t-2xl opacity-60" style={{ backgroundColor: "#fffef5" }}>
        <div className="absolute top-0 bottom-0" style={{ left: "18%", width: "1.5px", backgroundColor: "#fca5a5", opacity: 0.5 }} />
        {[30,45,60,75,90].map((t) => (
          <div key={t} className="absolute w-full" style={{ top: `${t}%`, height: "1px", backgroundColor: "#93c5fd", opacity: 0.5 }} />
        ))}
      </div>
    );
    if (tmpl === "grid") return (
      <div className="absolute inset-0 rounded-t-2xl overflow-hidden opacity-60" style={{
        backgroundImage: "linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)",
        backgroundSize: "12px 12px",
        backgroundColor: "#f8faff",
      }} />
    );
    if (tmpl === "dotted") return (
      <div className="absolute inset-0 rounded-t-2xl overflow-hidden opacity-60" style={{
        backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        backgroundColor: "#fffbf5",
      }} />
    );
    if (tmpl === "kraft") return (
      <div className="absolute inset-0 rounded-t-2xl overflow-hidden opacity-50" style={{
        background: "linear-gradient(135deg, #d4a76a, #c49554)",
      }}>
        {[30,55,80].map((t) => (
          <div key={t} className="absolute w-full" style={{ top: `${t}%`, height: "1px", backgroundColor: "#92400e", opacity: 0.3 }} />
        ))}
      </div>
    );
    if (tmpl === "dark") return (
      <div className="absolute inset-0 rounded-t-2xl overflow-hidden opacity-70" style={{
        background: "linear-gradient(160deg, #0f172a, #1e1b4b)",
      }}>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(rgba(129,140,248,0.5) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          opacity: 0.2,
        }} />
      </div>
    );
    return null;
  };

  return (
    <div
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
      style={{ animation: "fadeInUp 0.3s ease both" }}
    >
      {/* Template thumbnail header */}
      <div className="relative h-16 overflow-hidden" style={{ borderBottom: `1.5px solid ${bookColor}30` }}>
        <ThumbnailBg />
        {/* Book color strip */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg,${bookColor},${bookColor}55)` }} />
        {/* Template badge */}
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-sm"
          style={{ backgroundColor: bookColor + "20", border: `1px solid ${bookColor}30` }}
        >
          <span style={{ fontSize: "10px" }}>{tmplInfo.emoji}</span>
          <span className="text-xs" style={{ color: bookColor, fontWeight: 700, fontSize: "9px" }}>{tmplInfo.label}</span>
        </div>
        {/* Delete/edit on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 rounded-lg bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors">
            <Pencil size={11} />
          </button>
          <button onClick={onDelete} className="p-1 rounded-lg bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        {editing ? (
          <div className="flex items-center gap-1.5 mb-2">
            <input
              autoFocus value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 text-sm border-b-2 border-primary outline-none bg-transparent text-foreground pb-0.5"
            />
            <button onClick={save} className="text-green-500"><Check size={13} /></button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground"><X size={13} /></button>
          </div>
        ) : (
          <h3 className="text-card-foreground mb-1.5 line-clamp-2" style={{ fontWeight: 700, fontSize: "14px", lineHeight: 1.4 }}>
            {page.name}
          </h3>
        )}

        {/* Preview snippet */}
        {preview ? (
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3 flex-1" style={{ lineHeight: 1.55 }}>
            {preview}…
          </p>
        ) : (
          <p className="text-muted-foreground text-xs mb-3 flex-1 italic opacity-60">Empty page</p>
        )}

        {/* Tags */}
        {(page.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(page.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: bookColor + "15", color: bookColor, fontWeight: 600 }}>
                #{tag}
              </span>
            ))}
            {(page.tags || []).length > 3 && (
              <span className="text-xs text-muted-foreground">+{(page.tags || []).length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={10} />
            <span>{dateLabel}</span>
          </div>
          <button
            onClick={onOpen}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 active:scale-95"
            style={{ backgroundColor: bookColor + "18", color: bookColor, fontWeight: 600 }}
          >
            Open <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PagesPage({ book, onBack, onOpenPage, onOpenSearch }: Props) {
  const { isDark, toggle } = useTheme();
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Page | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const reload = () => setPages(getPagesForBook(book.id));
  useEffect(() => { reload(); }, [book.id]);

  const allTags = Array.from(new Set(pages.flatMap((p) => p.tags || []))).sort();

  const createPage = (name: string, template: PageTemplate) => {
    const page: Page = {
      id: generateId(), bookId: book.id, name,
      content: "", tags: [], order: pages.length, template,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    upsertPage(page);
    setShowPicker(false);
    reload();
    // Open directly after creating
    setTimeout(() => {
      const created = getPagesForBook(book.id).find((p) => p.id === page.id);
      if (created) onOpenPage(created);
    }, 50);
  };

  const saveEdit = (page: Page, name: string) => {
    upsertPage({ ...page, name, updatedAt: new Date().toISOString() }); reload();
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    deletePage(deleteModal.id); setDeleteModal(null); reload();
  };

  const filtered = pages
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !selectedTag || (p.tags || []).includes(selectedTag));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Template picker modal */}
      {showPicker && (
        <PageTemplatePicker
          bookColor={book.color}
          onConfirm={createPage}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Delete confirm */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
          <div className="w-80 bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-destructive" />
            </div>
            <h3 className="text-card-foreground mb-2" style={{ fontWeight: 700 }}>Delete Page?</h3>
            <p className="text-muted-foreground text-sm mb-5">
              "<strong>{deleteModal.name}</strong>" will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-2xl text-sm hover:opacity-90" style={{ fontWeight: 600 }}>Delete</button>
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2.5 rounded-2xl text-sm bg-muted text-muted-foreground">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-card/90 backdrop-blur-xl border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 h-[60px] flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <Flame size={13} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 flex-shrink-0">
              <ArrowLeft size={14} /> Books
            </button>
            <span className="text-border">/</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-3.5 h-3.5 rounded flex-shrink-0" style={{ backgroundColor: book.color }} />
              <span className="text-foreground truncate" style={{ fontWeight: 700 }}>{book.name}</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-xl hover:opacity-90 text-sm shadow-md"
              style={{ fontWeight: 600, background: `linear-gradient(135deg,${book.color},${book.color}cc)` }}
            >
              <Plus size={15} /> New Page
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>{book.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search pages…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 w-52 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            <button
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ backgroundColor: !selectedTag ? book.color : "var(--muted)", color: !selectedTag ? "white" : "var(--muted-foreground)", fontWeight: 600 }}
            >
              All ({pages.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all"
                style={{ backgroundColor: selectedTag === tag ? book.color : "var(--muted)", color: selectedTag === tag ? "white" : "var(--muted-foreground)", fontWeight: 500 }}
              >
                <Tag size={9} /> {tag}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: `linear-gradient(135deg,${book.color}20,${book.color}10)` }}
            >
              <FileText size={34} style={{ color: book.color }} />
            </div>
            <h3 className="text-foreground mb-2" style={{ fontWeight: 700, fontSize: "18px" }}>
              {search ? "No pages found" : "No pages yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {search ? `No pages match "${search}"` : "Create your first page — pick a background style that suits your mood."}
            </p>
            {!search && (
              <button
                onClick={() => setShowPicker(true)}
                className="mt-7 flex items-center gap-2 text-white px-6 py-3 rounded-2xl hover:opacity-90 text-sm shadow-lg"
                style={{ fontWeight: 600, background: `linear-gradient(135deg,${book.color},${book.color}cc)` }}
              >
                <Plus size={16} /> Create First Page
              </button>
            )}
          </div>
        )}

        {/* Card grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((page, i) => (
              <div key={page.id} style={{ animationDelay: `${i * 40}ms` }}>
                <PageCard
                  page={page}
                  bookColor={book.color}
                  onOpen={() => onOpenPage(page)}
                  onRename={(name) => saveEdit(page, name)}
                  onDelete={() => setDeleteModal(page)}
                />
              </div>
            ))}
            {/* Add page button */}
            <button
              onClick={() => setShowPicker(true)}
              className="group border-2 border-dashed border-border rounded-2xl p-5 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-3 min-h-[180px]"
              style={{ transition: "all 0.2s" }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: `linear-gradient(135deg,${book.color}15,${book.color}08)`, border: `1.5px dashed ${book.color}40` }}
              >
                <Plus size={22} style={{ color: book.color, opacity: 0.6 }} />
              </div>
              <span className="text-muted-foreground text-sm" style={{ fontWeight: 600 }}>New Page</span>
              <span className="text-muted-foreground text-xs opacity-60">Choose a style</span>
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
