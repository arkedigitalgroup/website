// app/(public)/fidel/mathematics-tutoring/page.js
import React from "react";
import MathematicsTutoringClient from "./page.client";
import { findPublicCourse } from "../../../../src/lib/fidelCatalog";

const SITE_URL = "https://www.arke-group.com";
const PAGE_URL = `${SITE_URL}/fidel/mathematics-tutoring`;
const COURSE_SLUG = "fidel-mathematics-advanced";

const course = findPublicCourse(COURSE_SLUG);

export const metadata = {
    title: "Mathematics Tutoring — Grades 9–12",
    description:
        "Online Fidel mathematics tutoring for Grades 9–12 in Addis Ababa: algebra, geometry, trigonometry, calculus and statistics, with exam-style practice and review.",
    alternates: {
        canonical: PAGE_URL,
    },
    openGraph: {
        title: "Mathematics Tutoring — Grades 9–12 | Fidel",
        description:
            "Algebra, geometry, trigonometry, calculus and statistics, taught online with an interactive whiteboard or in a hybrid format.",
        url: PAGE_URL,
        images: [
            {
                url: `${SITE_URL}/fidelPageHero.jpg`,
                width: 1280,
                height: 696,
                alt: "Fidel mathematics tutoring study materials",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Mathematics Tutoring — Grades 9–12 | Fidel",
        description:
            "Online mathematics tutoring for Grades 9–12: algebra, geometry, trigonometry, calculus and statistics.",
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
                          name: "Mathematics tutoring",
                          item: PAGE_URL,
                      },
                  ],
              },
          ],
      }
    : null;

export default function MathematicsTutoringPage() {
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
            <MathematicsTutoringClient />
        </>
    );
}
