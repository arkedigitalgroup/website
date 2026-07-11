// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}", // app router
        "./pages/**/*.{js,ts,jsx,tsx,mdx}", // pages router
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Core Navy ──
                navy: {
                    deep: "#002147",
                    mid: "#003570",
                    surface: "#0A3060",
                    border: "#1A4A80",
                    hover: "#0D3D7A",
                },
                // ── Gold ──
                gold: {
                    primary: "#E8B84B",
                    hover: "#D4A030",
                    muted: "#C5933A",
                },
                // ── Yeneta ──
                yt: {
                    maroon: "#800020",
                    "maroon-hover": "#9A0028",
                    gold: "#C5A059",
                    parchment: "#F5EDD6",
                },
                // ── Fidel ──
                ft: {
                    teal: "#0D9488",
                    "teal-hover": "#0F766E",
                    "teal-faint": "rgba(13, 148, 136, 0.12)",
                    amber: "#F59E0B",
                    "amber-hover": "#D97706",
                    "amber-faint": "rgba(245, 158, 11, 0.12)",
                    obsidian: "#0F172A",
                    "obsidian-surface": "#1E293B",
                    "obsidian-border": "#334155",
                    cool: "#F0F6FF",
                },
                // ── Cream ──
                cream: "#F7F5F0",
                // ── Semantic ──
                success: "var(--success)",
                warning: "var(--warning)",
                error: "var(--error)",
                info: "var(--info)",
            },
            fontFamily: {
                latin: ["Inter", "system-ui", "sans-serif"],
                ethiopic: ["Noto Sans Ethiopic", "sans-serif"],
            },
            borderRadius: {
                sm: "6px",
                md: "10px",
                lg: "14px",
                xl: "20px",
            },
            boxShadow: {
                navy: "0 4px 12px rgba(0, 0, 0, 0.35)",
                gold: "0 0 20px rgba(232, 184, 75, 0.25)",
            },
            // ── Background patterns for hero sections ──
            backgroundImage: {
                "gold-shine":
                    "linear-gradient(135deg, #E8B84B 0%, #C5933A 100%)",
                "navy-gradient":
                    "linear-gradient(180deg, #002147 0%, #003570 100%)",
            },
        },
    },
    plugins: [],
};

export default config;
