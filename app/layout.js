// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../src/context/LanguageContext";
import { AuthProvider } from "../src/context/AuthContext";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-latin",
});

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

export const metadata = {
    title: "Arke Digital Learning",
    icons: {
        icon: "/arkelogo.png",
    },
    description:
        "Bilingual (Amharic + English) Educational Platform connecting students and verified tutors in Ethiopia. Fusing Excellence with Ethics!",
};

export default function RootLayout({ children }) {
    return (
        <html lang="am" className={`${inter.variable}`}>
            <head>
                {/* Leaflet CSS for free maps */}
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </head>
            <body className="antialiased min-h-screen text-white bg-navy-deep">
                <LanguageProvider>
                    <AuthProvider>{children}</AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
