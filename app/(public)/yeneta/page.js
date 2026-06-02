// app/(public)/yeneta/page.js
import React from 'react';
import YenetaPageClient from './page.client';

export const metadata = {
  title: 'የየኔታ አስጠኚ — መንፈሳዊ የቤት ውስጥ ትምህርቶች | Yeneta Tutors',
  description:
    'በቤተክርስቲያን የተመሰከረላቸውን ብቁ የኔታዎች ከተማሪዎች ጋር በማገናኘት፣ በቤቶት ሆነው ግዕዝ፣ ቅዳሴ፣ ዜማ እና ስነ-ምግባርን ያስተምሩ። Vetted Orthodox tutors for your children.',
  alternates: {
    canonical: 'https://www.arke-group.com/yeneta',
  },
  openGraph: {
    title: 'የየኔታ አስጠኚ — መንፈሳዊ የቤት ውስጥ ትምህርቶች | Yeneta Tutors',
    description:
      'Vetted Yeneta tutors teaching Geez, Qidasse, Zema, and ethics in Addis Ababa. Connect today.',
    url: 'https://www.arke-group.com/yeneta',
  },
};

export default function YenetaPage() {
  return <YenetaPageClient />;
}
