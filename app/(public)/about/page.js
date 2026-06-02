// app/(public)/about/page.js
import React from 'react';
import AboutPageClient from './page.client';

export const metadata = {
  title: 'ስለ እኛ — አርኬ ዲጂታል ግሩፕ | About Us',
  description:
    'አርኬ ዲጂታል ግሩፕ በኢትዮጵያ ውስጥ የትምህርት ጥራትና የስነ-ምግባር እሴቶችን ለማስተሳሰር የተቋቋመ ተቋም ነው። Learn about our mission and vision.',
  alternates: {
    canonical: 'https://www.arke-group.com/about',
  },
  openGraph: {
    title: 'ስለ እኛ — አርኬ ዲጂታል ግሩፕ | About Us',
    description:
      'Learn about Arke Digital Group, our mission, vision for 2035, and the core beliefs that drive our tutoring services in Ethiopia.',
    url: 'https://www.arke-group.com/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
