// app/(dashboard)/admin/courses/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    orderBy,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const PRICING_MODELS = ["monthly", "per-hour", "per-session"];

const EMPTY_COURSE = {
    nameEn: "",
    nameAm: "",
    descEn: "",
    descAm: "",
    syllabusEn: "",
    syllabusAm: "",
    price: "",
    pricingModel: "monthly",
    gradeRange: "",
    subject: "",
    sortOrder: "",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCourses() {
    const { user } = useAuth();
    const { lang } = useLanguage();

    const [activeTab, setActiveTab] = useState("yeneta");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState(null); // null = closed, {} = new, {id,...} = edit
    const [form, setForm] = useState(EMPTY_COURSE);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [toggling, setToggling] = useState(null); // courseId being toggled

    // ── Real-time listener — switches when tab changes ────────────────────────
    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, "courses"),
            where("serviceLine", "==", activeTab),
            orderBy("sortOrder", "asc"),
        );
        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => {
                console.error("[AdminCourses] Firestore error:", err);
                setLoading(false);
            },
        );
        return () => unsubscribe();
    }, [activeTab]);

    // ── Open edit / new form ──────────────────────────────────────────────────
    const openNew = () => {
        setForm({ ...EMPTY_COURSE, sortOrder: courses.length + 1 });
        setEditingCourse({});
        setSaveError("");
    };

    const openEdit = (course) => {
        setForm({
            nameEn: course.nameEn ?? "",
            nameAm: course.nameAm ?? "",
            descEn: course.descEn ?? "",
            descAm: course.descAm ?? "",
            syllabusEn: course.syllabusEn ?? "",
            syllabusAm: course.syllabusAm ?? "",
            price: course.price ?? "",
            pricingModel: course.pricingModel ?? "monthly",
            gradeRange: course.gradeRange ?? "",
            subject: course.subject ?? "",
            sortOrder: course.sortOrder ?? "",
        });
        setEditingCourse(course);
        setSaveError("");
    };

    const closeForm = () => {
        setEditingCourse(null);
        setSaveError("");
    };

    // ── Save (new or edit) ────────────────────────────────────────────────────
    const handleSave = async () => {
        // Validate required fields
        if (!form.nameEn.trim() || !form.nameAm.trim()) {
            setSaveError("Both English and Amharic names are required.");
            return;
        }
        if (
            !form.price ||
            isNaN(parseFloat(form.price)) ||
            parseFloat(form.price) < 0
        ) {
            setSaveError("Price must be 0 or greater.");
            return;
        }

        setSaving(true);
        setSaveError("");

        try {
            const isNew = !editingCourse?.id;

            // For new courses, derive doc ID from nameEn slug
            const docId = isNew
                ? form.nameEn
                      .trim()
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                : editingCourse.id;

            const payload = {
                id: docId,
                nameEn: form.nameEn.trim(),
                nameAm: form.nameAm.trim(),
                descEn: form.descEn.trim(),
                descAm: form.descAm.trim(),
                syllabusEn: form.syllabusEn.trim(),
                syllabusAm: form.syllabusAm.trim(),
                price: parseFloat(form.price),
                pricingModel: form.pricingModel,
                serviceLine: activeTab,
                gradeRange: form.gradeRange.trim() || null,
                subject: form.subject.trim() || null,
                sortOrder: parseInt(form.sortOrder) || courses.length + 1,
                updatedAt: new Date(),
                updatedBy: user.uid,
                // Only set these on creation
                ...(isNew && { isActive: true, createdAt: new Date() }),
            };

            await setDoc(doc(db, "courses", docId), payload, { merge: !isNew });
            closeForm();
        } catch (err) {
            console.error("Course save error:", err);
            setSaveError("Save failed. Check your connection and try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle isActive ───────────────────────────────────────────────────────
    const handleToggleActive = async (course) => {
        setToggling(course.id);
        try {
            await updateDoc(doc(db, "courses", course.id), {
                isActive: !course.isActive,
                updatedAt: new Date(),
                updatedBy: user.uid,
            });
        } catch (err) {
            console.error("Toggle error:", err);
        } finally {
            setToggling(null);
        }
    };

    const isFidel = activeTab === "fidel";

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                        {lang === "am" ? "ኮርስ አስተዳደር" : "Course Manager"}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Add, edit, or deactivate courses. Changes reflect
                        immediately on registration and all pages
                    </p>
                </div>
                <button
                    onClick={openNew}
                    className="px-4 py-2.5 bg-gold-primary text-navy-deep font-extrabold text-sm rounded-lg hover:bg-gold-hover transition-all"
                >
                    + Add Course
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-navy-mid p-1 rounded-lg border border-navy-border w-fit">
                {["yeneta", "fidel"].map((line) => (
                    <button
                        key={line}
                        onClick={() => {
                            setActiveTab(line);
                            closeForm();
                        }}
                        className={`px-5 py-2 text-sm font-bold rounded-md transition-colors capitalize ${
                            activeTab === line
                                ? "bg-gold-primary text-navy-deep"
                                : "text-text-secondary hover:text-white"
                        }`}
                    >
                        {line === "yeneta" ? "✝ Yeneta" : "📚 Fidel"}
                    </button>
                ))}
            </div>

            {/* Course list */}
            <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 space-x-3">
                        <div className="w-6 h-6 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-text-secondary text-sm">
                            Loading courses...
                        </p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                        <p className="text-2xl">📭</p>
                        <p className="text-sm font-bold text-white">
                            No courses yet
                        </p>
                        <p className="text-xs text-text-muted">
                            Click{" "}
                            <span className="text-gold-primary font-semibold">
                                + Add Course
                            </span>{" "}
                            to create the first one, or run the seed script if
                            you haven't already.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4">Course</th>
                                    {isFidel && (
                                        <th className="p-4">Grade / Subject</th>
                                    )}
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Model</th>
                                    <th className="p-4">Order</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-border">
                                {courses.map((course) => (
                                    <tr
                                        key={course.id}
                                        className={`hover:bg-navy-hover transition-colors ${!course.isActive ? "opacity-50" : ""}`}
                                    >
                                        <td className="p-4">
                                            <div className="font-bold text-white">
                                                {course.nameEn}
                                            </div>
                                            <div className="text-xs text-text-muted font-ethiopic">
                                                {course.nameAm}
                                            </div>
                                            <div className="text-[10px] text-text-muted font-mono mt-0.5">
                                                {course.id}
                                            </div>
                                        </td>
                                        {isFidel && (
                                            <td className="p-4 text-text-secondary text-xs">
                                                <div>
                                                    {course.gradeRange ?? "—"}
                                                </div>
                                                <div className="text-text-muted">
                                                    {course.subject ?? "—"}
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-4 text-gold-primary font-bold">
                                            {course.price?.toLocaleString()} ETB
                                        </td>
                                        <td className="p-4 text-text-secondary capitalize">
                                            {course.pricingModel}
                                        </td>
                                        <td className="p-4 text-text-secondary">
                                            {course.sortOrder}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() =>
                                                    handleToggleActive(course)
                                                }
                                                disabled={
                                                    toggling === course.id
                                                }
                                                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border transition-all ${
                                                    course.isActive
                                                        ? "bg-success-faint text-success border-success/20 hover:bg-error-faint hover:text-error hover:border-error/20"
                                                        : "bg-error-faint text-error border-error/20 hover:bg-success-faint hover:text-success hover:border-success/20"
                                                }`}
                                            >
                                                {toggling === course.id
                                                    ? "..."
                                                    : course.isActive
                                                      ? "Active"
                                                      : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => openEdit(course)}
                                                className="text-xs font-bold text-gold-primary hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Edit / Add Form Panel ── */}
            {editingCourse !== null && (
                <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-lg space-y-6">
                    <div className="flex items-center justify-between border-b border-navy-border pb-3">
                        <h2 className="text-lg font-bold text-white">
                            {editingCourse?.id
                                ? `Editing — ${editingCourse.nameEn}`
                                : `New ${activeTab === "yeneta" ? "Yeneta" : "Fidel"} Course`}
                        </h2>
                        <button
                            onClick={closeForm}
                            className="text-text-muted hover:text-white text-sm font-semibold"
                        >
                            ✕ Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Name (English)" required>
                            <input
                                value={form.nameEn}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        nameEn: e.target.value,
                                    }))
                                }
                                className={INPUT}
                                placeholder="e.g. Meserete Imnet"
                            />
                        </Field>
                        <Field label="Name (Amharic)" required>
                            <input
                                value={form.nameAm}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        nameAm: e.target.value,
                                    }))
                                }
                                className={INPUT}
                                placeholder="e.g. መሠረተ እምነት"
                            />
                        </Field>
                        <Field label="Description (English)">
                            <textarea
                                value={form.descEn}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        descEn: e.target.value,
                                    }))
                                }
                                rows={2}
                                className={INPUT}
                            />
                        </Field>
                        <Field label="Description (Amharic)">
                            <textarea
                                value={form.descAm}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        descAm: e.target.value,
                                    }))
                                }
                                rows={2}
                                className={INPUT}
                            />
                        </Field>
                        <Field label="Syllabus (English)">
                            <textarea
                                value={form.syllabusEn}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        syllabusEn: e.target.value,
                                    }))
                                }
                                rows={2}
                                className={INPUT}
                                placeholder="Topics covered, comma separated"
                            />
                        </Field>
                        <Field label="Syllabus (Amharic)">
                            <textarea
                                value={form.syllabusAm}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        syllabusAm: e.target.value,
                                    }))
                                }
                                rows={2}
                                className={INPUT}
                            />
                        </Field>
                        <Field label="Price (ETB)" required>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        price: e.target.value,
                                    }))
                                }
                                className={INPUT}
                                placeholder="e.g. 4200"
                            />
                        </Field>
                        <Field label="Pricing Model">
                            <select
                                value={form.pricingModel}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        pricingModel: e.target.value,
                                    }))
                                }
                                className={INPUT}
                            >
                                {PRICING_MODELS.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Sort Order">
                            <input
                                type="number"
                                min={1}
                                value={form.sortOrder}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        sortOrder: e.target.value,
                                    }))
                                }
                                className={INPUT}
                                placeholder="1"
                            />
                        </Field>
                        {isFidel && (
                            <>
                                <Field label="Grade Range">
                                    <input
                                        value={form.gradeRange}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                gradeRange: e.target.value,
                                            }))
                                        }
                                        className={INPUT}
                                        placeholder="e.g. 5-8"
                                    />
                                </Field>
                                <Field label="Subject">
                                    <input
                                        value={form.subject}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                subject: e.target.value,
                                            }))
                                        }
                                        className={INPUT}
                                        placeholder="e.g. Mathematics"
                                    />
                                </Field>
                            </>
                        )}
                    </div>

                    {saveError && (
                        <p className="text-sm text-error bg-error-faint border border-error/20 rounded-lg px-4 py-3">
                            {saveError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={closeForm}
                            className="px-4 py-2 rounded border border-navy-border text-text-secondary hover:bg-navy-mid text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 rounded bg-gold-primary text-navy-deep font-extrabold text-sm hover:bg-gold-hover transition-all disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingCourse?.id
                                  ? "Save Changes"
                                  : "Create Course"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Shared input class ────────────────────────────────────────────────────────
const INPUT =
    "w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm";

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
    return (
        <div className="space-y-1">
            <label className="text-xs text-text-secondary font-semibold uppercase">
                {label}
                {required && <span className="text-error ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
