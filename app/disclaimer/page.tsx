"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ChevronLeft } from "lucide-react";

/* ─────────────────────────────────────────────
   CONTENT
───────────────────────────────────────────── */

const SECTIONS = [
  {
    title: "Fan Project",
    body: "Enies Hobby TCG is an unofficial, non-commercial fan project created for personal and community use. It is not affiliated with, endorsed by, sponsored by, or connected to Bandai Co., Ltd., Toei Animation, or Eiichiro Oda in any way.",
  },
  {
    title: "Intellectual Property",
    body: "One Piece and all related characters, card names, artwork, and game mechanics are trademarks and copyrights of Bandai Co., Ltd. and Eiichiro Oda / Shueisha. All card images displayed on this site are the property of their respective owners and are used here purely for fan reference purposes with no commercial intent.",
  },
  {
    title: "No Commercial Use",
    body: "This website does not charge fees, sell cards, generate revenue, or monetize card images or game content in any way. No official assets are redistributed or downloaded through this platform.",
  },
  {
    title: "Account & Data",
    body: "Authentication and user data (collection tracking, binder contents) are stored securely via Supabase. We do not sell, share, or use your personal data for any purpose other than providing the service.",
  },
  {
    title: "Accuracy",
    body: "Card data is sourced from community APIs and may be incomplete, outdated, or inaccurate. We make no guarantees about the correctness of card text, rulings, or set information.",
  },
  {
    title: "Use at Your Own Risk",
    body: "This service is provided as-is with no warranties of any kind. We are not responsible for any loss of data, service interruptions, or inaccuracies.",
  },
  {
    title: "Takedown / DMCA",
    body: "If you are a rights holder and believe any content on this site infringes your intellectual property, please contact us and we will address it promptly.",
  },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */

export default function DisclaimerPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="disclaimer-wrapper min-h-screen bg-bg-primary text-text-primary ml-17.5 transition-all duration-300"
      suppressHydrationWarning
    >
      <Sidebar />

      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-bg-primary/80 border-b border-border-theme px-8 py-3.5 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="bg-transparent border-0 cursor-pointer flex items-center gap-1.5 text-text-secondary text-[13px] p-0 hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="w-px h-4 bg-border-theme" />

        <span className="text-[13px] text-text-tertiary">
          Legal
        </span>
      </div>

      {/* CONTENT */}
      <div className="max-w-180 mx-auto px-8 pt-16 pb-24">
        {/* HERO */}
        <div className="mb-14">
          <div className="text-[11px] font-bold tracking-widest uppercase text-accent-theme mb-4">
            Disclaimer
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight leading-none mb-4.5 text-text-primary">
            Terms & Conditions
          </h1>

          <p className="text-[15px] leading-relaxed text-text-secondary max-w-140">
            Please read the following before using Enies Hobby TCG.
            By using this site you acknowledge and agree to the
            terms below.
          </p>

          <div className="mt-6 text-xs text-text-tertiary">
            Last updated · May 2026
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px bg-border-theme mb-13" />

        {/* SECTIONS */}
        <div className="flex flex-col gap-11">
          {SECTIONS.map((s, i) => (
            <div
              key={s.title}
              className="grid grid-cols-[28px_1fr] gap-5 items-start"
            >
              <div className="text-[11px] font-bold text-text-tertiary pt-0.5 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div>
                <div className="text-base font-bold text-text-primary mb-2.5 tracking-tight">
                  {s.title}
                </div>

                <p className="m-0 text-sm leading-relaxed text-text-secondary">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER CARD */}
        <div className="mt-18 p-6.5 rounded-[18px] bg-bg-secondary border border-border-theme">
          <div className="text-[13px] leading-relaxed text-text-secondary">
            <strong className="text-text-primary">
              One Piece TCG
            </strong>{" "}
            © Bandai Co., Ltd. · One Piece © Eiichiro Oda /
            Shueisha · Enies Hobby TCG is an independent fan
            project with no commercial affiliation.
          </div>
        </div>
      </div>
    </div>
  );
}