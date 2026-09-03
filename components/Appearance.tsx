"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";

const themes = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
  { name: "Bloom", value: "bloom" },
  { name: "Bloom Dark", value: "bloom-dark" },
  { name: "Luna Violet", value: "luna-violet" },
  { name: "Luna Dark", value: "luna-dark" },
];

export default function AppearancePopover() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("luna-violet");
  const ref = useRef<HTMLDivElement>(null);

  // close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="px-3.5 py-2.5 rounded-[10px] border border-gray-200 bg-white cursor-pointer text-sm font-medium hover:bg-gray-50"
      >
        Appearance
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute bottom-[110%] left-0 w-65 bg-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-200 z-50">
          <div className="font-bold mb-3 text-sm text-gray-900">
            Appearance
          </div>

          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => {
              const active = selected === theme.value;

              return (
                <div
                  key={theme.value}
                  onClick={() => setSelected(theme.value)}
                  className={`rounded-xl p-2 cursor-pointer bg-gray-50 transition-all ${
                    active ? "border-2 border-purple-500" : "border border-gray-200"
                  }`}
                >
                  {/* Preview */}
                  <div
                    className={`h-15 rounded-lg relative p-1.5 ${
                      theme.value.includes("dark") ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <div className="h-2 w-3/5 bg-gray-300 rounded mb-1.5" />
                    <div className="h-4 w-4 bg-gray-400 rounded-md" />
                    <div
                      className={`absolute bottom-1.5 right-1.5 h-2 w-10 rounded-[10px] ${
                        theme.value.includes("violet")
                          ? "bg-purple-500"
                          : theme.value.includes("bloom")
                          ? "bg-rose-400"
                          : "bg-orange-500"
                      }`}
                    />

                    {/* Check */}
                    {active && (
                      <div className="absolute top-1.5 right-1.5 bg-purple-500 rounded-full p-0.5">
                        <Check size={12} color="white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center text-xs mt-1.5 text-gray-700 font-medium">
                    {theme.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}