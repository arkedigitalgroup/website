// src/lib/fidelCatalog.js
//
// Shared, read-only helpers for the public Fidel catalog.
//
// The public catalog is the static `assets/fidelCourse.json` file. Firestore
// `courses` remains the source of truth for enrollment and for Yeneta. This
// module only decides what may be *promoted* publicly:
//   - courses explicitly marked `public_visibility: false` are excluded
//   - prices, grades and formats are read from the record itself (never invented)
//   - registration links use `course_slug`, which is the Firestore document ID

import fidelCourseData from "../../assets/fidelCourse.json";

export const allFidelCourses = fidelCourseData.courses ?? [];

export const publicFidelCourses = allFidelCourses.filter(
    (course) => course.public_visibility !== false,
);

export function findPublicCourse(slug) {
    return publicFidelCourses.find((course) => course.course_slug === slug) ?? null;
}

const subjectTranslationsAm = {
    "Multi-Subject": "ብዙ ትምህርቶች",
    "Multi-Subject (Exam Prep)": "ብዙ ትምህርቶች (የፈተና ዝግጅት)",
    Mathematics: "ሂሳብ",
    Science: "ሳይንስ",
    Physics: "ፊዚክስ",
    Chemistry: "ኬሚስትሪ",
    Biology: "ባዮሎጂ",
    English: "እንግሊዝኛ",
    "Amharic Literature": "አማርኛ ሥነ-ጽሑፍ",
    STEM: "ሳይንስና ቴክኖሎጂ (STEM)",
    Languages: "ቋንቋዎች",
    "Computer Science": "ኮምፒውተር ሳይንስ",
    "Life Skills & Study Skills": "የሕይወትና የመማር ክህሎቶች",
};

const formatTranslationsAm = {
    "In-Person": "በአካል (ቤት ውስጥ)",
    Online: "በኢንተርኔት",
    Hybrid: "የተቀላቀለ",
    Platform: "በፕላትፎርም",
};

const billingTranslationsAm = {
    "Per Hour": "በሰዓት",
    "Per Month": "በወር",
    "Full Program": "ሙሉ ፕሮግራም",
};

export function subjectLabel(subject, lang) {
    if (!subject) return "";
    return lang === "am" ? subjectTranslationsAm[subject] || subject : subject;
}

export function formatLabel(format, lang) {
    if (!format) return "";
    return lang === "am" ? formatTranslationsAm[format] || format : format;
}

export function billingUnitLabel(pricingModel, lang) {
    if (!pricingModel) return "";
    return lang === "am"
        ? billingTranslationsAm[pricingModel] || pricingModel
        : pricingModel.toLowerCase();
}

/**
 * Formats the catalog price using the record's own currency and range.
 * No conversion, no rounding, no invented "starting from" figure.
 */
export function formatCoursePrice(pricing, lang) {
    if (!pricing) return "";
    const currency = pricing.currency || "ETB";
    const price = Number(pricing.price);
    const priceMax = Number(pricing.price_max);

    if (!Number.isFinite(price)) return "";
    if (price === 0) return lang === "am" ? "ነጻ" : "Free";

    const min = price.toLocaleString("en-US");
    if (Number.isFinite(priceMax) && priceMax !== price) {
        const max = priceMax.toLocaleString("en-US");
        return `${min} – ${max} ${currency}`;
    }
    return `${min} ${currency}`;
}

export function gradeLabel(range, lang) {
    if (!range) return "";
    const raw = String(range).trim();
    const parts = raw
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (lang === "am") {
        if (parts.length > 1) return `ክፍል ${parts[0]} እና ${parts[1]}`;
        return `ክፍል ${raw.replace("-", "–")}`;
    }

    if (parts.length > 1) return `Grades ${parts[0]} & ${parts[1]}`;
    if (raw.includes("-")) return `Grades ${raw.replace("-", "–")}`;
    return `Grade ${raw}`;
}

/**
 * Registration deep link. `course_slug` is the Firestore document ID used by
 * the enrollment course selector, so the selected course survives the hop.
 */
export function buildRegisterHref(course, role = "student") {
    const slug = course?.course_slug || "in-person-home-tutoring-all-subjects";
    return `/register?role=${role}&line=fidel&course=${encodeURIComponent(slug)}`;
}
