// app/(dashboard)/admin/students/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useLanguage } from "../../../../src/context/LanguageContext";

export default function AdminStudents() {
    const { t, lang } = useLanguage();
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState("active"); // 'all', 'active', 'pending', 'suspended'
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // Detail modal
    const [selectedStudent, setSelectedStudent] = useState(null);
    // Suspend modal
    const [suspendingId, setSuspendingId] = useState(null);
    const [suspendReason, setSuspendReason] = useState("");

    const fetchStudents = async () => {
        try {
            setLoading(true);

            // Fetch all student user docs (role == "student")
            const usersSnap = await getDocs(
                query(collection(db, "users"), where("role", "==", "student"))
            );
            const userMap = {};
            usersSnap.forEach((d) => {
                userMap[d.id] = { id: d.id, ...d.data() };
            });

            // Fetch all student profile docs
            const studentsSnap = await getDocs(collection(db, "students"));
            const list = [];
            studentsSnap.forEach((d) => {
                const userRecord = userMap[d.id] || {};
                list.push({
                    id: d.id,
                    ...userRecord,
                    ...d.data(),
                    // ensure status comes from users collection
                    status: userRecord.status ?? "pending",
                });
            });

            // Also include user records that may not yet have a /students doc
            usersSnap.forEach((d) => {
                const exists = list.find((s) => s.id === d.id);
                if (!exists) {
                    list.push({ id: d.id, ...d.data(), status: d.data().status ?? "pending" });
                }
            });

            setStudents(list);
        } catch (err) {
            console.error("Error loading students:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleActivate = async (studentId) => {
        setUpdatingId(studentId);
        try {
            await updateDoc(doc(db, "users", studentId), { status: "active" });
            fetchStudents();
        } catch (err) {
            console.error("Activate error:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSuspend = async () => {
        if (!suspendingId) return;
        setUpdatingId(suspendingId);
        try {
            await updateDoc(doc(db, "users", suspendingId), {
                status: "suspended",
                suspendReason: suspendReason.trim(),
            });
            setSuspendingId(null);
            setSuspendReason("");
            fetchStudents();
        } catch (err) {
            console.error("Suspend error:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    // Stats
    const total = students.length;
    const activeCount = students.filter((s) => s.status === "active").length;
    const pendingCount = students.filter((s) => s.status === "pending").length;
    const suspendedCount = students.filter((s) => s.status === "suspended").length;
    const assignedCount = students.filter((s) => s.assignedTeacherId).length;

    // Filter + search
    const filtered = students.filter((s) => {
        const matchesFilter =
            filter === "all" ||
            s.status === filter;
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            (s.fullName || "").toLowerCase().includes(q) ||
            (s.christianName || "").toLowerCase().includes(q) ||
            (s.phone || "").includes(q) ||
            (s.serviceId || "").toLowerCase().includes(q) ||
            (s.courseId || "").toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const statusBadge = (status) => {
        if (status === "active")
            return (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-success-faint text-success uppercase">
                    Active
                </span>
            );
        if (status === "suspended")
            return (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-error-faint text-error uppercase">
                    Suspended
                </span>
            );
        return (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-warning-faint text-warning uppercase">
                Pending
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading students data...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                        {lang === "am" ? "ተማሪዎች አስተዳደር" : "Students Management"}
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        {lang === "am"
                            ? "በስርዓቱ ውስጥ ያሉ ሁሉም ተማሪዎችን ይቆጣጠሩ።"
                            : "Monitor and manage all registered students on the platform."}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-navy-mid border border-navy-border p-1 rounded-lg self-start text-xs font-semibold">
                    {[
                        { key: "all", label: "All" },
                        { key: "active", label: "Active" },
                        { key: "pending", label: "Pending" },
                        { key: "suspended", label: "Suspended" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded uppercase transition-colors ${
                                filter === key
                                    ? "bg-gold-primary text-navy-deep"
                                    : "text-text-secondary hover:text-white"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: total, color: "text-white" },
                    { label: "Active", value: activeCount, color: "text-success" },
                    { label: "Pending", value: pendingCount, color: "text-warning" },
                    { label: "Assigned Teachers", value: assignedCount, color: "text-gold-primary" },
                ].map(({ label, value, color }) => (
                    <div
                        key={label}
                        className="bg-navy-surface border border-navy-border rounded-xl p-4 space-y-1"
                    >
                        <p className="text-xs text-text-secondary uppercase tracking-wide">
                            {label}
                        </p>
                        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* ── Search Bar ── */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    🔍
                </span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, phone, course ID or student ID…"
                    className="w-full pl-9 pr-4 py-2.5 bg-navy-surface border border-navy-border rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-gold-primary transition-colors"
                />
            </div>

            {/* ── Table ── */}
            <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-sm">
                        {search
                            ? "No students match your search."
                            : "No students found for this status filter."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                                    <th className="p-4 sm:p-5">Name &amp; ID</th>
                                    <th className="p-4 sm:p-5">Age / Gender</th>
                                    <th className="p-4 sm:p-5">Phone</th>
                                    <th className="p-4 sm:p-5">Course</th>
                                    <th className="p-4 sm:p-5">Assigned Teacher</th>
                                    <th className="p-4 sm:p-5">Reg. Fee</th>
                                    <th className="p-4 sm:p-5">Status</th>
                                    <th className="p-4 sm:p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy-border text-sm">
                                {filtered.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-navy-hover transition-colors"
                                    >
                                        {/* Name & ID */}
                                        <td className="p-4 sm:p-5 space-y-1">
                                            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                                                {student.fullName || "—"}
                                                {student.christianName && (
                                                    <span className="text-xs text-gold-primary font-normal">
                                                        ({student.christianName})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-text-muted">
                                                ID: {student.serviceId || student.id.slice(0, 8)}
                                            </div>
                                            <div className="text-[10px] text-text-muted capitalize">
                                                {student.serviceLine || "—"}
                                            </div>
                                        </td>

                                        {/* Age / Gender */}
                                        <td className="p-4 sm:p-5">
                                            <div className="text-white font-semibold">
                                                {student.age ?? "—"}
                                            </div>
                                            <div className="text-xs text-text-secondary capitalize">
                                                {student.gender || "—"}
                                            </div>
                                        </td>

                                        {/* Phone */}
                                        <td className="p-4 sm:p-5">
                                            <div className="text-white font-medium">
                                                {student.phone || "—"}
                                            </div>
                                            {student.email && (
                                                <div className="text-[10px] text-text-muted truncate max-w-[140px]">
                                                    {student.email}
                                                </div>
                                            )}
                                        </td>

                                        {/* Course */}
                                        <td className="p-4 sm:p-5">
                                            <span className="text-sm text-white font-mono">
                                                {student.courseId || (
                                                    <span className="text-text-muted">—</span>
                                                )}
                                            </span>
                                        </td>

                                        {/* Assigned Teacher */}
                                        <td className="p-4 sm:p-5">
                                            {student.assignedTeacherId ? (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-success-faint text-success">
                                                    ✓ Assigned
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-navy-mid text-text-muted">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>

                                        {/* Registration Fee */}
                                        <td className="p-4 sm:p-5">
                                            {student.registrationFeePaid ? (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-success-faint text-success uppercase">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-error-faint text-error uppercase">
                                                    Unpaid
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4 sm:p-5">
                                            {statusBadge(student.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 sm:p-5 text-right">
                                            {updatingId === student.id ? (
                                                <span className="text-xs text-text-muted animate-pulse">
                                                    Syncing...
                                                </span>
                                            ) : (
                                                <div className="flex justify-end items-center gap-2 flex-wrap">
                                                    {/* View Details */}
                                                    <button
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="px-2.5 py-1 rounded bg-navy-mid border border-navy-border text-xs text-gold-primary hover:border-gold-primary transition-colors font-semibold"
                                                    >
                                                        Details
                                                    </button>

                                                    {/* Activate (if pending or suspended) */}
                                                    {student.status !== "active" && (
                                                        <button
                                                            onClick={() => handleActivate(student.id)}
                                                            className="px-2.5 py-1 rounded bg-success text-navy-deep text-xs font-bold hover:opacity-80 transition-all"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}

                                                    {/* Suspend (if active) */}
                                                    {student.status === "active" && (
                                                        <button
                                                            onClick={() => {
                                                                setSuspendingId(student.id);
                                                                setSuspendReason("");
                                                            }}
                                                            className="px-2.5 py-1 rounded border border-error text-error text-xs font-semibold hover:bg-error-faint transition-all"
                                                        >
                                                            Suspend
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

            {/* Result count */}
            <p className="text-xs text-text-muted text-right">
                Showing {filtered.length} of {total} student{total !== 1 ? "s" : ""}
            </p>

            {/* ── Details Modal ── */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white font-ethiopic">
                                    {selectedStudent.fullName || "Student Detail"}
                                </h3>
                                {selectedStudent.christianName && (
                                    <p className="text-sm text-gold-primary">
                                        {selectedStudent.christianName}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-text-secondary hover:text-white text-xl font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                { label: "Student ID", value: selectedStudent.serviceId || selectedStudent.id.slice(0, 8) },
                                { label: "Status", value: selectedStudent.status },
                                { label: "Age", value: selectedStudent.age ?? "—" },
                                { label: "Gender", value: selectedStudent.gender || "—" },
                                { label: "Phone", value: selectedStudent.phone || "—" },
                                { label: "Email", value: selectedStudent.email || "—" },
                                { label: "Service Line", value: selectedStudent.serviceLine || "—" },
                                { label: "Course ID", value: selectedStudent.courseId || "—" },
                                {
                                    label: "Assigned Teacher",
                                    value: selectedStudent.assignedTeacherId || "None",
                                },
                                {
                                    label: "Reg. Fee Paid",
                                    value: selectedStudent.registrationFeePaid ? "Yes ✓" : "No ✗",
                                },
                                {
                                    label: "Location",
                                    value:
                                        selectedStudent.locationPin?.lat
                                            ? `${selectedStudent.locationPin.lat.toFixed(4)}, ${selectedStudent.locationPin.lng.toFixed(4)}`
                                            : "—",
                                },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="bg-navy-mid rounded-lg p-3 border border-navy-border"
                                >
                                    <p className="text-[10px] text-text-muted uppercase font-bold mb-1">
                                        {label}
                                    </p>
                                    <p className="text-white text-xs break-all">{String(value)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-4 py-2 rounded border border-navy-border text-text-secondary hover:bg-navy-mid text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Suspend Modal ── */}
            {suspendingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-navy-surface border border-navy-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-white">
                            Suspend Student Account
                        </h3>
                        <p className="text-sm text-text-secondary">
                            Provide a reason for suspending this student&apos;s account. They
                            will lose access to the platform until reactivated.
                        </p>
                        <textarea
                            rows="3"
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="e.g. Payment overdue for 3 months, account under review."
                            className="w-full px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm resize-none"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setSuspendingId(null)}
                                className="px-4 py-2 rounded border border-navy-border text-text-secondary hover:bg-navy-mid text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspend}
                                className="px-4 py-2 rounded bg-error text-white text-xs font-bold hover:opacity-80 transition-all"
                            >
                                Confirm Suspension
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
