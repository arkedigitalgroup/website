// app/(public)/page.js
import React from "react";
import HomePageClient from "./page.client";

const SITE_URL = "https://www.arke-group.com";
const OG_IMAGE = {
    url: `${SITE_URL}/fidelPageHero.jpg`,
    width: 1280,
    height: 696,
    alt: "Arke Fidel academic tutoring — study desk with notebooks and textbooks",
};

export const metadata = {
    title: "Fidel Academic Tutoring — Grades 5–12 in Addis Ababa",
    description:
        "Fidel by Arke provides academic tutoring for Grades 5–12 in Addis Ababa: mathematics, sciences, languages, computer science and exam preparation. In-home, online and hybrid lessons. የአካዳሚክ አስጠኚ ለክፍል 5–12።",
    alternates: {
        canonical: `${SITE_URL}/`,
    },
    openGraph: {
        title: "Fidel Academic Tutoring — Arke Digital Learning",
        description:
            "Subject tutoring for Grades 5–12 in Addis Ababa. In-home, online and hybrid lessons, with grades, formats and prices shown before enrollment.",
        url: `${SITE_URL}/`,
        images: [OG_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title: "Fidel Academic Tutoring — Arke Digital Learning",
        description:
            "Academic tutoring for Grades 5–12 in Addis Ababa. In-home, online and hybrid lessons.",
        images: [OG_IMAGE.url],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "EducationalOrganization",
            "@id": `${SITE_URL}/#organization`,
            name: "Arke Digital Learning",
            alternateName: "አርኬ ዲጂታል ትምህርት",
            url: SITE_URL,
            logo: `${SITE_URL}/arkelogo.png`,
            description:
                "Academic tutoring for Grades 5–12 in Addis Ababa. Fidel is Arke's main academic service; Yeneta is a separate religious-education branch.",
            address: {
                "@type": "PostalAddress",
                addressLocality: "Addis Ababa",
                addressCountry: "ET",
            },
            areaServed: {
                "@type": "City",
                name: "Addis Ababa",
            },
            contactPoint: [
                {
                    "@type": "ContactPoint",
                    telephone: "+251990285748",
                    contactType: "customer service",
                    areaServed: "ET",
                    availableLanguage: ["Amharic", "English"],
                },
            ],
            sameAs: [
                "https://t.me/arkegroup",
                "https://facebook.com/share/17kUg7tM9n/",
                "https://www.instagram.com/arke_.group",
            ],
            hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Fidel academic tutoring",
                itemListElement: [
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "In-person home tutoring — all subjects",
                            description:
                                "Grades 5–12 subject tutoring at home in Addis Ababa.",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Grade 8 national exam preparation (online)",
                            description:
                                "Weekend online preparation for the Grade 8 national examination.",
                        },
                    },
                    {
                        "@type": "Offer",
                        itemOffered: {
                            "@type": "Service",
                            name: "Advanced mathematics tutoring — Grades 9–12",
                            description:
                                "Online mathematics tutoring covering algebra, geometry, calculus, statistics and trigonometry.",
                        },
                    },
                ],
            },
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: "Arke Digital Learning",
            publisher: { "@id": `${SITE_URL}/#organization` },
            inLanguage: ["am", "en"],
        },
    ],
};

export default function HomePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <HomePageClient />
        </>
    );
}
