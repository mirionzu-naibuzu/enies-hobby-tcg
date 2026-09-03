import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const impact = localFont({
  src: "../public/fonts/Impact.ttf",
  variable: "--font-impact",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enies Hobby TCG",
  description: "Browse One Piece TCG cards",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${impact.variable}`} suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={[
            "light",
            "dark",
            "marineford-light",
            "marineford-dark",
            "thrillerbark-light",
            "thrillerbark-dark",
            "alabasta-light",
            "alabasta-dark",
            "fishman-light",
            "fishman-dark",
          ]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}