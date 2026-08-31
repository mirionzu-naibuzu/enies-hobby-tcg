"use client";

import { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } from "react";
import { X, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { getColors } from "@/lib/themes";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface Props {
  onClose: () => void;
}

const subscribeToMounted = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export default function AuthModal({ onClose }: Props) {
  useBodyScrollLock(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { theme } = useTheme();
  const supabase = useMemo(() => createClient(), []);
  const mounted = useSyncExternalStore(
    subscribeToMounted,
    getMountedSnapshot,
    getServerMountedSnapshot
  );
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        onClose();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, onClose]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const tc = getColors(theme, mounted);
  const isDark = tc.isDark;

  const colors = {
    bg: { primary: tc.bg.primary, secondary: tc.bg.secondary },
    text: { primary: tc.text.primary, secondary: tc.text.tertiary },
    border: tc.border,
    error: "#ef4444",
  };

  // ── HANDLERS ──

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
    setLoading(false);
  };

  const handleVerifyOtp = useCallback(
    async (digits: string[]) => {
      const token = digits.join("");
      if (token.length !== 6) return;

      setLoading(true);
      setError("");

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        setError("Invalid or expired code. Please try again.");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
      // If successful, onAuthStateChange fires SIGNED_IN and closes
      setLoading(false);
    },
    [email, supabase]
  );

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (digit && index === 5) {
      handleVerifyOtp(newDigits);
    } else if (newDigits.every((d) => d !== "")) {
      handleVerifyOtp(newDigits);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);

    const nextFocus = Math.min(pasted.length, 5);
    otpRefs.current[nextFocus]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(newDigits);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError(error.message);
    } else {
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
    setLoading(false);
  };

  // ── RENDER ──

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
              {step === "otp" ? "Enter your code" : "Welcome"}
            </div>
            <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>
              {step === "otp"
                ? "We sent a 6-digit code to your email"
                : "Sign in or create your account"}
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
            <X style={{ width: 24, height: 24, color: colors.text.secondary }} />
          </button>
        </div>

        {/* ─── STEP: OTP VERIFICATION ─── */}
        {step === "otp" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* OTP icon */}
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

            {/* Email display */}
            <div style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 24, textAlign: "center", lineHeight: 1.6 }}>
              Enter the 6-digit code we sent to <strong style={{ color: colors.text.primary }}>{email}</strong>
            </div>

            {/* 6-digit OTP boxes */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={loading}
                  style={{
                    width: 44,
                    height: 52,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    border: `1.5px solid ${digit ? tc.accent : colors.border}`,
                    borderRadius: 10,
                    outline: "none",
                    background: colors.bg.secondary,
                    color: colors.text.primary,
                    transition: "border-color 0.2s",
                    caretColor: tc.accent,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = tc.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = digit ? tc.accent : colors.border; }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 12, color: colors.error, marginBottom: 12, textAlign: "center" }}>
                {error}
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 12 }}>
                Verifying...
              </div>
            )}

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              style={{
                background: "none",
                border: "none",
                color: resendCooldown > 0 ? colors.text.secondary : tc.accent,
                cursor: resendCooldown > 0 ? "default" : "pointer",
                fontSize: 13,
                fontWeight: 600,
                padding: 0,
                marginBottom: 16,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
            </button>

            {/* Change email */}
            <button
              onClick={() => {
                setStep("email");
                setError("");
                setOtpDigits(["", "", "", "", "", ""]);
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
              <span>Change email</span>
            </button>
          </div>

        ) : (
          /* ─── STEP: EMAIL INPUT (DEFAULT) ─── */
          <div>
            {/* OAuth Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <button
                onClick={handleGoogle}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  border: `1.5px solid ${colors.border}`, borderRadius: 8,
                  padding: "11px 0", fontSize: 13, fontWeight: 600,
                  color: colors.text.primary, background: "transparent",
                  cursor: "pointer", transition: "all 0.2s", minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.secondary; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 16, height: 16 }} />
                Continue with Google
              </button>

              <button
                onClick={handleDiscord}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10,
                  border: `1.5px solid ${colors.border}`, borderRadius: 8,
                  padding: "11px 0", fontSize: 13, fontWeight: 600,
                  color: colors.text.primary, background: "transparent",
                  cursor: "pointer", transition: "all 0.2s", minHeight: 44,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg.secondary; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isDark ? "#a5b4fc" : "#5865F2"}>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Continue with Discord
              </button>
            </div>

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && email) {
                  handleSendOtp();
                }
              }}
              style={{
                width: "100%", padding: "12px 14px", fontSize: 14,
                border: `1.5px solid ${colors.border}`, borderRadius: 8,
                outline: "none", boxSizing: "border-box",
                background: colors.bg.secondary, color: colors.text.primary,
                marginBottom: 12, transition: "all 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.text.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />

            {/* Error */}
            {error && <div style={{ fontSize: 12, color: colors.error, marginBottom: 12 }}>{error}</div>}

            {/* Continue Button */}
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              style={{
                width: "100%", background: tc.accent, color: "white",
                border: "none", borderRadius: 8, padding: "12px 0",
                fontSize: 14, fontWeight: 700,
                cursor: loading || !email ? "not-allowed" : "pointer",
                opacity: loading || !email ? 0.6 : 1,
                marginBottom: 16, minHeight: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {loading ? "Sending code..." : "Continue"}
            </button>

            {/* Terms */}
            <div style={{ fontSize: 11, color: colors.text.secondary, textAlign: "center", lineHeight: 1.6 }}>
              By continuing, you agree to our{" "}
              <span
                onClick={() => window.open("/disclaimer", "_blank")}
                style={{ color: tc.accent, textDecoration: "underline", cursor: "pointer" }}
              >
                Terms & Privacy Policy
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
