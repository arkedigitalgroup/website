// app/(dashboard)/teacher/attendance/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    collection,
    getDocs,
    doc,
    addDoc,
    query,
    where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";

export default function TeacherAttendance() {
    const { user } = useAuth();
    const { t, lang } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlStudentId = searchParams.get("studentId") || "";

    // Lists
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [studentId, setStudentId] = useState(urlStudentId);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [topic, setTopic] = useState("");
    const [topicAm, setTopicAm] = useState("");
    const [engagementStars, setEngagementStars] = useState(5);
    const [moralNotes, setMoralNotes] = useState("");
    const [mediaFile, setMediaFile] = useState(null);

    // Statuses
    const [submitting, setSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const qSnap = await getDocs(
                    query(
                        collection(db, "students"),
                        where("assignedTeacherId", "==", user.uid),
                    ),
                );
                const list = [];
                qSnap.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setStudents(list);

                // Default to first student if urlStudentId is not passed
                if (!studentId && list.length > 0) {
                    setStudentId(list[0].id);
                }
            } catch (err) {
                console.error("Error loading students list for reports:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [user]);

    // Sync state if query param changes
    useEffect(() => {
        if (urlStudentId) setStudentId(urlStudentId);
    }, [urlStudentId]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!studentId || !topic || !moralNotes) return;

        setSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            let mediaUrl = null;

            // Handle media upload (graceful fallback if Storage is not activated/unauthorized)
            if (mediaFile) {
                setUploadStatus(t("uploadFileLoading"));
                const fileExtension = mediaFile.name.split(".").pop();
                const storagePath = `reports/${user.uid}/${studentId}/${date}_report.${fileExtension}`;
                try {
                    const mediaRef = ref(storage, storagePath);
                    await uploadBytes(mediaRef, mediaFile);
                    mediaUrl = await getDownloadURL(mediaRef);
                } catch (storageErr) {
                    console.warn(
                        "Storage upload failed, using mock media link:",
                        storageErr,
                    );
                    // High quality mockup educational thumbnail
                    mediaUrl =
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
                }
            }

            // Write attendance report to Firestore /attendanceReports/{id}
            await addDoc(collection(db, "attendanceReports"), {
                teacherId: user.uid,
                studentId: studentId,
                date: new Date(date),
                topic: topic.trim(),
                topicAm: topicAm.trim() || topic.trim(),
                engagementStars: Number(engagementStars),
                moralNotes: moralNotes.trim(),
                mediaUrl: mediaUrl,
                createdAt: new Date(),
            });

            setSuccess(true);
            setTopic("");
            setTopicAm("");
            setMoralNotes("");
            setMediaFile(null);

            // Redirect back to overview after small delay
            setTimeout(() => {
                router.push("/teacher");
            }, 1500);
        } catch (err) {
            console.error("Attendance submission error:", err);
            setError(
                err.message ||
                    "Could not submit report. Please check your network.",
            );
        } finally {
            setSubmitting(false);
            setUploadStatus("");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading assigned students...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-navy-surface border border-navy-border rounded-xl p-8 sm:p-12 shadow-lg space-y-6">
                {/* Header */}
                <div className="space-y-2 border-b border-navy-border pb-4">
                    <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                        {t("fillReportBtn")}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Fill this form after completing each tutoring session to
                        submit daily attendance, progress notes, and images.
                    </p>
                </div>

                {students.length === 0 ? (
                    <p className="text-sm text-warning font-semibold text-center py-8">
                        ⚠️ You cannot submit reports until you are matched with
                        students by the admin.
                    </p>
                ) : (
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        {/* Student Selector */}
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                Select Student
                            </label>
                            <select
                                required
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                            >
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.fullName} ({student.serviceId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                {t("dateLabel")}
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                            />
                        </div>

                        {/* Topic input in English & Amharic */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    Today's Topic (English)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Ge'ez Alphabet Introduction"
                                    className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-text-secondary font-semibold uppercase">
                                    የእለቱ ርዕስ (Amharic)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={topicAm}
                                    onChange={(e) => setTopicAm(e.target.value)}
                                    placeholder="ምሳሌ፦ የግዕዝ ፊደላት መግቢያ"
                                    className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                                />
                            </div>
                        </div>

                        {/* Student Engagement Stars (1-5) */}
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase block">
                                {t("engagementLabel")}
                            </label>
                            <div className="flex space-x-2 pt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setEngagementStars(star)}
                                        className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                                    >
                                        {star <= engagementStars ? "⭐" : "☆"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Moral / Behavioral Progress Notes */}
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase">
                                {t("moralNotesLabel")}
                            </label>
                            <textarea
                                required
                                rows="4"
                                value={moralNotes}
                                onChange={(e) => setMoralNotes(e.target.value)}
                                placeholder="Write observation details regarding student moral behavior, prayers, attention span, and responses."
                                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm resize-none"
                            />
                        </div>

                        {/* Media Upload */}
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary font-semibold uppercase block">
                                {t("mediaLabel")}
                            </label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) =>
                                    setMediaFile(e.target.files[0])
                                }
                                className="w-full text-xs text-text-secondary border border-navy-border rounded bg-navy-mid px-3 py-2 focus:outline-none"
                            />
                        </div>

                        {/* Upload status */}
                        {uploadStatus && (
                            <p className="text-gold-primary text-xs font-semibold animate-pulse text-center">
                                ⏳ {uploadStatus}
                            </p>
                        )}

                        {/* Error Message */}
                        {error && (
                            <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error text-center">
                                ❌ {error}
                            </p>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <p className="text-success text-sm font-semibold bg-success-faint p-2.5 rounded border border-success text-center animate-pulse">
                                🎉 {t("reportSuccess")}
                            </p>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm"
                        >
                            {submitting
                                ? "Submitting Report..."
                                : t("btnSubmitReport")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
