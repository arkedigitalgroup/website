/**
 * scripts/seed-courses.js
 *
 * Seeds the `courses` Firestore collection. Both Yeneta and Fidel courses
 * are normalised into one unified schema — serviceLine field tells them apart.
 *
 * Usage (from project root):
 *   node scripts/seed-courses.js            ← dry run, prints what would write
 *   node scripts/seed-courses.js --write    ← actually writes to Firestore
 *
 * Always do the dry run first and read the output before using --write.
 *
 * Requires FIREBASE_SAK in your .env file.
 */

"use strict";

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const admin = require("firebase-admin");

const DRY_RUN = !process.argv.includes("--write");

// ── Credentials ──────────────────────────────────────────────────────────────
const rawSak = process.env.FIREBASE_SAK;
if (!rawSak) {
    console.error(
        "✗  FIREBASE_SAK not found in .env\n" +
            "   Add: FIREBASE_SAK={...paste your service account JSON here...}",
    );
    process.exit(1);
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(rawSak);
} catch (e) {
    console.error(
        "✗  FIREBASE_SAK is not valid JSON.\n" +
            "   Make sure the entire JSON is on one line with no extra quotes.\n" +
            "   Error: " +
            e.message,
    );
    process.exit(1);
}

let db;
if (!DRY_RUN) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    db = admin.firestore();
    console.log(
        "✓  Firebase Admin initialised — project:",
        serviceAccount.project_id,
    );
} else {
    console.log(
        "ℹ  Dry run — Firebase not initialised (no writes will happen)",
    );
}

// ── Unified course schema ─────────────────────────────────────────────────────
// Every document in the `courses` collection has exactly these fields.
// Why nameEn/nameAm as data instead of t() keys?
//   The t() function only works inside React. Firestore data is consumed
//   from scripts, email templates, and eventually a mobile app — it must
//   carry its own translations as plain strings, not code references.

function buildYenetaCourse({
    id,
    nameEn,
    nameAm,
    descEn,
    descAm,
    syllabusEn,
    syllabusAm,
    price,
    sortOrder,
}) {
    return {
        id,
        nameEn,
        nameAm: nameAm || nameEn,
        descEn,
        descAm: descAm || descEn,
        syllabusEn,
        syllabusAm: syllabusAm || syllabusEn,
        price,
        pricingModel: "monthly",
        serviceLine: "yeneta",
        isActive: true,
        gradeRange: null,
        subject: null,
        sortOrder,
        createdAt: DRY_RUN
            ? "<serverTimestamp>"
            : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: DRY_RUN
            ? "<serverTimestamp>"
            : admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: "seed-script",
    };
}

function buildFidelCourse(raw, sortOrder) {
    const pricingModelMap = {
        "Per Month": "monthly",
        "Per Hour": "per-hour",
        "Per Session": "per-session",
    };
    return {
        id: raw.course_slug,
        nameEn: raw.course_name,
        nameAm: raw.course_name, // replace with Amharic translations
        descEn: raw.description || "",
        descAm: raw.description || "", // replace with Amharic translations
        syllabusEn: (raw.subjects_covered || []).join(", "),
        syllabusAm: (raw.subjects_covered || []).join(", "), // replace with Amharic
        price: (raw.pricing && raw.pricing.price) || 0,
        pricingModel:
            pricingModelMap[raw.pricing && raw.pricing.pricing_model] ||
            "per-hour",
        serviceLine: "fidel",
        isActive: true,
        gradeRange: raw.grade_range || null,
        subject: raw.subject || null,
        sortOrder,
        createdAt: DRY_RUN
            ? "<serverTimestamp>"
            : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: DRY_RUN
            ? "<serverTimestamp>"
            : admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: "seed-script",
    };
}

// ── Yeneta courses ────────────────────────────────────────────────────────────
// Prices taken directly from yenetaCourse.js. After seeding, admin
// edits prices from the Admin Course Manager — not from this file.

const yenetaCourses = [
    buildYenetaCourse({
        id: "meserete-imnet",
        nameEn: "Meserete Imnet",
        nameAm: "መሠረተ እምነት",
        descEn: "Foundation of faith course covering the core tenets of Ethiopian Orthodox Christianity.",
        descAm: "የኢትዮጵያ ኦርቶዶክስ ክርስትና መሠረታዊ ትምህርቶችን የሚያካትት የእምነት መሠረት ኮርስ።",
        syllabusEn: "Catechism, prayer, fasting, sacraments, church history",
        syllabusAm: "ቀኖና፣ ጸሎት፣ ጾም፣ ሥርዓተ ቁርባን፣ የቤተ ክርስቲያን ታሪክ",
        price: 4199,
        sortOrder: 1,
    }),
    buildYenetaCourse({
        id: "quanquanna-zema",
        nameEn: "Quanquanna na Zema",
        nameAm: "ቋንቋና ዜማ",
        descEn: "Ge'ez language and sacred chant (Zema) study for liturgical practice.",
        descAm: "ለሥርዓተ አምልኮ ተሳትፎ የግዕዝ ቋንቋ እና ቅዱስ ዝማሬ (ዜማ) ጥናት።",
        syllabusEn: "Ge'ez alphabet, reading, Zema notation, hymns",
        syllabusAm: "የግዕዝ ፊደላት፣ ንባብ፣ የዜማ ምልክቶች፣ መዝሙሮች",
        price: 5499,
        sortOrder: 2,
    }),
    buildYenetaCourse({
        id: "diquna-zegajat",
        nameEn: "Diquna na Zegajat",
        nameAm: "ድቁና ዘጋጃት",
        descEn: "Deaconship preparation covering vestments, liturgical duties and ceremonial roles.",
        descAm: "ልብሰ ተክህኖ፣ የሥርዓተ አምልኮ ተግባራት እና ሥርዓታዊ ሚናዎችን የሚያካትት የዲቁና ዝግጅት።",
        syllabusEn:
            "Diaconal vestments, procession, incense duties, liturgical responses",
        syllabusAm: "የዲያቆናት ልብስ፣ ሰልፍ፣ ዕጣን ሥርዓት፣ የሥርዓተ አምልኮ ምላሾች",
        price: 5999,
        sortOrder: 3,
    }),
    buildYenetaCourse({
        id: "all-courses",
        nameEn: "Full Yeneta Bundle",
        nameAm: "ሙሉ የየኔታ ጥቅል",
        descEn: "Complete Yeneta curriculum — all courses combined at a discounted bundle price.",
        descAm: "ሙሉ የየኔታ ሥርዓተ ትምህርት — ሁሉም ኮርሶች በቅናሽ ዋጋ ተጣምረዋል።",
        syllabusEn:
            "Meserete Imnet + Quanquanna na Zema + Diquna na Zegajat + Begena",
        syllabusAm: "መሠረተ እምነት + ቋንቋና ዜማ + ድቁና ዘጋጃት + በገና",
        price: 7999,
        sortOrder: 4,
    }),
    buildYenetaCourse({
        id: "begena",
        nameEn: "Begena",
        nameAm: "በገና",
        descEn: "Traditional Ethiopian lyre (Begena) instruction for spiritual and artistic practice.",
        descAm: "ለመንፈሳዊ እና ጥበባዊ ልምምድ ባህላዊ የኢትዮጵያ ክራር (በገና) ትምህርት።",
        syllabusEn:
            "Begena tuning, posture, hymn accompaniment, traditional repertoire",
        syllabusAm: "የበገና ማስተካከያ፣ አቀማመጥ፣ የዝማሬ ታጀቢ፣ ባህላዊ ሙዚቃ ስብስብ",
        price: 6099,
        sortOrder: 5,
    }),
];

// ── Fidel courses ─────────────────────────────────────────────────────────────
// Read from fidelCourse.json. The script looks in the most common locations
// relative to the project root. After seeding, the JSON file can be deleted.

const FIDEL_JSON_CANDIDATES = [
    path.resolve(__dirname, "../assets/fidelCourse.json"),
    path.resolve(__dirname, "../src/data/fidelCourse.json"),
    path.resolve(__dirname, "../public/fidelCourse.json"),
    path.resolve(__dirname, "../data/fidelCourse.json"),
    path.resolve(__dirname, "./fidelCourse.json"),
];

let fidelCourses = [];
for (const candidate of FIDEL_JSON_CANDIDATES) {
    if (fs.existsSync(candidate)) {
        const raw = JSON.parse(fs.readFileSync(candidate, "utf8"));
        const list = raw.courses || raw;
        fidelCourses = list.map((entry, i) => buildFidelCourse(entry, i + 1));
        console.log(
            "✓  Loaded " +
                fidelCourses.length +
                " Fidel courses from " +
                candidate,
        );
        break;
    }
}

if (fidelCourses.length === 0) {
    console.warn(
        "⚠  fidelCourse.json not found. Looked in:\n" +
            FIDEL_JSON_CANDIDATES.map((p) => "   " + p).join("\n") +
            "\n" +
            "   Continuing with Yeneta courses only.",
    );
}

// ── All courses ───────────────────────────────────────────────────────────────
const allCourses = [...yenetaCourses, ...fidelCourses];

// ── Dry run ───────────────────────────────────────────────────────────────────
if (DRY_RUN) {
    console.log("\n══════════════════════════════════════════════════════");
    console.log("  DRY RUN — nothing written to Firestore");
    console.log("  Re-run with --write to commit");
    console.log("══════════════════════════════════════════════════════\n");
    console.log(
        "Total courses: " +
            allCourses.length +
            " (Yeneta: " +
            yenetaCourses.length +
            ", Fidel: " +
            fidelCourses.length +
            ")\n",
    );

    allCourses.forEach((course) => {
        console.log("▸ courses/" + course.id);
        console.log(JSON.stringify(course, null, 2));
        console.log();
    });

    console.log("Looks correct? Run with --write to seed Firestore:");
    console.log("  node scripts/seed-courses.js --write\n");
    process.exit(0);
}

// ── Write ─────────────────────────────────────────────────────────────────────
(async () => {
    console.log("\nSeeding " + allCourses.length + " courses …\n");
    const results = { success: [], failed: [] };

    for (const course of allCourses) {
        try {
            await db
                .collection("courses")
                .doc(course.id)
                .set(course, { merge: false });
            console.log(
                "  ✓  courses/" + course.id + "  (" + course.serviceLine + ")",
            );
            results.success.push(course.id);
        } catch (err) {
            console.error("  ✗  courses/" + course.id + ": " + err.message);
            results.failed.push(course.id);
        }
    }

    console.log("\n══════════════════════════════════════════════════════");
    console.log("  ✓ " + results.success.length + " written");
    if (results.failed.length > 0) {
        console.log(
            "  ✗ " +
                results.failed.length +
                " failed: " +
                results.failed.join(", "),
        );
    }
    console.log("══════════════════════════════════════════════════════\n");

    if (results.failed.length > 0) {
        console.error(
            "Some writes failed. Check your Firestore rules and credentials.",
        );
        process.exit(1);
    }

    console.log("Next steps:");
    console.log("  1. Verify data in Firebase Console → Firestore → courses");
    console.log("  2. Delete src/data/yenetaCourse.js");
    console.log("  3. Delete src/data/fidelCourse.json");
    console.log(
        "  4. Replace course imports with useCourses() hook (Phase 2)\n",
    );

    process.exit(0);
})();
