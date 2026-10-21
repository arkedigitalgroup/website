// app/(public)/fidel/exam-preparation/page.js
import React from "react";
import ExamPreparationClient from "./page.client";
import { findPublicCourse } from "../../../../src/lib/fidelCatalog";

const SITE_URL = "https://www.arke-group.com";
const PAGE_URL = `${SITE_URL}/fidel/exam-preparation`;
const COURSE_SLUG = "grade-8-national-exam-prep-online";

const course = findPublicCourse(COURSE_SLUG);

export const metadata = {
    title: "Grade 8 National Exam Preparation",
    description:
        "Weekend online Grade 8 national exam preparation in Addis Ababa: subject revision, practice questions, model exams and exam timing with Fidel tutors.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Grade 8 National Exam Preparation | Fidel",
        description:
            "Structured weekend online revision for the Grade 8 national exam: practice questions, model exams and timing strategy.",
        url: PAGE_URL,
        images: [
            {
                url: `${SITE_URL}/fidelPageHero.jpg`,
                width: 1280,
                height: 696,
                alt: "Fidel exam preparation study materials",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Grade 8 National Exam Preparation | Fidel",
        description:
            "Weekend online Grade 8 exam preparation with practice questions, model exams and timing strategy.",
        images: [`${SITE_URL}/fidelPageHero.jpg`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

const structuredData = course
    ? {
          "@context": "https://schema.org",
          "@graph": [
              {
                  "@type": "Course",
                  name: course.course_name,
                  description: course.description,
                  url: PAGE_URL,
                  provider: {
                      "@type": "EducationalOrganization",
                      name: "Arke Digital Learning",
                      url: SITE_URL,
                  },
                  educationalLevel: course.grade_range,
                  inLanguage: course.language,
                  offers: {
                      "@type": "AggregateOffer",
                      priceCurrency: course.pricing?.currency ?? "ETB",
                      lowPrice: course.pricing?.price,
                      highPrice:
                          course.pricing?.price_max ?? course.pricing?.price,
                      category: course.pricing?.pricing_model,
                  },
              },
              {
                  "@type": "BreadcrumbList",
                  itemListElement: [
                      {
                          "@type": "ListItem",
                          position: 1,
                          name: "Fidel",
                          item: `${SITE_URL}/fidel`,
                      },
                      {
                          "@type": "ListItem",
                          position: 2,
                          name: "Grade 8 exam preparation",
                          item: PAGE_URL,
                      },
                  ],
              },
          ],
      }
    : null;

export default function ExamPreparationPage() {
    return (
        <>
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}
            <ExamPreparationClient />
        </>
    );
}
