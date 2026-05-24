// app/(dashboard)/admin/teachers/page.js
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useLanguage } from "../../../../src/context/LanguageContext";

export default function AdminTeachers() {
    const { t, lang } = useLanguage();
    const [teachers, setTeachers] = useState([]);
    const [filter, setFilter] = useState("all"); // 'all', 'pending', 'verified', 'rejected'
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // Modal states for church recommendation letter view
    const [selectedDocUrl, setSelectedDocUrl] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectingId, setRejectingId] = useState(null);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const snap = await getDocs(collection(db, "teachers"));
            const list = [];
            snap.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setTeachers(list);
        } catch (err) {
            console.error("Error loading teachers list:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleApprove = async (teacherId) => {
        setUpdatingId(teacherId);
        try {
            // 1. Update /teachers/{uid} verified = true
            const teacherRef = doc(db, "teachers", teacherId);
            await updateDoc(teacherRef, { verified: true });

            // 2. Update /users/{uid} status = "active"
            const userRef = doc(db, "users", teacherId);
            await updateDoc(userRef, { status: "active" });

            // Reload list
            fetchTeachers();
        } catch (err) {
            console.error("Verification approval error:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenRejectModal = (teacherId) => {
        setRejectingId(teacherId);
        setRejectionReason("");
    };

    const handleReject = async () => {
        if (!rejectingId) return;
        setUpdatingId(rejectingId);
        try {
            // 1. Update /teachers/{uid} verified = false
            const teacherRef = doc(db, "teachers", rejectingId);
            await updateDoc(teacherRef, {
                verified: false,
                rejectionReason: rejectionReason.trim(),
            });

            // 2. Update /users/{uid} status = "suspended" or "rejected"
            const userRef = doc(db, "users", rejectingId);
            await updateDoc(userRef, { status: "suspended" });

            setRejectingId(null);
            setRejectionReason("");
            fetchTeachers();
        } catch (err) {
            console.error("Verification rejection error:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    // Filtered teachers list
    const filteredTeachers = teachers.filter((teacher) => {
        if (filter === "pending")
            return !teacher.verified && teacher.bankAccount; // has filled form but not verified
        if (filter === "verified") return teacher.verified;
        if (filter === "rejected")
            return !teacher.verified && teacher.rejectionReason;
        return true;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading teachers data...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                        {t("navAbout") === "About Us"
                            ? "Teachers Verification"
                            : "የአስተማሪዎች ማረጋገጫ"}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Verify submitted church recommendation letters and
                        approve tutors to teach.
                    </p>
                </div>

                {/* Tab Filters */}
                <div className="flex bg-navy-mid border border-navy-border p-1 rounded-lg self-start text-xs font-semibold">
                    {["all", "pending", "verified", "rejected"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-3 py-1.5 rounded uppercase ${
                                filter === item
                                    ? "bg-gold-primary text-navy-deep"
                                    : "text-text-secondary hover:text-white"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Teachers List Table */}
            <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden">
                {filteredTeachers.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-sm">
                        No teachers found matching this status filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4 sm:p-5">
                                        Name &amp; ID
                                    </th>
                                    <th className="p-4 sm:p-5">
                                        Brand / Gender
                                    </th>
                                    <th className="p-4 sm:p-5">
                                        Phone &amp; Bank
                                    </th>
                                    <th className="p-4 sm:p-5">
                                        Church Letter
                                    </th>
                                    <th className="p-4 sm:p-5">Location Pin</th>
                                    <th className="p-4 sm:p-5">Status</th>
                                    <th className="p-4 sm:p-5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-border text-sm">
                                {filteredTeachers.map((teacher) => (
                                    <tr
                                        key={teacher.id}
                                        className="hover:bg-navy-hover transition-colors"
                                    >
                                        <td className="p-4 sm:p-5 space-y-1">
                                            <div className="font-bold text-white flex items-center space-x-2">
                                                {teacher.fullName}
                                                {teacher.christianName && (
                                                    <span className="text-xs text-gold-primary font-normal">
                                                        ({teacher.christianName}
                                                        )
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-text-muted">
                                                ID: {teacher.serviceId}
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5">
                                            <div className="text-white capitalize font-semibold">
                                                {teacher.serviceLine}
                                            </div>
                                            <div className="text-xs text-text-secondary capitalize">
                                                {teacher.gender}
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5 space-y-1">
                                            <div className="text-white font-medium">
                                                {teacher.phone}
                                            </div>
                                            <div className="text-[10px] text-text-secondary">
                                                {teacher.bankProvider}:{" "}
                                                {teacher.bankAccount}
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5">
                                            {teacher.churchDocUrl ? (
                                                <button
                                                    onClick={() =>
                                                        setSelectedDocUrl(
                                                            teacher.churchDocUrl,
                                                        )
                                                    }
                                                    className="px-2.5 py-1 rounded bg-navy-mid border border-navy-border text-xs text-gold-primary hover:border-gold-primary transition-colors font-semibold"
                                                >
                                                    📄 View Letter
                                                </button>
                                            ) : (
                                                <span className="text-text-muted text-xs">
                                                    No Letter
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 sm:p-5">
                                            <span className="text-xs text-text-secondary font-mono">
                                                {teacher.locationPin?.lat?.toFixed(
                                                    4,
                                                )}
                                                ,{" "}
                                                {teacher.locationPin?.lng?.toFixed(
                                                    4,
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-4 sm:p-5">
                                            {teacher.verified ? (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-success-faint text-success uppercase">
                                                    Verified
                                                </span>
                                            ) : teacher.rejectionReason ? (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-error-faint text-error uppercase">
                                                    Rejected
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-warning-faint text-warning uppercase">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 sm:p-5 text-right">
                                            {updatingId === teacher.id ? (
                                                <span className="text-xs text-text-muted animate-pulse">
                                                    Syncing...
                                                </span>
                                            ) : (
                                                <div className="flex justify-end space-x-2">
                                                    {!teacher.verified && (
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    teacher.id,
                                                                )
                                                            }
                                                            className="px-2.5 py-1 rounded bg-success text-navy-deep text-xs font-bold hover:bg-success-faint hover:text-success transition-all duration-200"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {(!teacher.rejectionReason ||
                                                        teacher.verified) && (
                                                        <button
                                                            onClick={() =>
                                                                handleOpenRejectModal(
                                                                    teacher.id,
                                                                )
                                                            }
                                                            className="px-2.5 py-1 rounded border border-error text-error text-xs font-semibold hover:bg-error-faint transition-all duration-200"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PDF View Modal */}
            {selectedDocUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
                        <div className="p-4 border-b border-navy-border flex justify-between items-center bg-navy-mid">
                            <h3 className="font-bold text-white font-ethiopic">
                                Church Recommendation Document
                            </h3>
                            <button
                                onClick={() => setSelectedDocUrl(null)}
                                className="text-text-secondary hover:text-white text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-grow p-2">
                            <iframe
                                src={selectedDocUrl}
                                className="w-full h-full rounded border-0"
                                title="Church recommendation doc preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason input Modal */}
            {rejectingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white">
                            Specify Rejection Reason
                        </h3>
                        <textarea
                            rows="4"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Church document signature is missing or illegible."
                            className="w-full px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm resize-none"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setRejectingId(null)}
                                className="px-4 py-2 rounded border border-navy-border text-text-secondary hover:bg-navy-mid text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 rounded bg-error text-white text-xs font-bold hover:bg-error-faint hover:text-error transition-all"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
