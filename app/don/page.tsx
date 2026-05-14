"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ChevronLeft, Search, ChevronUp } from "lucide-react";

interface DonCard {
  card_name: string;
  card_text: string;
  rarity: string;
  card_image: string;
  optcg_don_name: string;
  inventory_price: number;
  market_price: number;
}

export default function DonCardsPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [donCards, setDonCards] = useState<DonCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [showScrollTop, setShowScrollTop] = useState(false);

  const isDark = mounted && theme === "dark";

  const colors = {
    bg: {
      primary: isDark ? "#111827" : "#ffffff",
      secondary: isDark ? "#1f2937" : "#f9fafb",
      tertiary: isDark ? "#374151" : "#ffffff",
    },
    text: {
      primary: isDark ? "#f3f4f6" : "#111827",
      secondary: isDark ? "#d1d5db" : "#4b5563",
      tertiary: isDark ? "#9ca3af" : "#6b7280",
    },
    border: isDark ? "#374151" : "#e5e7eb",
    accent: "#ef4444",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDonCards() {
      try {
        const res = await fetch("https://www.optcgapi.com/api/allDonCards/");
        const data = await res.json();
        setDonCards(data);
        console.log(`✅ Loaded ${data.length} DON!! cards`);
      } catch (err) {
        console.error("Error fetching DON!! cards:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDonCards();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
  
    window.addEventListener("scroll", handleScroll);
  
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredCards = useMemo(() => {
    return donCards.filter((card) => {
      const matchesSearch =
        card.card_name.toLowerCase().includes(search.toLowerCase()) ||
        card.optcg_don_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All"
          ? true
          : activeFilter === "Gold"
          ? card.card_name.toLowerCase().includes("(gold)")
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [donCards, search, activeFilter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      suppressHydrationWarning
      style={{
        minHeight: "100vh",
        background: colors.bg.primary,
        transition: "background-color 0.3s",
        color: colors.text.primary,
        marginLeft: 70,
      }}
    >
      <Sidebar />

      {/* Header */}
      <header
        style={{
          background: colors.bg.secondary,
          borderBottom: `1px solid ${colors.border}`,
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: colors.text.primary,
            display: "flex",
            alignItems: "center",
            padding: 8,
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>
          DON<span style={{ color: "#ef4444" }}>!!</span> Cards
        </h1>
      </header>

      {/* Search + Filters */}
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            minWidth: 240,
            position: "relative",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: colors.text.tertiary,
            }}
          />

          <input
            type="text"
            placeholder="Search DON!! cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              borderRadius: 14,
              border: `1px solid ${colors.border}`,
              background: colors.bg.secondary,
              color: colors.text.primary,
              outline: "none",
              fontSize: 14,
            }}
          />
        </div>

        {/* Filters */}
        {["All", "Gold"].map((filter) => {
          const active = activeFilter === filter;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 14,
                transition: "all 0.2s",

                background: active
                  ? filter === "Gold"
                    ? "linear-gradient(135deg, #facc15, #eab308)"
                    : "#ef4444"
                  : isDark
                  ? "#1f2937"
                  : "#f3f4f6",

                color: active
                  ? filter === "Gold"
                    ? "#111827"
                    : "#ffffff"
                  : colors.text.primary,

                boxShadow:
                  active && filter === "Gold"
                    ? "0 0 20px rgba(250, 204, 21, 0.35)"
                    : "none",
              }}
            >
              {filter === "Gold" ? "Gold" : filter}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <main
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 64,
        }}
      >
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .skeleton-loader {
            animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;
          }
        `}</style>

        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-loader"
                style={{
                  borderRadius: 16,
                  background: colors.bg.secondary,
                  border: `1px solid ${colors.border}`,
                  aspectRatio: "2.5 / 3.5",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 16,
            }}
          >
            {filteredCards.map((card, i) => {
              const isGold = card.card_name
                .toLowerCase()
                .includes("(gold)");

              return (
                <div
                  key={i}
                  style={{
                    cursor: "pointer",
                    borderRadius: 18,
                    overflow: "hidden",
                    background: colors.bg.secondary,
                    border: isGold
                      ? "1px solid #facc15"
                      : `1px solid ${colors.border}`,
                    transition: "all 0.2s ease",
                    transform: "translateY(0)",
                    boxShadow: isGold
                      ? "0 0 20px rgba(250,204,21,0.15)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    const element =
                      e.currentTarget as HTMLDivElement;

                    element.style.transform = "translateY(-4px)";
                    element.style.boxShadow = isGold
                      ? "0 0 30px rgba(250,204,21,0.35)"
                      : isDark
                      ? "0 20px 25px rgba(0,0,0,0.4)"
                      : "0 20px 25px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const element =
                      e.currentTarget as HTMLDivElement;

                    element.style.transform = "translateY(0)";
                    element.style.boxShadow = isGold
                      ? "0 0 20px rgba(250,204,21,0.15)"
                      : "none";
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "2.5 / 3.5",
                      overflow: "hidden",
                      background: isDark
                        ? "#0f172a"
                        : "#e5e7eb",
                    }}
                  >
                    <img
                      src={card.card_image || "/don-back.png"}
                      alt={card.card_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        const img =
                          e.currentTarget as HTMLImageElement;

                        img.src = "/don-back.png";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredCards.length === 0 && (
          <div
            style={{
              textAlign: "center",
              paddingTop: 96,
              paddingBottom: 96,
              color: colors.text.tertiary,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              🎴
            </div>

            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: colors.text.primary,
              }}
            >
              No DON!! cards found
            </div>
          </div>
        )}
      </main>
      {showScrollTop && (
  <button
    onClick={scrollToTop}
    style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      width: 52,
      height: 52,
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      background: isDark ? "#1f2937" : "#ffffff",
      color: colors.text.primary,
      boxShadow: isDark
        ? "0 10px 25px rgba(0,0,0,0.4)"
        : "0 10px 25px rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      const element = e.currentTarget;

      element.style.transform =
        "translateX(-50%) translateY(-3px)";
    }}
    onMouseLeave={(e) => {
      const element = e.currentTarget;

      element.style.transform =
        "translateX(-50%) translateY(0)";
    }}
  >
    <ChevronUp size={22} />
  </button>
)}

</div>
  );
}