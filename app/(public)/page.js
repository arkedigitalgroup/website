// app/(public)/page.js
"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../src/context/LanguageContext';

export default function HomePage() {
  const { t, lang } = useLanguage();

  const whyItems = [
    {
      title: t('whySafetyTitle'),
      desc: t('whySafetyDesc'),
      icon: (
        <svg className="w-8 h-8 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: t('whyMentorshipTitle'),
      desc: t('whyMentorshipDesc'),
      icon: (
        <svg className="w-8 h-8 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: t('whyTechTitle'),
      desc: t('whyTechDesc'),
      icon: (
        <svg className="w-8 h-8 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: t('whyLoyaltyTitle'),
      desc: t('whyLoyaltyDesc'),
      icon: (
        <svg className="w-8 h-8 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: t('whyIdentityTitle'),
      desc: t('whyIdentityDesc'),
      icon: (
        <svg className="w-8 h-8 text-gold-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative bg-navy-gradient py-24 sm:py-32 px-4 border-b border-navy-border flex flex-col items-center text-center">
        {/* Glowing aura background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-faint rounded-full filter blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10 animate-fadeIn">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-ethiopic leading-tight">
            {t('heroTagline')}
          </h1>
          <p className="text-lg sm:text-2xl text-text-secondary max-w-2xl mx-auto font-medium">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link
              href="/yeneta"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {t('heroYenetaCTA')}
            </Link>
            <Link
              href="/fidel"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-md border border-text-secondary text-text-secondary hover:border-gold-primary hover:text-gold-primary transition-all duration-200"
            >
              {t('heroFidelCTA')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Core Belief Quote Section */}
      <section className="max-w-7xl mx-auto px-4 text-center">
        <div className="relative inline-block py-8 px-6 sm:px-12 bg-navy-surface border border-navy-border rounded-xl shadow-lg max-w-3xl">
          <div className="absolute -top-4 left-6 text-4xl text-gold-muted font-serif">“</div>
          <p className="text-xl sm:text-3xl font-semibold text-gold-primary leading-relaxed font-ethiopic italic">
            {t('coreBeliefQuote')}
          </p>
          <div className="absolute -bottom-10 right-6 text-4xl text-gold-muted font-serif">”</div>
        </div>
      </section>

      {/* 3. Services Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 className="text-3xl font-bold text-center text-white border-b border-navy-border pb-4 max-w-xs mx-auto">
          {t('serviceTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Yeneta Card */}
          <div className="bg-navy-surface border-l-8 border-yt-maroon border-t border-r border-b border-navy-border rounded-xl p-8 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-3 bg-yt-maroon-faint rounded-lg text-gold-primary">
                  {/* Church SVG icon */}
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-success-faint text-success uppercase">
                  {t('activeNow')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white font-ethiopic">
                {t('yenetaTitle')}
              </h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed leading-8 font-medium">
                {t('yenetaDesc')}
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/yeneta"
                className="inline-block px-5 py-2.5 rounded-md bg-gold-primary text-navy-deep font-semibold hover:bg-gold-hover transition-colors text-sm"
              >
                {lang === 'am' ? 'ጥቅሎችን ይመልከቱ' : 'View Packages'} &rarr;
              </Link>
            </div>
          </div>

          {/* Fidel Card */}
          <div className="bg-navy-surface border-l-8 border-ft-teal border-t border-r border-b border-navy-border rounded-xl p-8 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-3 bg-ft-teal-faint rounded-lg text-gold-primary">
                  {/* Graduation cap SVG icon */}
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-warning-faint text-warning uppercase">
                  {t('comingSoon')}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white font-ethiopic">
                {t('fidelTitle')}
              </h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed leading-8 font-medium">
                {t('fidelDesc')}
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/fidel"
                className="inline-block px-5 py-2.5 rounded-md border border-navy-border text-gold-primary hover:bg-navy-hover transition-colors text-sm font-semibold"
              >
                {lang === 'am' ? 'ይመዝገቡ' : 'Join Waitlist'} &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Why Arke Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <h2 className="text-3xl font-bold text-center text-white border-b border-navy-border pb-4 max-w-xs mx-auto">
          {t('whyTitle')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {whyItems.map((item, index) => (
            <div 
              key={index}
              className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md hover:scale-105 transition-all duration-300 text-center flex flex-col items-center space-y-4"
            >
              <div className="p-3 bg-navy-mid border border-navy-border rounded-full shadow-inner text-gold-primary">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Founders' Brotherhood Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto relative overflow-hidden shadow-lg">
          {/* Subtle gold glow behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-faint rounded-full filter blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-bold text-gold-primary font-ethiopic">
              {t('foundersTitle')}
            </h2>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
              {t('foundersDesc')}
            </p>
            <div className="flex justify-center items-center gap-4 text-sm font-semibold text-white">
              <span className="px-4 py-1.5 bg-navy-mid border border-navy-border rounded-full">ቴዎድሮስ (Tewodros)</span>
              <span className="text-gold-primary">&amp;</span>
              <span className="px-4 py-1.5 bg-navy-mid border border-navy-border rounded-full">ዮናስ (Yonas)</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
