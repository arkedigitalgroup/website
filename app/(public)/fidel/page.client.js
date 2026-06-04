// app/(public)/fidel/page.client.js
"use client";

import React, { useState, useMemo } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
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
        Online: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        Hybrid: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        Platform: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };

    return (
        <div className="group bg-navy-surface border border-navy-border rounded-xl overflow-hidden hover:border-ft-teal/50 transition-all duration-300 hover:shadow-lg hover:shadow-ft-teal/5 flex flex-col">
            {/* Teal accent bar */}
            <div className="h-1 bg-gradient-to-r from-ft-teal to-ft-teal/40" />

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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-deep/60 rounded text-[11px] text-text-secondary">
                        📚 {course.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-navy-deep/60 rounded text-[11px] text-text-secondary">
                        🎓{" "}
                        {lang === "am"
                            ? `ክፍል ${course.grade_range}`
                            : `Grade ${course.grade_range}`}
                    </span>
                    {institution?.rating && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-primary/10 rounded text-[11px] text-gold-primary">
                            ⭐ {institution.rating}
                            {institution.total_reviews && (
                                <span className="text-text-muted">
                                    ({institution.total_reviews.toLocaleString()}
                                    )
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">
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
                                            className="flex items-start gap-1.5 text-xs text-text-secondary"
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
                                                className="flex items-start gap-1.5 text-xs text-text-secondary"
                                            >
                                                <span className="text-gold-primary mt-0.5 shrink-0">
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
                            <div className="bg-navy-deep/40 rounded-lg p-2.5">
                                <p className="text-text-muted mb-0.5">
                                    {lang === "am" ? "ክፍለ ጊዜ" : "Session"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.duration_per_session}
                                </p>
                            </div>
                            <div className="bg-navy-deep/40 rounded-lg p-2.5">
                                <p className="text-text-muted mb-0.5">
                                    {lang === "am" ? "ዓይነት" : "Type"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.session_type}
                                </p>
                            </div>
                            <div className="bg-navy-deep/40 rounded-lg p-2.5">
                                <p className="text-text-muted mb-0.5">
                                    {lang === "am" ? "አቅርቦት" : "Delivery"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.delivery_mode}
                                </p>
                            </div>
                            <div className="bg-navy-deep/40 rounded-lg p-2.5">
                                <p className="text-text-muted mb-0.5">
                                    {lang === "am" ? "መርሃ ግብር" : "Schedule"}
                                </p>
                                <p className="text-white font-medium">
                                    {course.schedule_flexibility}
                                </p>
                            </div>
                        </div>

                        {/* Contact / enrollment link */}
                        {course.enrollment?.registration_url && (
                            <a
                                href={course.enrollment.registration_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center px-4 py-2.5 bg-ft-teal/15 border border-ft-teal/40 text-ft-teal font-semibold text-sm rounded-lg hover:bg-ft-teal/25 transition-colors"
                            >
                                {lang === "am"
                                    ? "ድረገጽ ይጎብኙ →"
                                    : "Visit Provider →"}
                            </a>
                        )}
                    </div>
                )}

                {/* Footer: price + expand toggle */}
                <div className="mt-auto pt-4 border-t border-navy-border flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold text-gold-primary">
                            {priceLabel}
                        </p>
                        <p className="text-[10px] text-text-muted">
                            {pricing.pricing_model}
                        </p>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md border border-navy-border text-text-secondary hover:text-white hover:border-ft-teal/50 transition-colors"
                    >
                        {expanded
                            ? lang === "am"
                                ? "ዝጋ"
                                : "Less"
                            : lang === "am"
                              ? "ተጨማሪ"
                              : "Details"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FidelPageClient() {
    const { t, lang } = useLanguage();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

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

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError("");
        try {
            const waitlistDocRef = doc(
                db,
                "waitlist",
                email.toLowerCase().trim(),
            );
            await setDoc(waitlistDocRef, {
                email: email.toLowerCase().trim(),
                createdAt: new Date(),
                serviceLine: "fidel",
            });
            setSuccess(true);
            setEmail("");
        } catch (err) {
            console.error("Waitlist error:", err);
            setError(
                lang === "am"
                    ? "ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
                    : "Could not join waitlist. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative space-y-16 pb-20">
            {/* Hero section with Fidel Teal styling */}
            <section className="relative bg-gradient-to-b from-ft-teal/20 to-navy-deep py-20 px-4 text-center border-b border-ft-teal overflow-hidden">
                {/* Giant elegant watermark logo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 flex items-center justify-center">
                    <img
                        src="/fidellogo.png"
                        alt=""
                        className="w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] object-contain opacity-[0.05] pointer-events-none select-none transform rotate-12 scale-110"
                    />
                </div>

                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-ft-teal/25 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                            <img
                                src="/fidellogo.png"
                                alt="Fidel Logo"
                                className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain transition-transform duration-500 group-hover:scale-110 select-none pointer-events-none"
                            />
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-ft-teal-faint border border-ft-teal text-gold-primary text-sm font-semibold uppercase tracking-wider">
                            {lang === "am"
                                ? "የፊደል አስጠኚ | ለብሩህ ትውልድ፣ ብቁ አስጠኚ!"
                                : "Fidel Academic Tutors | Quality Tutors for a Brighter Generation!"}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-ethiopic leading-snug">
                        {lang === "am"
                            ? "ዘመናዊ አካዳሚክ አስጠኚ ለልጆችዎ"
                            : "Modern Academic Tutoring in Ethiopia"}
                    </h1>
                    <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium">
                        {lang === "am"
                            ? "ትምህርት ቤቶች በብዛት ተማሪ ስለሚይዙ ለእያንዳንዱ ተማሪ ትኩረት ለመስጠት አዳጋች ሆኗል። እኛ መምህራኑን ቤት ድረስ በመላክ፣ ተማሪው በአለማዊ ትምህርቱ ውጤታማ እንዲሆን እና በሱስ እንዳይጠመድ የቅርብ ክትትል እና የምክር አገልግሎት እንሰጣለን። "
                            : "Overcrowded schools often fail to provide individual attention. We  bring elite educators directly to your home, ensuring students excel in their secular education while receiving mentorship to stay protected from negative influences."}
                    </p>
                    <p className="text-sm text-gold-primary max-w-3xl mx-auto font-medium">
                        {lang === "am"
                            ? "የክፍል ትምህርትን የሚያግዝ፣ በሂሳብ፣ ሳይንስ፣ እንግሊዝኛ እና ሌሎች ቋንቋዎች ከፍተኛ ውጤት እንዲያመጡ የሚያግዝ ብቁ የአካዳሚክ አስተማሪዎች ስብስብ።"
                            : "Secure, high-quality, in-home academic tutoring covering school curriculum, STEM subjects, and languages to boost student performance."}
                    </p>
                </div>
            </section>

            {/* Waitlist capture Form */}
            <section className="max-w-3xl mx-auto px-4 relative z-10">
                <div className="bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg relative overflow-hidden text-center space-y-6">
                    <div className="absolute top-0 left-0 w-2 h-full bg-ft-teal" />

                    <div className="space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white font-ethiopic">
                            {t("fidelWaitlistTitle")}
                        </h2>
                        <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto">
                            {t("fidelWaitlistDesc")}
                        </p>
                    </div>

                    <form
                        onSubmit={handleWaitlistSubmit}
                        className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
                    >
                        <input
                            type="email"
                            required
                            disabled={loading || success}
                            placeholder={t("emailInputPlaceholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-ft-teal text-sm transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="px-6 py-3 font-semibold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm whitespace-nowrap"
                        >
                            {loading
                                ? lang === "am"
                                    ? "በማስገባት ላይ..."
                                    : "Joining..."
                                : t("btnJoinWaitlist")}
                        </button>
                    </form>

                    {success && (
                        <p className="text-success text-sm font-semibold animate-pulse">
                            🎉 {t("waitlistSuccess")}
                        </p>
                    )}

                    {error && (
                        <p className="text-error text-sm font-semibold">
                            ❌ {error}
                        </p>
                    )}
                </div>
            </section>

            {/* Course catalog */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
                {/* Section header */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-ethiopic">
                        {lang === "am"
                            ? "የትምህርት ጥቅሎች"
                            : "Academic Packages"}
                    </h2>
                    <p className="text-sm text-text-secondary max-w-xl mx-auto">
                        {lang === "am"
                            ? `${courses.length} ኮርሶች ከተለያዩ ተቋማት`
                            : `${courses.length} courses from verified tutoring providers across Addis Ababa`}
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
                        className="flex-grow px-4 py-2.5 bg-navy-surface border border-navy-border rounded-lg text-white placeholder-text-muted text-sm focus:outline-none focus:border-ft-teal transition-colors"
                    />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2.5 bg-navy-surface border border-navy-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-ft-teal transition-colors cursor-pointer"
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
                        className="px-3 py-2.5 bg-navy-surface border border-navy-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-ft-teal transition-colors cursor-pointer"
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
                    <p className="text-center text-xs text-text-muted">
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
                        <p className="text-text-secondary text-sm">
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
        </div>
    );
}
