// src/components/layout/AuthNavbar.jsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

export default function AuthNavbar() {
    const { toggleLanguage, t } = useLanguage();
    const { profile } = useAuth();
    const pathname = usePathname();

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

                    {/* Right Dynamic Navigation & Language Toggle */}
                    <div className="flex items-center space-x-4">
                        {/* Language Selector Button */}
                        <button
                            onClick={toggleLanguage}
                            className="px-3.5 py-1.5 rounded-md border border-navy-border text-sm text-gold-primary hover:bg-navy-surface hover:border-gold-primary active:scale-95 transition-all duration-200 font-semibold"
                        >
                            {t("langToggle")}
                        </button>

                        {/* Dynamic CTA button based on path */}
                        {profile ? (
                            dashboardLink && (
                                <Link
                                    href={dashboardLink}
                                    className="px-5 py-2 text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                                >
                                    {t("navDashboard")}
                                </Link>
                            )
                        ) : isLoginRoute ? (
                            <Link
                                href="/register"
                                className="px-5 py-2 text-sm font-semibold rounded-md border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                {t("dontHaveAccount").includes("?") || t("dontHaveAccount").includes("?") 
                                    ? t("btnRegisterSubmit") 
                                    : t("dontHaveAccount")}
                            </Link>
                        ) : isRegisterRoute ? (
                            <Link
                                href="/login"
                                className="px-5 py-2 text-sm font-semibold rounded-md border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-navy-deep shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                {t("alreadyHaveAccount").includes("?") 
                                    ? t("navSignIn") 
                                    : t("alreadyHaveAccount")}
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 text-sm font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                {t("navSignIn")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
