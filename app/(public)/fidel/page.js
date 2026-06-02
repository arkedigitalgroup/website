// app/(public)/fidel/page.js
import React from 'react';
import FidelPageClient from './page.client';

export const metadata = {
  title: 'የፊደል አስጠኚ — ዘመናዊ አካዳሚክ አስጠኚ ለልጆችዎ | Fidel Tutors',
  description:
    'የክፍል ትምህርትን የሚያግዝ፣ በሂሳብ፣ ሳይንስ፣ እንግሊዝኛ እና ሌሎች ቋንቋዎች ከፍተኛ ውጤት እንዲያመጡ የሚያግዝ ብቁ የአካዳሚክ አስተማሪዎች ስብስብ። Premium academic tutoring in Addis Ababa.',
  alternates: {
    canonical: 'https://www.arke-group.com/fidel',
  },
  openGraph: {
    title: 'የፊደል አስጠኚ — ዘመናዊ አካዳሚክ አስጠኚ ለልጆችዎ | Fidel Tutors',
    description:
      'Vetted, high-quality, in-home academic tutoring covering school curriculum, STEM subjects, and languages in Ethiopia.',
    url: 'https://www.arke-group.com/fidel',
  },
};

export default function FidelPage() {
  return <FidelPageClient />;
}
