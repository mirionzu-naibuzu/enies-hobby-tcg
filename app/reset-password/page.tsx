"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getColors } from "@/lib/themes"; // adjust path if needed
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "next-themes";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const { theme } = useTheme(); // your active theme
  const colors = getColors(theme, true);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  const [resetCode, setResetCode] = useState<string | null>(null);
  const [hashTokens, setHashTokens] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    window.history.replaceState({}, document.title, window.location.pathname);

    if (code) {
      setResetCode(code);
      setReady(true);
    } else if (accessToken && refreshToken) {
      setHashTokens({ access_token: accessToken, refresh_token: refreshToken });
      setReady(true);
    } else {
      setError("This reset link is invalid or has expired.");
    }

    setChecking(false);
  }, []);

  const handleUpdatePassword = async () => {
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (resetCode) {
      const { error } = await supabase.auth.exchangeCodeForSession(resetCode);
      if (error) {
        setError("Reset link has expired.");
        setLoading(false);
        return;
      }
    } else if (hashTokens) {
      const { error } = await supabase.auth.setSession(hashTokens);
      if (error) {
        setError("Reset link has expired.");
        setLoading(false);
        return;
      }
    } else {
      setError("No valid reset token found.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated! Redirecting...");

    setTimeout(() => {
      router.push("/"); // ✅ HOME PAGE REDIRECT
    }, 1500);
  };

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg.primary,
        color: colors.text.secondary,
        fontSize: 14,
      }}>
        Verifying reset link...
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg.primary,
        padding: 16,
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: colors.bg.secondary,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
        }}>
          <h1 style={{ color: colors.text.primary }}>Link expired</h1>
          <p style={{ color: colors.text.secondary, marginBottom: 20 }}>
            {error}
          </p>

          <button
            onClick={() => router.push("/")}
            style={{
              width: "100%",
              background: colors.accent,
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: colors.bg.primary,
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: colors.bg.secondary,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: 32,
      }}>
        <h1 style={{ color: colors.text.primary, fontSize: 28, fontWeight: 800 }}>
          Reset Password
        </h1>

        <p style={{ color: colors.text.secondary, marginBottom: 24 }}>
          Enter your new password.
        </p>

        {/* PASSWORD */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 40px 12px 14px",
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.bg.primary,
              color: colors.text.primary,
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: colors.text.secondary,
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* CONFIRM */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 40px 12px 14px",
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
              background: colors.bg.primary,
              color: colors.text.primary,
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: colors.text.secondary,
            }}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>
        )}

        {message && (
          <p style={{ color: "#22c55e", fontSize: 13 }}>{message}</p>
        )}

        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          style={{
            width: "100%",
            background: colors.accent,
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}