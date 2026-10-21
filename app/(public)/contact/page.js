// app/(public)/contact/page.js
import React from "react";
import ContactPageClient from "./page.client";

const SITE_URL = "https://www.arke-group.com";
const PAGE_URL = `${SITE_URL}/contact`;

export const metadata = {
    title: "Contact Arke — Academic Tutoring Enquiries",
    description:
        "Contact Arke Digital Learning in Addis Ababa about Fidel academic tutoring, enrollment, or teaching. Call +251 990 285 748, email info@arke-group.com, or send a message.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Contact Arke — Academic Tutoring Enquiries",
        description:
            "Questions about Fidel tutoring, enrollment, or teaching with Arke? Call, email, or send a message.",
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
        title: "Contact Arke — Academic Tutoring Enquiries",
        description:
            "Questions about Fidel tutoring, enrollment, or teaching with Arke? Call, email, or send a message.",
        images: [`${SITE_URL}/fidelPageHero.jpg`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ContactPage() {
    return <ContactPageClient />;
}
