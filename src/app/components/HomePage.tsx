import { useTheme } from "./ThemeContext";
import {
  BookOpen, Moon, Sun, Zap, Shield, Globe,
  ArrowRight, Flame, Tag, FileText, Check, Sparkles,
  Star, TrendingUp,
} from "lucide-react";

interface Props {
  onMakeNotes: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

const FEATURES = [
  {
    icon: BookOpen, accent: "#4f46e5", bg: "linear-gradient(135deg,#eef2ff,#e0e7ff)",
    title: "Smart Notebooks", badge: "Organize",
    desc: "Structure everything into books and pages. Your knowledge, beautifully organized.",
  },
  {
    icon: Zap, accent: "#f59e0b", bg: "linear-gradient(135deg,#fffbeb,#fef3c7)",
    title: "Powerful Editor", badge: "Write",
    desc: "Rich text, tables, code blocks, checklists — a real editor for real thinking.",
  },
  {
    icon: Tag, accent: "#10b981", bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
    title: "Tag & Filter", badge: "Find",
    desc: "Label pages and surface exactly what you need with global search in milliseconds.",
  },
  {
    icon: Shield, accent: "#6366f1", bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
    title: "Private & Local", badge: "Secure",
    desc: "Everything stays in your browser. No cloud, no tracking, no subscription.",
  },
  {
    icon: Globe, accent: "#0ea5e9", bg: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
    title: "Export Anywhere", badge: "Share",
    desc: "Download as PDF, plain text, or Markdown — your notes, your format.",
  },
  {
    icon: FileText, accent: "#ec4899", bg: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
    title: "Unlimited Pages", badge: "Grow",
    desc: "Create as many books and pages as you need — no caps, ever.",
  },
];

const STEPS = [
  { n: "1", icon: "✨", title: "Sign Up Free", desc: "Create your account with name, email, and password in seconds." },
  { n: "2", icon: "🔑", title: "Sign In", desc: "Use your credentials to access your personal workspace." },
  { n: "3", icon: "📚", title: "Create a Book", desc: "Organize notes into books — one per project, subject, or idea." },
  { n: "4", icon: "✍️", title: "Write & Save", desc: "Open a page, start typing. Auto-save keeps everything safe." },
];

const TESTIMONIALS = [
  { color: "#4f46e5", initials: "AK", name: "Arjun K.", text: "NoteForge replaced Notion for my personal notes. Faster and completely private." },
  { color: "#10b981", initials: "SM", name: "Sara M.", text: "The editor is surprisingly powerful. Tags and search are total game-changers." },
  { color: "#f59e0b", initials: "JL", name: "Jay L.", text: "Love that it's all local. My notes never leave my browser — ever." },
];

// Inline SVG save icon for the preview (no unused import)
function SaveIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function AppPreview({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e2e8f0";
  const muted = isDark ? "#475569" : "#e2e8f0";
  const faint = isDark ? "#162032" : "#f8fafc";
  const accent = "#4f46e5";
  const textCol = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div className="relative w-full" style={{ maxWidth: "480px" }}>
      <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
        style={{ background: "linear-gradient(135deg,#4f46e5,#a78bfa)", transform: "scale(0.9) translateY(24px)" }} />
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: bg, borderColor: border,
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 32px 80px rgba(79,70,229,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b" style={{ borderColor: border, backgroundColor: faint }}>
          {["#f87171","#fbbf24","#4ade80"].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />
          ))}
          <div className="flex-1 mx-3 h-4 rounded-md" style={{ backgroundColor: muted }} />
        </div>

        <div className="flex" style={{ height: "320px" }}>
          {/* Sidebar */}
          <div className="w-32 border-r flex flex-col" style={{ borderColor: border, backgroundColor: faint }}>
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ borderColor: border }}>
              <div className="w-4 h-4 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                <Flame size={8} className="text-white" />
              </div>
              <div className="h-2 rounded w-12" style={{ backgroundColor: muted }} />
            </div>
            <div className="px-2 py-2 flex-1">
              <div className="h-1.5 rounded w-8 mb-2" style={{ backgroundColor: muted, opacity: 0.5 }} />
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 mb-0.5" style={{ backgroundColor: i === 0 ? accent+"18" : "transparent" }}>
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: i === 0 ? accent : muted }} />
                  <div className="h-1.5 rounded flex-1" style={{ backgroundColor: i === 0 ? accent+"70" : muted }} />
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col" style={{ backgroundColor: bg }}>
            <div className="flex items-center gap-1 px-3 py-2 border-b" style={{ borderColor: border, backgroundColor: faint }}>
              {["B","I","U"].map((f) => (
                <div key={f} className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: muted, fontSize: "9px", fontWeight: 800, color: textCol }}>{f}</div>
              ))}
              <div className="w-px h-3 mx-1" style={{ backgroundColor: border }} />
              {[0,1,2].map((i) => <div key={i} className="w-5 h-5 rounded" style={{ backgroundColor: muted }} />)}
              <div className="flex-1" />
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: accent+"18", color: accent }}>
                <SaveIcon size={9} />
                <span style={{ fontSize: "8px", fontWeight: 700 }}>Saved</span>
              </div>
            </div>
            <div className="flex-1 px-6 py-5 overflow-hidden">
              <div className="h-4 rounded-lg mb-3 w-3/4" style={{ backgroundColor: isDark ? "#3b4a63" : "#cbd5e1" }} />
              <div className="flex gap-1.5 mb-4">
                {[accent, "#10b981", "#f59e0b"].map((c) => (
                  <div key={c} className="h-3.5 rounded-full px-2" style={{ backgroundColor: c+"20", minWidth: "36px" }}>
                    <div className="h-1 rounded w-full mt-1.5" style={{ backgroundColor: c+"70" }} />
                  </div>
                ))}
              </div>
              {[90,100,75,100,60,85,100,40].map((w, i) => (
                <div key={i} className="h-1.5 rounded mb-2" style={{ width: `${w}%`, backgroundColor: isDark ? "#2d3f55" : "#e2e8f0" }} />
              ))}
              <div className="flex gap-2 mt-3">
                <div className="w-0.5 rounded-full self-stretch" style={{ backgroundColor: accent }} />
                <div className="flex-1">
                  {[80,62].map((w, i) => (
                    <div key={i} className="h-1.5 rounded mb-1.5" style={{ width: `${w}%`, backgroundColor: isDark ? "#2d3f55" : "#e2e8f0", opacity: 0.65 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge: saved */}
      <div className="absolute -right-3 top-10 rounded-xl border px-3 py-2 shadow-xl" style={{ backgroundColor: bg, borderColor: border }}>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={8} className="text-white" />
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: textCol }}>Auto-saved</span>
        </div>
        <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b" }}>just now · 342 words</div>
      </div>

      {/* Floating badge: tags */}
      <div className="absolute -left-3 bottom-14 rounded-xl border px-3 py-2 shadow-xl" style={{ backgroundColor: bg, borderColor: border }}>
        <div className="text-xs mb-1.5" style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: 700 }}>Tags</div>
        <div className="flex gap-1.5">
          {[["#notes", accent], ["#ideas", "#10b981"]].map(([t, c]) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c+"20", color: c, fontWeight: 700 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomePage({ onMakeNotes, onSignIn, onSignUp }: Props) {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-primary/40"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <Flame size={15} className="text-white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.04em" }} className="text-foreground">
              Note<span className="text-primary">Forge</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[["#features","Features"],["#how-it-works","How it works"],["#pricing","Pricing"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={onSignIn} className="hidden sm:block text-sm px-4 py-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors" style={{ fontWeight: 500 }}>
              Sign In
            </button>
            <button
              onClick={onSignUp}
              className="text-sm px-4 py-2 rounded-xl text-white hover:opacity-90 transition-all shadow-md shadow-primary/30"
              style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle,#4f46e5,transparent 70%)" }} />
          <div className="absolute -top-8 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="flex flex-col lg:flex-row gap-14 items-center">
            <div className="flex-1 max-w-2xl">
              <div
                className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border mb-7"
                style={{
                  background: isDark ? "rgba(79,70,229,0.15)" : "#eef2ff",
                  borderColor: isDark ? "rgba(129,140,248,0.3)" : "#c7d2fe",
                  color: isDark ? "#818cf8" : "#4f46e5",
                  fontWeight: 600,
                }}
              >
                <Sparkles size={12} />
                Free forever · Works offline · No cloud
              </div>

              <h1 style={{ fontSize: "clamp(40px,6vw,68px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em" }} className="text-foreground mb-6">
                Your ideas deserve
                <br />
                <span style={{
                  background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 40%,#a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  a better home.
                </span>
              </h1>

              <p className="text-muted-foreground mb-9 max-w-lg" style={{ fontSize: "18px", lineHeight: 1.8 }}>
                NoteForge is a distraction-free notes app that lives in your browser.
                Books, pages, tags, rich editing — everything you need, nothing you don't.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button
                  onClick={onMakeNotes}
                  className="group flex items-center gap-2.5 text-white px-7 py-4 rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all"
                  style={{
                    fontWeight: 700, fontSize: "16px",
                    background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
                    boxShadow: "0 8px 32px rgba(79,70,229,0.4)",
                  }}
                >
                  Start Writing
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-border text-foreground hover:bg-muted/60 transition-colors"
                  style={{ fontWeight: 500, fontSize: "15px" }}
                >
                  I have an account
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {[["AK","#4f46e5"],["SM","#10b981"],["JL","#f59e0b"],["RP","#ec4899"],["TW","#0ea5e9"]].map(([init, c]) => (
                    <div key={init} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white"
                      style={{ backgroundColor: c, fontSize: "10px", fontWeight: 700 }}>{init}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill="#f59e0b" className="text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground">Loved by <span className="text-foreground" style={{ fontWeight: 600 }}>2,400+</span> writers</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end w-full max-w-lg">
              <AppPreview isDark={isDark} />
            </div>
          </div>
        </div>
      </section>

      {/* SIGNUP REQUIRED BANNER */}
      <section className="max-w-6xl mx-auto px-5 pb-14">
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: isDark ? "linear-gradient(135deg,rgba(79,70,229,0.2),rgba(124,58,237,0.15))" : "linear-gradient(135deg,#eef2ff,#ede9fe)",
            border: "1px solid",
            borderColor: isDark ? "rgba(129,140,248,0.25)" : "#c7d2fe",
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
            <Shield size={17} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-foreground text-sm" style={{ fontWeight: 700 }}>Sign up required — it's free and takes 10 seconds</p>
            <p className="text-muted-foreground text-sm mt-0.5">Create a free account first, then sign in. Your data stays only in your browser — never uploaded anywhere.</p>
          </div>
          <button
            onClick={onSignUp}
            className="text-white text-sm px-5 py-2.5 rounded-xl flex-shrink-0 hover:opacity-90 transition-opacity shadow-md"
            style={{ fontWeight: 600, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
          >
            Create free account →
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-y border-border/60 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isDark ? "rgba(15,23,42,0.8)" : "rgba(248,250,252,0.9)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(${isDark ? "rgba(129,140,248,0.06)" : "rgba(79,70,229,0.04)"} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-primary mb-3 block" style={{ fontWeight: 700 }}>Simple process</span>
            <h2 className="text-foreground" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Up and running in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            <div className="hidden lg:block absolute top-11 left-[12.5%] right-[12.5%] h-px"
              style={{ background: "linear-gradient(90deg,transparent,var(--primary),transparent)", opacity: 0.3 }} />
            {STEPS.map(({ n, icon, title, desc }, i) => (
              <div key={n} className="bg-card rounded-2xl p-6 border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 text-xl"
                  style={{ background: `linear-gradient(135deg,${["#eef2ff","#f0fdf4","#fffbeb","#fdf4ff"][i]},${["#e0e7ff","#dcfce7","#fef3c7","#f3e8ff"][i]})` }}
                >
                  {icon}
                </div>
                <div
                  className="text-xs mb-3 px-2 py-0.5 rounded-full inline-block"
                  style={{ background: isDark ? "rgba(129,140,248,0.15)" : "#eef2ff", color: isDark ? "#818cf8" : "#4f46e5", fontWeight: 700 }}
                >
                  Step {n}
                </div>
                <h3 className="text-card-foreground mb-2" style={{ fontWeight: 700, fontSize: "15px" }}>{title}</h3>
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-widest text-primary mb-3 block" style={{ fontWeight: 700 }}>Built for thinkers</span>
            <h2 className="text-foreground" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Everything you need to think clearly
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, accent, bg, title, badge, desc }) => (
              <div key={title} className="group bg-card border border-border rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.07] -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"
                  style={{ backgroundColor: accent }} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={20} style={{ color: accent }} />
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: bg, color: accent, fontWeight: 700 }}>{badge}</span>
                  </div>
                  <h3 className="text-card-foreground mb-2" style={{ fontWeight: 700, fontSize: "15px" }}>{title}</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "14px", lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border/60 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-foreground" style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>People love using it</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ color, initials, name, text }) => (
              <div key={name} className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={13} fill="#f59e0b" className="text-amber-400" />)}
                </div>
                <p className="text-foreground text-sm mb-4" style={{ lineHeight: 1.65 }}>"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: color, fontSize: "11px", fontWeight: 700 }}>{initials}</div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20">
        <div className="max-w-lg mx-auto px-5 text-center">
          <span className="text-xs uppercase tracking-widest text-primary mb-3 block" style={{ fontWeight: 700 }}>Pricing</span>
          <h2 className="text-foreground mb-3" style={{ fontSize: "clamp(26px,4vw,36px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            One plan. Free forever.
          </h2>
          <p className="text-muted-foreground mb-10" style={{ fontSize: "16px" }}>No credit card. No subscription. No nonsense.</p>
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-left"
            style={{
              background: isDark ? "linear-gradient(145deg,#1e293b,#1a1f35)" : "linear-gradient(145deg,#ffffff,#f8fafc)",
              border: "1px solid",
              borderColor: isDark ? "rgba(129,140,248,0.2)" : "#e0e7ff",
              boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 20px 60px rgba(79,70,229,0.08)",
            }}
          >
            <div className="absolute top-5 right-0 px-4 py-1 text-white text-xs"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)", fontWeight: 700, borderRadius: "8px 0 0 8px" }}>
              Always Free
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-foreground" style={{ fontSize: "52px", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>$0</span>
                <span className="text-muted-foreground mb-2" style={{ fontSize: "16px" }}>/forever</span>
              </div>
              <p className="text-muted-foreground text-sm">Everything included. Nothing held back.</p>
            </div>
            <ul className="flex flex-col gap-3 mb-8">
              {["Unlimited books & pages","Rich text editor with formatting","Tags, categories & global search","PDF, Markdown & text export","Password-protected notebooks","Dark mode","Browser-local privacy","Drag-and-drop page ordering"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-card-foreground">
                  <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-green-500" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onSignUp}
              className="w-full text-white py-4 rounded-2xl hover:opacity-95 transition-all"
              style={{ fontWeight: 700, fontSize: "16px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 8px 32px rgba(79,70,229,0.35)" }}
            >
              Get started for free — no card needed
            </button>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#3730a3 0%,#4f46e5 40%,#7c3aed 70%,#a855f7 100%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full mb-6 border border-white/20 text-white/80" style={{ fontWeight: 600 }}>
            <TrendingUp size={12} /> Join 2,400+ people already using NoteForge
          </div>
          <h2 className="text-white mb-4" style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 900, letterSpacing: "-0.04em" }}>
            Your best ideas are waiting.
          </h2>
          <p className="text-white/70 mb-9" style={{ fontSize: "18px", lineHeight: 1.75 }}>
            Sign up free, then sign in. Write your first note in under two minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onSignUp}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl hover:opacity-95 active:scale-[0.98] transition-all"
              style={{ fontWeight: 700, fontSize: "16px", backgroundColor: "white", color: "#4f46e5", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
            >
              Sign Up Free <ArrowRight size={18} />
            </button>
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/25 text-white hover:bg-white/10 transition-colors"
              style={{ fontWeight: 600, fontSize: "15px" }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-background border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
              <Flame size={13} className="text-white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em" }} className="text-foreground">
              Note<span className="text-primary">Forge</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 NoteForge · All notes stored locally in your browser.</p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <button onClick={onSignUp} className="hover:text-foreground transition-colors" style={{ fontWeight: 500 }}>Sign Up</button>
            <button onClick={onSignIn} className="hover:text-foreground transition-colors" style={{ fontWeight: 500 }}>Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
