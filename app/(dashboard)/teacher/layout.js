// app/(dashboard)/teacher/layout.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../src/context/AuthContext";
import { useLanguage } from "../../../src/context/LanguageContext";
import ProtectedRoute from "../../../src/components/auth/ProtectedRoute";

export default function TeacherLayout({ children }) {
    const { profile, logout } = useAuth();

    const { t, lang, toggleLanguage } = useLanguage();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        {
            name: lang === "am" ? "ዳሽቦርድ" : "Overview",
            path: "/teacher",
            icon: "🏠",
        },
        {
            name: lang === "am" ? "ሪፖርት ሙላ" : "Attendance & Reports",
            path: "/teacher/attendance",
            icon: "📝",
        },
        {
            name: lang === "am" ? "ክፍያዎቼ" : "Payouts Overview",
            path: "/teacher/payouts",
            icon: "💼",
        },
        {
            name: lang === "am" ? "መለያዬ" : "My Account",
            path: "/teacher/account",
            icon: "👤",
        },
        {
            name: lang === "am" ? "መልዕክት" : "Support Messages",
            path: "/teacher/messages",
            icon: "💬",
        },
    ];
    console.log(profile);
    return (
        <ProtectedRoute allowedRoles={["teacher"]}>
            <div className="min-h-screen bg-navy-deep text-white flex flex-col md:flex-row">
                {/* Mobile Header */}
                <header className="md:hidden bg-navy-mid border-b border-navy-border px-4 py-4 flex items-center justify-between sticky top-0 z-40">
                    <span className="text-lg font-bold text-gold-primary font-ethiopic">
                        Arke Teacher
                    </span>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-text-secondary hover:text-white"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </header>

                {/* Sidebar */}
                <aside
                    className={`w-full md:w-64 bg-navy-mid border-r border-navy-border flex-shrink-0 flex flex-col fixed md:relative inset-y-0 left-0 transform md:transform-none transition-transform duration-200 z-50 ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full md:translate-x-0"
                    }`}
                >
                    <div className="p-6 border-b border-navy-border flex items-center justify-between">
                        <span className="text-lg font-bold text-gold-primary font-ethiopic">
                            Arke Teacher
                        </span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden text-text-secondary hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-grow p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                                        isActive
                                            ? "bg-navy-surface text-gold-primary border-l-4 border-gold-primary"
                                            : "text-text-secondary hover:bg-navy-surface hover:text-white"
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar user footer */}
                    <div className="p-4 border-t border-navy-border space-y-3">
                        <div className="text-xs text-text-muted flex items-center space-x-2">
                            {console.log(profile)}
                            {profile?.profileUrl && (
                                <img
                                    src={profile.profileUrl}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full border border-gold-primary object-cover"
                                />
                            )}
                            <div className="truncate">
                                <div className="font-semibold text-white truncate max-w-[150px]">
                                    {profile?.fullName}
                                </div>
                                <div>ID: {profile?.serviceId}</div>
                            </div>

                            <button
                                onClick={toggleLanguage}
                                className="px-3 py-1.5 rounded-md border border-navy-border text-sm text-gold-primary hover:bg-navy-surface hover:border-gold-primary transition-all duration-200"
                            >
                                {t("langToggle")}
                            </button>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md border border-error text-error hover:bg-error-faint transition-all duration-200 text-sm font-semibold"
                        >
                            <span>🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Backdrop for mobile */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                    />
                )}

                {/* Content Area */}
                <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
