// app/(public)/page.js
import React from "react";
import HomePageClient from "./page.client";

export const metadata = {
  title: 'የቤት ውስጥ ሃይማኖታዊ እና አካዳሚክ አስጠኚ — ለኢትዮጵያ ቤተሰቦች',
  description:
    'አርኬ ዲጂታል — ግዕዝ፣ ቅዳሴ፣ ዜማ እና ስነ-ምግባርን ከቤተክርስቲያን ምስክርነት ያላቸው የኔታዎች ጋር ያገናኛል። Bilingual Ethiopian tutoring platform trusted by families in Addis Ababa.',
  alternates: {
    canonical: 'https://www.arke-group.com/',
  },
  openGraph: {
    title: 'Arke Digital Learning — Ethiopian Orthodox & Academic Tutors',
    description:
      'Find church-verified Yeneta tutors for Geez, Qidasse, and Zema. Bilingual platform for Ethiopian families.',
    url: 'https://www.arke-group.com/',
  },
};

export default function HomePage() {
    return <HomePageClient />;
}
