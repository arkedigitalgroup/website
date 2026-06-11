// app/(dashboard)/teacher/account/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";

// ─── Reusable Components ──────────────────────────────────────────────────────
function Field({ label, hint, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {label}
            </label>
            {hint && <p className="text-[10px] text-text-muted">{hint}</p>}
            {children}
        </div>
    );
}

const INPUT_CLS =
    "w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm transition-colors placeholder-text-muted";

const SELECT_CLS =
    "w-full px-3 py-2.5 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm transition-colors";

// ─── Document Upload Row ──────────────────────────────────────────────────────
function DocUploadRow({
    icon,
    label,
    hint,
    currentUrl,
    accept,
    uploading,
    onUpload,
}) {
    const inputRef = useRef(null);
    return (
        <div className="flex items-center gap-4 py-4 border-b border-navy-border/50 last:border-0">
            <div className="w-10 h-10 rounded-lg bg-navy-mid border border-navy-border flex items-center justify-center text-xl flex-shrink-0">
                {icon}
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-[10px] text-text-muted">{hint}</p>
                {currentUrl && (
                    <a
                        href={currentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-gold-primary hover:underline font-bold"
                    >
                        📎 View current file ↗
                    </a>
                )}
            </div>
            <div className="flex-shrink-0">
                {currentUrl && !uploading && (
                    <span className="mr-2 text-[10px] px-2 py-0.5 rounded bg-success/10 text-success border border-success/20 font-bold uppercase">
                        ✓ Uploaded
                    </span>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) =>
                        e.target.files[0] && onUpload(e.target.files[0])
                    }
                />
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="px-3 py-1.5 rounded-md border border-navy-border text-text-secondary hover:border-gold-primary hover:text-gold-primary text-xs font-semibold transition-all disabled:opacity-50"
                >
                    {uploading
                        ? "Uploading…"
                        : currentUrl
                          ? "Replace"
                          : "Upload"}
                </button>
            </div>
        </div>
    );
}

export default function TeacherAccount() {
    const { user, setProfile } = useAuth();
    const { lang } = useLanguage();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // Uploading states per document slot
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingChurch, setUploadingChurch] = useState(false);
    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingEdu, setUploadingEdu] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState("");
    const [christianName, setChristianName] = useState("");
    const [gender, setGender] = useState("male");
    const [phone, setPhone] = useState("");
    const [bankProvider, setBankProvider] = useState("CBE");
    const [bankAccount, setBankAccount] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    // Document URLs (stored in state after upload)
    const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
    const [churchDocUrl, setChurchDocUrl] = useState("");
    const [idCardUrl, setIdCardUrl] = useState("");
    const [educationCertUrl, setEducationCertUrl] = useState("");

    const loadProfile = async () => {
        if (!user) return;
        try {
            const snap = await getDoc(doc(db, "teachers", user.uid));
            if (snap.exists()) {
                const d = snap.data();
                setData(d);
                setFullName(d.fullName || "");
                setChristianName(d.christianName || "");
                setGender(d.gender || "male");
                setPhone(d.phone || "");
                setBankProvider(d.bankProvider || "CBE");
                setBankAccount(d.bankAccount || "");
                setLat(d.locationPin?.lat ?? "");
                setLng(d.locationPin?.lng ?? "");
                setProfilePhotoUrl(d.profilePhotoUrl || "");
                setChurchDocUrl(d.churchDocUrl || "");
                setIdCardUrl(d.idCardUrl || "");
                setEducationCertUrl(d.educationCertUrl || "");
            }
        } catch (e) {
            console.error("Failed to load teacher profile:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [user]);

    // ─── Generic file uploader ────────────────────────────────────────────────
    const uploadFile = async (file, storagePath, setUrl, setUploading) => {
        setUploading(true);
        setError("");
        try {
            const fileRef = ref(storage, storagePath);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setUrl(url);
            // Immediately persist to Firestore so admin can see it
            await updateDoc(doc(db, "teachers", user.uid), {
                [storagePath
                    .split("/")
                    .pop()
                    .replace(/\.[^.]+$/, "Url")
                    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())]: url,
            });
            return url;
        } catch (e) {
            console.error("Upload failed:", e);
            setError(
                lang === "am"
                    ? "ፋይሉ ሊሰቀል አልቻለም። ድጋሚ ሞክር።"
                    : "File upload failed. Please try again.",
            );
            return null;
        } finally {
            setUploading(false);
        }
    };

    // Per-slot handlers
    const handlePhotoUpload = (file) =>
        uploadFile(
            file,
            `teachers/${user.uid}/profile.jpg`,
            setProfilePhotoUrl,
            setUploadingPhoto,
        );

    const handleChurchUpload = (file) =>
        uploadFile(
            file,
            `teachers/${user.uid}/church-doc.pdf`,
            setChurchDocUrl,
            setUploadingChurch,
        );

    const handleIdCardUpload = (file) =>
        uploadFile(
            file,
            `teachers/${user.uid}/id-card.jpg`,
            setIdCardUrl,
            setUploadingId,
        );

    const handleEduCertUpload = (file) =>
        uploadFile(
            file,
            `teachers/${user.uid}/edu-cert.pdf`,
            setEducationCertUrl,
            setUploadingEdu,
        );

    // ─── Save profile fields ──────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const teacherRef = doc(db, "teachers", user.uid);
            await updateDoc(teacherRef, {
                christianName: christianName.trim(),
                gender,
                phone: phone.trim(),
                bankProvider,
                bankAccount: bankAccount.trim(),
                locationPin: {
                    lat: parseFloat(lat) || 0,
                    lng: parseFloat(lng) || 0,
                },
            });
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

    // ─── Profile completeness ─────────────────────────────────────────────────
    const completenessItems = [
        fullName,
        christianName,
        phone,
        bankAccount,
        lat,
        churchDocUrl,
        idCardUrl,
        educationCertUrl,
    ];
    const filledCount = completenessItems.filter(Boolean).length;
    const pct = Math.round((filledCount / completenessItems.length) * 100);

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
                        ? "መረጃዎን ያዘምኑ። ሰነዶቹ ሁሉ ሲሰቀሉ አድሚኑ ማረጋጡን ያፋጥናል።"
                        : "Update your profile and upload required documents. Complete all sections to get verified faster."}
                </p>

                {/* Profile Avatar & Completeness */}
                <div className="mt-5 flex items-center gap-5">
                    <div className="relative group">
                        {profilePhotoUrl ? (
                            <img
                                src={profilePhotoUrl}
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
                                        : pct >= 60
                                          ? "text-warning font-bold"
                                          : "text-error font-bold"
                                }
                            >
                                {pct}%
                            </span>
                        </div>
                        <div className="w-full bg-navy-mid rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? "bg-success" : pct >= 60 ? "bg-warning" : "bg-error"}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-text-muted">
                            {pct < 100
                                ? lang === "am"
                                    ? "ሁሉም ሜዳዎችና ሰነዶች ካልሞሉ አድሚን ሊያረጋግጥ አይችልም።"
                                    : "Admin cannot approve your account until all fields and documents are complete."
                                : lang === "am"
                                  ? "✅ ሁሉም ሙሉ ነው!"
                                  : "✅ Profile is complete!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Personal Information ──────────────────────────────────────────── */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex items-center gap-3 border-b border-navy-border pb-4">
                    <div className="w-10 h-10 rounded-full bg-gold-primary/20 border border-gold-primary/40 flex items-center justify-center text-xl">
                        📋
                    </div>
                    <h2 className="font-bold text-white text-base">
                        {lang === "am" ? "ግላዊ መረጃ" : "Personal Information"}
                    </h2>
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
                                required
                                value={christianName}
                                onChange={(e) =>
                                    setChristianName(e.target.value)
                                }
                                className={INPUT_CLS}
                                placeholder="e.g. Gebre Tsion"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={INPUT_CLS}
                                placeholder="+251 976977475"
                            />
                        </Field>
                    </div>

                    {/* Bank Details */}
                    <div className="border-t border-navy-border pt-5 space-y-5">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            🏦 {lang === "am" ? "የባንክ መረጃ" : "Bank Details"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field
                                label={
                                    lang === "am" ? "የባንክ ስም" : "Bank Provider"
                                }
                            >
                                <select
                                    value={bankProvider}
                                    onChange={(e) =>
                                        setBankProvider(e.target.value)
                                    }
                                    className={SELECT_CLS}
                                >
                                    <option value="CBE">
                                        Commercial Bank of Ethiopia (CBE)
                                    </option>
                                    <option value="BOA">
                                        Bank of Abyssinia (BOA)
                                    </option>
                                    <option value="Telebirr">
                                        Telebirr Wallet
                                    </option>
                                </select>
                            </Field>
                            <Field
                                label={
                                    lang === "am"
                                        ? "የባንክ መለያ ቁጥር"
                                        : "Account Number"
                                }
                                hint={
                                    lang === "am"
                                        ? "ቁጥሩ ትክክል ካልሆነ ክፍያ ላይደርስዎ ይችላል"
                                        : "Incorrect number means payouts may fail"
                                }
                            >
                                <input
                                    type="text"
                                    required
                                    value={bankAccount}
                                    onChange={(e) =>
                                        setBankAccount(e.target.value)
                                    }
                                    className={`${INPUT_CLS} font-mono`}
                                    placeholder="e.g. 1000123456789"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-t border-navy-border pt-5 space-y-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            📍 {lang === "am" ? "አካባቢ" : "Location Coordinates"}
                        </p>
                        <p className="text-xs text-text-muted">
                            {lang === "am"
                                ? "ትክክለኛ አካባቢ ፈጣን ምደባ ያስቻላል። Google Maps ላይ ቦታዎን ይፈልጉ።"
                                : "Accurate location enables faster student matching. Find your coordinates on Google Maps."}
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
                            id="teacher-account-save-btn"
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

            {/* ── Documents Section ─────────────────────────────────────────────── */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-2">
                <div className="flex items-center gap-3 border-b border-navy-border pb-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gold-primary/20 border border-gold-primary/40 flex items-center justify-center text-xl">
                        📂
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-base">
                            {lang === "am"
                                ? "አስፈላጊ ሰነዶች"
                                : "Required Documents"}
                        </h2>
                        <p className="text-xs text-text-muted">
                            {lang === "am"
                                ? "ሁሉም ሰነዶች ካልተሰቀሉ አድሚን ሊያረጋግጥ አይችልም።"
                                : "All documents must be uploaded before admin approval."}
                        </p>
                    </div>
                </div>

                <DocUploadRow
                    icon="🖼️"
                    label={lang === "am" ? "የፕሮፋይል ፎቶ" : "Profile Photo"}
                    hint={
                        lang === "am"
                            ? "ግልጽ የሆነ ፎቶ — JPG ወይም PNG"
                            : "Clear headshot — JPG or PNG, max 5MB"
                    }
                    currentUrl={profilePhotoUrl}
                    accept="image/jpeg,image/png"
                    uploading={uploadingPhoto}
                    onUpload={handlePhotoUpload}
                />
                <DocUploadRow
                    icon="⛪"
                    label={
                        lang === "am"
                            ? "የቤተ ክርስቲያን ምክረ ሃሳብ ደብዳቤ"
                            : "Church Endorsement Letter"
                    }
                    hint={
                        lang === "am"
                            ? "ከቤ/ክ ሊቀጳጳስ ወይም ቄስ — PDF"
                            : "Signed letter from church priest or bishop — PDF"
                    }
                    currentUrl={churchDocUrl}
                    accept="application/pdf"
                    uploading={uploadingChurch}
                    onUpload={handleChurchUpload}
                />
                <DocUploadRow
                    icon="🪪"
                    label={
                        lang === "am"
                            ? "የመንግስት መታወቂያ (ፓስፖርት / ቀበሌ)"
                            : "Government-Issued ID Card"
                    }
                    hint={
                        lang === "am"
                            ? "ብሄራዊ መታወቂያ ወይም ፓስፖርት — JPG ወይም PDF"
                            : "National ID, passport, or kebele ID — JPG or PDF"
                    }
                    currentUrl={idCardUrl}
                    accept="image/jpeg,image/png,application/pdf"
                    uploading={uploadingId}
                    onUpload={handleIdCardUpload}
                />
                <DocUploadRow
                    icon="🎓"
                    label={
                        lang === "am"
                            ? "የትምህርት ሰርተፊኬት / ዲፕሎማ"
                            : "Education Certificate / Diploma"
                    }
                    hint={
                        lang === "am"
                            ? "ዲፕሎማ ወይም ሰርተፊኬት — PDF ወይም JPG"
                            : "Diploma, degree, or relevant certificate — PDF or JPG"
                    }
                    currentUrl={educationCertUrl}
                    accept="application/pdf,image/jpeg,image/png"
                    uploading={uploadingEdu}
                    onUpload={handleEduCertUpload}
                />
            </div>

            {/* ── Read-only info ────────────────────────────────────────────────── */}
            <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                <h2 className="font-bold text-white text-base border-b border-navy-border pb-3">
                    🔒{" "}
                    {lang === "am"
                        ? "ሊቀየሩ የማይችሉ መረጃዎች"
                        : "Read-only Account Details"}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Service ID", value: data?.serviceId },
                        {
                            label: lang === "am" ? "ሚና" : "Role",
                            value: "Teacher / Tutor",
                        },
                        {
                            label: lang === "am" ? "አገልግሎት" : "Service Line",
                            value: data?.serviceLine,
                        },
                        {
                            label: lang === "am" ? "ደረጃ" : "Rating",
                            value: `${data?.rating ?? 5.0} ⭐`,
                        },
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
                        ? "ሚናን ወይም አገልግሎት ለመቀየር admin@arke.et ያነጋግሩ።"
                        : "To change your role or service line, contact admin@arke.et."}
                </p>
            </div>
        </div>
    );
}
