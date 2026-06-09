import { useState, useEffect, useRef } from "react";
import { getBooks, getPages, Book, Page } from "./storage";
import { htmlToPlainText } from "./markdownUtils";
import { Search, X, BookOpen, FileText, ArrowRight } from "lucide-react";

interface SearchResult {
  book: Book;
  page: Page;
  excerpt: string;
  matchIndex: number;
}

interface Props {
  isDark: boolean;
  onNavigate: (book: Book, page: Page) => void;
  onClose: () => void;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-gray-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchModal({ isDark, onNavigate, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const books = getBooks();
    const pages = getPages();
    const found: SearchResult[] = [];

    for (const page of pages) {
      const book = books.find((b) => b.id === page.bookId);
      if (!book) continue;

      const nameMatch = page.name.toLowerCase().includes(q);
      const plain = htmlToPlainText(page.content);
      const contentIdx = plain.toLowerCase().indexOf(q);
      const tagMatch = page.tags.some((t) => t.toLowerCase().includes(q));

      if (nameMatch || contentIdx >= 0 || tagMatch) {
        let excerpt = "";
        if (contentIdx >= 0) {
          const start = Math.max(0, contentIdx - 60);
          const end = Math.min(plain.length, contentIdx + 120);
          excerpt = (start > 0 ? "…" : "") + plain.slice(start, end) + (end < plain.length ? "…" : "");
        } else {
          excerpt = plain.slice(0, 150) + (plain.length > 150 ? "…" : "");
        }
        found.push({ book, page, excerpt, matchIndex: contentIdx });
      }
    }

    setResults(found.slice(0, 20));
  }, [query]);

  const surface = 'var(--card)';
  const base = 'var(--background)';
  const border = 'var(--border)';
  const textPrimary = 'var(--foreground)';
  const textSecondary = 'var(--muted-foreground)';
  const hoverBg = 'var(--muted)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: surface, border: `1px solid ${border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${border}` }}>
          <Search size={20} style={{ color: textSecondary }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across all books and pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="flex-1 outline-none text-base"
            style={{ backgroundColor: 'transparent', color: textPrimary }}
          />
          <button onClick={onClose} style={{ color: textSecondary }} className="hover:opacity-70">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
          {query.trim() === '' && (
            <div className="py-12 text-center" style={{ color: textSecondary }}>
              <Search size={36} className="mx-auto mb-3 opacity-30" />
              <p>Start typing to search across all pages</p>
            </div>
          )}

          {query.trim() !== '' && results.length === 0 && (
            <div className="py-12 text-center" style={{ color: textSecondary }}>
              <p>No results found for "<strong style={{ color: textPrimary }}>{query}</strong>"</p>
            </div>
          )}

          {results.map((r, i) => (
            <button
              key={`${r.page.id}-${i}`}
              onClick={() => onNavigate(r.book, r.page)}
              className="w-full text-left px-5 py-4 transition-colors flex items-start gap-4"
              style={{ borderBottom: `1px solid ${border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileText size={14} className="text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: textSecondary }}>
                    <BookOpen size={11} />
                    <span>{r.book.name}</span>
                  </div>
                  <ArrowRight size={11} style={{ color: textSecondary }} />
                  <span className="text-sm" style={{ fontWeight: 600, color: textPrimary }}>
                    {highlight(r.page.name, query)}
                  </span>
                </div>
                {r.excerpt && (
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: textSecondary }}>
                    {highlight(r.excerpt, query)}
                  </p>
                )}
                {r.page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {r.page.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="px-5 py-3 text-xs" style={{ color: textSecondary, borderTop: `1px solid ${border}` }}>
            {results.length} result{results.length !== 1 ? 's' : ''} · Click to open
          </div>
        )}
      </div>
    </div>
  );
}
