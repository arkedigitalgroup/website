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
    metadataBase: new URL("https://www.arke-group.com"),
    title: {
        default: "Arke Digital Learning | ዕውቀት ለስኬት፣ ሥነ-ምግባር ለሕይወት",
        template: "%s | Arke Digital Learning",
    },
    description:
        "የኦርቶዶክስ መንፈሳዊና አካዳሚክ አስጠኚ — Connecting Ethiopian students with verified, church-certified tutors for Geez, Qidasse, Zema, and academic subjects.",
    openGraph: {
        siteName: "Arke Digital Learning",
        locale: "am_ET",
        alternateLocale: "en_US",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: "/arkelogo.png",
    },
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
