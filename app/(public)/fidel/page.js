// app/(public)/fidel/page.js
import React from "react";
import FidelPageClient from "./page.client";
import { publicFidelCourses } from "../../../src/lib/fidelCatalog";

const SITE_URL = "https://www.arke-group.com";
const PAGE_URL = `${SITE_URL}/fidel`;
const OG_IMAGE = {
    url: `${SITE_URL}/fidelPageHero.jpg`,
    width: 1280,
    height: 696,
    alt: "Fidel academic tutoring study materials",
};

export const metadata = {
    title: "Fidel Courses — Grades 5–12 Academic Tutoring",
    description:
        "Browse Fidel academic courses for Grades 5–12 in Addis Ababa. Each course lists supported grades, delivery format, price and billing unit. Mathematics, sciences, languages, computer science and exam preparation.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Fidel Courses — Academic Tutoring for Grades 5–12",
        description:
            "Course catalog with grades, formats and prices. In-home, online and hybrid tutoring in Addis Ababa.",
        url: PAGE_URL,
        images: [OG_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title: "Fidel Courses — Academic Tutoring for Grades 5–12",
        description:
            "Course catalog with grades, formats and prices. In-home, online and hybrid tutoring in Addis Ababa.",
        images: [OG_IMAGE.url],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const courseList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fidel academic courses",
    url: PAGE_URL,
    numberOfItems: publicFidelCourses.length,
    itemListElement: publicFidelCourses.map((course, index) => {
        const pricing = course.pricing ?? {};
        return {
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Course",
                name: course.course_name,
                description: course.description,
                url: `${PAGE_URL}#courses`,
                provider: {
                    "@type": "EducationalOrganization",
                    name: "Arke Digital Learning",
                    sameAs: SITE_URL,
                },
                offers: {
                    "@type": "AggregateOffer",
                    priceCurrency: pricing.currency || "ETB",
                    lowPrice: pricing.price,
                    highPrice: pricing.price_max ?? pricing.price,
                    category: pricing.pricing_model,
                },
                educationalLevel: course.grade_range,
                inLanguage: course.language,
            },
        };
    }),
};

const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Which grades and subjects are supported?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Most Fidel courses cover Grades 5–12. Some courses are narrower, such as Grade 8 exam preparation or Grades 9–12 mathematics. Each course card lists its supported grades and subjects.",
            },
        },
        {
            "@type": "Question",
            name: "How is the tutor chosen?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "You choose a course and register with your child's grade, subject and location. Arke reviews available tutors for that subject and area, then proposes a match.",
            },
        },
        {
            "@type": "Question",
            name: "What will lessons cost?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Each course shows either an hourly range, a monthly price or a full-programme price. A one-time registration fee and a monthly service fee may apply; the registration form shows the fees that apply to your account before submission.",
            },
        },
        {
            "@type": "Question",
            name: "Can lessons be online or at home?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Fidel courses are delivered in person at home, online, or in a hybrid format. The format is shown on each course card and confirmed during matching.",
            },
        },
        {
            "@type": "Question",
            name: "Is religious education part of Fidel?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "No. Religious education is provided through Yeneta, Arke's separate branch, with its own page and enrollment flow.",
            },
        },
    ],
};

export default function FidelPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseList) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
            />
            <FidelPageClient />
        </>
    );
}
