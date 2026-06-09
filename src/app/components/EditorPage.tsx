import { useRef, useEffect, useState, useCallback } from "react";
import {
  Book, Page, PageTemplate, generateId, getPage,
  getPagesForBook, upsertPage, deletePage,
} from "./storage";
import { useTheme } from "./ThemeContext";
import { EditorToolbar } from "./EditorToolbar";
import {
  Plus, FileText, Trash2,
  Check, X, Pencil, Tag, GripVertical, Moon, Sun, Flame,
  ChevronLeft,
} from "lucide-react";

interface Props {
  book: Book;
  page: Page;
  onBack: () => void;
}

type SaveStatus = "idle" | "unsaved" | "saving" | "saved";

// Returns plain style objects — no React namespace needed
function getTemplateStyles(template: PageTemplate | undefined) {
  switch (template) {
    case "lined":
      return {
        outerBg: "#e2e8f4",
        paperBg: "#fffef5",
        paperExtra: {
          backgroundImage: [
            "linear-gradient(transparent calc(2em - 1px), #bfdbfe calc(2em - 1px), #bfdbfe calc(2em), transparent calc(2em))",
          ].join(", "),
          backgroundSize: "100% 2em",
          backgroundAttachment: "local",
        } as Record<string, string>,
        editorExtra: {
          lineHeight: "2em",
          fontFamily: "Georgia, 'Times New Roman', serif",
        } as Record<string, string>,
        headerBorder: "#bfdbfe",
        textColor: "#1e293b",
        headingColor: "#1e293b",
        subColor: "#64748b",
        // margin line color for the vertical red line
        showMarginLine: true,
      };
    case "grid":
      return {
        outerBg: "#d9e2ee",
        paperBg: "#f5f8ff",
        paperExtra: {
          backgroundImage: [
            "linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "28px 28px",
        } as Record<string, string>,
        editorExtra: {
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: "2em",
        } as Record<string, string>,
        headerBorder: "#cbd5e1",
        textColor: "#1e293b",
        headingColor: "#1e293b",
        subColor: "#64748b",
        showMarginLine: false,
      };
    case "dotted":
      return {
        outerBg: "#e0d9d0",
        paperBg: "#fffbf5",
        paperExtra: {
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.5) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        } as Record<string, string>,
        editorExtra: {
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: "1.9em",
        } as Record<string, string>,
        headerBorder: "#d1c4b2",
        textColor: "#292524",
        headingColor: "#1c1917",
        subColor: "#78716c",
        showMarginLine: false,
      };
    case "kraft":
      return {
        outerBg: "#9a7040",
        paperBg: "#c49554",
        paperExtra: {
          background: "linear-gradient(160deg,#d4a76a 0%,#c49554 50%,#b8864e 100%)",
        } as Record<string, string>,
        editorExtra: {
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: "2em",
        } as Record<string, string>,
        headerBorder: "rgba(92,48,10,0.3)",
        textColor: "#3b1a08",
        headingColor: "#1c0a00",
        subColor: "#6b3a1a",
        showMarginLine: false,
      };
    case "dark":
      return {
        outerBg: "#020609",
        paperBg: "#0f172a",
        paperExtra: {
          background: "linear-gradient(160deg,#0f172a 0%,#1e1b4b 100%)",
        } as Record<string, string>,
        editorExtra: {
          fontFamily: "Inter, system-ui, sans-serif",
          lineHeight: "1.9em",
        } as Record<string, string>,
        headerBorder: "rgba(129,140,248,0.2)",
        textColor: "#e2e8f0",
        headingColor: "#f1f5f9",
        subColor: "#818cf8",
        showMarginLine: false,
      };
    default: // plain
      return {
        outerBg: "#eef0f5",
        paperBg: "var(--card)",
        paperExtra: {} as Record<string, string>,
        editorExtra: {
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: "1.9em",
        } as Record<string, string>,
        headerBorder: "var(--border)",
        textColor: "var(--card-foreground)",
        headingColor: "var(--card-foreground)",
        subColor: "var(--muted-foreground)",
        showMarginLine: false,
      };
  }
}

// Inline save icon (avoids name collision with lucide Save which isn't imported)
function SaveIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}

export function EditorPage({ book, page, onBack }: Props) {
  const { isDark, toggle } = useTheme();

  // ── state ──────────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<Page>(page);
  const [pages, setPages]             = useState<Page[]>([]);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved]     = useState<Date | null>(null);
  const [wordCount, setWordCount]     = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [pageName, setPageName]       = useState(page.name);
  const [creatingPage, setCreatingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [tags, setTags]               = useState<string[]>(page.tags || []);
  const [tagInput, setTagInput]       = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [draggedId, setDraggedId]     = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);

  const editorRef  = useRef<HTMLDivElement>(null);
  const contentRef = useRef<string>(page.content || "");
  const autoTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived template styles — safe because currentPage is declared above
  const tmpl = getTemplateStyles(currentPage.template);

  // ── helpers ────────────────────────────────────────────────────────────────
  const reload = () => setPages(getPagesForBook(book.id));

  const updateWC = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    setWordCount(text ? text.split(" ").filter(Boolean).length : 0);
  };

  // ── effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fresh = getPage(currentPage.id) || currentPage;
    setCurrentPage(fresh);
    setPageName(fresh.name);
    setTags(fresh.tags || []);
    contentRef.current = fresh.content || "";
    if (editorRef.current) {
      editorRef.current.innerHTML = fresh.content || "";
      editorRef.current.focus();
    }
    updateWC(fresh.content || "");
    setSaveStatus("idle");
    reload();
  }, [currentPage.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    autoTimer.current = setInterval(() => {
      setSaveStatus((s) => {
        if (s === "unsaved") { doSave(); return "saving"; }
        return s;
      });
    }, 5000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [currentPage, pageName, tags]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── editor handlers ────────────────────────────────────────────────────────
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    contentRef.current = editorRef.current.innerHTML;
    updateWC(editorRef.current.innerHTML);
    setSaveStatus("unsaved");
  }, []);

  const doSave = () => {
    const updated: Page = {
      ...currentPage,
      name: pageName,
      content: contentRef.current,
      tags,
      updatedAt: new Date().toISOString(),
    };
    upsertPage(updated);
    setCurrentPage(updated);
    setLastSaved(new Date());
    setSaveStatus("saved");
    reload();
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  const saveNow = () => { setSaveStatus("saving"); setTimeout(doSave, 80); };

  const saveBeforeSwitch = () => {
    upsertPage({ ...currentPage, name: pageName, content: contentRef.current, tags, updatedAt: new Date().toISOString() });
  };

  const switchPage = (p: Page) => {
    saveBeforeSwitch();
    const fresh = getPage(p.id) || p;
    setCurrentPage(fresh);
    setPageName(fresh.name);
    setTags(fresh.tags || []);
    contentRef.current = fresh.content || "";
    if (editorRef.current) editorRef.current.innerHTML = fresh.content || "";
    updateWC(fresh.content || "");
    setSaveStatus("idle");
    reload();
    setTimeout(() => editorRef.current?.focus(), 50);
  };

  const createPage = () => {
    const np: Page = {
      id: generateId(), bookId: book.id,
      name: newPageName.trim() || "Untitled Page",
      content: "", tags: [], order: pages.length,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    upsertPage(np);
    setNewPageName("");
    setCreatingPage(false);
    switchPage(np);
  };

  const removePage = (id: string) => {
    if (!confirm("Delete this page?")) return;
    deletePage(id);
    const rest = getPagesForBook(book.id);
    if (id === currentPage.id) {
      if (rest.length > 0) switchPage(rest[0]); else onBack();
    } else {
      reload();
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || tags.includes(t)) { setTagInput(""); return; }
    setTags([...tags, t]);
    setTagInput("");
    setSaveStatus("unsaved");
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(targetId);
    if (!draggedId || draggedId === targetId) return;
    const arr = [...pages];
    const from = arr.findIndex((p) => p.id === draggedId);
    const to   = arr.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    arr.forEach((p, i) => { p.order = i; upsertPage(p); });
    setPages(arr);
  };

  // ── status badge ───────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (saveStatus === "unsaved") return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs" style={{ fontWeight: 600 }}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Unsaved
      </span>
    );
    if (saveStatus === "saving") return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs" style={{ fontWeight: 600 }}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" /> Saving…
      </span>
    );
    if (saveStatus === "saved") return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs" style={{ fontWeight: 600 }}>
        <Check size={11} /> Saved
      </span>
    );
    if (lastSaved) return (
      <span className="text-xs text-muted-foreground">
        Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
    return null;
  };

  // ── render ─────────────────────────────────────────────────────────────────
  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-background overflow-hidden"
    : "flex flex-col bg-background overflow-hidden"
  ;
  // We use min-h-screen so the layout always fills the viewport
  const wrapperClass = isFullscreen ? containerClass : `${containerClass} min-h-screen`;

  return (
    <div className={wrapperClass} style={{ height: "100dvh" }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header
        className="border-b border-border flex-shrink-0 z-30 flex items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
            <Flame size={13} className="text-white" />
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline" style={{ fontWeight: 500 }}>{book.name}</span>
          </button>
          <span className="text-border flex-shrink-0 text-muted-foreground">/</span>

          {editingName ? (
            <div className="flex items-center gap-2 min-w-0">
              <input
                autoFocus value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setEditingName(false); setSaveStatus("unsaved"); }
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="border-b-2 border-primary outline-none bg-transparent text-foreground text-sm py-0.5 min-w-0 w-44"
              />
              <button onClick={() => { setEditingName(false); setSaveStatus("unsaved"); }} className="text-green-500 flex-shrink-0"><Check size={13} /></button>
              <button onClick={() => setEditingName(false)} className="text-muted-foreground flex-shrink-0"><X size={13} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-foreground text-sm truncate" style={{ fontWeight: 700 }}>{pageName}</span>
              <button
                onClick={() => setEditingName(true)}
                className="text-muted-foreground hover:text-foreground p-0.5 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              >
                <Pencil size={11} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">{wordCount} words</span>
          <StatusBadge />
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={saveNow}
            className="flex items-center gap-1.5 text-white px-3.5 py-1.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 2px 10px rgba(79,70,229,0.35)" }}
          >
            <SaveIcon size={13} /> Save
          </button>
        </div>
      </header>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 z-20">
        <EditorToolbar
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((f) => !f)}
          getContent={() => contentRef.current}
          setContent={(html) => {
            contentRef.current = html;
            if (editorRef.current) editorRef.current.innerHTML = html;
            updateWC(html);
            setSaveStatus("unsaved");
          }}
          pageName={pageName}
        />
      </div>

      {/* ── TAGS BAR ─────────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 border-b border-border/60 px-4 py-1.5 flex items-center flex-wrap gap-1.5"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <Tag size={11} className="text-muted-foreground flex-shrink-0" />
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground" style={{ fontWeight: 600 }}>
            #{t}
            <button
              onClick={() => { setTags(tags.filter((x) => x !== t)); setSaveStatus("unsaved"); }}
              className="hover:opacity-60"
            >
              <X size={9} />
            </button>
          </span>
        ))}
        {showTagInput ? (
          <input
            autoFocus type="text" placeholder="tag…" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
              if (e.key === "Escape") { setShowTagInput(false); setTagInput(""); }
            }}
            onBlur={() => { addTag(); setShowTagInput(false); }}
            className="text-xs border border-border rounded-full px-2.5 py-0.5 outline-none bg-card text-foreground w-24 focus:border-primary/50"
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={10} /> tag
          </button>
        )}
      </div>

      {/* ── BODY: SIDEBAR + EDITOR ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar */}
        <aside
          className="w-52 flex-shrink-0 border-r border-border flex-col hidden md:flex overflow-hidden"
          style={{ backgroundColor: "var(--sidebar)" }}
        >
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/50 flex-shrink-0">
            <span className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontWeight: 700 }}>Pages</span>
            <button
              onClick={() => setCreatingPage(true)}
              className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Plus size={13} />
            </button>
          </div>

          {creatingPage && (
            <div className="px-2 py-2 border-b border-border/50 flex-shrink-0">
              <input
                autoFocus placeholder="Page name…" value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createPage();
                  if (e.key === "Escape") setCreatingPage(false);
                }}
                className="w-full text-xs rounded-xl border border-primary/40 bg-card text-foreground px-3 py-1.5 outline-none"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-1 px-1.5">
            {pages.map((p) => {
              const active = p.id === currentPage.id;
              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => setDraggedId(p.id)}
                  onDragOver={(e) => handleDragOver(e, p.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                  className="group flex items-center rounded-xl cursor-pointer transition-all mb-0.5"
                  style={{
                    backgroundColor: active ? "var(--sidebar-accent)" : dragOverId === p.id ? "var(--muted)" : "transparent",
                    opacity: draggedId === p.id ? 0.3 : 1,
                    borderLeft: `3px solid ${active ? book.color : "transparent"}`,
                  }}
                >
                  <button
                    onClick={() => switchPage(p)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left px-2 py-2"
                  >
                    <GripVertical size={10} className="text-muted-foreground opacity-0 group-hover:opacity-50 flex-shrink-0" />
                    <FileText size={12} style={{ color: active ? book.color : "var(--muted-foreground)", flexShrink: 0 }} />
                    <span
                      className="text-xs truncate"
                      style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: active ? 700 : 400 }}
                    >
                      {p.name}
                    </span>
                  </button>
                  <button
                    onClick={() => removePage(p.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 mr-1 rounded-lg hover:text-destructive hover:bg-destructive/10 transition-all text-muted-foreground flex-shrink-0"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── EDITOR COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Paper area */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              backgroundColor: tmpl.outerBg,
              padding: "32px 24px",
              transition: "background-color 0.4s ease",
            }}
          >
            {/* Lined margin line */}
            {tmpl.showMarginLine && (
              <div
                className="pointer-events-none fixed z-10"
                style={{
                  top: 0, bottom: 0,
                  left: "calc(52px + 224px + 24px + 72px)",
                  width: "2px",
                  backgroundColor: "#fca5a5",
                  opacity: 0.45,
                }}
              />
            )}

            <div
              className="mx-auto rounded-2xl overflow-hidden relative"
              style={{
                maxWidth: "820px",
                minHeight: "1000px",
                backgroundColor: tmpl.paperBg,
                boxShadow: currentPage.template === "dark"
                  ? "0 8px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(129,140,248,0.12)"
                  : currentPage.template === "kraft"
                  ? "0 8px 40px rgba(100,60,10,0.35), 0 0 0 1px rgba(180,120,60,0.3)"
                  : "0 4px 40px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)",
                transition: "all 0.4s ease",
                ...tmpl.paperExtra,
              }}
            >
              {/* Dark template dot overlay */}
              {currentPage.template === "dark" && (
                <div
                  className="absolute inset-0 pointer-events-none z-0 rounded-2xl overflow-hidden"
                  style={{
                    backgroundImage: "radial-gradient(rgba(129,140,248,0.12) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
              )}

              {/* Page header */}
              <div
                className="relative z-10 px-12 pt-12 pb-6 border-b"
                style={{ borderColor: tmpl.headerBorder }}
              >
                <div className="h-1.5 w-10 rounded-full mb-4" style={{ backgroundColor: book.color }} />
                <div
                  className="text-xs mb-2 uppercase"
                  style={{ fontWeight: 700, letterSpacing: "0.1em", color: tmpl.subColor }}
                >
                  {book.name}
                </div>
                <div
                  style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.25, color: tmpl.headingColor }}
                >
                  {pageName}
                </div>
              </div>

              {/* Editable area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                spellCheck
                data-placeholder="Click here and start writing…"
                className="nf-editor relative z-10"
                style={{
                  minHeight: "800px",
                  padding: "28px 48px 72px",
                  outline: "none",
                  fontSize: "16px",
                  cursor: "text",
                  wordBreak: "break-word",
                  color: tmpl.textColor,
                  ...tmpl.editorExtra,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── GLOBAL STYLES ───────────────────────────────────────────────────── */}
      <style>{`
        .nf-editor:empty::before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
          font-style: italic;
          opacity: 0.55;
        }
        .nf-editor:focus { outline: none; }
        .nf-editor h1 { font-size: 2em; font-weight: 800; margin: .8em 0 .4em; letter-spacing: -0.025em; color: inherit; }
        .nf-editor h2 { font-size: 1.5em; font-weight: 700; margin: .7em 0 .35em; letter-spacing: -0.015em; color: inherit; }
        .nf-editor h3 { font-size: 1.25em; font-weight: 600; margin: .6em 0 .3em; color: inherit; }
        .nf-editor h4 { font-size: 1.05em; font-weight: 600; margin: .5em 0 .25em; color: inherit; }
        .nf-editor p  { margin: 0 0 .85em; }
        .nf-editor blockquote {
          border-left: 3px solid var(--primary); margin: 1.5em 0; padding: 10px 18px;
          background: var(--accent); color: var(--muted-foreground); font-style: italic;
          border-radius: 0 10px 10px 0;
        }
        .nf-editor pre {
          background: #0f172a; color: #e2e8f0; padding: 18px; border-radius: 10px;
          font-family: 'Courier New', monospace; font-size: 14px;
          overflow: auto; margin: 1.25em 0; border: 1px solid rgba(255,255,255,0.06);
        }
        .nf-editor code {
          background: var(--muted); color: var(--primary);
          padding: 2px 6px; border-radius: 4px; font-size: .88em;
          font-family: 'Courier New', monospace;
        }
        .nf-editor ul { list-style: disc; padding-left: 1.6em; margin: .6em 0; }
        .nf-editor ol { list-style: decimal; padding-left: 1.6em; margin: .6em 0; }
        .nf-editor li { margin: .3em 0; }
        .nf-editor a  { color: var(--primary); text-decoration: underline; text-underline-offset: 2px; }
        .nf-editor table { border-collapse: collapse; width: 100%; margin: 1.25em 0; }
        .nf-editor td, .nf-editor th { border: 1px solid #cbd5e1; padding: 9px 13px; }
        .nf-editor th { background: var(--muted); font-weight: 700; }
        .nf-editor hr { border: none; border-top: 2px solid var(--border); margin: 2em 0; }
        .nf-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: .7em 0; }
      `}</style>
    </div>
  );
}
