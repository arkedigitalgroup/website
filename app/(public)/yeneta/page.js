// app/(public)/yeneta/page.js
"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../src/context/LanguageContext';

export default function YenetaPage() {
  const { t, lang } = useLanguage();

  const packages = [
    {
      id: "meserete-imnet",
      name: t('package1'),
      desc: t('package1Desc'),
      price: 4200,
    },
    {
      id: "quanquanna-zema",
      name: t('package2'),
      desc: t('package2Desc'),
      price: 4200,
    },
    {
      id: "diquna-zegajat",
      name: t('package3'),
      desc: t('package3Desc'),
      price: 4700,
    },
    {
      id: "all-courses",
      name: t('package4'),
      desc: t('package4Desc'),
      price: 7100,
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero section with Yeneta Maroon styling */}
      <section className="relative bg-gradient-to-b from-yt-maroon to-navy-deep py-20 px-4 text-center border-b border-yt-maroon">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="px-4 py-1.5 rounded-full bg-yt-maroon-faint border border-yt-maroon text-gold-primary text-sm font-semibold uppercase tracking-wider">
            {lang === 'am' ? 'የየኔታ አስጠኚ' : 'Yeneta Spiritual Tutors'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-ethiopic leading-snug">
            {lang === 'am' ? 'መንፈሳዊና ባህላዊ የቤት ውስጥ ትምህርቶች' : 'Spiritual & Traditional Home Tutoring'}
          </h1>
          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
            {lang === 'am' 
              ? 'በቤተክርስቲያን የተመሰከረላቸውን ብቁ የኔታዎች ከተማሪዎች ጋር በማገናኘት፣ በቤቶት ሆነው ግዕዝ፣ ቅዳሴ፣ ዜማ እና ስነ-ምግባርን ያስተምሩ።' 
              : 'Empowering the next generation with deep cultural identity, liturgical chants, Ge\'ez literacy, and traditional Orthodox theology from vetted tutors in your home.'}
          </p>
        </div>
      </section>

      {/* Course Packages Table/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-white font-ethiopic">
            {t('yenetaPackagesTitle')}
          </h2>
          <p className="text-sm text-text-secondary">
            {t('yenetaPackagesSub')}
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="bg-navy-surface border border-navy-border rounded-xl p-8 hover:border-gold-primary hover:shadow-gold transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-ethiopic leading-snug">
                    {pkg.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gold-primary">
                      {pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted block">ETB / mo</span>
                  </div>
                </div>
                <div className="h-px bg-navy-border w-full" />
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-medium">
                  {pkg.desc}
                </p>
              </div>

              <div className="pt-8">
                <Link
                  href={`/register?role=student&line=yeneta&course=${pkg.id}`}
                  className="block w-full text-center py-3 text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover transition-colors font-medium"
                >
                  {t('btnRegisterStudent')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Join as Teacher */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-navy-surface border border-yt-maroon border-l-4 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-left space-y-2">
            <h3 className="text-xl font-bold text-white font-ethiopic">
              {lang === 'am' ? 'የየኔታ መምህር ነዎት?' : 'Are you a qualified Yeneta/Tutor?'}
            </h3>
            <p className="text-sm text-text-secondary max-w-md">
              {lang === 'am' 
                ? 'በክብር ሙያዎ ተማሪዎችን እያስተማሩ 85% ክፍያ በማግኘት ኑሮዎን ያሻሽሉ። ዛሬውኑ ይመዝገቡ።' 
                : 'Join our platform, preserve our indigenous identity, and earn a premium 85% payout. Register as a teacher now.'}
            </p>
          </div>
          <Link
            href="/register?role=teacher&line=yeneta"
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-gold-primary text-gold-primary hover:bg-gold-faint transition-colors text-sm font-semibold whitespace-nowrap"
          >
            {t('btnRegisterTeacher')}
          </Link>
        </div>
      </section>

    </div>
  );
}
