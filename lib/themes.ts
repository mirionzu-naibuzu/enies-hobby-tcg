export type ThemeColors = {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: string;
  accent: string;
  isDark: boolean;
};

const THEMES: Record<string, ThemeColors> = {
  light: {
    bg:   { primary: "#ffffff",  secondary: "#f9fafb",  tertiary: "#f3f4f6"  },
    text: { primary: "#111827",  secondary: "#4b5563",  tertiary: "#6b7280"  },
    border: "#e5e7eb",
    accent: "#ef4444",
    isDark: false,
  },
  dark: {
    bg:   { primary: "#111827",  secondary: "#1f2937",  tertiary: "#374151"  },
    text: { primary: "#f3f4f6",  secondary: "#d1d5db",  tertiary: "#9ca3af"  },
    border: "#374151",
    accent: "#ef4444",
    isDark: true,
  },

  // ── Marineford ──────────────────────────────────────
  "marineford-light": {
    bg:   { primary: "#f0f4f8",  secondary: "#e2eaf2",  tertiary: "#ccdbe8"  },
    text: { primary: "#1a3a5c",  secondary: "#2d5a8a",  tertiary: "#5a85aa"  },
    border: "#b8d0e8",
    accent: "#1e6091",
    isDark: false,
  },
  "marineford-dark": {
    bg:   { primary: "#0d1b2a",  secondary: "#132336",  tertiary: "#1a2f45"  },
    text: { primary: "#e8f2fa",  secondary: "#a8c8e8",  tertiary: "#5a85aa"  },
    border: "#1e3a55",
    accent: "#2980b9",
    isDark: true,
  },

  // ── Thriller Bark ───────────────────────────────────
  "thrillerbark-light": {
    bg:   { primary: "#f5f0ff",  secondary: "#ede8fa",  tertiary: "#e0d8f5"  },
    text: { primary: "#2d1b69",  secondary: "#4c3a8a",  tertiary: "#7c6aaa"  },
    border: "#c8b8f0",
    accent: "#7c3aed",
    isDark: false,
  },
  "thrillerbark-dark": {
    bg:   { primary: "#0f0a1a",  secondary: "#18102e",  tertiary: "#221840"  },
    text: { primary: "#f0ebff",  secondary: "#c4b5fd",  tertiary: "#7c6aaa"  },
    border: "#2d1b55",
    accent: "#7c3aed",
    isDark: true,
  },

  // ── Alabasta ─────────────────────────────────────────
  "alabasta-light": {
    bg:   { primary: "#fffbf0",  secondary: "#fdf4d8",  tertiary: "#f9e8a8"  },
    text: { primary: "#3d2800",  secondary: "#7a5c00",  tertiary: "#a07830"  },
    border: "#e8c858",
    accent: "#d97706",
    isDark: false,
  },
  // Improved: desaturated warm browns, comfortable contrast
  "alabasta-dark": {
    bg:   { primary: "#17130c",  secondary: "#211a10",  tertiary: "#2c2318"  },
    text: { primary: "#ede0c4",  secondary: "#c4a06a",  tertiary: "#8a6e48"  },
    border: "#3a2e1a",
    accent: "#c8850a",
    isDark: true,
  },

  // ── Fishman Island ───────────────────────────────────
  "fishman-light": {
    bg:   { primary: "#f0f9ff",  secondary: "#ddf0fa",  tertiary: "#b8e4f5"  },
    text: { primary: "#0a2c42",  secondary: "#1a5a80",  tertiary: "#3a8aaa"  },
    border: "#88c8e8",
    accent: "#0891b2",
    isDark: false,
  },
  "fishman-dark": {
    bg:   { primary: "#030e18",  secondary: "#071826",  tertiary: "#0c2435"  },
    text: { primary: "#e0f5ff",  secondary: "#7ac8ea",  tertiary: "#3a8aaa"  },
    border: "#0c2435",
    accent: "#0ea5e9",
    isDark: true,
  },
};

export function getColors(theme: string | undefined, mounted: boolean): ThemeColors {
  if (!mounted) return THEMES.light;
  return THEMES[theme ?? "light"] ?? THEMES.light;
}

// Paired: [light, dark] per row — order matters for the appearance panel layout
export const ALL_THEMES = [
  {
    value: "light",
    name: "Light",
    preview: { bg: "#ffffff", bar: "#ef4444", dark: false },
  },
  {
    value: "dark",
    name: "Dark",
    preview: { bg: "#1f2937", bar: "#ef4444", dark: true },
  },
  {
    value: "marineford-light",
    name: "Marineford",
    preview: { bg: "#f0f4f8", bar: "#1e6091", dark: false },
  },
  {
    value: "marineford-dark",
    name: "Marineford Dark",
    preview: { bg: "#0d1b2a", bar: "#2980b9", dark: true },
  },
  {
    value: "thrillerbark-light",
    name: "Thriller Bark",
    preview: { bg: "#f5f0ff", bar: "#7c3aed", dark: false },
  },
  {
    value: "thrillerbark-dark",
    name: "Thriller Bark Dark",
    preview: { bg: "#0f0a1a", bar: "#7c3aed", dark: true },
  },
  {
    value: "alabasta-light",
    name: "Alabasta",
    preview: { bg: "#fffbf0", bar: "#d97706", dark: false },
  },
  {
    value: "alabasta-dark",
    name: "Alabasta Dark",
    preview: { bg: "#17130c", bar: "#c8850a", dark: true },
  },
  {
    value: "fishman-light",
    name: "Fishman Island",
    preview: { bg: "#f0f9ff", bar: "#0891b2", dark: false },
  },
  {
    value: "fishman-dark",
    name: "Fishman Dark",
    preview: { bg: "#030e18", bar: "#0ea5e9", dark: true },
  },
];