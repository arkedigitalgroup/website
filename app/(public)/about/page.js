// app/(public)/about/page.js
import React from "react";
import AboutPageClient from "./page.client";

const SITE_URL = "https://www.arke-group.com";
const PAGE_URL = `${SITE_URL}/about`;

export const metadata = {
    title: "About Arke — Fidel Academic Tutoring",
    description:
        "Arke Digital Learning is an academic tutoring company in Addis Ababa. Fidel supports Grades 5–12 at home or online; Yeneta is a separate religious-education branch.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "About Arke — Fidel Academic Tutoring",
        description:
            "Our approach to academic tutoring in Addis Ababa: subject matching, tutor review, progress reporting and clear pricing.",
        url: PAGE_URL,
        images: [
            {
                url: `${SITE_URL}/fidelPageHero.jpg`,
                width: 1280,
                height: 696,
                alt: "Fidel academic study materials",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Arke — Fidel Academic Tutoring",
        description:
            "Our approach to academic tutoring in Addis Ababa: subject matching, tutor review, progress reporting and clear pricing.",
        images: [`${SITE_URL}/fidelPageHero.jpg`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function AboutPage() {
    return <AboutPageClient />;
}
