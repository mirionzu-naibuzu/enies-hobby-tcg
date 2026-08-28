"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { X, Eye, EyeOff, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { getColors } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface Props {
  onClose: () => void;
  initialMode?: "login" | "signup";
}

const subscribeToMounted = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export default function AuthModal({ onClose, initialMode = "login" }: Props) {
  useBodyScrollLock(true);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [suggestSignup, setSuggestSignup] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { theme } = useTheme();
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        onClose();
        window.location.reload();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, onClose]);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const colors = {
    bg: {
      primary: tc.bg.primary,
      secondary: tc.bg.secondary,
    },
    text: {
      primary: tc.text.primary,
      secondary: tc.text.tertiary,
    },
    border: tc.border,
    error: "#ef4444",
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (mode === "signup" && !termsAccepted) {
      setError("Please accept the terms and privacy policy");
      return;
    }

    setLoading(true);
    setError("");
    setSuggestSignup(false);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setStep("verify");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError(
            "Account not found or password incorrect. Would you like to create an account instead?"
          );
          setSuggestSignup(true);
        } else {
          setError(error.message);
        }
      } else if (data.user) {
        onClose();
        window.location.reload();
      }
    }

    setLoading(false);
  };

  return (
    <div
      suppressHydrationWarning
      style={{
        position: "fixed",
        inset: 0,
        background: isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="auth-modal-content"
        style={{
          background: colors.bg.primary,
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 420,
          boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.2)",
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 24, color: colors.text.primary }}>
              Welcome to Enies Hobby
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X
              style={{
                width: 24,
                height: 24,
                color: colors.text.secondary,
              }}
            />
          </button>
        </div>

        {resetSent ? (
          <div style={{ textAlign: "center", padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                color: tc.accent,
              }}
            >
              <KeyRound size={30} strokeWidth={1.8} />
            </div>

            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Password reset sent
            </div>

            <div
              style={{
                fontSize: 13,
                color: colors.text.secondary,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              We sent a password reset link to <strong>{email}</strong>.
              Check your inbox and follow the instructions to reset your password.
            </div>

            <button
              onClick={() => {
                setResetSent(false);
                setForgotPassword(false);
                setMode("login");
                setPassword("");
                setError("");
              }}
              style={{
                width: "100%",
                background: tc.accent,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Back to Sign in
            </button>
          </div>
        ) : step === "verify" ? (
          <div style={{ textAlign: "center", padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                color: tc.accent,
              }}
            >
              <Mail size={30} strokeWidth={1.8} />
            </div>

            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Check your inbox!
            </div>

            <div
              style={{
                fontSize: 13,
                color: colors.text.secondary,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              We sent a confirmation link to <strong>{email}</strong>.
              Click the link to activate your account then come back to sign in.
            </div>

            <button
              onClick={() => {
                setStep("form");
                setMode("login");
                setError("");
              }}
              style={{
                width: "100%",
                background: tc.accent,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Back to Sign in
            </button>
          </div>
        ) : (
          <div>
            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => setMode("login")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: mode === "login" ? colors.bg.secondary : "transparent",
                  color: colors.text.primary,
                  transition: "all 0.2s",
                  minHeight: 44,
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: mode === "signup" ? colors.bg.secondary : "transparent",
                  color: colors.text.primary,
                  transition: "all 0.2s",
                  minHeight: 44,
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                border: `1.5px solid ${colors.border}`,
                borderRadius: 8,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 600,
                color: colors.text.primary,
                background: "transparent",
                cursor: "pointer",
                marginBottom: 16,
                transition: "all 0.2s",
                minHeight: 44,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.secondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <img src="https://www.google.com/favicon.ico" style={{ width: 16, height: 16 }} />
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: colors.border }} />
              <span style={{ fontSize: 12, color: colors.text.secondary }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: colors.border }} />
            </div>

            {/* Email Input */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 14,
                border: `1.5px solid ${colors.border}`,
                borderRadius: 8,
                outline: "none",
                boxSizing: "border-box",
                background: colors.bg.secondary,
                color: colors.text.primary,
                marginBottom: 12,
                transition: "all 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.text.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
            {forgotPassword ? (
  <>
    {error && (
      <div
        style={{
          fontSize: 12,
          color: colors.error,
          marginBottom: 12,
        }}
      >
        {error}
      </div>
    )}

    <button
      onClick={handleForgotPassword}
      disabled={loading || !email}
      style={{
        width: "100%",
        background: tc.accent,
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "12px 0",
        fontSize: 14,
        fontWeight: 700,
        cursor: loading || !email ? "not-allowed" : "pointer",
        opacity: loading || !email ? 0.6 : 1,
        marginBottom: 12,
        minHeight: 44,
      }}
    >
      {loading ? "Sending..." : "Send reset link"}
    </button>

    <div style={{ textAlign: "center" }}>
    <button
      onClick={() => {
        setForgotPassword(false);
        setResetSent(false);
        setError("");
        setPassword("");
        setMode("login");
      }}
      style={{
        background: "none",
        border: "none",
        color: tc.accent,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        minHeight: 44,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <ArrowLeft size={14} />
      <span>Back to sign in</span>
    </button>
  </div>
  </>
) : (
  <>
    {/* Password Input */}
    <div style={{ position: "relative", marginBottom: 16 }}>
      <input
        type={showPassword ? "text" : "password"}
        placeholder={mode === "signup" ? "Password (min. 8 chars)" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        style={{
          width: "100%",
          padding: "12px 14px",
          paddingRight: 40,
          fontSize: 14,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 8,
          outline: "none",
          boxSizing: "border-box",
          background: colors.bg.secondary,
          color: colors.text.primary,
          transition: "all 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.text.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.border;
        }}
      />

      <button
        onMouseDown={() => setShowPassword(true)}
        onMouseUp={() => setShowPassword(false)}
        onMouseLeave={() => setShowPassword(false)}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.text.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          minWidth: 44,
          minHeight: 44,
        }}
      >
        {showPassword ? (
          <EyeOff style={{ width: 16, height: 16 }} />
        ) : (
          <Eye style={{ width: 16, height: 16 }} />
        )}
      </button>
    </div>

    {/* Error Message */}
    {error && (
      <div
        style={{
          fontSize: 12,
          color: colors.error,
          marginBottom: 12,
        }}
      >
        {error}
      </div>
    )}

    {/* Terms Checkbox */}
    {mode === "signup" && (
      <label
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          alignItems: "flex-start",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          style={{ marginTop: 4, cursor: "pointer" }}
        />

        <span
          style={{
            fontSize: 12,
            color: colors.text.secondary,
            lineHeight: 1.5,
          }}
        >
          I agree to the{" "}
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open("/disclaimer", "_blank");
            }}
            style={{
              color: tc.accent,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Terms & Conditions
          </span>
        </span>
      </label>
    )}

    {/* Submit Button */}
    <button
      onClick={handleSubmit}
      disabled={
        loading ||
        !email ||
        !password ||
        (mode === "signup" && !termsAccepted)
      }
      style={{
        width: "100%",
        background: tc.accent,
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "12px 0",
        fontSize: 14,
        fontWeight: 700,
        cursor:
          loading ||
          !email ||
          !password ||
          (mode === "signup" && !termsAccepted)
            ? "not-allowed"
            : "pointer",
        marginBottom: 12,
        opacity:
          loading ||
          !email ||
          !password ||
          (mode === "signup" && !termsAccepted)
            ? 0.6
            : 1,
        minHeight: 44,
      }}
    >
      {loading
        ? "Loading..."
        : mode === "login"
        ? "Sign in"
        : "Sign up"}
    </button>

    {/* Toggle Link */}
    <div
      style={{
        textAlign: "center",
        fontSize: 13,
        color: colors.text.secondary,
      }}
    >
      {mode === "login"
        ? "Don't have an account? "
        : "Already have an account? "}

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setSuggestSignup(false);
          setTermsAccepted(false);
        }}
        style={{
          background: "none",
          border: "none",
          fontWeight: 700,
          color: tc.accent,
          cursor: "pointer",
          padding: 0,
          minHeight: 44,
        }}
      >
        {mode === "login" ? "Sign up" : "Sign in"}
      </button>
    </div>
  </>
)}
            {/* Additional Links */}
            {mode === "login" && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  onClick={() => {
                    setForgotPassword(true);
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: tc.accent,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: 0,
                    minHeight: 44,
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
