import { useState } from "react";
import { PageTemplate } from "./storage";
import { Check, X } from "lucide-react";

interface TemplateOption {
  id: PageTemplate;
  label: string;
  emoji: string;
  desc: string;
  preview: React.ReactNode;
}

function LinedPreview() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: "#fffef5" }}>
      {/* Red margin line */}
      <div className="absolute top-0 bottom-0" style={{ left: "22%", width: "1.5px", backgroundColor: "#f87171", opacity: 0.5 }} />
      {/* Horizontal lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="absolute w-full" style={{ top: `${18 + i * 11}%`, height: "1px", backgroundColor: "#93c5fd", opacity: 0.6 }} />
      ))}
      {/* Fake text */}
      {[55, 75, 90, 65, 80].map((w, i) => (
        <div key={i} className="absolute rounded-sm" style={{ top: `${15 + i * 11}%`, left: "26%", width: `${w}%`, height: "5px", backgroundColor: "#94a3b8", opacity: 0.4 }} />
      ))}
    </div>
  );
}

function GridPreview() {
  return (
    <div className="w-full h-full" style={{
      backgroundColor: "#f8faff",
      backgroundImage: "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
      backgroundSize: "14px 14px",
    }}>
      {[55, 75, 40, 68, 55].map((w, i) => (
        <div key={i} className="absolute rounded-sm" style={{ top: `${14 + i * 16}%`, left: "12%", width: `${w}%`, height: "5px", backgroundColor: "#64748b", opacity: 0.3 }} />
      ))}
    </div>
  );
}

function DottedPreview() {
  return (
    <div className="w-full h-full relative" style={{
      backgroundColor: "#fffbf5",
      backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
      backgroundSize: "12px 12px",
    }}>
      {[60, 45, 78, 52].map((w, i) => (
        <div key={i} className="absolute rounded-sm" style={{ top: `${16 + i * 20}%`, left: "12%", width: `${w}%`, height: "5px", backgroundColor: "#92400e", opacity: 0.25 }} />
      ))}
    </div>
  );
}

function KraftPreview() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #d4a76a, #c49554, #b8864e)" }}>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.4' /%3E%3C/svg%3E\")",
      }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="absolute w-full" style={{ top: `${14 + i * 12}%`, height: "1px", backgroundColor: "#92400e", opacity: 0.25 }} />
      ))}
      {[55, 75, 45, 65, 70].map((w, i) => (
        <div key={i} className="absolute rounded-sm" style={{ top: `${11 + i * 12}%`, left: "10%", width: `${w}%`, height: "5px", backgroundColor: "#451a03", opacity: 0.3 }} />
      ))}
    </div>
  );
}

function PlainPreview() {
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: "#ffffff" }}>
      <div className="absolute" style={{ top: "12%", left: "10%", right: "10%" }}>
        <div className="rounded mb-2" style={{ height: "8px", width: "55%", backgroundColor: "#1e293b", opacity: 0.7 }} />
        {[90, 100, 75, 100, 60, 85].map((w, i) => (
          <div key={i} className="rounded mb-1.5" style={{ height: "4px", width: `${w}%`, backgroundColor: "#94a3b8", opacity: 0.5 }} />
        ))}
        <div className="mt-3 flex gap-1.5">
          {["#eef2ff", "#f0fdf4"].map((c, i) => (
            <div key={i} className="rounded-full px-2 py-0.5" style={{ backgroundColor: c, minWidth: "30px", height: "12px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="w-full h-full relative" style={{ background: "linear-gradient(160deg, #0f172a, #1e1b4b)" }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(rgba(129,140,248,0.8) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }} />
      {[60, 85, 50, 75, 65].map((w, i) => (
        <div key={i} className="absolute rounded-sm" style={{ top: `${14 + i * 14}%`, left: "12%", width: `${w}%`, height: "5px", backgroundColor: "#818cf8", opacity: 0.35 }} />
      ))}
    </div>
  );
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "plain",
    label: "Clean Paper",
    emoji: "📄",
    desc: "Minimal white — pure focus",
    preview: <PlainPreview />,
  },
  {
    id: "lined",
    label: "Lined Notebook",
    emoji: "📓",
    desc: "Classic ruled lines like a real notebook",
    preview: <LinedPreview />,
  },
  {
    id: "grid",
    label: "Graph Paper",
    emoji: "📐",
    desc: "Grid squares — great for structured notes",
    preview: <GridPreview />,
  },
  {
    id: "dotted",
    label: "Dot Grid",
    emoji: "🔵",
    desc: "Subtle dots — bullet journal style",
    preview: <DottedPreview />,
  },
  {
    id: "kraft",
    label: "Kraft Paper",
    emoji: "📜",
    desc: "Warm recycled paper feel",
    preview: <KraftPreview />,
  },
  {
    id: "dark",
    label: "Dark Mode Paper",
    emoji: "🌙",
    desc: "Midnight dark with a galaxy feel",
    preview: <DarkPreview />,
  },
];

interface Props {
  onConfirm: (name: string, template: PageTemplate) => void;
  onClose: () => void;
  bookColor: string;
}

export function PageTemplatePicker({ onConfirm, onClose, bookColor }: Props) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<PageTemplate>("plain");
  const [entered, setEntered] = useState(false);

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), selected);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-card border border-border sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60">
          <div>
            <h2 className="text-foreground" style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>
              Create New Page
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">Name your page and pick a background style</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Page name input */}
          <div className="mb-5">
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block" style={{ fontWeight: 700 }}>
              Page name
            </label>
            <input
              autoFocus
              placeholder="e.g. Meeting Notes, Random Thoughts…"
              value={name}
              onChange={(e) => { setName(e.target.value); setEntered(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); if (e.key === "Escape") onClose(); }}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              style={{ borderColor: entered && !name.trim() ? "var(--destructive)" : undefined }}
            />
            {entered && !name.trim() && <p className="text-xs text-destructive mt-1.5">Please enter a page name</p>}
          </div>

          {/* Template grid */}
          <label className="text-xs text-muted-foreground uppercase tracking-widest mb-3 block" style={{ fontWeight: 700 }}>
            Background style
          </label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {TEMPLATES.map((t) => {
              const isSelected = selected === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className="group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 text-left"
                  style={{
                    borderColor: isSelected ? bookColor : "var(--border)",
                    boxShadow: isSelected ? `0 0 0 4px ${bookColor}22` : "none",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {/* Preview */}
                  <div className="relative h-20 overflow-hidden">
                    {t.preview}
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: bookColor }}
                      >
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <div className="px-2.5 py-2 bg-card border-t border-border/50">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span style={{ fontSize: "13px" }}>{t.emoji}</span>
                      <span className="text-foreground truncate" style={{ fontWeight: 600, fontSize: "11px" }}>{t.label}</span>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "10px", lineHeight: 1.4 }}>{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setEntered(true); handleConfirm(); }}
              className="flex-1 text-white py-3 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all"
              style={{
                fontWeight: 700,
                fontSize: "15px",
                background: `linear-gradient(135deg, ${bookColor}, ${bookColor}cc)`,
                boxShadow: `0 4px 16px ${bookColor}44`,
              }}
            >
              Create Page →
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
