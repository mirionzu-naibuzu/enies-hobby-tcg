"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Menu, PanelLeft, User, BookOpen, Palette, MessageSquare, LogOut, LayoutGrid, Heart, X, Sun, Moon, Check, Bug, Lightbulb, HelpCircle, Coffee } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { getColors, ALL_THEMES } from "@/lib/themes";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { theme, setTheme } = useTheme();
  const [showAppearance, setShowAppearance] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<string | null>(null);
  const [feedbackMood, setFeedbackMood] = useState(2);
  const [feedbackMoodTouched, setFeedbackMoodTouched] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [showSupport, setShowSupport] = useState(false);
  const [supportTab, setSupportTab] = useState<"gcash" | "kofi">("gcash");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isMobile && !expanded) {
      setShowAppearance(false);
    }
  }, [isMobile, expanded]);

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
    { icon: BookOpen,    label: "Binder",   action: () => router.push("/binder"),   show: true, badge: "New"},
    { icon: Menu,        label: "DON!!",    action: () => router.push("/don"),       show: true },
  ];

  const FEEDBACK_CATEGORIES = [
    { value: "Bug", label: "Bug", icon: Bug },
    { value: "Suggestion", label: "Suggestion", icon: Lightbulb },
    { value: "Praise", label: "Praise", icon: Heart },
    { value: "Question", label: "Question", icon: HelpCircle },
  ];
  
  const MOOD_LABELS = ["Frustrated", "Not great", "Okay", "Good", "Delighted"];

  const bottomItems = [
    { icon: Heart,         label: "Support us", action: () => setShowSupport(true) },
    { icon: Palette,       label: "Themes",     action: () => {
        setShowAppearance(prev => {
          const next = !prev;
          if (next) setThemeMode(isDark ? "dark" : "light");
          return next;
        });
      } },
    { icon: MessageSquare, label: "Feedback",   action: () => setShowFeedback(true) },
  ];

  const closeSupport = () => { setShowSupport(false); setSupportTab("gcash"); };
  
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

  const closeFeedback = () => {
    setShowFeedback(false);
    setFeedbackStatus("idle");
    setFeedbackText("");
    setFeedbackCategory(null);
    setFeedbackMood(2);
    setFeedbackMoodTouched(false);
  };
  
  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim() || !feedbackCategory) return;
    setFeedbackStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/mkoenrzy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: feedbackCategory,
          mood: feedbackMoodTouched ? MOOD_LABELS[feedbackMood] : "Not specified",
          message: feedbackText,
        }),
      });
      if (res.ok) {
        setFeedbackStatus("sent");
        setTimeout(() => { closeFeedback(); }, 2000);
      } else {
        setFeedbackStatus("error");
      }
    } catch {
      setFeedbackStatus("error");
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div
        className="mobile-topbar"
        style={{
          background: colors.bg.secondary,
          borderBottom: `1px solid ${colors.border}`,
          height: 64,
          boxSizing: "border-box",
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            title="Toggle sidebar"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary }}
          >
            <PanelLeft size={20} />
          </button>
          {pathname !== "/browse" && (
            <img
              src={colors.isDark ? "/sidebar-logo.png" : "/logo-light.png"}
              alt="Enies Hobby"
              onClick={() => router.push("/")}
              style={{ height: 32, objectFit: "contain", cursor: "pointer" }}
            />
          )}
        </div>
        <button
          onClick={() => {
            setShowAppearance(prev => {
              const next = !prev;
              if (next) setThemeMode(isDark ? "dark" : "light");
              return next;
            });
          }}
          title="Appearance"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.primary }}
        >
          <Palette size={18} />
        </button>
      </div>

      {/* Mobile sidebar backdrop */}
      {isMobile && expanded && (
        <div
          className="sidebar-mobile-backdrop open"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar${expanded ? ' expanded' : ''}`}
        suppressHydrationWarning
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: expanded ? (isMobile ? "min(280px, 85vw)" : 280) : 70,
          background: colors.bg.secondary,
          borderRight: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease",
          overflow: "hidden",
          boxShadow: expanded ? (isDark ? "4px 0 28px rgba(0,0,0,0.5)" : "4px 0 28px rgba(0,0,0,0.12)") : "none",
        }}
      >
        {/* Inner Fixed 280px Container — Ensures icons stay completely stationary during expanding/collapsing */}
        <div className="sidebar-inner" style={{ width: 280, minWidth: 280, height: "100%", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>
          
          {/* Header */}
          <div
            className="sidebar-header"
            style={{
              height: 64,
              boxSizing: "border-box",
              position: "relative",
              borderBottom: `1px solid ${colors.border}`,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* Logo on the left when expanded */}
            <div
              onClick={() => router.push("/")}
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: expanded ? "translateY(-50%) translateX(0)" : "translateY(-50%) translateX(-12px)",
                opacity: expanded ? 1 : 0,
                transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                pointerEvents: expanded ? "auto" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              <img
                src={colors.isDark ? "/sidebar-logo.png" : "/logo-light.png"}
                alt="Enies Hobby Logo"
                style={{
                  height: 32,
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Sidebar toggle icon — centered at x=19 in 70px rail when closed, glides to right (x=232) when open */}
            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Collapse sidebar" : "Expand sidebar"}
              style={{
                position: "absolute",
                top: "50%",
                left: expanded ? 232 : 19,
                transform: expanded ? "translateY(-50%) rotate(180deg)" : "translateY(-50%) rotate(0deg)",
                transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s",
                width: 32,
                height: 32,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text.primary,
                borderRadius: 8,
                padding: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              <PanelLeft size={20} />
            </button>
          </div>

          {/* User Profile */}
          {user && (
            <div
              className="sidebar-profile"
              style={{
                height: 64,
                boxSizing: "border-box",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 70, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div
                  className="sidebar-profile-avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: colors.text.primary,
                    color: colors.bg.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <div
                style={{
                  width: 190,
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? "translateX(0)" : "translateX(-8px)",
                  transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  pointerEvents: expanded ? "auto" : "none",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: colors.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                </div>
                <div style={{ fontSize: 11, color: colors.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="sidebar-nav" style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", gap: 2 }}>
            {menuItems.map((item) => {
              if (item.show === false) return null;
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  title={expanded ? undefined : item.label}
                  className="sidebar-nav-btn"
                  style={{
                    width: "100%",
                    minHeight: 44,
                    padding: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: colors.text.primary,
                    transition: "background 0.15s",
                    textAlign: "left",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <div className="sidebar-icon-wrap" style={{ width: 70, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div
                    className="sidebar-text-wrap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      whiteSpace: "nowrap",
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? "translateX(0)" : "translateX(-8px)",
                      transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      pointerEvents: expanded ? "auto" : "none",
                    }}
                  >
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
                          transform: "translateY(-4px)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="sidebar-bottom" style={{ borderTop: `1px solid ${colors.border}`, padding: "8px 0", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  title={expanded ? undefined : item.label}
                  className="sidebar-bottom-btn"
                  style={{
                    width: "100%",
                    minHeight: 44,
                    padding: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: colors.text.primary,
                    transition: "background 0.15s",
                    textAlign: "left",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.hover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  <div className="sidebar-icon-wrap" style={{ width: 70, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div
                    className="sidebar-text-wrap"
                    style={{
                      whiteSpace: "nowrap",
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? "translateX(0)" : "translateX(-8px)",
                      transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      pointerEvents: expanded ? "auto" : "none",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                  </div>
                </button>
              );
            })}

            {user && (
              <button
                onClick={() => setShowSignOutConfirm(true)}
                title={expanded ? undefined : "Sign Out"}
                className="sidebar-bottom-btn"
                style={{
                  width: "100%",
                  minHeight: 44,
                  padding: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#ef4444",
                  transition: "background 0.15s",
                  textAlign: "left",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >
                <div className="sidebar-icon-wrap" style={{ width: 70, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LogOut size={20} />
                </div>
                <div
                  className="sidebar-text-wrap"
                  style={{
                    whiteSpace: "nowrap",
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? "translateX(0)" : "translateX(-8px)",
                    transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    pointerEvents: expanded ? "auto" : "none",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>Sign Out</span>
                </div>
              </button>
            )}
          </div>
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
      {/* Support Modal */}
{showSupport && (
  <div
    style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    onClick={closeSupport}
  >
    <div
      className="support-modal-content"
      style={{ background: colors.bg.primary, borderRadius: 20, width: "100%", maxWidth: 360, border: `1px solid ${colors.border}`, boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.6)" : "0 32px 64px rgba(0,0,0,0.15)", padding: 24 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Heart size={16} style={{ color: "#ef4444", fill: "#ef4444" }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: colors.text.primary, letterSpacing: "-0.01em" }}>
            Support Enies Hobby
          </span>
        </div>
        <button onClick={closeSupport} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
          <X size={18} color={colors.text.secondary} />
        </button>
      </div>
      <p style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 1.6, margin: "0 0 18px" }}>
        This project is free and always will be. If it&apos;s been useful to you, even a small contribution means a lot.
      </p>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, background: tc.bg.tertiary, padding: 4, borderRadius: 8, marginBottom: 18 }}>
        <button
          onClick={() => setSupportTab("gcash")}
          style={{ flex: 1, padding: "8px 0", borderRadius: 6, background: supportTab === "gcash" ? colors.bg.primary : "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: supportTab === "gcash" ? colors.text.primary : colors.text.secondary, transition: "all 0.2s" }}
        >
          GCash
        </button>
        <button
          onClick={() => setSupportTab("kofi")}
          style={{ flex: 1, padding: "8px 0", borderRadius: 6, background: supportTab === "kofi" ? colors.bg.primary : "transparent", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: supportTab === "kofi" ? colors.text.primary : colors.text.secondary, transition: "all 0.2s" }}
        >
          Ko-fi
        </button>
      </div>

      {/* GCash panel */}
      {supportTab === "gcash" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: isDark ? colors.bg.secondary : "#f9fafb", border: `1px solid ${colors.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ width: 160, height: 160, borderRadius: 10, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}` }}>
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
      )}

      {/* Ko-fi panel */}
      {supportTab === "kofi" && (
          <a
          href="https://ko-fi.com/millionsknives47476"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 0", borderRadius: 12, background: "#FF5E5B", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "opacity 0.2s", letterSpacing: "0.01em" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <Coffee size={15}  />Buy me a Coffee
        </a>
      )}
    </div>
  </div>
)}
        {/* Feedback Modal */}
        {showFeedback && (
          <div
            style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={closeFeedback}
          >
            <div
              className="feedback-modal-content"
              style={{ background: colors.bg.primary, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, border: `1px solid ${colors.border}`, boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: colors.text.primary, marginBottom: 4 }}>Share your feedback</div>
                <div style={{ fontSize: 13, color: colors.text.secondary }}>Help us improve Enies Hobby.</div>
              </div>

              {feedbackStatus === "sent" ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: colors.text.primary }}>Thanks!</div>
                  <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>Your feedback was sent.</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text.secondary, marginBottom: 8 }}>What&apos;s this about?</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
                    {FEEDBACK_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = feedbackCategory === cat.value;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => setFeedbackCategory(cat.value)}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            padding: "12px 4px", borderRadius: 10, cursor: "pointer",
                            border: active ? "1.5px solid #ef4444" : `1px solid ${colors.border}`,
                            background: active ? (isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)") : "transparent",
                            transition: "all 0.15s",
                          }}
                        >
                          <Icon size={18} color={active ? "#ef4444" : colors.text.secondary} />
                          <span style={{ fontSize: 11, fontWeight: 500, color: active ? "#ef4444" : colors.text.secondary }}>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <style>{`
                    .feedback-mood-range {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 100%;
                      height: 4px;
                      border-radius: 999px;
                      background: ${colors.border};
                      outline: none;
                      cursor: pointer;
                    }
                    .feedback-mood-range::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: ${colors.bg.primary};
                      border: 1.5px solid ${colors.border};
                      cursor: pointer;
                    }
                    .feedback-mood-range::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: ${colors.bg.primary};
                      border: 1.5px solid ${colors.border};
                      cursor: pointer;
                      box-sizing: border-box;
                    }
                    .feedback-mood-range::-moz-range-track {
                      height: 4px;
                      border-radius: 999px;
                      background: ${colors.border};
                    }
                  `}</style>

                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text.secondary, marginBottom: 10 }}>
                    How do you feel? <span style={{ color: colors.text.secondary, fontWeight: 400 }}>(optional)</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: colors.text.primary, marginBottom: 8 }}>
                    {MOOD_LABELS[feedbackMood]}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={feedbackMood}
                    onChange={(e) => { setFeedbackMood(Number(e.target.value)); setFeedbackMoodTouched(true); }}
                    className="feedback-mood-range"
                    style={{ marginBottom: 6 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: colors.text.secondary, marginBottom: 20 }}>
                    <span>Frustrated</span>
                    <span>Delighted</span>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text.secondary, marginBottom: 8 }}>Tell us more</div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Type your feedback here..."
                    rows={4}
                    style={{ width: "100%", padding: "12px 14px", fontSize: 13, borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.bg.secondary, color: colors.text.primary, resize: "none", outline: "none", marginBottom: 20, lineHeight: 1.6, fontFamily: "inherit", transition: "border-color 0.2s" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#ef4444"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                  />

                  {feedbackStatus === "error" && (
                    <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>Something went wrong. Try again.</div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={closeFeedback}
                      style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 600, border: `1.5px solid ${colors.border}`, background: "transparent", color: colors.text.primary, borderRadius: 8, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackText.trim() || !feedbackCategory || feedbackStatus === "sending"}
                      style={{ flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 600, border: "none", background: (feedbackText.trim() && feedbackCategory) ? "#ef4444" : (isDark ? "#374151" : "#e5e7eb"), color: (feedbackText.trim() && feedbackCategory) ? "#fff" : colors.text.secondary, borderRadius: 8, cursor: (feedbackText.trim() && feedbackCategory) ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                    >
                      {feedbackStatus === "sending" ? "Sending..." : "Send"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Overlay (desktop only — mobile uses sidebar-mobile-backdrop) */}
      {expanded && !isMobile && (
        <div 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 45 }}
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Themes Panel */}
      {showAppearance && (
        <div onClick={() => setShowAppearance(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={isMobile ? 'theme-popover-mobile' : ''}
            style={{
              position: isMobile ? undefined : "absolute",
              left: isMobile ? undefined : (expanded ? 292 : 82),
              bottom: isMobile ? undefined : 100,
              width: isMobile ? undefined : 280,
              maxHeight: isMobile ? undefined : "calc(100vh - 120px)",
              overflowY: isMobile ? undefined : "auto",
              scrollbarWidth: "thin",
              background: colors.bg.primary,
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
              borderRadius: 16,
              padding: 16,
              boxShadow: isDark
                ? "0 16px 36px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)"
                : "0 16px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header */}
            <div style={{ fontWeight: 700, marginBottom: 2, color: colors.text.primary, fontSize: 14 }}>Themes</div>
            <div style={{ fontSize: 11, color: colors.text.secondary, marginBottom: 14 }}>Choose a theme for your experience</div>

            {/* Mode switcher */}
            <div style={{ display: "flex", gap: 4, background: tc.bg.tertiary, padding: 4, borderRadius: 8, marginBottom: 12 }}>
              <button
                onClick={() => setThemeMode("light")}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: themeMode === "light" ? colors.bg.primary : "transparent", color: themeMode === "light" ? colors.text.primary : colors.text.secondary, transition: "all 0.2s" }}
              >
                <Sun size={13} /> Light
              </button>
              <button
                onClick={() => setThemeMode("dark")}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: themeMode === "dark" ? colors.bg.primary : "transparent", color: themeMode === "dark" ? colors.text.primary : colors.text.secondary, transition: "all 0.2s" }}
              >
                <Moon size={13} /> Dark
              </button>
            </div>

            {/* Single-column theme rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ALL_THEMES.filter((t) => t.preview.dark === (themeMode === "dark")).map((t) => {
                const isActive = theme === t.value;
                return (
                  <div
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 8,
                      borderRadius: 10,
                      cursor: "pointer",
                      border: isActive ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                      background: isActive ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)") : "transparent",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <div style={{ width: 48, height: 34, borderRadius: 6, background: t.preview.bg, position: "relative", overflow: "hidden", flexShrink: 0, border: `1px solid ${colors.border}` }}>
                      <div style={{ position: "absolute", top: 5, left: 5, width: 24, height: 4, borderRadius: 2, background: t.preview.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
                      <div style={{ position: "absolute", bottom: 5, right: 5, width: 14, height: 4, borderRadius: 2, background: t.preview.bar }} />
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? colors.accent : colors.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.name}
                    </span>
                    {isActive && <Check size={15} color={colors.accent} strokeWidth={3} />}
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