// app/(public)/fidel/page.client.js
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "../../../src/context/LanguageContext";
import fidelCourseData from "../../../assets/fidelCourse.json";

const courses = fidelCourseData.courses;

// Extract unique subjects and formats for filters
const allSubjects = [...new Set(courses.map((c) => c.subject))];
const allFormats = [...new Set(courses.map((c) => c.format))];

function CourseCard({ course, lang }) {
    const [expanded, setExpanded] = useState(false);
    const pricing = course.pricing;
    const institution = course.institution;

    const priceLabel =
        pricing.price === 0
            ? lang === "am"
                ? "ነጻ"
                : "Free"
            : pricing.price === pricing.price_max
              ? `${pricing.price.toLocaleString()} ETB`
              : `${pricing.price.toLocaleString()} – ${pricing.price_max.toLocaleString()} ETB`;

    const formatBadgeColor = {
        "In-Person": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        Online: "bg-ft-teal/15 text-ft-teal border-ft-teal/30",
        Hybrid: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        Platform: "bg-ft-amber/15 text-ft-amber border-ft-amber/30",
    };

    return (
        <div className="group bg-ft-obsidian-surface border border-ft-obsidian-border rounded-xl overflow-hidden hover:border-ft-amber/50 transition-all duration-300 hover:shadow-lg hover:shadow-ft-amber/5 flex flex-col">
            {/* Amber accent bar */}
            <div className="h-1 bg-gradient-to-r from-ft-amber to-ft-teal/60" />

            <div className="p-5 sm:p-6 flex flex-col flex-grow">
                {/* Header: institution + format badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        {institution?.name && (
                            <p className="text-xs font-semibold text-ft-teal uppercase tracking-wide mb-1 truncate">
                                {institution.name}
                            </p>
                        )}
                        <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {course.course_name}
                        </h3>
                    </div>
                    <span
                        className={`shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${formatBadgeColor[course.format] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}
                    >
                        {course.format}
                    </span>
                </div>

                {/* Quick info pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ft-obsidian/60 rounded text-[11px] text-white/60">
                        📚 {course.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ft-obsidian/60 rounded text-[11px] text-white/60">
                        🎓{" "}
                        {lang === "am"
                            ? `ክፍል ${course.grade_range}`
                            : `Grade ${course.grade_range}`}
                    </span>
                    {institution?.rating && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ft-amber/10 rounded text-[11px] text-ft-amber">
                            ⭐ {institution.rating}
                            {institution.total_reviews && (
                                <span className="text-white/40">
                                    (
                                    {institution.total_reviews.toLocaleString()}
                                    )
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-4 line-clamp-3">
                    {course.description}
                </p>

                {/* Expandable details */}
                {expanded && (
                    <div className="space-y-4 mb-4 animate-fadeIn">
                        {/* Features */}
                        {course.features?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
                                    {lang === "am" ? "ባህሪያት" : "Features"}
                                </p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {course.features.map((feat, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-1.5 text-xs text-white/60"
                                        >
                                            <span className="text-ft-teal mt-0.5 shrink-0">
                                                ✓
                                            </span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Learning outcomes */}
                        {course.learning_outcomes?.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
                                    {lang === "am"
                                        ? "የመማሪያ ውጤቶች"
                                        : "Learning Outcomes"}
                                </p>
                                <ul className="space-y-1">
                                    {course.learning_outcomes.map(
                                        (outcome, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-1.5 text-xs text-white/60"
                                            >
                                                <span className="text-ft-amber mt-0.5 shrink-0">
                                                    →
                                                </span>
                                                {outcome}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Session details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-ft-obsidian/40 rounded-lg p-2.5">
                                <p className="text-white/40 mb-0.5">
                                    {lang === "am" ? "ክፍለ ጊዜ" : "Session"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.duration_per_session}
                                </p>
                            </div>
                            <div className="bg-ft-obsidian/40 rounded-lg p-2.5">
                                <p className="text-white/40 mb-0.5">
                                    {lang === "am" ? "ዓይነት" : "Type"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.session_type}
                                </p>
                            </div>
                            <div className="bg-ft-obsidian/40 rounded-lg p-2.5">
                                <p className="text-white/40 mb-0.5">
                                    {lang === "am" ? "አቅርቦት" : "Delivery"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.delivery_mode}
                                </p>
                            </div>
                            <div className="bg-ft-obsidian/40 rounded-lg p-2.5">
                                <p className="text-white/40 mb-0.5">
                                    {lang === "am" ? "መርሃ ግብር" : "Schedule"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.schedule_flexibility}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer: price + register + expand */}
                <div className="mt-auto pt-4 border-t border-ft-obsidian-border flex items-center justify-between gap-3">
                    <div>
                        <p className="text-lg font-bold text-ft-amber">
                            {priceLabel}
                        </p>
                        <p className="text-[10px] text-white/40">
                            {pricing.pricing_model}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-ft-obsidian-border text-white/60 hover:text-white hover:border-ft-teal/50 transition-colors"
                        >
                            {expanded
                                ? lang === "am"
                                    ? "ዝጋ"
                                    : "Less"
                                : lang === "am"
                                  ? "ተጨማሪ"
                                  : "Details"}
                        </button>
                        <Link
                            href={`/register?role=student&line=fidel&course=${course.course_id}`}
                            className="px-4 py-1.5 text-xs font-bold rounded-md bg-ft-amber text-ft-obsidian hover:bg-ft-amber-hover transition-colors shadow-sm"
                        >
                            {lang === "am" ? "ተመዝገብ" : "Register"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FidelPageClient() {
    const { t, lang } = useLanguage();

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedFormat, setSelectedFormat] = useState("");

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                course.course_name.toLowerCase().includes(q) ||
                course.description.toLowerCase().includes(q) ||
                course.institution?.name?.toLowerCase().includes(q) ||
                course.subject.toLowerCase().includes(q);

            const matchesSubject =
                !selectedSubject || course.subject === selectedSubject;
            const matchesFormat =
                !selectedFormat || course.format === selectedFormat;

            return matchesSearch && matchesSubject && matchesFormat;
        });
    }, [searchQuery, selectedSubject, selectedFormat]);

    return (
        <div className="relative space-y-16 pb-20 bg-ft-obsidian min-h-screen">
            {/* Hero section with */}

            <section className="relative  min-h-[60vh] max-h-[100vh] py-16 px-4 border-b border-ft-amber/20 overflow-hidden flex items-center">
                {/* Full-width background image aligned right */}
                <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                    <img
                        src="/fidelPageHero.jpg"
                        alt=""
                        className="w-full h-full object-cover object-right opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ft-obsidian via-ft-obsidian/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-start gap-6 text-left w-full">
                    <div className="w-full lg:w-1/2 space-y-5">
                        <div className="flex flex-col items-start gap-4 mb-2">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-ft-amber/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                                <img
                                    src="/fidellogo.png"
                                    alt="Fidel Logo"
                                    className="relative w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform duration-500 group-hover:scale-110 select-none pointer-events-none"
                                />
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-ft-amber/10 border border-ft-amber/40 text-ft-amber text-sm font-semibold uppercase tracking-wider">
                                {lang === "am"
                                    ? "የፊደል አስጠኚ | ለብሩህ ትውልድ፣ ብቁ አስጠኚ!"
                                    : "Fidel Academic Tutors | Quality Tutors for a Brighter Generation!"}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-ethiopic leading-snug">
                            {lang === "am"
                                ? "ዘመናዊ አካዳሚክ አስጠኚ ለልጆችዎ"
                                : "Modern Academic Tutoring in Ethiopia"}
                        </h1>
                        <p className="text-base sm:text-lg text-white/80 font-medium leading-relaxed">
                            {lang === "am"
                                ? "ትምህርት ቤቶች በብዛት ተማሪ ስለሚይዙ ለእያንዳንዱ ተማሪ ትኩረት ለመስጠት አዳጋች ሆኗል። እኛ መምህራኑን ቤት ድረስ በመላክ፣ ተማሪው በአለማዊ ትምህርቱ ውጤታማ እንዲሆን እና በሱስ እንዳይጠመድ የቅርብ ክትትል እና የምክር አገልግሎት እንሰጣለን።"
                                : "Overcrowded schools often fail to provide individual attention. We bring elite educators directly to your home, ensuring students excel in their secular education while receiving mentorship to stay protected from negative influences."}
                        </p>
                        <p className="text-sm text-ft-teal font-medium">
                            {lang === "am"
                                ? "የክፍል ትምህርትን የሚያግዝ፣ በሂሳብ፣ ሳይንስ፣ እንግሊዝኛ እና ሌሎች ቋንቋዎች ከፍተኛ ውጤት እንዲያመጡ የሚያግዝ ብቁ የአካዳሚክ አስተማሪዎች ስብስብ።"
                                : "Secure, high-quality, in-home academic tutoring covering school curriculum, STEM subjects, and languages to boost student performance."}
                        </p>

                        {/* Hero CTA */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                            <a
                                href="#courses"
                                className="px-8 py-3.5 text-base font-bold rounded-xl bg-ft-amber text-ft-obsidian hover:bg-ft-amber-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md"
                            >
                                {lang === "am"
                                    ? "ኮርሶችን ይመልከቱ ↓"
                                    : "Browse Courses ↓"}
                            </a>
                            <a
                                href="/register?role=teacher&line=fidel"
                                className="px-8 py-3.5 text-base font-semibold rounded-xl border border-ft-teal/60 text-ft-teal hover:bg-ft-teal/10 transition-colors"
                            >
                                {lang === "am"
                                    ? "እንደ መምህር ይመዝገቡ"
                                    : "Register as Teacher"}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course catalog */}
            <section
                id="courses"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 scroll-mt-8"
            >
                {/* Section header */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-ethiopic">
                        {lang === "am" ? "የትምህርት ጥቅሎች" : "Academic Packages"}
                    </h2>
                    <p className="text-sm text-white/60 max-w-xl mx-auto">
                        {lang === "am"
                            ? `${courses.length} ኮርሶች — የሚፈልጉትን ኮርስ መርጠው ይመዝገቡ`
                            : `${courses.length} courses — Choose a course and register to get started`}
                    </p>
                </div>

                {/* Search & filters */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
                    <input
                        type="text"
                        placeholder={
                            lang === "am"
                                ? "ኮርስ ወይም ተቋም ፈልግ..."
                                : "Search courses or providers..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-grow px-4 py-2.5 bg-ft-obsidian-surface border border-ft-obsidian-border rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-ft-amber/50 transition-colors"
                    />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2.5 bg-ft-obsidian-surface border border-ft-obsidian-border rounded-lg text-sm text-white/60 focus:outline-none focus:border-ft-amber/50 transition-colors cursor-pointer"
                    >
                        <option value="">
                            {lang === "am" ? "ሁሉም ትምህርቶች" : "All Subjects"}
                        </option>
                        {allSubjects.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="px-3 py-2.5 bg-ft-obsidian-surface border border-ft-obsidian-border rounded-lg text-sm text-white/60 focus:outline-none focus:border-ft-amber/50 transition-colors cursor-pointer"
                    >
                        <option value="">
                            {lang === "am" ? "ሁሉም ቅርጾች" : "All Formats"}
                        </option>
                        {allFormats.map((f) => (
                            <option key={f} value={f}>
                                {f}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Results count */}
                {(searchQuery || selectedSubject || selectedFormat) && (
                    <p className="text-center text-xs text-white/40">
                        {lang === "am"
                            ? `${filteredCourses.length} ውጤቶች ተገኝተዋል`
                            : `${filteredCourses.length} result${filteredCourses.length !== 1 ? "s" : ""} found`}
                    </p>
                )}

                {/* Course grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.course_id}
                                course={course}
                                lang={lang}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 space-y-3">
                        <p className="text-4xl">📭</p>
                        <p className="text-white/60 text-sm">
                            {lang === "am"
                                ? "ምንም ኮርሶች አልተገኙም። ፍለጋዎን ይቀይሩ።"
                                : "No courses match your filters. Try adjusting your search."}
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedSubject("");
                                setSelectedFormat("");
                            }}
                            className="text-xs text-ft-teal hover:underline"
                        >
                            {lang === "am"
                                ? "ማጣሪያዎችን ያጽዱ"
                                : "Clear all filters"}
                        </button>
                    </div>
                )}
            </section>

            {/* CTA Join as Teacher */}
            <section className="max-w-4xl mx-auto px-4 text-center">
                <div className="bg-ft-obsidian-surface border border-ft-teal/30 border-l-4 border-l-ft-teal rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                    <div className="text-left space-y-2">
                        <h3 className="text-xl font-bold text-white font-ethiopic">
                            {lang === "am"
                                ? "ብቁ አካዳሚክ መምህር ነዎት?"
                                : "Are you a qualified Academic Tutor?"}
                        </h3>
                        <p className="text-sm text-white/60 max-w-md">
                            {lang === "am"
                                ? "በክብር ሙያዎ ተማሪዎችን እያስተማሩ 85% ክፍያ በማግኘት ኑሮዎን ያሻሽሉ። ዛሬውኑ ይመዝገቡ።"
                                : "Join our platform, teach students at home, and earn a premium 85% payout. Register as a Fidel teacher now."}
                        </p>
                    </div>
                    <Link
                        href="/register?role=teacher&line=fidel"
                        className="w-full sm:w-auto px-6 py-3 rounded-md border border-ft-amber text-ft-amber hover:bg-ft-amber/10 transition-colors text-sm font-semibold whitespace-nowrap"
                    >
                        {t("btnRegisterTeacher")}
                    </Link>
                </div>
            </section>
        </div>
    );
}
