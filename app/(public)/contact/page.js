// app/(public)/contact/page.js
import React from 'react';
import ContactPageClient from './page.client';

export const metadata = {
  title: 'ያግኙን — አርኬ ዲጂታል ግሩፕ | Contact Us',
  description:
    'ማንኛውም ጥያቄ፣ የስራ ቅጥር፣ ወይም የትብብር ጥያቄ ካለዎት እባክዎ ያግኙን። Connect with Arke Digital Group.',
  alternates: {
    canonical: 'https://www.arke-group.com/contact',
  },
  openGraph: {
    title: 'ያግኙን — አርኬ ዲጂታል ግሩፕ | Contact Us',
    description:
      'Have questions, feedback, or business inquiries? Contact Arke Digital Group directly or connect with us on Telegram, Facebook, and TikTok.',
    url: 'https://www.arke-group.com/contact',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
