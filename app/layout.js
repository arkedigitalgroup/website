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
        default:
            "Arke Digital Learning | Fidel Academic Tutoring for Grades 5–12",
        template: "%s | Arke Digital Learning",
    },
    description:
        "Fidel academic tutoring for Grades 5–12 in Addis Ababa: mathematics, sciences, languages, computer science and exam preparation. In-home, online and hybrid lessons. Yeneta is our separate religious-education branch. የአካዳሚክ አስጠኚ ለክፍል 5–12።",
    applicationName: "Arke Digital Learning",
    openGraph: {
        siteName: "Arke Digital Learning",
        locale: "am_ET",
        alternateLocale: "en_US",
        type: "website",
        images: [
            {
                url: "/fidelPageHero.jpg",
                width: 1280,
                height: 696,
                alt: "Arke Fidel academic tutoring study materials",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
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
