// app/(dashboard)/admin/settings/page.js
"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";
import { usePlatformConfig } from "../../../../src/hooks/Useplatformconfig";

export default function AdminSettings() {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const { config, loading } = usePlatformConfig();

    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    // Populate form once config loads from Firestore
    useEffect(() => {
        if (!loading && config) {
            setForm({
                registrationFeeStudent: config.registrationFeeStudent,
                registrationFeeTeacher: config.registrationFeeTeacher,
                serviceFeeMonthly: config.serviceFeeMonthly,
                teacherPayoutRatio: config.teacherPayoutRatio * 100, // store as % in form
            });
        }
    }, [loading]);

    const handleChange = (field, value) => {
        setSaved(false);
        setError(null);
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validate
        const ratio = parseFloat(form.teacherPayoutRatio);
        if (isNaN(ratio) || ratio <= 0 || ratio >= 100) {
            setError("Teacher payout ratio must be between 1 and 99.");
            return;
        }
        const fees = [
            form.registrationFeeStudent,
            form.registrationFeeTeacher,
            form.serviceFeeMonthly,
        ];
        if (fees.some((f) => isNaN(parseFloat(f)) || parseFloat(f) < 0)) {
            setError("All fees must be 0 or greater.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await setDoc(
                doc(db, "platform_config", "global"),
                {
                    registrationFeeStudent: parseFloat(
                        form.registrationFeeStudent,
                    ),
                    registrationFeeTeacher: parseFloat(
                        form.registrationFeeTeacher,
                    ),
                    serviceFeeMonthly: parseFloat(form.serviceFeeMonthly),
                    teacherPayoutRatio: ratio / 100, // save as decimal
                    updatedAt: serverTimestamp(),
                    updatedBy: user.uid,
                },
                { merge: true },
            );
            setSaved(true);
        } catch (err) {
            console.error("Settings save error:", err);
            setError("Failed to save. Check your connection and try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading settings...
                </p>
            </div>
        );
    }

    const companyRatio = (
        100 - parseFloat(form.teacherPayoutRatio || 0)
    ).toFixed(1);

    return (
        <div className="space-y-10 max-w-2xl">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                    {lang === "am" ? "የመድረክ ቅንብሮች" : "Platform Settings"}
                </h1>
                <p className="text-sm text-text-secondary">
                    Changes save instantly to Firestore. All pages update in
                    real-time — no redeploy needed.
                </p>
            </div>

            {/* Fees */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
                <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3">
                    Registration Fees
                </h2>

                <Field
                    label="Student Registration Fee"
                    hint="One-time fee collected when a new student registers."
                    value={form.registrationFeeStudent}
                    onChange={(v) => handleChange("registrationFeeStudent", v)}
                    suffix="ETB"
                />
                <Field
                    label="Teacher Registration Fee"
                    hint="One-time activation fee collected from new teachers."
                    value={form.registrationFeeTeacher}
                    onChange={(v) => handleChange("registrationFeeTeacher", v)}
                    suffix="ETB"
                />
            </div>

            {/* Revenue split */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
                <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3">
                    Monthly Revenue Split
                </h2>

                <Field
                    label="Monthly Service Fee (Arke flat cut)"
                    hint="Added on top of the course price in every monthly invoice."
                    value={form.serviceFeeMonthly}
                    onChange={(v) => handleChange("serviceFeeMonthly", v)}
                    suffix="ETB"
                />
                <Field
                    label="Teacher Payout Ratio"
                    hint="Percentage of the course price paid to the teacher."
                    value={form.teacherPayoutRatio}
                    onChange={(v) => handleChange("teacherPayoutRatio", v)}
                    suffix="%"
                    max={99}
                />

                {/* Live preview */}
                <div className="rounded-lg bg-navy-mid border border-navy-border p-4 text-xs text-text-secondary space-y-1">
                    <p className="font-semibold text-white text-sm mb-2">
                        Live preview — example course price: 4,200 ETB
                    </p>
                    <div className="flex justify-between">
                        <span>Parent pays (course + service fee)</span>
                        <span className="text-gold-primary font-bold">
                            {(
                                4200 + parseFloat(form.serviceFeeMonthly || 0)
                            ).toLocaleString()}{" "}
                            ETB
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>
                            Teacher receives ({form.teacherPayoutRatio}%)
                        </span>
                        <span className="text-white font-bold">
                            {(
                                4200 *
                                (parseFloat(form.teacherPayoutRatio || 0) / 100)
                            ).toLocaleString()}{" "}
                            ETB
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Arke keeps ({companyRatio}% + service fee)</span>
                        <span className="text-success font-bold">
                            {(
                                4200 * (parseFloat(companyRatio) / 100) +
                                parseFloat(form.serviceFeeMonthly || 0)
                            ).toLocaleString()}{" "}
                            ETB
                        </span>
                    </div>
                </div>
            </div>

            {/* Save */}
            {error && (
                <p className="text-sm text-error bg-error-faint border border-error/20 rounded-lg px-4 py-3">
                    {error}
                </p>
            )}
            {saved && (
                <p className="text-sm text-success bg-success-faint border border-success/20 rounded-lg px-4 py-3">
                    ✓ Settings saved. All pages updated in real-time.
                </p>
            )}

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-lg bg-gold-primary text-navy-deep font-extrabold text-sm hover:bg-gold-hover transition-all disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Settings"}
            </button>
        </div>
    );
}

// ── Reusable field component ──────────────────────────────────────────────────
function Field({ label, hint, value, onChange, suffix, max }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-semibold text-white">{label}</label>
            {hint && <p className="text-xs text-text-muted">{hint}</p>}
            <div className="flex items-center space-x-2 mt-1">
                <input
                    type="number"
                    min={0}
                    max={max}
                    step="any"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-40 px-4 py-2 bg-navy-mid border border-navy-border rounded-md text-white text-sm font-mono focus:outline-none focus:border-gold-primary"
                />
                <span className="text-text-secondary text-sm">{suffix}</span>
            </div>
        </div>
    );
}
