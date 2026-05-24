// src/components/layout/Navbar.jsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t('navHome'), path: '/' },
    { name: t('navAbout'), path: '/about' },
    { name: t('navYeneta'), path: '/yeneta' },
    { name: t('navFidel'), path: '/fidel' },
    { name: t('navContact'), path: '/contact' },
  ];

  const getDashboardLink = () => {
    if (!profile) return null;
    if (profile.role === 'admin') return '/admin';
    if (profile.role === 'teacher') return '/teacher';
    if (profile.role === 'student') return '/student';
    return null;
  };

  const dashboardLink = getDashboardLink();

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy-deep border-b border-navy-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-wider text-gold-primary hover:text-gold-hover transition-colors font-ethiopic">
                {t('logoText')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-all duration-200 px-3 py-2 rounded-md hover:bg-navy-surface hover:text-gold-primary ${
                    isActive
                      ? 'text-gold-primary border-b-2 border-gold-primary rounded-none bg-transparent'
                      : 'text-text-secondary'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-md border border-navy-border text-sm text-gold-primary hover:bg-navy-surface hover:border-gold-primary transition-all duration-200"
            >
              {t('langToggle')}
            </button>

            {/* Dashboard or Auth Button */}
            {profile ? (
              <div className="flex items-center space-x-3">
                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {t('navDashboard')}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-error text-error hover:bg-error-faint transition-all duration-200"
                >
                  {t('navSignOut')}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
              >
                {t('navSignIn')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Language Toggle Mobile */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-md border border-navy-border text-xs text-gold-primary"
            >
              {t('langToggle')}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-white hover:bg-navy-surface focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-mid border-t border-navy-border px-2 pt-2 pb-4 space-y-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleLinkClick}
                className={`block px-3 py-2.5 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-navy-surface text-gold-primary border-l-4 border-gold-primary'
                    : 'text-text-secondary hover:bg-navy-surface hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="border-t border-navy-border my-2 pt-2">
            {profile ? (
              <div className="space-y-2 px-3">
                <div className="text-xs text-text-muted">
                  ID: {profile.serviceId} | {profile.email}
                </div>
                {dashboardLink && (
                  <Link
                    href={dashboardLink}
                    onClick={handleLinkClick}
                    className="block w-full text-center px-4 py-2.5 text-base font-semibold rounded-md bg-gold-primary text-navy-deep"
                  >
                    {t('navDashboard')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                  className="block w-full text-center px-4 py-2.5 text-base font-semibold rounded-md border border-error text-error"
                >
                  {t('navSignOut')}
                </button>
              </div>
            ) : (
              <div className="px-3">
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="block w-full text-center px-4 py-2.5 text-base font-semibold rounded-md bg-gold-primary text-navy-deep shadow-gold"
                >
                  {t('navSignIn')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
