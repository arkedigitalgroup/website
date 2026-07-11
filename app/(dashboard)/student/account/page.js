// app/(dashboard)/student/account/page.js
"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";

// ─── Reusable Field Component ─────────────────────────────────────────────────
function Field({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}

const INPUT_CLS =
    "w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm transition-colors placeholder-text-muted";

const SELECT_CLS =
    "w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm transition-colors";

export default function StudentAccount() {
    const { user, profile } = useAuth();
    const { lang } = useLanguage();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // Form fields
    const [fullName, setFullName] = useState("");
    const [christianName, setChristianName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [phone, setPhone] = useState("");
    const [courseId, setCourseId] = useState("meserete-imnet");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [profileUrl, setprofileUrl] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, "students", user.uid));
                if (snap.exists()) {
                    const d = snap.data();
                    console.log("student", d);
                    setData(d);
                    setFullName(d.fullName || "");
                    setChristianName(d.christianName || "");
                    setAge(d.age ?? "");
                    setGender(d.gender || "male");
                    setPhone(d.phone || "");
                    setCourseId(d.courseId || "meserete-imnet");
                    setLat(d.locationPin?.lat ?? "");
                    setLng(d.locationPin?.lng ?? "");
                    setprofileUrl(d.profileUrl || "");
                }
            } catch (e) {
                console.error("Failed to load student profile:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const handlePhotoUpload = async (file) => {
        setUploadingPhoto(true);
        setError("");
        try {
            const fileRef = ref(storage, `students/${user.uid}/profile.jpg`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setprofileUrl(url);
            // Immediately persist to Firestore
            await updateDoc(doc(db, "students", user.uid), {
                profileUrl: url,
            });
            return url;
        } catch (e) {
            console.error("Upload failed:", e);
            setError(
                lang === "am"
                    ? "ፎቶው ሊሰቀል አልቻለም። ድጋሚ ሞክር።"
                    : "File upload failed. Please try again.",
            );
            return null;
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const studentRef = doc(db, "students", user.uid);
            const updates = {
                christianName: christianName.trim(),
                age: Number(age),
                gender,
                phone: phone.trim(),
                locationPin: {
                    lat: parseFloat(lat) || 0,
                    lng: parseFloat(lng) || 0,
                },
            };
            await updateDoc(studentRef, updates);

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Save error:", err);
            setError(
                lang === "am"
                    ? "ለማስቀመጥ ሳይሳካ ቀረ። ድጋሚ ሞክር።"
                    : "Failed to save. Please try again.",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    {lang === "am" ? "መገለጫ በመጫን ላይ..." : "Loading profile..."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Page Header */}
            <div className="border-b border-navy-border pb-6">
                <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                    {lang === "am" ? "የእኔ መለያ" : "My Account"}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                    {lang === "am"
                        ? "የግል መረጃዎን ያዘምኑ። ትክክለኛ አካባቢ ፈጣን ምደባ ያስችላል።"
                        : "Update your personal information. Accurate details help us match you with the right tutor faster."}
                </p>

                {/* Profile Avatar & Completeness */}
                <div className="mt-5 flex items-center gap-5">
                    <div className="relative group">
                        {profileUrl ? (
                            <img
                                src={profileUrl}
                                alt="Profile"
                                className="w-16 h-16 rounded-xl border-2 border-gold-primary object-cover shadow-gold flex-shrink-0"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-navy-border bg-navy-mid flex items-center justify-center text-3xl flex-shrink-0 text-text-secondary">
                                👤
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer transition-opacity duration-150">
                            {uploadingPhoto
                                ? "..."
                                : lang === "am"
                                  ? "ቀይር"
                                  : "Change"}
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                disabled={uploadingPhoto}
                                onChange={(e) =>
                                    e.target.files[0] &&
                                    handlePhotoUpload(e.target.files[0])
                                }
                            />
                        </label>
                    </div>
                    <div className="flex-grow space-y-1.5">
                        {data &&
                            (() => {
                                const fields = [
                                    fullName,
                                    christianName,
                                    phone,
                                    lat,
                                    profileUrl,
                                ];
                                const filled = fields.filter(Boolean).length;
                                const pct = Math.round(
                                    (filled / fields.length) * 100,
                                );
                                return (
                                    <>
                                        <div className="flex justify-between text-xs text-text-secondary">
                                            <span>
                                                {lang === "am"
                                                    ? "የመገለጫ ሙሉነት"
                                                    : "Profile Completeness"}
                                            </span>
                                            <span
                                                className={
                                                    pct === 100
                                                        ? "text-success font-bold"
                                                        : "text-warning font-bold"
                                                }
                                            >
                                                {pct}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-navy-mid rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all duration-500 ${pct === 100 ? "bg-success" : "bg-warning"}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </>
                                );
                            })()}
                    </div>
                </div>
            </div>

            {/* Identity Card */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center gap-3 border-b border-navy-border pb-4">
                    {profileUrl ? (
                        <img
                            src={profileUrl}
                            alt="Profile"
                            className="w-16 h-16 rounded-xl border-2 border-gold-primary object-cover shadow-gold flex-shrink-0"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-xl border-2 border-navy-border bg-navy-mid flex items-center justify-center text-3xl flex-shrink-0 text-text-secondary">
                            👤
                        </div>
                    )}
                    <div>
                        <h2 className="font-bold text-white text-base">
                            {lang === "am" ? "ግላዊ መረጃ" : "Personal Information"}
                        </h2>
                        <p className="text-xs text-text-muted">
                            ID:{" "}
                            <span className="font-mono text-gold-primary">
                                {data?.serviceId}
                            </span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label={lang === "am" ? "ሙሉ ስም" : "Full Name"}>
                            <div className="relative">
                                <input
                                    type="text"
                                    disabled
                                    value={fullName}
                                    className={`${INPUT_CLS} opacity-60 cursor-not-allowed pr-8`}
                                    placeholder="e.g. Abebe Bekele"
                                />
                                <span
                                    className="absolute right-3 top-3 text-xs opacity-50"
                                    title="Locked"
                                >
                                    🔒
                                </span>
                            </div>
                        </Field>
                        <Field
                            label={
                                lang === "am" ? "የክርስትና ስም" : "Christian Name"
                            }
                        >
                            <input
                                type="text"
                                value={christianName}
                                onChange={(e) =>
                                    setChristianName(e.target.value)
                                }
                                className={INPUT_CLS}
                                placeholder="e.g. Gebre Mariam"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <Field label={lang === "am" ? "ዕድሜ" : "Age"}>
                            <input
                                type="number"
                                min="4"
                                max="99"
                                required
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className={INPUT_CLS}
                            />
                        </Field>
                        <Field label={lang === "am" ? "ጾታ" : "Gender"}>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className={SELECT_CLS}
                            >
                                <option value="male">
                                    {lang === "am" ? "ወንድ" : "Male"}
                                </option>
                                <option value="female">
                                    {lang === "am" ? "ሴት" : "Female"}
                                </option>
                            </select>
                        </Field>
                        <Field
                            label={lang === "am" ? "ስልክ ቁጥር" : "Phone Number"}
                        >
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={INPUT_CLS}
                                placeholder="+251 976977475"
                            />
                        </Field>
                    </div>

                    <Field
                        label={lang === "am" ? "የትምህርት ጥቅል" : "Course Package"}
                    >
                        <div className="relative">
                            <select
                                disabled
                                value={courseId}
                                className={`${SELECT_CLS} opacity-60 cursor-not-allowed pr-8`}
                            >
                                <option value="meserete-imnet">
                                    Meserete Imnet (Foundation of Faith)
                                </option>
                                <option value="quanquanna-zema">
                                    Quanquanna & Zema (Liturgical Chant)
                                </option>
                                <option value="diquna-zegajat">
                                    Diquna & Zegajat (Deacon Training)
                                </option>
                                <option value="begena">
                                    Begena (Sacred Harp)
                                </option>
                                <option value="all-courses">
                                    All Courses Bundle
                                </option>
                            </select>
                            <span
                                className="absolute right-3 top-3 text-xs opacity-50"
                                title="Locked"
                            >
                                🔒
                            </span>
                        </div>
                    </Field>

                    {/* Location */}
                    <div className="border-t border-navy-border pt-5 space-y-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            📍{" "}
                            {lang === "am"
                                ? "አካባቢ (ኬክሮስ / ቁመት)"
                                : "Location Coordinates"}
                        </p>
                        <p className="text-xs text-text-muted -mt-1">
                            {lang === "am"
                                ? "Google Maps ላይ ቦታዎን ፈልገው ኬክሮስና ቁመት ያስገቡ።"
                                : "Find your location on Google Maps and paste the latitude and longitude values."}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Latitude">
                                <input
                                    type="number"
                                    step="any"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="9.0320"
                                />
                            </Field>
                            <Field label="Longitude">
                                <input
                                    type="number"
                                    step="any"
                                    value={lng}
                                    onChange={(e) => setLng(e.target.value)}
                                    className={INPUT_CLS}
                                    placeholder="38.7469"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <p className="text-error text-xs font-semibold bg-error/10 border border-error/30 px-3 py-2 rounded-lg">
                            ❌ {error}
                        </p>
                    )}
                    {saved && (
                        <p className="text-success text-xs font-semibold bg-success/10 border border-success/30 px-3 py-2 rounded-lg">
                            ✅{" "}
                            {lang === "am"
                                ? "መረጃ ተቀምጧል!"
                                : "Profile saved successfully!"}
                        </p>
                    )}

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            id="student-account-save-btn"
                            className="px-8 py-3 bg-gold-primary text-navy-deep font-bold rounded-md hover:bg-gold-hover shadow-gold transition-all disabled:opacity-50 text-sm"
                        >
                            {saving
                                ? lang === "am"
                                    ? "በማስቀመጥ ላይ..."
                                    : "Saving..."
                                : lang === "am"
                                  ? "ለውጦችን አስቀምጥ"
                                  : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Read-only info card */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                <h2 className="font-bold text-white text-base border-b border-navy-border pb-3">
                    🔒{" "}
                    {lang === "am"
                        ? "ሊቀየሩ የማይችሉ መረጃዎች"
                        : "Read-only Account Details"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        {
                            label: lang === "am" ? "ኢሜይል" : "Email",
                            value: data?.email,
                        },
                        {
                            label: lang === "am" ? "አገልግሎት" : "Service Line",
                            value: data?.serviceLine,
                        },
                        {
                            label: lang === "am" ? "ሚና" : "Role",
                            value: "Student / Parent",
                        },
                        { label: "Service ID", value: data?.serviceId },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="bg-navy-mid border border-navy-border rounded-lg p-4 space-y-1"
                        >
                            <span className="text-[10px] font-semibold text-text-secondary uppercase block">
                                {item.label}
                            </span>
                            <span className="font-bold text-white text-sm capitalize font-mono">
                                {item.value || "—"}
                            </span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-text-muted">
                    {lang === "am"
                        ? "ሚናን ወይም አገልግሎትን ለመቀየር info@arke-group.com ያነጋግሩ።"
                        : "To change your role or service line, contact info@arke-group.com."}
                </p>
            </div>
        </div>
    );
}
