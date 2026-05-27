// src/components/layout/AuthNavbar.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function AuthNavbar() {
  // Hooks must be called inside the component
  const { toggleLanguage, t } = useLanguage();
  const { profile } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";

  const getDashboardLink = () => {
    if (!profile) return null;
    if (profile.role === "admin") return "/admin";
    if (profile.role === "teacher") return "/teacher";
    if (profile.role === "student") return "/student";
    return null;
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 bg-navy-deep/80 backdrop-blur-md border-b border-navy-border shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Image
                  src="/arkelogo.png"
                  alt="Arke logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain transition-transform duration-300 group-hover:rotate-12"
                />
                <div className="absolute inset-0 bg-gold-primary/20 rounded-full blur filter opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold tracking-wider text-gold-primary group-hover:text-gold-hover transition-colors font-ethiopic">
                {t("logoText")}
              </span>
            </Link>
          </div>

          {/* Right Navigation & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden px-2 py-1.5 rounded-md border border-navy-border text-xs text-gold-primary hover:bg-navy-surface hover:border-gold-primary transition"
            >
              {/* Hamburger icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="px-2 sm:px-3.5 py-1.5 rounded-md border border-navy-border text-xs sm:text-sm text-gold-primary hover:bg-navy-surface hover:border-gold-primary active:scale-95 transition-all duration-200 font-semibold"
              >
                {t("langToggle")}
              </button>
              {profile ? (
                dashboardLink && (
                  <Link
                    href={dashboardLink}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {t("navDashboard")}
                  </Link>
                )
              ) : isLoginRoute ? (
                <Link
                  href="/register"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {t("btnRegisterSubmit")}
                </Link>
              ) : isRegisterRoute ? (
                <Link
                  href="/login"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep shadow-gold hover:scale-105 active:scale-90 transition-all duration-200"
                >
                  {t("navSignIn")}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {t("navSignIn")}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile overlay menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-navy-deep/95 backdrop-blur-md flex flex-col items-center pt-20 z-50 md:hidden">
            <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={toggleLanguage}
              className="mb-4 px-4 py-2 rounded-md border border-navy-border text-sm text-gold-primary hover:bg-navy-surface hover:border-gold-primary transition"
            >
              {t("langToggle")}
            </button>
            {profile ? (
              dashboardLink && (
                <Link
                  href={dashboardLink}
                  className="mb-4 px-6 py-3 rounded-md bg-gold-primary text-navy-deep text-lg font-semibold hover:bg-gold-hover"
                >
                  {t("navDashboard")}
                </Link>
              )
            ) : isLoginRoute ? (
              <Link
                href="/register"
                className="mb-4 px-6 py-3 rounded-md border border-gold-primary text-gold-primary text-lg font-semibold hover:bg-gold-primary hover:text-navy-deep"
              >
                {t("btnRegisterSubmit")}
              </Link>
            ) : isRegisterRoute ? (
              <Link
                href="/login"
                className="mb-4 px-6 py-3 rounded-md border border-gold-primary text-gold-primary text-lg font-semibold hover:bg-gold-primary hover:text-navy-deep"
              >
                {t("navSignIn")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="mb-4 px-6 py-3 rounded-md bg-gold-primary text-navy-deep text-lg font-semibold hover:bg-gold-hover"
              >
                {t("navSignIn")}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
