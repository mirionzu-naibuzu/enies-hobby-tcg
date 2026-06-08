"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Menu, PanelLeft, User, Bookmark, Palette, MessageSquare, LogOut, LayoutGrid, Heart, Badge } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { getColors, ALL_THEMES } from "@/lib/themes";

export default function Sidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { theme, setTheme } = useTheme();
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const colors = {
    bg: {
      primary:   tc.bg.primary,
      secondary: tc.bg.secondary,
    },
    text: {
      primary:   tc.text.primary,
      secondary: tc.text.tertiary,
    },
    border: tc.border,
    hover:  isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    accent: tc.accent,
    isDark: tc.isDark
  };

  const menuItems = [
    { icon: User,        label: "Sign In",  action: () => { setAuthMode("login"); setShowAuth(true); }, show: !user },
    { icon: LayoutGrid,  label: "Browse",   action: () => router.push("/browse"),   show: true },
    { icon: Bookmark,    label: "Binder",   action: () => router.push("/binder"),   show: true, badge: "New"},
    { icon: Menu,        label: "DON!!",    action: () => router.push("/don"),       show: true },
  ];

  const bottomItems = [
    { icon: Heart,         label: "Support us", action: () => setShowSupport(true) },
    { icon: Palette,       label: "Themes",     action: () => setShowAppearance(prev => !prev) },
    { icon: MessageSquare, label: "Feedback",   action: () => setShowFeedback(true) },
  ];

  const handleConfirmSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setExpanded(false);
    setShowSignOutConfirm(false);
  };

  // Pair themes: [light, dark] per row
  const themePairs: (typeof ALL_THEMES)[] = [];
  for (let i = 0; i < ALL_THEMES.length; i += 2) {
    themePairs.push(ALL_THEMES.slice(i, i + 2));
  }

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/mkoenrzy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackText }),
      });
      if (res.ok) {
        setFeedbackStatus("sent");
        setFeedbackText("");
        setTimeout(() => { setShowFeedback(false); setFeedbackStatus("idle"); }, 2000);
      } else {
        setFeedbackStatus("error");
      }
    } catch {
      setFeedbackStatus("error");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        style={{
          position: "fixed", left: 0, top: 0, height: "100vh",
          width: expanded ? 280 : 70,
          background: colors.bg.secondary,
          borderRight: `1px solid ${colors.border}`,
          display: "flex", flexDirection: "column",
          zIndex: 40, transition: "width 0.3s ease", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: expanded ? "space-between" : "center", padding: "16px 12px", borderBottom: `1px solid ${colors.border}` }}>
          {expanded && (
            <div
            onClick={() => router.push("/")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <img
              src={colors.isDark
                ? "/sidebar-logo.png"
                : "/logo-light.png"}
              alt="Enies Hobby Logo"
              style={{
                height: 40,
                objectFit: "contain",
                transition: "opacity 0.3s ease",
              }}
            />
          </div>
          
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 5.5, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary }}
          >
            <PanelLeft size={20} style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }} />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div style={{ padding: "16px 12px", borderBottom: `1px solid ${colors.border}`, display: "flex", flexDirection: "row", alignItems: expanded ? "flex-start" : "center", gap: expanded ? 12 : 0 }}>
            <div style={{ width: 45, height: 45, borderRadius: "50%", background: colors.text.primary, color: colors.bg.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
              {user.email?.[0].toUpperCase()}
            </div>
            {expanded && (
              <div style={{ width: "70%" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: colors.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                </div>
                <div style={{ fontSize: 12, color: colors.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", display: "flex", flexDirection: "column" }}>
        {menuItems.map((item) => {
  if (item.show === false) return null;
  const Icon = item.icon;

  return (
    <button
      key={item.label}
      onClick={item.action}
      title={item.label}
      style={{
        width: "100%",
        padding: "12px",
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: colors.text.primary,
        transition: "all 0.2s",
        justifyContent: expanded ? "flex-start" : "center",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = colors.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      <Icon size={20} />

      {expanded && (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
    <span style={{ fontSize: 14, fontWeight: 500 }}>
      {item.label}
    </span>

    {item.badge && (
      <span
        style={{
          fontSize: 9,
          lineHeight: 1,
          padding: "2px 5px",
          borderRadius: 999,
          background: "#ef4444",
          color: "#fff",
          fontWeight: 700,
          transform: "translateY(-4px)", // 👈 makes it "exponent-like"
        }}
      >
        {item.badge}
      </span>
    )}
  </div>
)}
    </button>
  );
})}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${colors.border}`, padding: "12px 0", display: "flex", flexDirection: "column" }}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={item.action} title={item.label}
                style={{ width: "100%", padding: "12px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: colors.text.primary, transition: "all 0.2s", justifyContent: expanded ? "flex-start" : "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >
                <Icon size={20} />
                {expanded && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
              </button>
            );
          })}

          {user && (
            <button onClick={() => setShowSignOutConfirm(true)} title="Sign Out"
              style={{ width: "100%", padding: "12px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "#ef4444", transition: "all 0.2s", justifyContent: expanded ? "flex-start" : "center" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              <LogOut size={20} />
              {expanded && <span style={{ fontSize: 14, fontWeight: 500 }}>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Auth Modal */}
      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />}

      {/* Sign Out Confirm */}
      {showSignOutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div style={{ background: colors.bg.primary, borderRadius: 16, padding: 32, width: "100%", maxWidth: 320, boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.2)", border: `1px solid ${colors.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: colors.text.primary, marginBottom: 8 }}>Sign Out?</div>
              <div style={{ fontSize: 14, color: colors.text.secondary }}>Are you sure you want to sign out of your account?</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowSignOutConfirm(false)}
                style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, border: `1.5px solid ${colors.border}`, background: "transparent", color: colors.text.primary, borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >Cancel</button>
              <button onClick={handleConfirmSignOut}
                style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 600, border: "none", background: "#ef4444", color: "white", borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div
          style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowSupport(false)}
        >
          <div
            style={{ background: colors.bg.primary, borderRadius: 20, width: "100%", maxWidth: 380, border: `1px solid ${colors.border}`, boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.6)" : "0 32px 64px rgba(0,0,0,0.15)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: "24px 24px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Heart size={16} style={{ color: "#ef4444", fill: "#ef4444" }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: colors.text.primary, letterSpacing: "-0.01em" }}>
                  Support OPTCG
                </span>
              </div>
              <p style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 1.6, margin: "0 0 20px" }}>
                This project is free and always will be. If it's been useful to you, even a small contribution means a lot.
              </p>
            </div>

            <div style={{ height: "0.5px", background: colors.border }} />

            {/* GCash */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#007bff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>G</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary }}>GCash</span>
                <span style={{ fontSize: 11, color: colors.text.secondary, marginLeft: 2 }}>· Philippines</span>
              </div>
              <div style={{ background: isDark ? colors.bg.secondary : "#f9fafb", border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 180, height: 180, borderRadius: 10, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}` }}>
                  <img
                    src="/gcash-qr.png"
                    alt="GCash QR Code"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = '<span style="font-size:11px;color:#9ca3af;text-align:center;padding:12px">QR not available</span>';
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: colors.text.secondary }}>Scan with your GCash app</span>
              </div>
            </div>

            {/* OR divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", marginBottom: 20 }}>
              <div style={{ flex: 1, height: "0.5px", background: colors.border }} />
              <span style={{ fontSize: 11, color: colors.text.secondary, fontWeight: 500 }}>OR</span>
              <div style={{ flex: 1, height: "0.5px", background: colors.border }} />
            </div>

            {/* Ko-fi */}
            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#FF5E5B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11 }}>☕</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary }}>Ko-fi</span>
                <span style={{ fontSize: 11, color: colors.text.secondary, marginLeft: 2 }}>· International</span>
              </div>
              <a
                href="https://ko-fi.com/YOUR_KOFI_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 0", borderRadius: 12, background: "#FF5E5B", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s", letterSpacing: "0.01em" }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <span>☕</span>
                Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      )}
        {/* Feedback Modal */}
        {showFeedback && (
          <div
            style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => { setShowFeedback(false); setFeedbackStatus("idle"); setFeedbackText(""); }}
          >
            <div
              style={{ background: colors.bg.primary, borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, border: `1px solid ${colors.border}`, boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: colors.text.primary, marginBottom: 4 }}>Send feedback</div>
                <div style={{ fontSize: 13, color: colors.text.secondary }}>What's on your mind? Bugs, ideas, or anything else.</div>
              </div>
              {feedbackStatus === "sent" ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: colors.text.primary }}>Thanks!</div>
                  <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>Your feedback was sent.</div>
                </div>
              ) : (
                <>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Type your feedback here..."
                    rows={5}
                    style={{ width: "100%", padding: "12px 14px", fontSize: 13, borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.bg.secondary, color: colors.text.primary, resize: "none", outline: "none", marginBottom: 12, lineHeight: 1.6, fontFamily: "inherit", transition: "border-color 0.2s" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#ef4444"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                  />
                  {feedbackStatus === "error" && (
                    <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>Something went wrong. Try again.</div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setShowFeedback(false); setFeedbackStatus("idle"); setFeedbackText(""); }}
                      style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 600, border: `1.5px solid ${colors.border}`, background: "transparent", color: colors.text.primary, borderRadius: 8, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackText.trim() || feedbackStatus === "sending"}
                      style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 600, border: "none", background: feedbackText.trim() ? "#ef4444" : (isDark ? "#374151" : "#e5e7eb"), color: feedbackText.trim() ? "#fff" : colors.text.secondary, borderRadius: 8, cursor: feedbackText.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                    >
                      {feedbackStatus === "sending" ? "Sending..." : "Send"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      {/* Overlay */}
      {expanded && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 30 }}
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Themes Panel */}
      {showAppearance && (
        <div onClick={() => setShowAppearance(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: expanded ? 292 : 82,
              bottom: 100,
              width: 320,
              background: colors.bg.primary,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 16,
              boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.6)" : "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header */}
            <div style={{ fontWeight: 700, marginBottom: 2, color: colors.text.primary, fontSize: 14 }}>Themes</div>
            <div style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 14 }}>Choose a theme for your experience</div>

            {/* Column labels */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: colors.text.secondary, textAlign: "center" as const }}>Light</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: colors.text.secondary, textAlign: "center" as const }}>Dark</div>
            </div>

            {/* Paired grid — 2 columns, light left / dark right */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ALL_THEMES.map((t) => {
                const isActive = theme === t.value;
                return (
                  <div
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    style={{
                      borderRadius: 10,
                      padding: 7,
                      cursor: "pointer",
                      border: isActive ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                      transition: "all 0.2s",
                      background: isActive
                        ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    {/* Preview swatch */}
                    <div style={{ height: 44, borderRadius: 6, background: t.preview.bg, position: "relative", overflow: "hidden", padding: 6 }}>
                      {/* Fake header bar */}
                      <div style={{ height: 5, width: "65%", borderRadius: 3, background: t.preview.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)", marginBottom: 5 }} />
                      {/* Fake card rect */}
                      <div style={{ height: 12, width: 12, borderRadius: 3, background: t.preview.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />
                      {/* Accent bar */}
                      <div style={{ position: "absolute", bottom: 6, right: 6, height: 5, width: 26, borderRadius: 4, background: t.preview.bar }} />
                      {/* Active check */}
                      {isActive && (
                        <div style={{ position: "absolute", top: 4, right: 4, width: 13, height: 13, borderRadius: "50%", background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700 }}>✓</div>
                      )}
                    </div>
                    <div style={{ fontSize: 9, textAlign: "center" as const, marginTop: 5, color: isActive ? colors.accent : colors.text.secondary, fontWeight: isActive ? 700 : 400, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}