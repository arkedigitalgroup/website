"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translate } from '../lib/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('am');

  useEffect(() => {
    const savedLang = localStorage.getItem('arke_lang');
    if (savedLang === 'am' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'am' ? 'en' : 'am';
    setLang(newLang);
    localStorage.setItem('arke_lang', newLang);
  };

  const t = (key) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      <div data-lang={lang} className={lang === 'am' ? 'am' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
