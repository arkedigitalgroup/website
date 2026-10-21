// app/(public)/yeneta/page.js
import React from "react";
import YenetaPageClient from "./page.client";

const SITE_URL = "https://www.arke-group.com";
const PAGE_URL = `${SITE_URL}/yeneta`;

export const metadata = {
    title: "Yeneta — Spiritual & Religious Education",
    description:
        "Yeneta is Arke's separate religious-education branch: home-based Ge'ez, Qidasse, Zema, Begena and ethics lessons in Addis Ababa. Tutor applications and qualifications are reviewed before assignment.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Yeneta — Spiritual & Religious Education",
        description:
            "Home-based Ge'ez, Qidasse, Zema and ethics lessons in Addis Ababa, through Arke's dedicated Yeneta branch.",
        url: PAGE_URL,
        images: [
            {
                url: `${SITE_URL}/yenetapageHero.png`,
                width: 1536,
                height: 1024,
                alt: "Yeneta spiritual education",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Yeneta — Spiritual & Religious Education",
        description:
            "Home-based Ge'ez, Qidasse, Zema and ethics lessons in Addis Ababa, through Arke's dedicated Yeneta branch.",
        images: [`${SITE_URL}/yenetapageHero.png`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function YenetaPage() {
    return <YenetaPageClient />;
}
