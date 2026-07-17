(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(("TURBOPACK compile-time value", "https://yfdskhwnimoulzpaxrxe.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZHNraHduaW1vdWx6cGF4cnhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTc3MDMsImV4cCI6MjA5MDEzMzcwM30.SSaPv5r7hkNNfzQxJFlGjUt1p7MVfqIQTwVtBZtiRd0"));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/themes.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_THEMES",
    ()=>ALL_THEMES,
    "getColors",
    ()=>getColors
]);
const THEMES = {
    light: {
        bg: {
            primary: "#ffffff",
            secondary: "#f9fafb",
            tertiary: "#f3f4f6"
        },
        text: {
            primary: "#111827",
            secondary: "#4b5563",
            tertiary: "#6b7280"
        },
        border: "#e5e7eb",
        accent: "#ef4444",
        isDark: false
    },
    dark: {
        bg: {
            primary: "#111827",
            secondary: "#1f2937",
            tertiary: "#374151"
        },
        text: {
            primary: "#f3f4f6",
            secondary: "#d1d5db",
            tertiary: "#9ca3af"
        },
        border: "#374151",
        accent: "#ef4444",
        isDark: true
    },
    // ── Marineford ──────────────────────────────────────
    "marineford-light": {
        bg: {
            primary: "#f0f4f8",
            secondary: "#e2eaf2",
            tertiary: "#ccdbe8"
        },
        text: {
            primary: "#1a3a5c",
            secondary: "#2d5a8a",
            tertiary: "#5a85aa"
        },
        border: "#b8d0e8",
        accent: "#1e6091",
        isDark: false
    },
    "marineford-dark": {
        bg: {
            primary: "#0d1b2a",
            secondary: "#132336",
            tertiary: "#1a2f45"
        },
        text: {
            primary: "#e8f2fa",
            secondary: "#a8c8e8",
            tertiary: "#5a85aa"
        },
        border: "#1e3a55",
        accent: "#2980b9",
        isDark: true
    },
    // ── Thriller Bark ───────────────────────────────────
    "thrillerbark-light": {
        bg: {
            primary: "#f5f0ff",
            secondary: "#ede8fa",
            tertiary: "#e0d8f5"
        },
        text: {
            primary: "#2d1b69",
            secondary: "#4c3a8a",
            tertiary: "#7c6aaa"
        },
        border: "#c8b8f0",
        accent: "#7c3aed",
        isDark: false
    },
    "thrillerbark-dark": {
        bg: {
            primary: "#0f0a1a",
            secondary: "#18102e",
            tertiary: "#221840"
        },
        text: {
            primary: "#f0ebff",
            secondary: "#c4b5fd",
            tertiary: "#7c6aaa"
        },
        border: "#2d1b55",
        accent: "#7c3aed",
        isDark: true
    },
    // ── Alabasta ─────────────────────────────────────────
    "alabasta-light": {
        bg: {
            primary: "#fffbf0",
            secondary: "#fdf4d8",
            tertiary: "#f9e8a8"
        },
        text: {
            primary: "#3d2800",
            secondary: "#7a5c00",
            tertiary: "#a07830"
        },
        border: "#e8c858",
        accent: "#d97706",
        isDark: false
    },
    // Improved: desaturated warm browns, comfortable contrast
    "alabasta-dark": {
        bg: {
            primary: "#17130c",
            secondary: "#211a10",
            tertiary: "#2c2318"
        },
        text: {
            primary: "#ede0c4",
            secondary: "#c4a06a",
            tertiary: "#8a6e48"
        },
        border: "#3a2e1a",
        accent: "#c8850a",
        isDark: true
    },
    // ── Fishman Island ───────────────────────────────────
    "fishman-light": {
        bg: {
            primary: "#f0f9ff",
            secondary: "#ddf0fa",
            tertiary: "#b8e4f5"
        },
        text: {
            primary: "#0a2c42",
            secondary: "#1a5a80",
            tertiary: "#3a8aaa"
        },
        border: "#88c8e8",
        accent: "#0891b2",
        isDark: false
    },
    "fishman-dark": {
        bg: {
            primary: "#030e18",
            secondary: "#071826",
            tertiary: "#0c2435"
        },
        text: {
            primary: "#e0f5ff",
            secondary: "#7ac8ea",
            tertiary: "#3a8aaa"
        },
        border: "#0c2435",
        accent: "#0ea5e9",
        isDark: true
    }
};
function getColors(theme, mounted) {
    if (!mounted) return THEMES.light;
    return THEMES[theme ?? "light"] ?? THEMES.light;
}
const ALL_THEMES = [
    {
        value: "light",
        name: "Light",
        preview: {
            bg: "#ffffff",
            bar: "#ef4444",
            dark: false
        }
    },
    {
        value: "dark",
        name: "Dark",
        preview: {
            bg: "#1f2937",
            bar: "#ef4444",
            dark: true
        }
    },
    {
        value: "marineford-light",
        name: "Marineford",
        preview: {
            bg: "#f0f4f8",
            bar: "#1e6091",
            dark: false
        }
    },
    {
        value: "marineford-dark",
        name: "Marineford",
        preview: {
            bg: "#0d1b2a",
            bar: "#2980b9",
            dark: true
        }
    },
    {
        value: "thrillerbark-light",
        name: "Thriller Bark",
        preview: {
            bg: "#f5f0ff",
            bar: "#7c3aed",
            dark: false
        }
    },
    {
        value: "thrillerbark-dark",
        name: "Thriller Bark",
        preview: {
            bg: "#0f0a1a",
            bar: "#7c3aed",
            dark: true
        }
    },
    {
        value: "alabasta-light",
        name: "Alabasta",
        preview: {
            bg: "#fffbf0",
            bar: "#d97706",
            dark: false
        }
    },
    {
        value: "alabasta-dark",
        name: "Alabasta",
        preview: {
            bg: "#17130c",
            bar: "#c8850a",
            dark: true
        }
    },
    {
        value: "fishman-light",
        name: "Fishman Island",
        preview: {
            bg: "#f0f9ff",
            bar: "#0891b2",
            dark: false
        }
    },
    {
        value: "fishman-dark",
        name: "Fishman Island",
        preview: {
            bg: "#030e18",
            bar: "#0ea5e9",
            dark: true
        }
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/AuthModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/themes.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const subscribeToMounted = ()=>()=>{};
const getMountedSnapshot = ()=>true;
const getServerMountedSnapshot = ()=>false;
function AuthModal({ onClose, initialMode = "login" }) {
    _s();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialMode);
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("form");
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [suggestSignup, setSuggestSignup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [termsAccepted, setTermsAccepted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [forgotPassword, setForgotPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [resetSent, setResetSent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthModal.useMemo[supabase]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])()
    }["AuthModal.useMemo[supabase]"], []);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeToMounted, getMountedSnapshot, getServerMountedSnapshot);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthModal.useEffect": ()=>{
            const { data: { subscription } } = supabase.auth.onAuthStateChange({
                "AuthModal.useEffect": (event)=>{
                    if (event === "SIGNED_IN") {
                        onClose();
                        window.location.reload();
                    }
                }
            }["AuthModal.useEffect"]);
            return ({
                "AuthModal.useEffect": ()=>{
                    subscription.unsubscribe();
                }
            })["AuthModal.useEffect"];
        }
    }["AuthModal.useEffect"], [
        onClose,
        supabase.auth
    ]);
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getColors"])(theme, mounted);
    const isDark = tc.isDark;
    const colors = {
        bg: {
            primary: tc.bg.primary,
            secondary: tc.bg.tertiary
        },
        text: {
            primary: tc.text.primary,
            secondary: tc.text.tertiary
        },
        border: tc.border,
        error: "#ef4444"
    };
    const handleGoogle = async ()=>{
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
    };
    const handleForgotPassword = async ()=>{
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) {
            setError(error.message);
        } else {
            setResetSent(true);
        }
        setLoading(false);
    };
    const handleSubmit = async ()=>{
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
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) {
                setError(error.message);
            } else if (data.user && data.user.identities && data.user.identities.length === 0) {
                setError("This email is already registered.");
                setSuggestSignup(true);
            } else {
                setStep("verify");
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (!error) {
                onClose();
            } else if (error.message.includes("Email not confirmed")) {
                setError("Please confirm your email first. Check your inbox!");
            } else if (error.message.includes("Invalid login credentials")) {
                setError("Incorrect email or password. Please try again.");
                setSuggestSignup(true);
            } else {
                setError(error.message);
            }
        }
        setLoading(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        suppressHydrationWarning: true,
        style: {
            position: "fixed",
            inset: 0,
            background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
        },
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "auth-modal-content",
            style: {
                background: colors.bg.primary,
                borderRadius: 16,
                padding: 32,
                width: "100%",
                maxWidth: 420,
                boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.2)",
                border: `1px solid ${colors.border}`
            },
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 28
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontWeight: 900,
                                    fontSize: 24,
                                    color: colors.text.primary
                                },
                                children: "Welcome to Enies Hobby"
                            }, void 0, false, {
                                fileName: "[project]/components/AuthModal.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                style: {
                                    width: 24,
                                    height: 24,
                                    color: colors.text.secondary
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/AuthModal.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 176,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 170,
                    columnNumber: 9
                }, this),
                resetSent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: "center",
                        padding: "10px 0"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 48,
                                marginBottom: 16
                            },
                            children: "🔐"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 197,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 700,
                                fontSize: 16,
                                color: colors.text.primary,
                                marginBottom: 8
                            },
                            children: "Password reset sent"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 199,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 13,
                                color: colors.text.secondary,
                                marginBottom: 24,
                                lineHeight: 1.6
                            },
                            children: [
                                "We sent a password reset link to ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: email
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 218,
                                    columnNumber: 40
                                }, this),
                                ". Check your inbox and follow the instructions to reset your password."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 210,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setResetSent(false);
                                setForgotPassword(false);
                                setMode("login");
                                setPassword("");
                                setError("");
                            },
                            style: {
                                width: "100%",
                                background: tc.accent,
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "12px 0",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: "pointer"
                            },
                            children: "Back to Sign in"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 222,
                            columnNumber: 5
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 196,
                    columnNumber: 3
                }, this) : step === "verify" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: "center",
                        padding: "10px 0"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 48,
                                marginBottom: 16
                            },
                            children: "📧"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 247,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 700,
                                fontSize: 16,
                                color: colors.text.primary,
                                marginBottom: 8
                            },
                            children: "Check your inbox!"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 249,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 13,
                                color: colors.text.secondary,
                                marginBottom: 24,
                                lineHeight: 1.6
                            },
                            children: [
                                "We sent a confirmation link to ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: email
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 268,
                                    columnNumber: 38
                                }, this),
                                ". Click the link to activate your account then come back to sign in."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 260,
                            columnNumber: 5
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                setStep("form");
                                setMode("login");
                                setError("");
                            },
                            style: {
                                width: "100%",
                                background: tc.accent,
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                padding: "12px 0",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: "pointer"
                            },
                            children: "Go to Sign in"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 272,
                            columnNumber: 5
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 246,
                    columnNumber: 3
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: 12,
                                marginBottom: 24
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setMode("login"),
                                    style: {
                                        flex: 1,
                                        padding: "12px 16px",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        background: mode === "login" ? colors.bg.secondary : "transparent",
                                        color: colors.text.primary,
                                        transition: "all 0.2s"
                                    },
                                    children: "Sign In"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 297,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setMode("signup"),
                                    style: {
                                        flex: 1,
                                        padding: "12px 16px",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        background: mode === "signup" ? colors.bg.secondary : "transparent",
                                        color: colors.text.primary,
                                        transition: "all 0.2s"
                                    },
                                    children: "Sign Up"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 314,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 296,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleGoogle,
                            style: {
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
                                transition: "all 0.2s"
                            },
                            onMouseEnter: (e)=>{
                                e.currentTarget.style.background = colors.bg.secondary;
                            },
                            onMouseLeave: (e)=>{
                                e.currentTarget.style.background = "transparent";
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "https://www.google.com/favicon.ico",
                                    style: {
                                        width: 16,
                                        height: 16
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 356,
                                    columnNumber: 15
                                }, this),
                                "Continue with Google"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 334,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        height: 1,
                                        background: colors.border
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 362,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 12,
                                        color: colors.text.secondary
                                    },
                                    children: "or continue with email"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 363,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        height: 1,
                                        background: colors.border
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 364,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 361,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "email",
                            placeholder: "Email address",
                            value: email,
                            onChange: (e)=>setEmail(e.target.value),
                            style: {
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
                                transition: "all 0.2s"
                            },
                            onFocus: (e)=>{
                                e.currentTarget.style.borderColor = colors.text.primary;
                            },
                            onBlur: (e)=>{
                                e.currentTarget.style.borderColor = colors.border;
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 368,
                            columnNumber: 13
                        }, this),
                        forgotPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        color: colors.error,
                                        marginBottom: 12
                                    },
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 392,
                                    columnNumber: 7
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleForgotPassword,
                                    disabled: loading || !email,
                                    style: {
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
                                        marginBottom: 12
                                    },
                                    children: loading ? "Sending..." : "Send reset link"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 403,
                                    columnNumber: 5
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: "center"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setForgotPassword(false);
                                            setResetSent(false);
                                            setError("");
                                            setPassword("");
                                            setMode("login");
                                        },
                                        style: {
                                            background: "none",
                                            border: "none",
                                            color: tc.accent,
                                            cursor: "pointer",
                                            fontSize: 13,
                                            fontWeight: 600
                                        },
                                        children: "← Back to sign in"
                                    }, void 0, false, {
                                        fileName: "[project]/components/AuthModal.tsx",
                                        lineNumber: 424,
                                        columnNumber: 5
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 423,
                                    columnNumber: 5
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative",
                                        marginBottom: 16
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: showPassword ? "text" : "password",
                                            placeholder: mode === "signup" ? "Password (min. 8 chars)" : "Password",
                                            value: password,
                                            onChange: (e)=>setPassword(e.target.value),
                                            onKeyDown: (e)=>e.key === "Enter" && handleSubmit(),
                                            style: {
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
                                                transition: "all 0.2s"
                                            },
                                            onFocus: (e)=>{
                                                e.currentTarget.style.borderColor = colors.text.primary;
                                            },
                                            onBlur: (e)=>{
                                                e.currentTarget.style.borderColor = colors.border;
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/AuthModal.tsx",
                                            lineNumber: 449,
                                            columnNumber: 7
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onMouseDown: ()=>setShowPassword(true),
                                            onMouseUp: ()=>setShowPassword(false),
                                            onMouseLeave: ()=>setShowPassword(false),
                                            style: {
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
                                                padding: 0
                                            },
                                            children: showPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                style: {
                                                    width: 16,
                                                    height: 16
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/AuthModal.tsx",
                                                lineNumber: 495,
                                                columnNumber: 11
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                style: {
                                                    width: 16,
                                                    height: 16
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/AuthModal.tsx",
                                                lineNumber: 497,
                                                columnNumber: 11
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/AuthModal.tsx",
                                            lineNumber: 476,
                                            columnNumber: 7
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 448,
                                    columnNumber: 5
                                }, this),
                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        color: colors.error,
                                        marginBottom: 12
                                    },
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 504,
                                    columnNumber: 7
                                }, this),
                                mode === "signup" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    style: {
                                        display: "flex",
                                        gap: 8,
                                        marginBottom: 16,
                                        alignItems: "flex-start",
                                        cursor: "pointer"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: termsAccepted,
                                            onChange: (e)=>setTermsAccepted(e.target.checked),
                                            style: {
                                                marginTop: 4,
                                                cursor: "pointer"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/AuthModal.tsx",
                                            lineNumber: 526,
                                            columnNumber: 9
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 12,
                                                color: colors.text.secondary,
                                                lineHeight: 1.5
                                            },
                                            children: [
                                                "I agree to the",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    onClick: (e)=>{
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        window.open("/disclaimer", "_blank");
                                                    },
                                                    style: {
                                                        color: tc.accent,
                                                        textDecoration: "underline",
                                                        cursor: "pointer"
                                                    },
                                                    children: "Terms & Conditions"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/AuthModal.tsx",
                                                    lineNumber: 541,
                                                    columnNumber: 11
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/AuthModal.tsx",
                                            lineNumber: 533,
                                            columnNumber: 9
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 517,
                                    columnNumber: 7
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSubmit,
                                    disabled: loading || !email || !password || mode === "signup" && !termsAccepted,
                                    style: {
                                        width: "100%",
                                        background: tc.accent,
                                        color: "white",
                                        border: "none",
                                        borderRadius: 8,
                                        padding: "12px 0",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: loading || !email || !password || mode === "signup" && !termsAccepted ? "not-allowed" : "pointer",
                                        marginBottom: 12,
                                        opacity: loading || !email || !password || mode === "signup" && !termsAccepted ? 0.6 : 1
                                    },
                                    children: loading ? "Loading..." : mode === "login" ? "Sign in" : "Sign up"
                                }, void 0, false, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 560,
                                    columnNumber: 5
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: "center",
                                        fontSize: 13,
                                        color: colors.text.secondary
                                    },
                                    children: [
                                        mode === "login" ? "Don't have an account? " : "Already have an account? ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                setMode(mode === "login" ? "signup" : "login");
                                                setError("");
                                                setSuggestSignup(false);
                                                setTermsAccepted(false);
                                            },
                                            style: {
                                                background: "none",
                                                border: "none",
                                                fontWeight: 700,
                                                color: tc.accent,
                                                cursor: "pointer",
                                                padding: 0
                                            },
                                            children: mode === "login" ? "Sign up" : "Sign in"
                                        }, void 0, false, {
                                            fileName: "[project]/components/AuthModal.tsx",
                                            lineNumber: 613,
                                            columnNumber: 7
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/AuthModal.tsx",
                                    lineNumber: 602,
                                    columnNumber: 5
                                }, this)
                            ]
                        }, void 0, true),
                        mode === "login" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: "center",
                                marginTop: 12
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setForgotPassword(true);
                                    setError("");
                                },
                                style: {
                                    background: "none",
                                    border: "none",
                                    color: tc.accent,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    padding: 0
                                },
                                children: "Forgot password?"
                            }, void 0, false, {
                                fileName: "[project]/components/AuthModal.tsx",
                                lineNumber: 637,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/AuthModal.tsx",
                            lineNumber: 636,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/AuthModal.tsx",
                    lineNumber: 294,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/AuthModal.tsx",
            lineNumber: 156,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/AuthModal.tsx",
        lineNumber: 142,
        columnNumber: 5
    }, this);
}
_s(AuthModal, "LdJecvOfvvgNEoe/DR0DIWXhKFw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
_c = AuthModal;
var _c;
__turbopack_context__.k.register(_c, "AuthModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panel-left.js [app-client] (ecmascript) <export default as PanelLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bug$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bug.js [app-client] (ecmascript) <export default as Bug>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/coffee.js [app-client] (ecmascript) <export default as Coffee>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/themes.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function Sidebar() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [expanded, setExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showAuth, setShowAuth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [authMode, setAuthMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("login");
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [showAppearance, setShowAppearance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [themeMode, setThemeMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("light");
    const [showSignOutConfirm, setShowSignOutConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showFeedback, setShowFeedback] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [feedbackText, setFeedbackText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [feedbackCategory, setFeedbackCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [feedbackMood, setFeedbackMood] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2);
    const [feedbackMoodTouched, setFeedbackMoodTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [feedbackStatus, setFeedbackStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [showSupport, setShowSupport] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [supportTab, setSupportTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("gcash");
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            setMounted(true);
        }
    }["Sidebar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            const mq = window.matchMedia("(max-width: 768px)");
            setIsMobile(mq.matches);
            const handler = {
                "Sidebar.useEffect.handler": (e)=>setIsMobile(e.matches)
            }["Sidebar.useEffect.handler"];
            mq.addEventListener("change", handler);
            return ({
                "Sidebar.useEffect": ()=>mq.removeEventListener("change", handler)
            })["Sidebar.useEffect"];
        }
    }["Sidebar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            if (isMobile && !expanded) {
                setShowAppearance(false);
            }
        }
    }["Sidebar.useEffect"], [
        isMobile,
        expanded
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.auth.getUser().then({
                "Sidebar.useEffect": ({ data })=>setUser(data.user)
            }["Sidebar.useEffect"]);
            const { data: listener } = supabase.auth.onAuthStateChange({
                "Sidebar.useEffect": (_event, session)=>{
                    setUser(session?.user ?? null);
                }
            }["Sidebar.useEffect"]);
            return ({
                "Sidebar.useEffect": ()=>listener.subscription.unsubscribe()
            })["Sidebar.useEffect"];
        }
    }["Sidebar.useEffect"], []);
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getColors"])(theme, mounted);
    const isDark = tc.isDark;
    const colors = {
        bg: {
            primary: tc.bg.primary,
            secondary: tc.bg.secondary
        },
        text: {
            primary: tc.text.primary,
            secondary: tc.text.tertiary
        },
        border: tc.border,
        hover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        accent: tc.accent,
        isDark: tc.isDark
    };
    const menuItems = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
            label: "Sign In",
            action: ()=>{
                setAuthMode("login");
                setShowAuth(true);
            },
            show: !user
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"],
            label: "Browse",
            action: ()=>router.push("/browse"),
            show: true
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
            label: "Binder",
            action: ()=>router.push("/binder"),
            show: true,
            badge: "New"
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"],
            label: "DON!!",
            action: ()=>router.push("/don"),
            show: true
        }
    ];
    const FEEDBACK_CATEGORIES = [
        {
            value: "Bug",
            label: "Bug",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bug$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bug$3e$__["Bug"]
        },
        {
            value: "Suggestion",
            label: "Suggestion",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"]
        },
        {
            value: "Praise",
            label: "Praise",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"]
        },
        {
            value: "Question",
            label: "Question",
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"]
        }
    ];
    const MOOD_LABELS = [
        "Frustrated",
        "Not great",
        "Okay",
        "Good",
        "Delighted"
    ];
    const bottomItems = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
            label: "Support us",
            action: ()=>setShowSupport(true)
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"],
            label: "Themes",
            action: ()=>{
                setShowAppearance((prev)=>{
                    const next = !prev;
                    if (next) setThemeMode(isDark ? "dark" : "light");
                    return next;
                });
            }
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"],
            label: "Feedback",
            action: ()=>setShowFeedback(true)
        }
    ];
    const closeSupport = ()=>{
        setShowSupport(false);
        setSupportTab("gcash");
    };
    const handleConfirmSignOut = async ()=>{
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        await supabase.auth.signOut();
        setExpanded(false);
        setShowSignOutConfirm(false);
    };
    // Pair themes: [light, dark] per row
    const themePairs = [];
    for(let i = 0; i < __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALL_THEMES"].length; i += 2){
        themePairs.push(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALL_THEMES"].slice(i, i + 2));
    }
    const closeFeedback = ()=>{
        setShowFeedback(false);
        setFeedbackStatus("idle");
        setFeedbackText("");
        setFeedbackCategory(null);
        setFeedbackMood(2);
        setFeedbackMoodTouched(false);
    };
    const handleFeedbackSubmit = async ()=>{
        if (!feedbackText.trim() || !feedbackCategory) return;
        setFeedbackStatus("sending");
        try {
            const res = await fetch("https://formspree.io/f/mkoenrzy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category: feedbackCategory,
                    mood: feedbackMoodTouched ? MOOD_LABELS[feedbackMood] : "Not specified",
                    message: feedbackText
                })
            });
            if (res.ok) {
                setFeedbackStatus("sent");
                setTimeout(()=>{
                    closeFeedback();
                }, 2000);
            } else {
                setFeedbackStatus("error");
            }
        } catch  {
            setFeedbackStatus("error");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mobile-topbar",
                style: {
                    background: colors.bg.secondary,
                    borderBottom: `1px solid ${colors.border}`,
                    height: 64,
                    boxSizing: "border-box",
                    padding: "0 16px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setExpanded(!expanded),
                                title: "Toggle sidebar",
                                style: {
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: colors.text.primary
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__["PanelLeft"], {
                                    size: 20
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 171,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/Sidebar.tsx",
                                lineNumber: 166,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: colors.isDark ? "/sidebar-logo.png" : "/logo-light.png",
                                alt: "Enies Hobby",
                                onClick: ()=>router.push("/"),
                                style: {
                                    height: 32,
                                    objectFit: "contain",
                                    cursor: "pointer"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/Sidebar.tsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>{
                            setShowAppearance((prev)=>{
                                const next = !prev;
                                if (next) setThemeMode(isDark ? "dark" : "light");
                                return next;
                            });
                        },
                        title: "Appearance",
                        style: {
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.text.primary
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                            size: 18
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 191,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/Sidebar.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 155,
                columnNumber: 7
            }, this),
            isMobile && expanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sidebar-mobile-backdrop open",
                onClick: ()=>setExpanded(false)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 197,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `app-sidebar${expanded ? ' expanded' : ''}`,
                suppressHydrationWarning: true,
                style: {
                    position: "fixed",
                    left: 0,
                    top: 0,
                    height: "100vh",
                    width: expanded ? 280 : 70,
                    background: colors.bg.secondary,
                    borderRight: `1px solid ${colors.border}`,
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 50,
                    transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease",
                    overflow: "hidden",
                    boxShadow: expanded ? isDark ? "4px 0 28px rgba(0,0,0,0.5)" : "4px 0 28px rgba(0,0,0,0.12)" : "none"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sidebar-inner",
                    style: {
                        width: 280,
                        minWidth: 280,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflowY: "auto",
                        overflowX: "hidden"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sidebar-header",
                            style: {
                                height: 64,
                                boxSizing: "border-box",
                                position: "relative",
                                borderBottom: `1px solid ${colors.border}`,
                                overflow: "hidden",
                                flexShrink: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>router.push("/"),
                                    style: {
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
                                        whiteSpace: "nowrap"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: colors.isDark ? "/sidebar-logo.png" : "/logo-light.png",
                                        alt: "Enies Hobby Logo",
                                        style: {
                                            height: 32,
                                            objectFit: "contain"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 255,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 239,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setExpanded(!expanded),
                                    title: expanded ? "Collapse sidebar" : "Expand sidebar",
                                    style: {
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
                                        padding: 0
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.background = colors.hover;
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.background = "none";
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panel$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PanelLeft$3e$__["PanelLeft"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 290,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 266,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 227,
                            columnNumber: 11
                        }, this),
                        user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sidebar-profile",
                            style: {
                                height: 64,
                                boxSizing: "border-box",
                                borderBottom: `1px solid ${colors.border}`,
                                display: "flex",
                                alignItems: "center",
                                flexShrink: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: 70,
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sidebar-profile-avatar",
                                        style: {
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            background: colors.text.primary,
                                            color: colors.bg.primary,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                            fontSize: 15
                                        },
                                        children: user.email?.[0].toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 308,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 307,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: 190,
                                        opacity: expanded ? 1 : 0,
                                        transform: expanded ? "translateX(0)" : "translateX(-8px)",
                                        transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                        pointerEvents: expanded ? "auto" : "none",
                                        overflow: "hidden"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontWeight: 700,
                                                fontSize: 13,
                                                color: colors.text.primary,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            },
                                            children: user.user_metadata?.full_name ?? user.email?.split("@")[0]
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 336,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 11,
                                                color: colors.text.secondary,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            },
                                            children: user.email
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 339,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 326,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 296,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "sidebar-nav",
                            style: {
                                flex: 1,
                                padding: "8px 0",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2
                            },
                            children: menuItems.map((item)=>{
                                if (item.show === false) return null;
                                const Icon = item.icon;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: item.action,
                                    title: expanded ? undefined : item.label,
                                    className: "sidebar-nav-btn",
                                    style: {
                                        width: 280,
                                        height: 44,
                                        padding: 0,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        color: colors.text.primary,
                                        transition: "background 0.15s",
                                        textAlign: "left",
                                        flexShrink: 0
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.background = colors.hover;
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.background = "none";
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sidebar-icon-wrap",
                                            style: {
                                                width: 70,
                                                height: 44,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 380,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 379,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sidebar-text-wrap",
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                whiteSpace: "nowrap",
                                                opacity: expanded ? 1 : 0,
                                                transform: expanded ? "translateX(0)" : "translateX(-8px)",
                                                transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                pointerEvents: expanded ? "auto" : "none"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 14,
                                                        fontWeight: 500
                                                    },
                                                    children: item.label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 395,
                                                    columnNumber: 21
                                                }, this),
                                                item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 9,
                                                        lineHeight: 1,
                                                        padding: "2px 5px",
                                                        borderRadius: 999,
                                                        background: "#ef4444",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        transform: "translateY(-4px)"
                                                    },
                                                    children: item.badge
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 382,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, item.label, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 353,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 347,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sidebar-bottom",
                            style: {
                                borderTop: `1px solid ${colors.border}`,
                                padding: "8px 0",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                flexShrink: 0
                            },
                            children: [
                                bottomItems.map((item)=>{
                                    const Icon = item.icon;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: item.action,
                                        title: expanded ? undefined : item.label,
                                        className: "sidebar-bottom-btn",
                                        style: {
                                            width: 280,
                                            height: 44,
                                            padding: 0,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            color: colors.text.primary,
                                            transition: "background 0.15s",
                                            textAlign: "left",
                                            flexShrink: 0
                                        },
                                        onMouseEnter: (e)=>{
                                            e.currentTarget.style.background = colors.hover;
                                        },
                                        onMouseLeave: (e)=>{
                                            e.currentTarget.style.background = "none";
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "sidebar-icon-wrap",
                                                style: {
                                                    width: 70,
                                                    height: 44,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    size: 20
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 448,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 447,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "sidebar-text-wrap",
                                                style: {
                                                    whiteSpace: "nowrap",
                                                    opacity: expanded ? 1 : 0,
                                                    transform: expanded ? "translateX(0)" : "translateX(-8px)",
                                                    transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    pointerEvents: expanded ? "auto" : "none"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 14,
                                                        fontWeight: 500
                                                    },
                                                    children: item.label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 460,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 450,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.label, true, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 425,
                                        columnNumber: 17
                                    }, this);
                                }),
                                user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowSignOutConfirm(true),
                                    title: expanded ? undefined : "Sign Out",
                                    className: "sidebar-bottom-btn",
                                    style: {
                                        width: 280,
                                        height: 44,
                                        padding: 0,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        color: "#ef4444",
                                        transition: "background 0.15s",
                                        textAlign: "left",
                                        flexShrink: 0
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.background = "none";
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sidebar-icon-wrap",
                                            style: {
                                                width: 70,
                                                height: 44,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 489,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 488,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sidebar-text-wrap",
                                            style: {
                                                whiteSpace: "nowrap",
                                                opacity: expanded ? 1 : 0,
                                                transform: expanded ? "translateX(0)" : "translateX(-8px)",
                                                transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                                pointerEvents: expanded ? "auto" : "none"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                },
                                                children: "Sign Out"
                                            }, void 0, false, {
                                                fileName: "[project]/components/Sidebar.tsx",
                                                lineNumber: 501,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 491,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 467,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 421,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Sidebar.tsx",
                    lineNumber: 224,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 204,
                columnNumber: 7
            }, this),
            showAuth && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                initialMode: authMode,
                onClose: ()=>setShowAuth(false)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 510,
                columnNumber: 20
            }, this),
            showSignOutConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    inset: 0,
                    background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16
                },
                onClick: ()=>setShowSignOutConfirm(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: colors.bg.primary,
                        borderRadius: 16,
                        padding: 32,
                        width: "100%",
                        maxWidth: 320,
                        boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.2)",
                        border: `1px solid ${colors.border}`
                    },
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: 24
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontWeight: 900,
                                        fontSize: 20,
                                        color: colors.text.primary,
                                        marginBottom: 8
                                    },
                                    children: "Sign Out?"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 521,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 14,
                                        color: colors.text.secondary
                                    },
                                    children: "Are you sure you want to sign out of your account?"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 522,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 520,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: 12
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowSignOutConfirm(false),
                                    style: {
                                        flex: 1,
                                        padding: "12px 0",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        border: `1.5px solid ${colors.border}`,
                                        background: "transparent",
                                        color: colors.text.primary,
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.background = colors.hover;
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.background = "transparent";
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 525,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleConfirmSignOut,
                                    style: {
                                        flex: 1,
                                        padding: "12px 0",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        border: "none",
                                        background: "#ef4444",
                                        color: "white",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    },
                                    onMouseEnter: (e)=>{
                                        e.currentTarget.style.opacity = "0.9";
                                    },
                                    onMouseLeave: (e)=>{
                                        e.currentTarget.style.opacity = "1";
                                    },
                                    children: "Sign Out"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 530,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 524,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Sidebar.tsx",
                    lineNumber: 517,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 514,
                columnNumber: 9
            }, this),
            showSupport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    inset: 0,
                    background: isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)",
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16
                },
                onClick: closeSupport,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: colors.bg.primary,
                        borderRadius: 20,
                        width: "100%",
                        maxWidth: 360,
                        border: `1px solid ${colors.border}`,
                        boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.6)" : "0 32px 64px rgba(0,0,0,0.15)",
                        padding: 24
                    },
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                marginBottom: 6
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                            size: 16,
                                            style: {
                                                color: "#ef4444",
                                                fill: "#ef4444"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 554,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: 17,
                                                fontWeight: 700,
                                                color: colors.text.primary,
                                                letterSpacing: "-0.01em"
                                            },
                                            children: "Support Enies Hobby"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 555,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 553,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: closeSupport,
                                    style: {
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        display: "flex"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 18,
                                        color: colors.text.secondary
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 560,
                                        columnNumber: 11
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 559,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 552,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                fontSize: 13,
                                color: colors.text.secondary,
                                lineHeight: 1.6,
                                margin: "0 0 18px"
                            },
                            children: "This project is free and always will be. If it's been useful to you, even a small contribution means a lot."
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 563,
                            columnNumber: 7
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: 4,
                                background: tc.bg.tertiary,
                                padding: 4,
                                borderRadius: 8,
                                marginBottom: 18
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSupportTab("gcash"),
                                    style: {
                                        flex: 1,
                                        padding: "8px 0",
                                        borderRadius: 6,
                                        background: supportTab === "gcash" ? colors.bg.primary : "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: supportTab === "gcash" ? colors.text.primary : colors.text.secondary,
                                        transition: "all 0.2s"
                                    },
                                    children: "GCash"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 569,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSupportTab("kofi"),
                                    style: {
                                        flex: 1,
                                        padding: "8px 0",
                                        borderRadius: 6,
                                        background: supportTab === "kofi" ? colors.bg.primary : "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: supportTab === "kofi" ? colors.text.primary : colors.text.secondary,
                                        transition: "all 0.2s"
                                    },
                                    children: "Ko-fi"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 575,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 568,
                            columnNumber: 7
                        }, this),
                        supportTab === "gcash" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                                background: isDark ? colors.bg.secondary : "#f9fafb",
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: 16
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: 160,
                                        height: 160,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        background: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `1px solid ${colors.border}`
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/gcash-qr.png",
                                        alt: "GCash QR Code",
                                        style: {
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain"
                                        },
                                        onError: (e)=>{
                                            e.currentTarget.style.display = "none";
                                            e.currentTarget.parentElement.innerHTML = '<span style="font-size:11px;color:#9ca3af;text-align:center;padding:12px">QR not available</span>';
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/Sidebar.tsx",
                                        lineNumber: 587,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 586,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: 11,
                                        color: colors.text.secondary
                                    },
                                    children: "Scan with your GCash app"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 597,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 585,
                            columnNumber: 9
                        }, this),
                        supportTab === "kofi" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "https://ko-fi.com/millionsknives47476",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                width: "100%",
                                padding: "12px 0",
                                borderRadius: 12,
                                background: "#FF5E5B",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "opacity 0.2s",
                                letterSpacing: "0.01em"
                            },
                            onMouseEnter: (e)=>{
                                e.currentTarget.style.opacity = "0.88";
                            },
                            onMouseLeave: (e)=>{
                                e.currentTarget.style.opacity = "1";
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$coffee$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Coffee$3e$__["Coffee"], {
                                    size: 15
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 611,
                                    columnNumber: 11
                                }, this),
                                "Buy me a Coffee"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 603,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Sidebar.tsx",
                    lineNumber: 547,
                    columnNumber: 5
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 543,
                columnNumber: 3
            }, this),
            showFeedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    inset: 0,
                    background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16
                },
                onClick: closeFeedback,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: colors.bg.primary,
                        borderRadius: 16,
                        padding: 28,
                        width: "100%",
                        maxWidth: 400,
                        border: `1px solid ${colors.border}`,
                        boxShadow: isDark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.15)"
                    },
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: 20
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontWeight: 700,
                                        fontSize: 18,
                                        color: colors.text.primary,
                                        marginBottom: 4
                                    },
                                    children: "Share your feedback"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 628,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 13,
                                        color: colors.text.secondary
                                    },
                                    children: "Help us improve Enies Hobby."
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 629,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 627,
                            columnNumber: 15
                        }, this),
                        feedbackStatus === "sent" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: "center",
                                padding: "24px 0"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 32,
                                        marginBottom: 8
                                    },
                                    children: "🎉"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 634,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontWeight: 600,
                                        fontSize: 15,
                                        color: colors.text.primary
                                    },
                                    children: "Thanks!"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 635,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 13,
                                        color: colors.text.secondary,
                                        marginTop: 4
                                    },
                                    children: "Your feedback was sent."
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 636,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 633,
                            columnNumber: 17
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: colors.text.secondary,
                                        marginBottom: 8
                                    },
                                    children: "What's this about?"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 640,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: 8,
                                        marginBottom: 20
                                    },
                                    children: FEEDBACK_CATEGORIES.map((cat)=>{
                                        const Icon = cat.icon;
                                        const active = feedbackCategory === cat.value;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setFeedbackCategory(cat.value),
                                            style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 6,
                                                padding: "12px 4px",
                                                borderRadius: 10,
                                                cursor: "pointer",
                                                border: active ? "1.5px solid #ef4444" : `1px solid ${colors.border}`,
                                                background: active ? isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)" : "transparent",
                                                transition: "all 0.15s"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    size: 18,
                                                    color: active ? "#ef4444" : colors.text.secondary
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 657,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        color: active ? "#ef4444" : colors.text.secondary
                                                    },
                                                    children: cat.label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 658,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, cat.value, true, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 646,
                                            columnNumber: 25
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 641,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                                    children: `
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
                  `
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 664,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: colors.text.secondary,
                                        marginBottom: 10
                                    },
                                    children: [
                                        "How do you feel? ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: colors.text.secondary,
                                                fontWeight: 400
                                            },
                                            children: "(optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 702,
                                            columnNumber: 38
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 701,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: "center",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        marginBottom: 8
                                    },
                                    children: MOOD_LABELS[feedbackMood]
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 704,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: 0,
                                    max: 4,
                                    step: 1,
                                    value: feedbackMood,
                                    onChange: (e)=>{
                                        setFeedbackMood(Number(e.target.value));
                                        setFeedbackMoodTouched(true);
                                    },
                                    className: "feedback-mood-range",
                                    style: {
                                        marginBottom: 6
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 707,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: 11,
                                        color: colors.text.secondary,
                                        marginBottom: 20
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Frustrated"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 718,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Delighted"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 719,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 717,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: colors.text.secondary,
                                        marginBottom: 8
                                    },
                                    children: "Tell us more"
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 722,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: feedbackText,
                                    onChange: (e)=>setFeedbackText(e.target.value),
                                    placeholder: "Type your feedback here...",
                                    rows: 4,
                                    style: {
                                        width: "100%",
                                        padding: "12px 14px",
                                        fontSize: 13,
                                        borderRadius: 10,
                                        border: `1px solid ${colors.border}`,
                                        background: colors.bg.secondary,
                                        color: colors.text.primary,
                                        resize: "none",
                                        outline: "none",
                                        marginBottom: 20,
                                        lineHeight: 1.6,
                                        fontFamily: "inherit",
                                        transition: "border-color 0.2s"
                                    },
                                    onFocus: (e)=>{
                                        e.currentTarget.style.borderColor = "#ef4444";
                                    },
                                    onBlur: (e)=>{
                                        e.currentTarget.style.borderColor = colors.border;
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 723,
                                    columnNumber: 19
                                }, this),
                                feedbackStatus === "error" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 12,
                                        color: "#ef4444",
                                        marginBottom: 10
                                    },
                                    children: "Something went wrong. Try again."
                                }, void 0, false, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 734,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: "flex",
                                        gap: 8
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: closeFeedback,
                                            style: {
                                                flex: 1,
                                                padding: "11px 0",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                border: `1.5px solid ${colors.border}`,
                                                background: "transparent",
                                                color: colors.text.primary,
                                                borderRadius: 8,
                                                cursor: "pointer"
                                            },
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 738,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleFeedbackSubmit,
                                            disabled: !feedbackText.trim() || !feedbackCategory || feedbackStatus === "sending",
                                            style: {
                                                flex: 1,
                                                padding: "11px 0",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                border: "none",
                                                background: feedbackText.trim() && feedbackCategory ? "#ef4444" : isDark ? "#374151" : "#e5e7eb",
                                                color: feedbackText.trim() && feedbackCategory ? "#fff" : colors.text.secondary,
                                                borderRadius: 8,
                                                cursor: feedbackText.trim() && feedbackCategory ? "pointer" : "not-allowed",
                                                transition: "all 0.2s"
                                            },
                                            children: feedbackStatus === "sending" ? "Sending..." : "Send"
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 744,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 737,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Sidebar.tsx",
                    lineNumber: 623,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 619,
                columnNumber: 11
            }, this),
            expanded && !isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 45
                },
                onClick: ()=>setExpanded(false)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 760,
                columnNumber: 9
            }, this),
            showAppearance && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: ()=>setShowAppearance(false),
                style: {
                    position: "fixed",
                    inset: 0,
                    zIndex: 50
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    onClick: (e)=>e.stopPropagation(),
                    className: isMobile ? 'theme-popover-mobile' : '',
                    style: {
                        position: isMobile ? undefined : "absolute",
                        left: isMobile ? undefined : expanded ? 292 : 82,
                        bottom: isMobile ? undefined : 100,
                        width: isMobile ? undefined : 280,
                        maxHeight: isMobile ? undefined : "calc(100vh - 120px)",
                        overflowY: isMobile ? undefined : "auto",
                        scrollbarWidth: "thin",
                        background: colors.bg.primary,
                        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
                        borderRadius: 16,
                        padding: 16,
                        boxShadow: isDark ? "0 16px 36px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.4)" : "0 16px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 700,
                                marginBottom: 2,
                                color: colors.text.primary,
                                fontSize: 14
                            },
                            children: "Themes"
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 790,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 11,
                                color: colors.text.secondary,
                                marginBottom: 14
                            },
                            children: "Choose a theme for your experience"
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 791,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: 4,
                                background: tc.bg.tertiary,
                                padding: 4,
                                borderRadius: 8,
                                marginBottom: 12
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setThemeMode("light"),
                                    style: {
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        padding: "7px 0",
                                        borderRadius: 6,
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: themeMode === "light" ? colors.bg.primary : "transparent",
                                        color: themeMode === "light" ? colors.text.primary : colors.text.secondary,
                                        transition: "all 0.2s"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                            size: 13
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 799,
                                            columnNumber: 17
                                        }, this),
                                        " Light"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 795,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setThemeMode("dark"),
                                    style: {
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        padding: "7px 0",
                                        borderRadius: 6,
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: themeMode === "dark" ? colors.bg.primary : "transparent",
                                        color: themeMode === "dark" ? colors.text.primary : colors.text.secondary,
                                        transition: "all 0.2s"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                            size: 13
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 805,
                                            columnNumber: 17
                                        }, this),
                                        " Dark"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 801,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 794,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                flexDirection: "column",
                                gap: 6
                            },
                            children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ALL_THEMES"].filter((t)=>t.preview.dark === (themeMode === "dark")).map((t)=>{
                                const isActive = theme === t.value;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: ()=>setTheme(t.value),
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: 8,
                                        borderRadius: 10,
                                        cursor: "pointer",
                                        border: isActive ? `1.5px solid ${colors.accent}` : `1px solid ${colors.border}`,
                                        background: isActive ? isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" : "transparent",
                                        transition: "all 0.2s"
                                    },
                                    onMouseEnter: (e)=>{
                                        if (!isActive) e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
                                    },
                                    onMouseLeave: (e)=>{
                                        if (!isActive) e.currentTarget.style.borderColor = colors.border;
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: 48,
                                                height: 34,
                                                borderRadius: 6,
                                                background: t.preview.bg,
                                                position: "relative",
                                                overflow: "hidden",
                                                flexShrink: 0,
                                                border: `1px solid ${colors.border}`
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "absolute",
                                                        top: 5,
                                                        left: 5,
                                                        width: 24,
                                                        height: 4,
                                                        borderRadius: 2,
                                                        background: t.preview.dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 836,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "absolute",
                                                        bottom: 5,
                                                        right: 5,
                                                        width: 14,
                                                        height: 4,
                                                        borderRadius: 2,
                                                        background: t.preview.bar
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/Sidebar.tsx",
                                                    lineNumber: 837,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 835,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                flex: 1,
                                                fontSize: 13,
                                                fontWeight: isActive ? 700 : 500,
                                                color: isActive ? colors.accent : colors.text.primary,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            },
                                            children: t.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 839,
                                            columnNumber: 21
                                        }, this),
                                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            size: 15,
                                            color: colors.accent,
                                            strokeWidth: 3
                                        }, void 0, false, {
                                            fileName: "[project]/components/Sidebar.tsx",
                                            lineNumber: 842,
                                            columnNumber: 34
                                        }, this)
                                    ]
                                }, t.value, true, {
                                    fileName: "[project]/components/Sidebar.tsx",
                                    lineNumber: 814,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/Sidebar.tsx",
                            lineNumber: 810,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Sidebar.tsx",
                    lineNumber: 769,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/Sidebar.tsx",
                lineNumber: 768,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
_s(Sidebar, "cmtZmD7q3pdxwuWcK5d5//VsO+Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/binder.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addCardToBinder",
    ()=>addCardToBinder,
    "addUserCard",
    ()=>addUserCard,
    "createBinder",
    ()=>createBinder,
    "deleteBinder",
    ()=>deleteBinder,
    "getBinderCardCounts",
    ()=>getBinderCardCounts,
    "getBinderCards",
    ()=>getBinderCards,
    "getBinders",
    ()=>getBinders,
    "getCardKey",
    ()=>getCardKey,
    "getDonCardKey",
    ()=>getDonCardKey,
    "getUserCards",
    ()=>getUserCards,
    "removeCardFromBinder",
    ()=>removeCardFromBinder,
    "removeUserCard",
    ()=>removeUserCard,
    "renameBinder",
    ()=>renameBinder,
    "toggleWishlist",
    ()=>toggleWishlist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
const getCardKey = (card)=>`${card.id ?? ""}||${card.name ?? ""}||${card.set?.name ?? ""}`;
const getDonCardKey = (donCard)=>`don||${donCard.card_name}`;
async function getUserCards(userId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const allCards = [];
    const pageSize = 1000;
    let from = 0;
    while(true){
        const { data, error } = await supabase.from("user_cards").select("card_id, in_wishlist").eq("user_id", userId).range(from, from + pageSize - 1);
        if (error) {
            console.error(error);
            break;
        }
        if (!data || data.length === 0) break;
        allCards.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
    }
    return allCards;
}
async function addUserCard(userId, cardId, inWishlist = false) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("user_cards").upsert({
        user_id: userId,
        card_id: cardId,
        in_wishlist: inWishlist
    }, {
        onConflict: "user_id,card_id"
    });
}
async function removeUserCard(userId, cardId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("user_cards").delete().eq("user_id", userId).eq("card_id", cardId);
}
async function toggleWishlist(userId, cardId, inWishlist) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("user_cards").update({
        in_wishlist: inWishlist
    }).eq("user_id", userId).eq("card_id", cardId);
}
async function getBinders(userId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from("binders").select("id, name, created_at").eq("user_id", userId).order("created_at", {
        ascending: true
    });
    if (error) {
        console.error(error);
        return [];
    }
    return data ?? [];
}
async function createBinder(userId, name) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await supabase.from("binders").insert({
        user_id: userId,
        name
    }).select().single();
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}
async function deleteBinder(binderId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("binders").delete().eq("id", binderId);
}
async function renameBinder(binderId, name) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("binders").update({
        name
    }).eq("id", binderId);
}
async function getBinderCards(binderId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const allCards = [];
    const pageSize = 1000;
    let from = 0;
    while(true){
        const { data, error } = await supabase.from("binder_cards").select("card_id").eq("binder_id", binderId).range(from, from + pageSize - 1);
        if (error) {
            console.error(error);
            break;
        }
        if (!data || data.length === 0) break;
        allCards.push(...data.map((r)=>r.card_id));
        if (data.length < pageSize) break;
        from += pageSize;
    }
    return allCards;
}
async function addCardToBinder(binderId, cardId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("binder_cards").upsert({
        binder_id: binderId,
        card_id: cardId
    }, {
        onConflict: "binder_id,card_id"
    });
}
async function removeCardFromBinder(binderId, cardId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    await supabase.from("binder_cards").delete().eq("binder_id", binderId).eq("card_id", cardId);
}
async function getBinderCardCounts(userId) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: binders } = await supabase.from("binders").select("id").eq("user_id", userId);
    if (!binders?.length) return {};
    const { data: counts } = await supabase.from("binder_cards").select("binder_id").in("binder_id", binders.map((b)=>b.id));
    const result = {};
    for (const row of counts ?? []){
        result[row.binder_id] = (result[row.binder_id] ?? 0) + 1;
    }
    return result;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/useBodyScrollLock.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBodyScrollLock",
    ()=>useBodyScrollLock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useBodyScrollLock(locked) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBodyScrollLock.useEffect": ()=>{
            if (!locked) return;
            const original = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return ({
                "useBodyScrollLock.useEffect": ()=>{
                    document.body.style.overflow = original;
                }
            })["useBodyScrollLock.useEffect"];
        }
    }["useBodyScrollLock.useEffect"], [
        locked
    ]);
}
_s(useBodyScrollLock, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAllCards",
    ()=>getAllCards,
    "getAllDonCards",
    ()=>getAllDonCards,
    "getAllSets",
    ()=>getAllSets
]);
async function getAllCards() {
    const res = await fetch("/api/cards");
    if (!res.ok) return []; // return empty instead of throwing
    return res.json();
}
async function getAllDonCards() {
    const res = await fetch("/api/don-cards");
    if (!res.ok) throw new Error("Failed to fetch DON cards");
    return res.json();
}
async function getAllSets() {
    const res = await fetch("https://optcgapi.com/api/allSets/", {
        next: {
            revalidate: 86400
        }
    });
    if (!res.ok) throw new Error("Failed to fetch sets");
    return res.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ModalCardImage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModalCardImage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ModalCardImage({ src, alt, isLeader = false, isDark, backSrc: backSrcOverride, fallbackSrc = "/card-placeholder.png", onUnavailable }) {
    _s();
    const defaultBack = isLeader ? "/card-back-leader.png" : "/card-back.png";
    const backSrc = backSrcOverride ?? defaultBack;
    const initialSrc = src && src.trim() ? src : fallbackSrc;
    const [displaySrc, setDisplaySrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialSrc);
    const [loaded, setLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [flipped, setFlipped] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModalCardImage.useEffect": ()=>{
            setLoaded(false);
            setFlipped(false);
            let isMounted = true;
            const targetSrc = src && src.trim() ? src : fallbackSrc;
            setDisplaySrc(targetSrc);
            const img = new window.Image();
            img.src = targetSrc;
            img.onload = ({
                "ModalCardImage.useEffect": ()=>{
                    if (!isMounted) return;
                    setLoaded(true);
                    setTimeout({
                        "ModalCardImage.useEffect": ()=>{
                            if (isMounted) setFlipped(true);
                        }
                    }["ModalCardImage.useEffect"], 60);
                }
            })["ModalCardImage.useEffect"];
            img.onerror = ({
                "ModalCardImage.useEffect": ()=>{
                    if (!isMounted) return;
                    onUnavailable?.();
                    if (targetSrc !== fallbackSrc) {
                        const fallbackImg = new window.Image();
                        fallbackImg.src = fallbackSrc;
                        fallbackImg.onload = ({
                            "ModalCardImage.useEffect": ()=>{
                                if (!isMounted) return;
                                setDisplaySrc(fallbackSrc);
                                setLoaded(true);
                                setTimeout({
                                    "ModalCardImage.useEffect": ()=>{
                                        if (isMounted) setFlipped(true);
                                    }
                                }["ModalCardImage.useEffect"], 60);
                            }
                        })["ModalCardImage.useEffect"];
                        fallbackImg.onerror = ({
                            "ModalCardImage.useEffect": ()=>{
                                if (!isMounted) return;
                                setDisplaySrc(fallbackSrc);
                                setLoaded(true);
                                setTimeout({
                                    "ModalCardImage.useEffect": ()=>{
                                        if (isMounted) setFlipped(true);
                                    }
                                }["ModalCardImage.useEffect"], 60);
                            }
                        })["ModalCardImage.useEffect"];
                    } else {
                        setLoaded(true);
                        setTimeout({
                            "ModalCardImage.useEffect": ()=>{
                                if (isMounted) setFlipped(true);
                            }
                        }["ModalCardImage.useEffect"], 60);
                    }
                }
            })["ModalCardImage.useEffect"];
            return ({
                "ModalCardImage.useEffect": ()=>{
                    isMounted = false;
                }
            })["ModalCardImage.useEffect"];
        }
    }["ModalCardImage.useEffect"], [
        src,
        fallbackSrc
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: "100%",
            aspectRatio: "63/88",
            perspective: "1000px"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                position: "relative",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
                borderRadius: 17,
                boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.2)"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        borderRadius: 17,
                        overflow: "hidden"
                    },
                    children: loaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: displaySrc,
                        alt: alt,
                        style: {
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block"
                        },
                        onError: ()=>{
                            if (displaySrc !== fallbackSrc) {
                                setDisplaySrc(fallbackSrc);
                            }
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/ModalCardImage.tsx",
                        lineNumber: 112,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ModalCardImage.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderRadius: 17,
                        overflow: "hidden"
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: backSrc,
                        alt: "",
                        style: {
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block"
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/ModalCardImage.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ModalCardImage.tsx",
                    lineNumber: 124,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ModalCardImage.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ModalCardImage.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_s(ModalCardImage, "od+KDW464IaNumR6+o0uJmIslCY=");
_c = ModalCardImage;
var _c;
__turbopack_context__.k.register(_c, "ModalCardImage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/don/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DonCardsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookmarkPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bookmark-plus.js [app-client] (ecmascript) <export default as BookmarkPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/themes.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/binder.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useBodyScrollLock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/useBodyScrollLock.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ModalCardImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ModalCardImage.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
// Extract a clean display name from the full card_name
const getDonCardName = (name)=>{
    // "DON!! Card (Donquixote Doflamingo) (Gold)" → "Donquixote Doflamingo (Gold)"
    const match = name.match(/DON!! Card \(([^)]+)\)(.*)/);
    if (match) return (match[1] + match[2]).trim();
    return name;
};
// Parse set info from optcg_don_name
const getDonSetName = (optcgName)=>{
    const match = optcgName.match(/ - (.+)$/);
    return match ? match[1].trim() : "";
};
function DonCardsPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [donCards, setDonCards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeFilter, setActiveFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("All");
    const [showScrollTop, setShowScrollTop] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [filterKey, setFilterKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [animatedKey, setAnimatedKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    // Modal state
    const [selectedIndex, setSelectedIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(-1);
    const [showBinderPicker, setShowBinderPicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Auth + binder state
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [binders, setBinders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [binderCardMap, setBinderCardMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // Inline binder creation
    const [creatingBinderInline, setCreatingBinderInline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newBinderNameInline, setNewBinderNameInline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [creatingBinderLoading, setCreatingBinderLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const tc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$themes$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getColors"])(theme, mounted);
    const isDark = tc.isDark;
    const colors = {
        bg: {
            primary: tc.bg.primary,
            secondary: tc.bg.secondary,
            tertiary: tc.bg.tertiary
        },
        text: {
            primary: tc.text.primary,
            secondary: tc.text.secondary,
            tertiary: tc.text.tertiary
        },
        border: tc.border,
        accent: tc.accent
    };
    //scroll lock
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useBodyScrollLock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBodyScrollLock"])(selectedIndex >= 0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            setMounted(true);
        }
    }["DonCardsPage.useEffect"], []);
    // Auth
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            supabase.auth.getUser().then({
                "DonCardsPage.useEffect": ({ data })=>setUser(data.user)
            }["DonCardsPage.useEffect"]);
            const { data: listener } = supabase.auth.onAuthStateChange({
                "DonCardsPage.useEffect": (_e, session)=>{
                    setUser(session?.user ?? null);
                }
            }["DonCardsPage.useEffect"]);
            return ({
                "DonCardsPage.useEffect": ()=>listener.subscription.unsubscribe()
            })["DonCardsPage.useEffect"];
        }
    }["DonCardsPage.useEffect"], []);
    // Load binders
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            if (!user) {
                setBinders([]);
                setBinderCardMap({});
                return;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBinders"])(user.id).then({
                "DonCardsPage.useEffect": (b)=>setBinders(b)
            }["DonCardsPage.useEffect"]);
        }
    }["DonCardsPage.useEffect"], [
        user
    ]);
    // Load binder membership
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            if (!binders.length) return;
            Promise.all(binders.map({
                "DonCardsPage.useEffect": (b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBinderCards"])(b.id).then({
                        "DonCardsPage.useEffect": (cards)=>({
                                id: b.id,
                                cards
                            })
                    }["DonCardsPage.useEffect"])
            }["DonCardsPage.useEffect"])).then({
                "DonCardsPage.useEffect": (results)=>{
                    const map = {};
                    for (const r of results)map[r.id] = r.cards;
                    setBinderCardMap(map);
                }
            }["DonCardsPage.useEffect"]);
        }
    }["DonCardsPage.useEffect"], [
        binders
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            async function fetchDonCards() {
                try {
                    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllDonCards"])();
                    setDonCards(data);
                } catch (err) {
                    console.error("Error fetching DON!! cards:", err);
                } finally{
                    setLoading(false);
                }
            }
            fetchDonCards();
        }
    }["DonCardsPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            const handleScroll = {
                "DonCardsPage.useEffect.handleScroll": ()=>setShowScrollTop(window.scrollY > 500)
            }["DonCardsPage.useEffect.handleScroll"];
            window.addEventListener("scroll", handleScroll);
            return ({
                "DonCardsPage.useEffect": ()=>window.removeEventListener("scroll", handleScroll)
            })["DonCardsPage.useEffect"];
        }
    }["DonCardsPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            setFilterKey({
                "DonCardsPage.useEffect": (k)=>k + 1
            }["DonCardsPage.useEffect"]);
        }
    }["DonCardsPage.useEffect"], [
        activeFilter
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            const t = setTimeout({
                "DonCardsPage.useEffect.t": ()=>setFilterKey({
                        "DonCardsPage.useEffect.t": (k)=>k + 1
                    }["DonCardsPage.useEffect.t"])
            }["DonCardsPage.useEffect.t"], 400);
            return ({
                "DonCardsPage.useEffect": ()=>clearTimeout(t)
            })["DonCardsPage.useEffect"];
        }
    }["DonCardsPage.useEffect"], [
        search
    ]);
    // Keyboard nav for modal
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DonCardsPage.useEffect": ()=>{
            const handleKey = {
                "DonCardsPage.useEffect.handleKey": (e)=>{
                    if (showBinderPicker) {
                        if (e.key === "Escape") {
                            setShowBinderPicker(false);
                            setCreatingBinderInline(false);
                            setNewBinderNameInline("");
                        }
                        return;
                    }
                    if (selectedIndex < 0) return;
                    e.preventDefault();
                    if (e.key === "ArrowRight" && selectedIndex < filteredCards.length - 1) setSelectedIndex({
                        "DonCardsPage.useEffect.handleKey": (prev)=>prev + 1
                    }["DonCardsPage.useEffect.handleKey"]);
                    if (e.key === "ArrowLeft" && selectedIndex > 0) setSelectedIndex({
                        "DonCardsPage.useEffect.handleKey": (prev)=>prev - 1
                    }["DonCardsPage.useEffect.handleKey"]);
                    if (e.key === "Escape") {
                        setSelectedIndex(-1);
                    }
                }
            }["DonCardsPage.useEffect.handleKey"];
            window.addEventListener("keydown", handleKey);
            return ({
                "DonCardsPage.useEffect": ()=>window.removeEventListener("keydown", handleKey)
            })["DonCardsPage.useEffect"];
        }
    }["DonCardsPage.useEffect"], [
        selectedIndex,
        showBinderPicker
    ]);
    const filteredCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DonCardsPage.useMemo[filteredCards]": ()=>{
            return donCards.filter({
                "DonCardsPage.useMemo[filteredCards]": (card)=>{
                    const matchesSearch = card.card_name.toLowerCase().includes(search.toLowerCase()) || card.optcg_don_name?.toLowerCase().includes(search.toLowerCase());
                    const matchesFilter = activeFilter === "All" ? true : activeFilter === "Gold" ? card.card_name.toLowerCase().includes("(gold)") : true;
                    return matchesSearch && matchesFilter;
                }
            }["DonCardsPage.useMemo[filteredCards]"]);
        }
    }["DonCardsPage.useMemo[filteredCards]"], [
        donCards,
        search,
        activeFilter
    ]);
    const isAnimating = animatedKey < filterKey;
    const selected = selectedIndex >= 0 ? filteredCards[selectedIndex] : null;
    // Binder actions
    const handleToggleBinderCard = async (binderId, cardKey)=>{
        const current = binderCardMap[binderId] ?? [];
        if (current.includes(cardKey)) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeCardFromBinder"])(binderId, cardKey);
            setBinderCardMap((prev)=>({
                    ...prev,
                    [binderId]: prev[binderId].filter((id)=>id !== cardKey)
                }));
        } else {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addCardToBinder"])(binderId, cardKey);
            setBinderCardMap((prev)=>({
                    ...prev,
                    [binderId]: [
                        ...prev[binderId] ?? [],
                        cardKey
                    ]
                }));
        }
    };
    const handleCreateBinderInline = async (cardKey)=>{
        if (!user || !newBinderNameInline.trim() || creatingBinderLoading) return;
        setCreatingBinderLoading(true);
        const b = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBinder"])(user.id, newBinderNameInline.trim());
        if (b) {
            setBinders((prev)=>[
                    ...prev,
                    b
                ]);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addCardToBinder"])(b.id, cardKey);
            setBinderCardMap((prev)=>({
                    ...prev,
                    [b.id]: [
                        cardKey
                    ]
                }));
        }
        setNewBinderNameInline("");
        setCreatingBinderInline(false);
        setCreatingBinderLoading(false);
    };
    const isInAnyBinder = (cardKey)=>Object.values(binderCardMap).some((cards)=>cards.includes(cardKey));
    const closeModal = ()=>{
        setSelectedIndex(-1);
        setShowBinderPicker(false);
        setCreatingBinderInline(false);
        setNewBinderNameInline("");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "don-wrapper",
        suppressHydrationWarning: true,
        style: {
            minHeight: "100vh",
            background: colors.bg.primary,
            transition: "background 0.3s",
            color: colors.text.primary,
            marginLeft: 70
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes cardFlipIn { 0% { transform: rotateY(180deg); } 100% { transform: rotateY(0deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .don-skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 220,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "11px 24px 10px",
                    borderBottom: `1px solid ${colors.border}`,
                    marginBottom: 10
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    style: {
                        fontSize: 28,
                        fontWeight: 900,
                        margin: 0,
                        color: colors.text.primary,
                        letterSpacing: "-0.03em"
                    },
                    children: [
                        "DON",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                color: colors.accent
                            },
                            children: "!!"
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 225,
                            columnNumber: 14
                        }, this),
                        " Cards"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 224,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "don-search-wrap",
                style: {
                    padding: "18px 24px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottom: `1px solid ${colors.border}`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "don-search-container",
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "don-search-input-wrap",
                            style: {
                                position: "relative",
                                width: 260
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                    size: 16,
                                    style: {
                                        position: "absolute",
                                        left: 12,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: colors.text.tertiary
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 233,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "don-search-input",
                                    value: search,
                                    onChange: (e)=>setSearch(e.target.value),
                                    placeholder: "Search DON!!",
                                    style: {
                                        width: "100%",
                                        padding: "10px 32px 10px 36px",
                                        borderRadius: 12,
                                        border: `1px solid ${colors.border}`,
                                        background: colors.bg.secondary,
                                        color: colors.text.primary,
                                        outline: "none",
                                        fontSize: 13
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 234,
                                    columnNumber: 13
                                }, this),
                                search && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSearch(""),
                                    style: {
                                        position: "absolute",
                                        right: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 4,
                                        display: "flex"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 14,
                                        color: colors.text.tertiary
                                    }, void 0, false, {
                                        fileName: "[project]/app/don/page.tsx",
                                        lineNumber: 243,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 242,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 232,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "don-filter-chips",
                            style: {
                                display: "flex",
                                gap: 4,
                                background: colors.bg.tertiary,
                                padding: 4,
                                borderRadius: 8,
                                flexShrink: 0
                            },
                            children: [
                                "All",
                                "Gold"
                            ].map((filter)=>{
                                const active = activeFilter === filter;
                                const isGold = filter === "Gold";
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveFilter(filter),
                                    style: {
                                        padding: "6px 10px",
                                        borderRadius: 6,
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        transition: "all 0.2s",
                                        // 🎯 Background logic
                                        background: active ? isGold ? "linear-gradient(135deg,#facc15,#eab308)" // gold active
                                         : colors.bg.primary // normal active
                                         : "transparent",
                                        // 🎯 Text color logic
                                        color: active ? isGold ? "#1f2937" // dark text on gold
                                         : colors.text.primary : isGold ? "#eab308" // gold text when inactive
                                         : colors.text.tertiary
                                    },
                                    children: filter
                                }, filter, false, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 263,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 231,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: "12px 24px",
                    display: "flex",
                    justifyContent: "flex-start",
                    borderBottom: `1px solid ${colors.border}`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: 14,
                        color: colors.text.tertiary
                    },
                    children: loading ? "Loading cards..." : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            "Showing",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                style: {
                                    color: colors.text.primary
                                },
                                children: filteredCards.length
                            }, void 0, false, {
                                fileName: "[project]/app/don/page.tsx",
                                lineNumber: 306,
                                columnNumber: 15
                            }, this),
                            " ",
                            "cards"
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 300,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 299,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "don-main",
                style: {
                    padding: "12px 24px 64px"
                },
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "don-card-grid",
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 18,
                        marginTop: 10
                    },
                    children: Array.from({
                        length: 12
                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "don-skeleton",
                            style: {
                                borderRadius: 14,
                                background: colors.bg.tertiary,
                                border: `1px solid ${colors.border}`,
                                aspectRatio: "5 / 7"
                            }
                        }, i, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 320,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 318,
                    columnNumber: 11
                }, this) : filteredCards.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        textAlign: "center",
                        paddingTop: 96,
                        paddingBottom: 96,
                        color: colors.text.tertiary,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/nocard.png",
                            alt: "No cards found",
                            style: {
                                width: 120,
                                height: 120,
                                objectFit: "contain",
                                marginBottom: 20,
                                opacity: isDark ? 0.9 : 1
                            },
                            onError: (e)=>{
                                e.currentTarget.style.display = "none";
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 325,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 700,
                                fontSize: 20,
                                color: colors.text.primary
                            },
                            children: "No cards found"
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 326,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: 14,
                                marginTop: 6,
                                color: colors.text.tertiary
                            },
                            children: "Try a different search"
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 327,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 324,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "don-card-grid",
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: 18,
                        marginTop: 10
                    },
                    children: filteredCards.map((card, i)=>{
                        const isGold = card.card_name.toLowerCase().includes("(gold)");
                        const shouldFlip = isAnimating && i < 10;
                        const isLastFlip = i === Math.min(9, filteredCards.length - 1);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                cursor: "pointer",
                                perspective: shouldFlip ? "1000px" : "none"
                            },
                            onClick: ()=>setSelectedIndex(i),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative",
                                    transformStyle: shouldFlip ? "preserve-3d" : "flat",
                                    animationName: shouldFlip ? "cardFlipIn" : "none",
                                    animationDuration: shouldFlip ? "0.5s" : "0s",
                                    animationTimingFunction: "ease",
                                    animationFillMode: "forwards",
                                    animationDelay: shouldFlip ? `${i * 0.03}s` : "0s",
                                    willChange: shouldFlip ? "transform" : "auto"
                                },
                                onAnimationEnd: isLastFlip ? ()=>setAnimatedKey(filterKey) : undefined,
                                children: [
                                    shouldFlip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            backfaceVisibility: "hidden",
                                            WebkitBackfaceVisibility: "hidden",
                                            transform: "rotateY(180deg)",
                                            position: "absolute",
                                            inset: 0,
                                            borderRadius: 14,
                                            overflow: "hidden"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: "/don-back.png",
                                            alt: "",
                                            style: {
                                                width: "100%",
                                                height: "100%",
                                                display: "block"
                                            },
                                            onError: (e)=>{
                                                e.currentTarget.src = "/card-back.png";
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/don/page.tsx",
                                            lineNumber: 348,
                                            columnNumber: 25
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/don/page.tsx",
                                        lineNumber: 347,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            backfaceVisibility: shouldFlip ? "hidden" : "visible",
                                            WebkitBackfaceVisibility: shouldFlip ? "hidden" : "visible"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                borderRadius: 14,
                                                overflow: "hidden",
                                                background: colors.bg.secondary,
                                                border: isGold ? "1px solid #facc15" : `1px solid ${colors.border}`,
                                                transition: "all 0.25s ease",
                                                boxShadow: isGold ? "0 0 25px rgba(250,204,21,0.2)" : isDark ? "0 10px 30px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.08)"
                                            },
                                            onMouseEnter: (e)=>{
                                                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                                                e.currentTarget.style.boxShadow = isGold ? "0 0 40px rgba(250,204,21,0.35)" : "0 20px 40px rgba(0,0,0,0.25)";
                                            },
                                            onMouseLeave: (e)=>{
                                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                e.currentTarget.style.boxShadow = isGold ? "0 0 25px rgba(250,204,21,0.2)" : isDark ? "0 10px 30px rgba(0,0,0,0.4)" : "0 10px 25px rgba(0,0,0,0.08)";
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: "100%",
                                                    aspectRatio: "5 / 7",
                                                    background: colors.bg.tertiary,
                                                    overflow: "hidden"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: card.card_image || "/card-placeholder.png",
                                                    alt: card.card_name,
                                                    style: {
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        display: "block"
                                                    },
                                                    onError: (e)=>{
                                                        e.currentTarget.src = "/card-placeholder.png";
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/don/page.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/don/page.tsx",
                                                lineNumber: 357,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/don/page.tsx",
                                            lineNumber: 352,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/don/page.tsx",
                                        lineNumber: 351,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/don/page.tsx",
                                lineNumber: 342,
                                columnNumber: 19
                            }, this)
                        }, `${filterKey}-${i}`, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 337,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 330,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 316,
                columnNumber: 7
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "card-modal-outer",
                style: {
                    position: "fixed",
                    inset: 0,
                    background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.55)",
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24
                },
                onClick: closeModal,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "card-modal-nav-row",
                    style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        width: "100%",
                        maxWidth: 860
                    },
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "card-modal-prev",
                            onClick: ()=>{
                                setSelectedIndex(selectedIndex - 1);
                                setShowBinderPicker(false);
                                setCreatingBinderInline(false);
                                setNewBinderNameInline("");
                            },
                            disabled: selectedIndex <= 0,
                            style: {
                                flexShrink: 0,
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: colors.bg.primary,
                                border: `1px solid ${colors.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: colors.text.primary,
                                cursor: selectedIndex > 0 ? "pointer" : "not-allowed",
                                opacity: selectedIndex <= 0 ? 0.3 : 1,
                                boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)",
                                transition: "all 0.2s"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/app/don/page.tsx",
                                lineNumber: 386,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 380,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "card-modal-container",
                            style: {
                                flex: 1,
                                background: colors.bg.primary,
                                borderRadius: 20,
                                border: `1px solid ${colors.border}`,
                                overflow: "hidden",
                                maxHeight: "90vh",
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: isDark ? "0 32px 64px rgba(0,0,0,0.5)" : "0 32px 64px rgba(0,0,0,0.15)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-modal-header",
                                    style: {
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "18px 24px",
                                        borderBottom: `1px solid ${colors.border}`,
                                        flexShrink: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontWeight: 900,
                                                        fontSize: 20,
                                                        color: colors.text.primary,
                                                        letterSpacing: "-0.02em"
                                                    },
                                                    children: getDonCardName(selected.card_name)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/don/page.tsx",
                                                    lineNumber: 395,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: 12,
                                                        color: colors.text.tertiary,
                                                        marginTop: 2
                                                    },
                                                    children: getDonSetName(selected.optcg_don_name)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/don/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/don/page.tsx",
                                            lineNumber: 394,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8
                                            },
                                            children: [
                                                user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: "relative"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                setShowBinderPicker((p)=>!p);
                                                                setCreatingBinderInline(false);
                                                                setNewBinderNameInline("");
                                                            },
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                                padding: "7px 12px",
                                                                borderRadius: 8,
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                                cursor: "pointer",
                                                                transition: "all 0.2s",
                                                                border: `1px solid ${isInAnyBinder((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected)) ? "#16a34a" : colors.border}`,
                                                                background: isInAnyBinder((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected)) ? isDark ? "rgba(22,163,74,0.15)" : "rgba(22,163,74,0.08)" : "transparent",
                                                                color: isInAnyBinder((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected)) ? "#16a34a" : colors.text.tertiary
                                                            },
                                                            children: [
                                                                isInAnyBinder((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected)) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/don/page.tsx",
                                                                    lineNumber: 411,
                                                                    columnNumber: 67
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookmarkPlus$3e$__["BookmarkPlus"], {
                                                                    size: 14
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/don/page.tsx",
                                                                    lineNumber: 411,
                                                                    columnNumber: 89
                                                                }, this),
                                                                isInAnyBinder((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected)) ? "In binder" : "Add to binder"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/don/page.tsx",
                                                            lineNumber: 407,
                                                            columnNumber: 23
                                                        }, this),
                                                        showBinderPicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                position: "absolute",
                                                                top: "calc(100% + 8px)",
                                                                right: 0,
                                                                width: 240,
                                                                background: colors.bg.primary,
                                                                border: `1px solid ${colors.border}`,
                                                                borderRadius: 12,
                                                                overflow: "hidden",
                                                                boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)",
                                                                zIndex: 10
                                                            },
                                                            onClick: (e)=>e.stopPropagation(),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    padding: "8px 8px 8px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: 10,
                                                                            color: colors.text.tertiary,
                                                                            fontWeight: 600,
                                                                            letterSpacing: "0.07em",
                                                                            textTransform: "uppercase",
                                                                            padding: "4px 8px 6px"
                                                                        },
                                                                        children: "My binders"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/don/page.tsx",
                                                                        lineNumber: 422,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            maxHeight: 180,
                                                                            overflowY: "auto"
                                                                        },
                                                                        children: [
                                                                            binders.length === 0 && !creatingBinderInline && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: 12,
                                                                                    color: colors.text.tertiary,
                                                                                    padding: "6px 10px"
                                                                                },
                                                                                children: "No binders yet."
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/don/page.tsx",
                                                                                lineNumber: 428,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            binders.map((binder)=>{
                                                                                const cardKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected);
                                                                                const inBinder = (binderCardMap[binder.id] ?? []).includes(cardKey);
                                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                    onClick: ()=>handleToggleBinderCard(binder.id, cardKey),
                                                                                    style: {
                                                                                        width: "100%",
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: 10,
                                                                                        padding: "9px 10px",
                                                                                        borderRadius: 8,
                                                                                        border: "none",
                                                                                        cursor: "pointer",
                                                                                        fontSize: 13,
                                                                                        textAlign: "left",
                                                                                        transition: "all 0.15s",
                                                                                        background: inBinder ? isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)" : "transparent",
                                                                                        color: inBinder ? "#6366f1" : colors.text.primary
                                                                                    },
                                                                                    onMouseEnter: (e)=>{
                                                                                        if (!inBinder) e.currentTarget.style.background = colors.bg.secondary;
                                                                                    },
                                                                                    onMouseLeave: (e)=>{
                                                                                        if (!inBinder) e.currentTarget.style.background = "transparent";
                                                                                    },
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                                            size: 14,
                                                                                            style: {
                                                                                                flexShrink: 0
                                                                                            }
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/don/page.tsx",
                                                                                            lineNumber: 442,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            style: {
                                                                                                flex: 1,
                                                                                                whiteSpace: "nowrap",
                                                                                                overflow: "hidden",
                                                                                                textOverflow: "ellipsis"
                                                                                            },
                                                                                            children: binder.name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/don/page.tsx",
                                                                                            lineNumber: 443,
                                                                                            columnNumber: 35
                                                                                        }, this),
                                                                                        inBinder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                                            size: 12,
                                                                                            strokeWidth: 3
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/don/page.tsx",
                                                                                            lineNumber: 444,
                                                                                            columnNumber: 48
                                                                                        }, this)
                                                                                    ]
                                                                                }, binder.id, true, {
                                                                                    fileName: "[project]/app/don/page.tsx",
                                                                                    lineNumber: 435,
                                                                                    columnNumber: 33
                                                                                }, this);
                                                                            })
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/don/page.tsx",
                                                                        lineNumber: 426,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    creatingBinderInline ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 6,
                                                                            padding: "6px 10px",
                                                                            borderRadius: 8,
                                                                            border: `1px solid ${colors.border}`,
                                                                            margin: "4px 0"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                                size: 13,
                                                                                style: {
                                                                                    flexShrink: 0,
                                                                                    color: colors.text.tertiary
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/don/page.tsx",
                                                                                lineNumber: 453,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                autoFocus: true,
                                                                                value: newBinderNameInline,
                                                                                onChange: (e)=>setNewBinderNameInline(e.target.value),
                                                                                onKeyDown: (e)=>{
                                                                                    e.stopPropagation();
                                                                                    if (e.key === "Enter") handleCreateBinderInline((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected));
                                                                                    if (e.key === "Escape") {
                                                                                        setCreatingBinderInline(false);
                                                                                        setNewBinderNameInline("");
                                                                                    }
                                                                                },
                                                                                placeholder: "Binder name...",
                                                                                style: {
                                                                                    flex: 1,
                                                                                    background: "transparent",
                                                                                    border: "none",
                                                                                    outline: "none",
                                                                                    fontSize: 13,
                                                                                    color: colors.text.primary,
                                                                                    fontFamily: "inherit",
                                                                                    minWidth: 0
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/don/page.tsx",
                                                                                lineNumber: 454,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                onClick: ()=>handleCreateBinderInline((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$binder$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDonCardKey"])(selected)),
                                                                                disabled: !newBinderNameInline.trim() || creatingBinderLoading,
                                                                                style: {
                                                                                    flexShrink: 0,
                                                                                    width: 22,
                                                                                    height: 22,
                                                                                    borderRadius: 6,
                                                                                    border: "none",
                                                                                    cursor: newBinderNameInline.trim() ? "pointer" : "not-allowed",
                                                                                    background: newBinderNameInline.trim() ? "#16a34a" : colors.bg.tertiary,
                                                                                    color: newBinderNameInline.trim() ? "#fff" : colors.text.tertiary,
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",
                                                                                    transition: "all 0.15s"
                                                                                },
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                                    size: 12,
                                                                                    strokeWidth: 3
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/don/page.tsx",
                                                                                    lineNumber: 471,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/don/page.tsx",
                                                                                lineNumber: 466,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/don/page.tsx",
                                                                        lineNumber: 452,
                                                                        columnNumber: 31
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setCreatingBinderInline(true),
                                                                        style: {
                                                                            width: "100%",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 10,
                                                                            padding: "9px 10px",
                                                                            borderRadius: 8,
                                                                            border: `1px dashed ${colors.border}`,
                                                                            cursor: "pointer",
                                                                            fontSize: 13,
                                                                            textAlign: "left",
                                                                            transition: "all 0.15s",
                                                                            background: "transparent",
                                                                            color: colors.text.tertiary,
                                                                            marginTop: 4
                                                                        },
                                                                        onMouseEnter: (e)=>{
                                                                            e.currentTarget.style.background = colors.bg.secondary;
                                                                            e.currentTarget.style.borderColor = colors.text.tertiary;
                                                                            e.currentTarget.style.color = colors.text.primary;
                                                                        },
                                                                        onMouseLeave: (e)=>{
                                                                            e.currentTarget.style.background = "transparent";
                                                                            e.currentTarget.style.borderColor = colors.border;
                                                                            e.currentTarget.style.color = colors.text.tertiary;
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                                                size: 14,
                                                                                style: {
                                                                                    flexShrink: 0
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/don/page.tsx",
                                                                                lineNumber: 481,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            "New binder"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/don/page.tsx",
                                                                        lineNumber: 475,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/don/page.tsx",
                                                                lineNumber: 421,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/don/page.tsx",
                                                            lineNumber: 417,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/don/page.tsx",
                                                    lineNumber: 406,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: closeModal,
                                                    style: {
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        padding: 4,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                        size: 20,
                                                        color: colors.text.tertiary
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/don/page.tsx",
                                                        lineNumber: 492,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/don/page.tsx",
                                                    lineNumber: 491,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/don/page.tsx",
                                            lineNumber: 402,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 393,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-modal-body",
                                    style: {
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 24
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-modal-image-pane",
                                        style: {
                                            width: "100%",
                                            maxWidth: 320
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ModalCardImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: selected.card_image || "/card-placeholder.png",
                                            alt: selected.card_name,
                                            isDark: isDark,
                                            backSrc: "/don-back.png"
                                        }, selected.card_image || selected.card_name || selectedIndex, false, {
                                            fileName: "[project]/app/don/page.tsx",
                                            lineNumber: 500,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/don/page.tsx",
                                        lineNumber: 499,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 498,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "card-modal-footer",
                                    style: {
                                        borderTop: `1px solid ${colors.border}`,
                                        padding: "10px 24px",
                                        textAlign: "center",
                                        fontSize: 12,
                                        color: colors.text.tertiary,
                                        flexShrink: 0
                                    },
                                    children: [
                                        selectedIndex + 1,
                                        " / ",
                                        filteredCards.length
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/don/page.tsx",
                                    lineNumber: 511,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 390,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "card-modal-next",
                            onClick: ()=>{
                                setSelectedIndex(selectedIndex + 1);
                                setShowBinderPicker(false);
                                setCreatingBinderInline(false);
                                setNewBinderNameInline("");
                            },
                            disabled: selectedIndex >= filteredCards.length - 1,
                            style: {
                                flexShrink: 0,
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: colors.bg.primary,
                                border: `1px solid ${colors.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: colors.text.primary,
                                cursor: selectedIndex < filteredCards.length - 1 ? "pointer" : "not-allowed",
                                opacity: selectedIndex >= filteredCards.length - 1 ? 0.3 : 1,
                                boxShadow: isDark ? "0 20px 25px rgba(0,0,0,0.4)" : "0 10px 15px rgba(0,0,0,0.1)",
                                transition: "all 0.2s"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/app/don/page.tsx",
                                lineNumber: 523,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/don/page.tsx",
                            lineNumber: 517,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/don/page.tsx",
                    lineNumber: 377,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 372,
                columnNumber: 9
            }, this),
            showScrollTop && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    }),
                style: {
                    position: "fixed",
                    bottom: 32,
                    left: "calc(50% + 40px)",
                    transform: "translateX(-50%)",
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: tc.bg.tertiary,
                    color: colors.text.primary,
                    border: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    fontSize: 22,
                    fontWeight: 700,
                    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)",
                    zIndex: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                },
                children: "↑"
            }, void 0, false, {
                fileName: "[project]/app/don/page.tsx",
                lineNumber: 531,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/don/page.tsx",
        lineNumber: 209,
        columnNumber: 5
    }, this);
}
_s(DonCardsPage, "WP6f3GN7QfxVfNpt8GkceELn6MI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$useBodyScrollLock$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBodyScrollLock"]
    ];
});
_c = DonCardsPage;
var _c;
__turbopack_context__.k.register(_c, "DonCardsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_cde7454d._.js.map