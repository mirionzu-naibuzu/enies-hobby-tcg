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
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="auth-modal-content w-full max-w-105 rounded-2xl p-8 bg-bg-primary text-text-primary border border-border-theme shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <div className="font-black text-2xl text-text-primary">
              {step === "otp" ? "Enter your code" : "Welcome"}
            </div>
            <div className="text-[13px] text-text-tertiary mt-1">
              {step === "otp"
                ? "We sent a 6-digit code to your email"
                : "Sign in or create your account"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center bg-transparent border-0 cursor-pointer text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ─── STEP: OTP VERIFICATION ─── */}
        {step === "otp" ? (
          <div className="flex flex-col items-center">
            {/* OTP icon */}
            <div className="w-16 h-16 rounded-full bg-accent-theme/15 border border-accent-theme/25 flex items-center justify-center mb-4 text-accent-theme">
              <Mail size={30} strokeWidth={1.8} />
            </div>

            {/* Email display */}
            <div className="text-[13px] text-text-tertiary mb-6 text-center leading-relaxed">
              Enter the 6-digit code we sent to <strong className="text-text-primary">{email}</strong>
            </div>

            {/* 6-digit OTP boxes */}
            <div className="flex gap-2 mb-5 justify-center">
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
                  className={`w-11 h-13 text-center text-[22px] font-bold rounded-[10px] outline-none bg-bg-secondary text-text-primary transition-colors border-[1.5px] caret-accent-theme ${
                    digit ? "border-accent-theme" : "border-border-theme"
                  } focus:border-accent-theme`}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-500 mb-3 text-center">
                {error}
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="text-[13px] text-text-tertiary mb-3">
                Verifying...
              </div>
            )}

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className={`bg-transparent border-0 text-[13px] font-semibold p-0 mb-4 min-h-11 flex items-center cursor-pointer ${
                resendCooldown > 0 ? "text-text-tertiary cursor-default" : "text-accent-theme hover:underline"
              }`}
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
              className="bg-transparent border-0 text-accent-theme hover:underline cursor-pointer text-[13px] font-semibold min-h-11 inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Change email</span>
            </button>
          </div>

        ) : (
          /* ─── STEP: EMAIL INPUT (DEFAULT) ─── */
          <div>
            {/* OAuth Buttons */}
            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 border-[1.5px] border-border-theme rounded-lg py-2.75 text-[13px] font-semibold text-text-primary bg-transparent hover:bg-bg-secondary cursor-pointer transition-all min-h-11"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>

              <button
                onClick={handleDiscord}
                className="w-full flex items-center justify-center gap-2.5 border-[1.5px] border-border-theme rounded-lg py-2.75 text-[13px] font-semibold text-text-primary bg-transparent hover:bg-bg-secondary cursor-pointer transition-all min-h-11"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isDark ? "#a5b4fc" : "#5865F2"}>
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Continue with Discord
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border-theme" />
              <span className="text-xs text-text-tertiary">or continue with email</span>
              <div className="flex-1 h-px bg-border-theme" />
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
              className="w-full px-3.5 py-3 text-sm border-[1.5px] border-border-theme rounded-lg outline-none box-border bg-bg-secondary text-text-primary mb-3 transition-all focus:border-text-primary"
            />

            {/* Error */}
            {error && <div className="text-xs text-red-500 mb-3">{error}</div>}

            {/* Continue Button */}
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="w-full bg-accent-theme text-white border-0 rounded-lg py-3 text-sm font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 mb-4 min-h-11 flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {loading ? "Sending code..." : "Continue"}
            </button>

            {/* Terms */}
            <div className="text-[11px] text-text-tertiary text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <span
                onClick={() => window.open("/disclaimer", "_blank")}
                className="text-accent-theme underline cursor-pointer"
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
