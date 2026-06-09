import { useState } from "react";
import { useTheme } from "./ThemeContext";
import { registerUser, signInUser } from "./storage";
import { Flame, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Moon, Sun, CheckCircle2, Sparkles, BookOpen, Shield, Zap } from "lucide-react";

type Mode = "signin" | "signup";

interface Props {
  initialMode?: Mode;
  onSuccess: () => void;
  onBack: () => void;
  onSwitchMode?: (mode: Mode) => void;
}

const PERKS = [
  { icon: BookOpen, text: "Unlimited books & pages" },
  { icon: Zap, text: "Rich text editor with formatting" },
  { icon: Shield, text: "Private & stored locally" },
];

export function AuthPage({ initialMode = "signin", onSuccess, onBack, onSwitchMode }: Props) {
  const { isDark, toggle } = useTheme();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setSuccess("");
    onSwitchMode?.(m);
  };

  const validate = (): string | null => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (mode === "signup") {
      if (!name.trim()) return "Full name is required.";
      if (password.length < 6) return "Password must be at least 6 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (mode === "signup") {
        const result = registerUser(name.trim(), email.trim(), password);
        if (result) { setError(result); setLoading(false); }
        else { setSuccess("Account created! Signing you in…"); setTimeout(onSuccess, 800); }
      } else {
        const result = signInUser(email.trim(), password);
        if (result) { setError(result); setLoading(false); }
        else { setSuccess("Welcome back! Redirecting…"); setTimeout(onSuccess, 600); }
      }
    }, 500);
  };

  const strengthLevel = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["transparent", "#f59e0b", "#10b981", "#4f46e5"];
  const strengthLabels = ["", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* Left panel — branding (desktop only) */}
      <div
        className="hidden md:flex md:w-[420px] lg:w-[480px] flex-shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#3730a3 0%,#4f46e5 40%,#7c3aed 100%)" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Glow orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#a78bfa,transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle,#818cf8,transparent 70%)" }} />

        {/* Logo */}
        <div className="relative">
          <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-16 text-sm" style={{ fontWeight: 500 }}>
            <ArrowLeft size={15} /> Back to home
          </button>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Flame size={20} className="text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.04em" }}>NoteForge</span>
          </div>
          <h2 className="text-white mb-3" style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em" }}>
            {mode === "signup" ? "Start writing today." : "Welcome back."}
          </h2>
          <p className="text-white/65" style={{ fontSize: "15px", lineHeight: 1.7 }}>
            {mode === "signup"
              ? "Create your free account and build your personal knowledge base."
              : "Your notebooks are waiting. Sign in to pick up where you left off."}
          </p>
        </div>

        {/* Perks */}
        <div className="relative flex flex-col gap-4">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-white" />
              </div>
              <span className="text-white/85 text-sm" style={{ fontWeight: 500 }}>{text}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/15">
            <div className="flex -space-x-2">
              {["#10b981","#f59e0b","#ec4899","#0ea5e9"].map((c) => (
                <div key={c} className="w-6 h-6 rounded-full border-2 border-white/30" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-white/60 text-xs">2,400+ writers trust NoteForge</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} /> Back
          </button>
          <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            {/* Desktop: back + theme */}
            <div className="hidden md:flex items-center justify-between mb-8">
              <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={14} /> Back to home
              </button>
              <button onClick={toggle} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            {/* Logo on mobile */}
            <div className="flex items-center gap-2.5 mb-7 md:hidden">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                <Flame size={17} className="text-white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.04em" }} className="text-foreground">
                Note<span className="text-primary">Forge</span>
              </span>
            </div>

            <h1 className="text-foreground mb-1.5" style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>
              {mode === "signin" ? "Sign in to your account" : "Create your account"}
            </h1>
            <p className="text-muted-foreground text-sm mb-7">
              {mode === "signin"
                ? "Enter your email and password to access your notebooks."
                : "Join NoteForge free — no credit card required."}
            </p>

            {/* Tab switcher */}
            <div className="flex rounded-2xl p-1 mb-7" style={{ backgroundColor: "var(--muted)" }}>
              {(["signup","signin"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                  style={{
                    fontWeight: 600,
                    backgroundColor: mode === m ? "var(--card)" : "transparent",
                    color: mode === m ? "var(--foreground)" : "var(--muted-foreground)",
                    boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 rounded-2xl px-4 py-3 mb-5">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {mode === "signup" && (
                <Field icon={<User size={15} />} placeholder="Full Name" type="text" value={name} onChange={(v) => { setName(v); setError(""); }} autoComplete="name" />
              )}
              <Field icon={<Mail size={15} />} placeholder="Email address" type="email" value={email} onChange={(v) => { setEmail(v); setError(""); }} autoComplete="email" />
              <Field
                icon={<Lock size={15} />}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(v) => { setPassword(v); setError(""); }}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                suffix={
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              {mode === "signup" && password.length > 0 && (
                <div>
                  <div className="flex gap-1.5 mb-1">
                    {[1,2,3].map((l) => (
                      <div key={l} className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: strengthLevel >= l ? strengthColors[strengthLevel] : "var(--muted)" }} />
                    ))}
                  </div>
                  {strengthLevel > 0 && (
                    <p className="text-xs" style={{ color: strengthColors[strengthLevel] }}>{strengthLabels[strengthLevel]} password</p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <Field
                  icon={<Lock size={15} />}
                  placeholder="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(v) => { setConfirmPassword(v); setError(""); }}
                  autoComplete="new-password"
                  suffix={
                    <button type="button" onClick={() => setShowConfirm((s) => !s)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              )}

              {mode === "signin" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground select-none">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-primary hover:underline" style={{ fontWeight: 500 }}>
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-2xl px-4 py-3 flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">⚠</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full text-white py-3.5 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
                style={{
                  fontWeight: 700, fontSize: "15px",
                  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  boxShadow: "0 4px 20px rgba(79,70,229,0.35)",
                }}
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "signin" ? (
                <>Don't have an account?{" "}
                  <button onClick={() => switchMode("signup")} className="text-primary hover:underline" style={{ fontWeight: 600 }}>Sign Up for free</button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button onClick={() => switchMode("signin")} className="text-primary hover:underline" style={{ fontWeight: 600 }}>Sign In</button>
                </>
              )}
            </p>

            {mode === "signin" && (
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
                <Sparkles size={12} className="text-primary flex-shrink-0" />
                You must sign up before you can sign in. New here?{" "}
                <button onClick={() => switchMode("signup")} className="text-primary hover:underline ml-0.5" style={{ fontWeight: 600 }}>Create an account.</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, type, value, onChange, autoComplete, suffix }: {
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}
