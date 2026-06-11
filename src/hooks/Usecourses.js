// src/hooks/useCourses.js
//
// Fetches active courses from Firestore for a given service line.
//
// WHY this exists instead of importing yenetaCourse.js / fidelCourse.json:
//   Static files require a code edit + redeploy every time a course price
//   changes or a new course is added. This hook reads from Firestore, so
//   admin can add, edit, or deactivate courses from the Admin Course Manager
//   and every page reflects the change immediately — no deploy needed.
//
// WHY getDocs here (not onSnapshot like usePlatformConfig)?
//   Course data changes infrequently — a few times a year at most. The
//   ongoing WebSocket cost of onSnapshot across all registration sessions
//   is not justified. getDocs is a clean one-shot read on mount.
//   Exception: the Admin Course Manager uses onSnapshot directly so the
//   admin sees their own edits instantly. That page manages its own listener.
//
// WHERE this is used:
//   - Registration page  (student picks a course to enroll in)
//   - Admin Course Manager (lists courses for editing)
//   - Any future page that needs a course list or price lookup

"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Returns courses for a specific service line, filtered to active only.
 * Names and descriptions are already resolved to the correct language.
 *
 * @param {"yeneta" | "fidel"} serviceLine
 * @param {"am" | "en"} lang  - from useLanguage().lang
 *
 * @returns {{
 *   courses: Array<{
 *     id:           string,
 *     name:         string,   // resolved to correct language
 *     desc:         string,   // resolved to correct language
 *     syllabus:     string,   // resolved to correct language
 *     price:        number,
 *     pricingModel: string,
 *     serviceLine:  string,
 *     gradeRange:   string | null,
 *     subject:      string | null,
 *     sortOrder:    number,
 *   }>,
 *   loading: boolean,
 *   error:   Error | null,
 * }}
 */
export function useCourses(serviceLine, lang = "am") {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!serviceLine) {
            setCourses([]);
            setLoading(false);
            return;
        }

        let cancelled = false; // guard against setting state after unmount

        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const q = query(
                    collection(db, "courses"),
                    where("serviceLine", "==", serviceLine),
                    where("isActive", "==", true),
                    orderBy("sortOrder", "asc"),
                );

                const snapshot = await getDocs(q);
                if (cancelled) return;

                const list = snapshot.docs.map((doc) => {
                    const d = doc.data();
                    return normaliseCourse(d, lang);
                });

                setCourses(list);
            } catch (err) {
                if (cancelled) return;
                console.error("[useCourses] Firestore error:", err);
                setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCourses();

        return () => {
            cancelled = true;
        };

        // Re-fetch when serviceLine or lang changes so the correct
        // language names are always shown without a full page reload.
    }, [serviceLine, lang]);

    return { courses, loading, error };
}

// ── getCoursePrice ──────────────────────────────────────────────────────────
//
// Looks up a course price from an already-fetched courses array by courseId.
// Used in the finance page teacher payout loop to replace the hardcoded
// price switch (7100 / 4700 / 4200) that existed before.
//
// Usage:
//   const price = getCoursePrice(courses, student.courseId);
//   const payout = calcTeacherPayout(config, price);

/**
 * @param {Array<{id: string, price: number}>} courses
 * @param {string} courseId
 * @param {number} [fallback=0]  - returned if courseId not found
 * @returns {number}
 */
export function getCoursePrice(courses, courseId, fallback = 0) {
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
        console.warn(
            "[getCoursePrice] courseId '" +
                courseId +
                "' not found in courses array. " +
                "Returning fallback: " +
                fallback,
        );
        return fallback;
    }
    return course.price;
}

// ── Internal normaliser ─────────────────────────────────────────────────────
//
// WHY we normalise here instead of in components:
//   Components should never contain `lang === "am" ? d.nameAm : d.nameEn`
//   conditionals — that logic lives in one place (here) and every consumer
//   gets a clean { name, desc, syllabus } object regardless of language.

/**
 * Resolves bilingual Firestore fields into a single-language course object.
 * @param {object} d    - raw Firestore document data
 * @param {"am"|"en"} lang
 * @returns {object}
 */
function normaliseCourse(d, lang) {
    const isAm = lang === "am";
    return {
        id: d.id,
        name: isAm ? d.nameAm || d.nameEn : d.nameEn || d.nameAm,
        desc: isAm ? d.descAm || d.descEn : d.descEn || d.descAm,
        syllabus: isAm
            ? d.syllabusAm || d.syllabusEn
            : d.syllabusEn || d.syllabusAm,
        price: d.price ?? 0,
        image: d.image ?? "",
        pricingModel: d.pricingModel ?? "monthly",
        serviceLine: d.serviceLine,
        gradeRange: d.gradeRange ?? null,
        subject: d.subject ?? null,
        sortOrder: d.sortOrder ?? 0,
        // Keep raw bilingual fields available for admin pages that need both
        nameEn: d.nameEn,
        nameAm: d.nameAm,
        descEn: d.descEn,
        descAm: d.descAm,
    };
}
