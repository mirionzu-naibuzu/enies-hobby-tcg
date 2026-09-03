"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Menu, PanelLeft, User, BookOpen, Palette, MessageSquare, LogOut, LayoutGrid, LayoutDashboard, Heart, X, Sun, Moon, Check, Bug, Lightbulb, HelpCircle, Coffee, Sparkles } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import Toast, { ToastData, ToastType } from "@/components/Toast";
import DonIcon from "@/components/DonIcon";
import { getColors, ALL_THEMES } from "@/lib/themes";
import { hasGuestData, syncGuestToCloud } from "@/lib/guestStorage";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { theme, setTheme } = useTheme();
  const [showAppearance, setShowAppearance] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<string | null>(null);
  const [feedbackMood, setFeedbackMood] = useState(2);
  const [feedbackMoodTouched, setFeedbackMoodTouched] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sending" | "error">("idle");
  const [showSupport, setShowSupport] = useState(false);
  const [supportTab, setSupportTab] = useState<"gcash" | "kofi">("gcash");
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, toast.type === "celebrate" ? 3200 : 2500);
    return () => clearTimeout(timer);
  }, [toast]);

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
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && hasGuestData()) {
        const res = await syncGuestToCloud(currentUser.id);
        if (res.syncedCards > 0 || res.syncedBinders > 0) {
          showToast(`Synced ${res.syncedCards} cards & ${res.syncedBinders} binders to your account!`, "celebrate");
        }
      }
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
    { icon: User,        label: "Sign In",  action: () => { setShowAuth(true); }, show: !authLoading && !user },
    { icon: LayoutDashboard, label: "Dashboard", action: () => router.push("/dashboard"), show: true },
    { icon: LayoutGrid,  label: "Browse",   action: () => router.push("/browse"),   show: true },
    { icon: BookOpen,    label: "Binder",   action: () => router.push("/binder"),   show: true },
    { icon: DonIcon,     label: "DON!!",    action: () => router.push("/don"),       show: true },
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

  const handleSwitchThemeMode = (newMode: "light" | "dark") => {
    setThemeMode(newMode);
    if (theme) {
      if (newMode === "dark" && !theme.includes("dark")) {
        const darkEquivalent = theme === "light" ? "dark" : `${theme.replace("-light", "")}-dark`;
        if (ALL_THEMES.some(t => t.value === darkEquivalent)) {
          setTheme(darkEquivalent);
        } else {
          setTheme("dark");
        }
      } else if (newMode === "light" && (theme.includes("dark") || theme === "dark")) {
        const lightEquivalent = theme === "dark" ? "light" : `${theme.replace("-dark", "")}-light`;
        if (ALL_THEMES.some(t => t.value === lightEquivalent)) {
          setTheme(lightEquivalent);
        } else {
          setTheme("light");
        }
      }
    }
  };

  useEffect(() => {
    setThemeMode(isDark ? "dark" : "light");
  }, [theme, isDark]);

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
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: feedbackCategory,
          mood: feedbackMoodTouched ? MOOD_LABELS[feedbackMood] : "Not specified",
          message: feedbackText.trim(),
          userEmail: user?.email || null,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      if (res.ok) {
        closeFeedback();
        showToast("Thanks for your feedback!", "celebrate");
      } else {
        setFeedbackStatus("error");
      }
    } catch {
      setFeedbackStatus("error");
    }
  };

  useEffect(() => {
    const handleToggle = () => setExpanded((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-topbar bg-bg-secondary border-b border-border-theme h-16 box-border px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            title="Toggle sidebar"
            className="bg-transparent border-0 cursor-pointer p-1 flex items-center justify-center text-text-primary"
          >
            <PanelLeft size={20} />
          </button>
          {pathname !== "/browse" && pathname !== "/don" && pathname !== "/binder" && pathname !== "/dashboard" && (
            <img
              src="/logo-light.png"
              alt="Enies Hobby"
              onClick={() => router.push("/")}
              className="h-8 object-contain cursor-pointer"
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
          className="bg-transparent border-0 cursor-pointer p-1 flex items-center justify-center text-text-primary"
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
        className={`app-sidebar fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden bg-bg-secondary border-r border-border-theme transition-[width,box-shadow] duration-350 ease-in-out ${
          expanded
            ? "expanded w-[min(280px,85vw)] md:w-70 shadow-[4px_0_28px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_28px_rgba(0,0,0,0.5)]"
            : "w-17.5 shadow-none"
        }`}
        style={{
          background: colors.bg.secondary,
          borderColor: colors.border,
        }}
        suppressHydrationWarning
      >
        {/* Inner Fixed 280px Container — Ensures icons stay completely stationary during expanding/collapsing */}
        <div className="sidebar-inner w-70 min-w-70 h-full flex flex-col overflow-y-auto overflow-x-hidden">
          
          {/* Header */}
          <div className="sidebar-header h-16 box-border relative border-b border-border-theme overflow-hidden shrink-0">
            {/* Logo on the left when expanded */}
            <div
              onClick={() => router.push("/")}
              className={`absolute left-4 top-1/2 flex items-center whitespace-nowrap cursor-pointer transition-[opacity,transform] duration-250 ease-in-out ${
                expanded
                  ? "-translate-y-1/2 translate-x-0 opacity-100 pointer-events-auto"
                  : "-translate-y-1/2 -translate-x-3 opacity-0 pointer-events-none"
              }`}
            >
              <img
                src="/logo-light.png"
                alt="Enies Hobby Logo"
                className="h-8 object-contain"
              />
            </div>

            {/* Sidebar toggle icon — centered at x=19 in 70px rail when closed, glides to right (x=232) when open */}
            <button
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Collapse sidebar" : "Expand sidebar"}
              className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center p-0 cursor-pointer bg-transparent border-0 text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-[left,transform,background] duration-350 ease-in-out ${
                expanded ? "left-58 rotate-180" : "left-4.75 rotate-0"
              }`}
            >
              <PanelLeft size={20} />
            </button>
          </div>

          {/* User Profile */}
          {user && (
            <div className="sidebar-profile h-16 box-border border-b border-border-theme flex items-center shrink-0">
              <div className="w-17.5 h-full flex items-center justify-center shrink-0">
                <div className="sidebar-profile-avatar w-9 h-9 rounded-full bg-text-primary text-bg-primary flex items-center justify-center font-bold text-[15px]">
                  {user.email?.[0].toUpperCase()}
                </div>
              </div>
              <div
                className={`w-47.5 overflow-hidden transition-[opacity,transform] duration-250 ease-in-out ${
                  expanded
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 -translate-x-2 pointer-events-none"
                }`}
              >
                <div className="font-bold text-[13px] text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                </div>
                <div className="text-[11px] text-text-tertiary whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="sidebar-nav flex-1 py-2 flex flex-col gap-0.5">
            {menuItems.map((item) => {
              if (item.show === false) return null;
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  title={expanded ? undefined : item.label}
                  className="sidebar-nav-btn w-full min-h-11 p-0 bg-transparent border-0 cursor-pointer flex items-center text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left shrink-0"
                >
                  <div className="sidebar-icon-wrap w-17.5 h-11 flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <div
                    className={`sidebar-text-wrap flex items-center gap-1.5 whitespace-nowrap transition-[opacity,transform] duration-250 ease-in-out ${
                      expanded
                        ? "opacity-100 translate-x-0 pointer-events-auto"
                        : "opacity-0 -translate-x-2 pointer-events-none"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="sidebar-bottom border-t border-border-theme py-2 flex flex-col gap-0.5 shrink-0">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  title={expanded ? undefined : item.label}
                  className="sidebar-bottom-btn w-full min-h-11 p-0 bg-transparent border-0 cursor-pointer flex items-center text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left shrink-0"
                >
                  <div className="sidebar-icon-wrap w-17.5 h-11 flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <div
                    className={`sidebar-text-wrap whitespace-nowrap transition-[opacity,transform] duration-250 ease-in-out ${
                      expanded
                        ? "opacity-100 translate-x-0 pointer-events-auto"
                        : "opacity-0 -translate-x-2 pointer-events-none"
                    }`}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}

            {user && (
              <button
                onClick={() => setShowSignOutConfirm(true)}
                title={expanded ? undefined : "Sign Out"}
                className="sidebar-bottom-btn w-full min-h-11 p-0 bg-transparent border-0 cursor-pointer flex items-center text-red-500 hover:bg-red-500/10 transition-colors text-left shrink-0"
              >
                <div className="sidebar-icon-wrap w-17.5 h-11 flex items-center justify-center shrink-0">
                  <LogOut size={20} />
                </div>
                <div
                  className={`sidebar-text-wrap whitespace-nowrap transition-[opacity,transform] duration-250 ease-in-out ${
                    expanded
                      ? "opacity-100 translate-x-0 pointer-events-auto"
                      : "opacity-0 -translate-x-2 pointer-events-none"
                  }`}
                >
                  <span className="text-sm font-medium">Sign Out</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Sign Out Confirm */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSignOutConfirm(false)}
        >
          <div
            className="bg-bg-primary rounded-2xl p-8 w-full max-w-[320px] shadow-2xl border border-border-theme text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <div className="font-black text-xl text-text-primary mb-2">Sign Out?</div>
              <div className="text-sm text-text-tertiary">Are you sure you want to sign out of your account?</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-3 text-sm font-semibold border-[1.5px] border-border-theme bg-transparent text-text-primary rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="flex-1 py-3 text-sm font-semibold border-0 bg-red-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={closeSupport}
        >
          <div
            className="support-modal-content bg-bg-primary text-text-primary rounded-[20px] w-full max-w-90 border border-border-theme shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-500 fill-red-500" />
                <span className="text-[17px] font-bold text-text-primary tracking-[-0.01em]">
                  Support Enies Hobby
                </span>
              </div>
              <button onClick={closeSupport} className="bg-transparent border-0 cursor-pointer p-0 flex text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-text-tertiary leading-relaxed mb-4.5 mt-0">
              This project is free and always will be. If it&apos;s been useful to you, even a small contribution means a lot.
            </p>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-bg-tertiary p-1 rounded-lg mb-4.5">
              <button
                onClick={() => setSupportTab("gcash")}
                className={`flex-1 py-2 rounded-md border-0 cursor-pointer text-[13px] font-semibold transition-all ${
                  supportTab === "gcash" ? "bg-bg-primary text-text-primary shadow-sm" : "bg-transparent text-text-tertiary"
                }`}
              >
                GCash
              </button>
              <button
                onClick={() => setSupportTab("kofi")}
                className={`flex-1 py-2 rounded-md border-0 cursor-pointer text-[13px] font-semibold transition-all ${
                  supportTab === "kofi" ? "bg-bg-primary text-text-primary shadow-sm" : "bg-transparent text-text-tertiary"
                }`}
              >
                Ko-fi
              </button>
            </div>

            {/* GCash panel */}
            {supportTab === "gcash" && (
              <div className="flex flex-col items-center gap-2.5 bg-bg-secondary border border-border-theme rounded-2xl p-4">
                <div className="w-40 h-40 rounded-[10px] overflow-hidden bg-white flex items-center justify-center border border-border-theme">
                  <img
                    src="/gcash-qr.png"
                    alt="GCash QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = '<span class="text-[11px] text-gray-400 text-center p-3">QR not available</span>';
                    }}
                  />
                </div>
                <span className="text-[11px] text-text-tertiary">Scan with your GCash app</span>
              </div>
            )}

            {/* Ko-fi panel */}
            {supportTab === "kofi" && (
              <a
                href="https://ko-fi.com/millionsknives47476"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FF5E5B] text-white text-sm font-semibold no-underline hover:opacity-90 transition-opacity tracking-[0.01em]"
              >
                <Coffee size={15} />
                <span>Buy me a Coffee</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeFeedback}
        >
          <div
            className="feedback-modal-content bg-bg-primary text-text-primary rounded-2xl p-7 w-full max-w-100 border border-border-theme shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <div className="font-bold text-lg text-text-primary mb-1">Share your feedback</div>
              <div className="text-[13px] text-text-tertiary">Help us improve Enies Hobby.</div>
            </div>

            <div className="text-xs font-semibold text-text-tertiary mb-2">What&apos;s this about?</div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {FEEDBACK_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = feedbackCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setFeedbackCategory(cat.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-[10px] cursor-pointer transition-all ${
                      active
                        ? "border-[1.5px] border-red-500 bg-red-500/10 text-red-500"
                        : "border border-border-theme bg-transparent text-text-tertiary hover:border-text-tertiary"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[11px] font-medium">{cat.label}</span>
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

            <div className="text-xs font-semibold text-text-tertiary mb-2.5">
              How do you feel? <span className="font-normal text-text-tertiary">(optional)</span>
            </div>
            <div className="text-center text-[13px] font-semibold text-text-primary mb-2">
              {MOOD_LABELS[feedbackMood]}
            </div>
            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={feedbackMood}
              onChange={(e) => { setFeedbackMood(Number(e.target.value)); setFeedbackMoodTouched(true); }}
              className="feedback-mood-range mb-1.5"
            />
            <div className="flex justify-between text-[11px] text-text-tertiary mb-5">
              <span>Frustrated</span>
              <span>Delighted</span>
            </div>

            <div className="text-xs font-semibold text-text-tertiary mb-2">Tell us more</div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Type your feedback here..."
              rows={4}
              className="w-full p-3.5 text-[13px] rounded-[10px] border border-border-theme bg-bg-secondary text-text-primary resize-none outline-none mb-5 leading-relaxed font-inherit transition-colors focus:border-red-500"
            />

            {feedbackStatus === "error" && (
              <div className="text-xs text-red-500 mb-2.5">Something went wrong. Try again.</div>
            )}

            <div className="flex gap-2">
              <button
                onClick={closeFeedback}
                className="flex-1 py-2.5 text-[13px] font-semibold border-[1.5px] border-border-theme bg-transparent text-text-primary rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackText.trim() || !feedbackCategory || feedbackStatus === "sending"}
                className={`flex-1 py-2.5 text-[13px] font-semibold border-0 rounded-lg transition-all ${
                  feedbackText.trim() && feedbackCategory && feedbackStatus !== "sending"
                    ? "bg-red-500 text-white cursor-pointer hover:opacity-90"
                    : "bg-gray-300 dark:bg-gray-700 text-text-tertiary cursor-not-allowed"
                }`}
              >
                {feedbackStatus === "sending" ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay (desktop only — mobile uses sidebar-mobile-backdrop) */}
      {expanded && !isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 z-45"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Themes Panel */}
      {showAppearance && (
        <div onClick={() => setShowAppearance(false)} className="fixed inset-0 z-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-bg-primary text-text-primary border border-border-theme/40 rounded-2xl p-4 shadow-2xl ${
              isMobile
                ? "theme-popover-mobile"
                : "absolute bottom-25 w-70 max-h-[calc(100vh-120px)] overflow-y-auto [scrollbar-width:thin]"
            }`}
            style={{ left: isMobile ? undefined : (expanded ? 292 : 82) }}
          >
            {/* Header */}
            <div className="font-bold mb-0.5 text-text-primary text-sm">Themes</div>
            <div className="text-[11px] text-text-tertiary mb-3.5">Choose a theme for your experience</div>

            {/* Mode switcher */}
            <div className="flex gap-1 bg-bg-tertiary p-1 rounded-lg mb-3">
              <button
                onClick={() => handleSwitchThemeMode("light")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border-0 cursor-pointer text-xs font-semibold transition-all ${
                  themeMode === "light" ? "bg-bg-primary text-text-primary shadow-sm" : "bg-transparent text-text-tertiary"
                }`}
              >
                <Sun size={13} /> Light
              </button>
              <button
                onClick={() => handleSwitchThemeMode("dark")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md border-0 cursor-pointer text-xs font-semibold transition-all ${
                  themeMode === "dark" ? "bg-bg-primary text-text-primary shadow-sm" : "bg-transparent text-text-tertiary"
                }`}
              >
                <Moon size={13} /> Dark
              </button>
            </div>

            {/* Single-column theme rows */}
            <div className="flex flex-col gap-1.5">
              {ALL_THEMES.filter((t) => t.preview.dark === (themeMode === "dark")).map((t) => {
                const isActive = theme === t.value;
                return (
                  <div
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`flex items-center gap-2.5 p-2 rounded-[10px] cursor-pointer transition-all ${
                      isActive
                        ? "border-[1.5px] border-accent-theme bg-accent-theme/10 text-accent-theme"
                        : "border border-border-theme bg-transparent hover:border-text-tertiary"
                    }`}
                  >
                    <div
                      className="w-12 h-8.5 rounded-md relative overflow-hidden shrink-0 border border-border-theme"
                      style={{ background: t.preview.bg }}
                    >
                      <div
                        className="absolute top-1.25 left-1.25 w-6 h-1 rounded-sm"
                        style={{ background: t.preview.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }}
                      />
                      <div
                        className="absolute bottom-1.25 right-1.25 w-3.5 h-1 rounded-sm"
                        style={{ background: t.preview.bar }}
                      />
                    </div>
                    <span className="flex-1 text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {t.name}
                    </span>
                    {isActive && <Check size={15} className="text-accent-theme stroke-3" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} isDark={isDark} />
    </>
  );
}