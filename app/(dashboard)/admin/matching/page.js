// app/(dashboard)/admin/matching/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useLanguage } from "../../../../src/context/LanguageContext";
import MatchingMap from "../../../../src/components/dashboard/MatchingMap";

export default function AdminMatching() {
    const { t, lang } = useLanguage();
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Statuses
    const [loading, setLoading] = useState(true);
    const [matching, setMatching] = useState(false);
    const [matchSuccess, setMatchSuccess] = useState("");

    // Haversine Distance Formula in Kilometers
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
        const R = 6371; // Earth radius
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const loadMatchingData = async () => {
        try {
            setLoading(true);
            // Fetch students
            const studentsSnap = await getDocs(collection(db, "students"));
            const sList = [];
            studentsSnap.forEach((doc) => {
                sList.push({ id: doc.id, ...doc.data() });
            });
            setStudents(sList);

            // Fetch verified teachers
            const teachersSnap = await getDocs(collection(db, "teachers"));
            const tList = [];
            teachersSnap.forEach((doc) => {
                const data = doc.data();
                if (data.verified) {
                    tList.push({ id: doc.id, ...data });
                }
            });
            setTeachers(tList);
        } catch (err) {
            console.error("Error loading matching data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMatchingData();
    }, []);

    const handleMatchConfirm = async () => {
        if (!selectedStudent || !selectedTeacher) return;
        setMatching(true);
        setMatchSuccess("");

        try {
            // 1. Update student document with assignedTeacherId
            const studentRef = doc(db, "students", selectedStudent.id);
            await updateDoc(studentRef, {
                assignedTeacherId: selectedTeacher.id,
            });

            // 2. Update teacher document adding studentId to assignedStudentIds
            const teacherRef = doc(db, "teachers", selectedTeacher.id);
            await updateDoc(teacherRef, {
                assignedStudentIds: arrayUnion(selectedStudent.id),
            });

            // Create a mock active payment record for this month so student dashboard lock displays properly
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const paymentRef = doc(
                db,
                "payments",
                `${selectedStudent.id}-${currentMonth}`,
            );
            await setDoc(paymentRef, {
                id: `${selectedStudent.id}-${currentMonth}`,
                studentId: selectedStudent.id,
                teacherId: selectedTeacher.id,
                month: currentMonth,
                coursePrice:
                    selectedStudent.courseId === "all-courses"
                        ? 7100
                        : selectedStudent.courseId === "diquna-zegajat"
                          ? 4700
                          : 4200,
                serviceFee: 100,
                totalAmount:
                    selectedStudent.courseId === "all-courses"
                        ? 7200
                        : selectedStudent.courseId === "diquna-zegajat"
                          ? 4800
                          : 4300,
                status: "pending",
                paidAt: null,
                companyRevenue:
                    selectedStudent.courseId === "all-courses"
                        ? 1165
                        : selectedStudent.courseId === "diquna-zegajat"
                          ? 805
                          : 730,
                teacherPayout:
                    selectedStudent.courseId === "all-courses"
                        ? 6035
                        : selectedStudent.courseId === "diquna-zegajat"
                          ? 3995
                          : 3570,
            });

            setMatchSuccess(
                lang === "am"
                    ? "መምህሩ በተሳካ ሁኔታ ተመድቧል!"
                    : "Tutor assigned successfully!",
            );
            setSelectedStudent(null);
            setSelectedTeacher(null);
            loadMatchingData(); // Refresh records
        } catch (err) {
            console.error("Matching assignment error:", err);
        } finally {
            setMatching(false);
        }
    };

    // Filter out unmatched students
    const unmatchedStudents = students.filter((s) => !s.assignedTeacherId);
    const matchedStudents = students.filter((s) => s.assignedTeacherId);

    // Compute nearby teachers sorted by distance from selected student
    // const nearbyTeachers = selectedStudent
    //     ? teachers
    //           .map((t) => {
    //               const dist = calculateDistance(
    //                   selectedStudent.locationPin?.lat,
    //                   selectedStudent.locationPin?.lng,
    //                   t.locationPin?.lat,
    //                   t.locationPin?.lng,
    //               );
    //               return { ...t, distance: dist };
    //           })
    //           .sort((a, b) => a.distance - b.distance)
    //     : [];
    const nearbyTeachers = selectedStudent
        ? teachers
              .filter(
                  (t) =>
                      Array.isArray(t.qualifiedCourses) &&
                      t.qualifiedCourses.includes(selectedStudent.courseId),
              )
              .map((t) => {
                  const dist = calculateDistance(
                      selectedStudent.locationPin?.lat,
                      selectedStudent.locationPin?.lng,
                      t.locationPin?.lat,
                      t.locationPin?.lng,
                  );
                  return { ...t, distance: dist };
              })
              .sort((a, b) => {
                  // Primary sort: distance. Secondary sort: rating (higher is better)
                  if (Math.abs(a.distance - b.distance) < 0.5) {
                      return (b.rating ?? 0) - (a.rating ?? 0);
                  }
                  return a.distance - b.distance;
              })
        : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading matching records...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div>
                <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                    {lang === "am"
                        ? "የተማሪ-መምህር ምደባ ማዕከል"
                        : "Student-Teacher Matching Center"}
                </h1>
                <p className="text-sm text-text-secondary">
                    Click a student on the list or pin to calculate nearby
                    verified tutors and link them.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Map on Left */}
                <div className="lg:col-span-7 bg-navy-surface border border-navy-border rounded-xl p-4 shadow-lg flex flex-col justify-between">
                    <h2 className="text-sm font-semibold text-text-secondary uppercase mb-3 flex items-center space-x-2">
                        <span>🗺️ Coordinates Map</span>
                        <span className="text-[10px] text-text-muted">
                            (Red: Selected Student, Blue: Unmatched, Gold:
                            Tutor)
                        </span>
                    </h2>
                    <div className="flex-grow">
                        <MatchingMap
                            students={students}
                            teachers={teachers}
                            selectedStudent={selectedStudent}
                            onSelectStudent={setSelectedStudent}
                            onSelectTeacher={setSelectedTeacher}
                        />
                    </div>
                </div>

                {/* Control lists on Right */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Active selection info Card */}
                    {selectedStudent && (
                        <div className="bg-navy-surface border border-gold-primary/30 rounded-xl p-6 shadow-md space-y-4 animate-fadeIn">
                            <div className="border-b border-navy-border pb-3 flex justify-between items-center">
                                <h3 className="font-bold text-white text-base">
                                    Match Request Details
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedStudent(null);
                                        setSelectedTeacher(null);
                                    }}
                                    className="text-text-muted hover:text-white text-xs font-semibold"
                                >
                                    Clear Selection
                                </button>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-text-secondary font-semibold">
                                        Student Name:
                                    </span>{" "}
                                    <span className="font-bold text-white">
                                        {selectedStudent.fullName}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-text-secondary font-semibold">
                                        Selected Course:
                                    </span>{" "}
                                    <span className="text-gold-primary capitalize font-semibold">
                                        {selectedStudent.courseId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-text-secondary font-semibold">
                                        Location Pin:
                                    </span>{" "}
                                    <span className="text-xs font-mono text-text-muted">
                                        {selectedStudent.locationPin?.lat?.toFixed(
                                            4,
                                        )}
                                        ,{" "}
                                        {selectedStudent.locationPin?.lng?.toFixed(
                                            4,
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Selected Teacher for match */}
                            {selectedTeacher ? (
                                <div className="bg-navy-mid border border-success/30 p-3 rounded-lg flex justify-between items-center">
                                    <div className="text-xs">
                                        <span className="text-success font-bold block uppercase tracking-wider text-[10px]">
                                            Tutor Selected
                                        </span>
                                        <span className="font-bold text-white text-sm">
                                            {selectedTeacher.fullName}
                                        </span>
                                        <span className="text-text-secondary block">
                                            Distance:{" "}
                                            <span className="text-gold-primary font-bold">
                                                {calculateDistance(
                                                    selectedStudent.locationPin
                                                        ?.lat,
                                                    selectedStudent.locationPin
                                                        ?.lng,
                                                    selectedTeacher.locationPin
                                                        ?.lat,
                                                    selectedTeacher.locationPin
                                                        ?.lng,
                                                ).toFixed(2)}{" "}
                                                km
                                            </span>
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleMatchConfirm}
                                        disabled={matching}
                                        className="px-4 py-2 bg-success text-navy-deep font-bold rounded text-xs hover:bg-success-faint hover:text-success transition-all disabled:opacity-50"
                                    >
                                        {matching
                                            ? "Assigning..."
                                            : t("btnSaveMatch")}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-warning font-semibold bg-warning-faint p-3 rounded border border-warning/20">
                                    👉 Click on one of the available tutors
                                    listed below to complete assignment.
                                </p>
                            )}

                            {matchSuccess && (
                                <p className="text-success text-xs font-semibold text-center animate-pulse">
                                    🎉 {matchSuccess}
                                </p>
                            )}
                        </div>
                    )}

                    {/* List Section: Unmatched Students or Nearby Teachers */}
                    <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                        {selectedStudent ? (
                            /* SHOW NEARBY TUTORS LIST */
                            <>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-navy-border pb-2">
                                    {t("nearbyTeachers")}
                                </h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {nearbyTeachers.length === 0 ? (
                                        <div className="text-center py-8 space-y-2">
                                            <p className="text-2xl">⚠️</p>
                                            <p className="text-sm font-bold text-warning">
                                                No Qualified Tutors Available
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                No verified tutor is currently
                                                qualified to teach{" "}
                                                <span className="text-gold-primary font-semibold capitalize">
                                                    {selectedStudent.courseId}
                                                </span>
                                                . Check the Teachers page to
                                                verify qualifications.
                                            </p>
                                        </div>
                                    ) : (
                                        nearbyTeachers.map((tutor) => (
                                            <div
                                                key={tutor.id}
                                                onClick={() =>
                                                    setSelectedTeacher(tutor)
                                                }
                                                className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-center justify-between gap-4 ${
                                                    selectedTeacher?.id ===
                                                    tutor.id
                                                        ? "bg-navy-mid border-gold-primary shadow-gold"
                                                        : "bg-navy-mid/50 border-navy-border hover:border-gold-primary/50"
                                                }`}
                                            >
                                                {/* <div className="text-xs space-y-1">
                                                    <div className="font-bold text-white text-sm">
                                                        {tutor.fullName}
                                                    </div>
                                                    <div className="text-text-secondary">
                                                        Rating: {tutor.rating}{" "}
                                                        ⭐ | ID:{" "}
                                                        {tutor.serviceId}
                                                    </div>
                                                </div> */}
                                                <div className="text-xs space-y-1">
                                                    <div className="font-bold text-white text-sm">
                                                        {tutor.fullName}
                                                    </div>
                                                    <div className="text-text-secondary">
                                                        Rating:{" "}
                                                        {tutor.rating ?? "N/A"}{" "}
                                                        ⭐ | ID:{" "}
                                                        {tutor.serviceId}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {tutor.qualifiedCourses?.map(
                                                            (course) => (
                                                                <span
                                                                    key={course}
                                                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                                                        course ===
                                                                        selectedStudent.courseId
                                                                            ? "bg-success/10 text-success border-success/30"
                                                                            : "bg-navy-deep text-text-muted border-navy-border"
                                                                    }`}
                                                                >
                                                                    {course}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-gold-primary">
                                                        {tutor.distance.toFixed(
                                                            2,
                                                        )}{" "}
                                                        km
                                                    </span>
                                                    <span className="text-[10px] text-text-muted block">
                                                        away
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            /* SHOW UNMATCHED STUDENTS LIST */
                            <>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-navy-border pb-2">
                                    Unmatched Students (
                                    {unmatchedStudents.length})
                                </h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {unmatchedStudents.length === 0 ? (
                                        <p className="text-xs text-text-muted text-center py-6">
                                            All students have been assigned a
                                            tutor.
                                        </p>
                                    ) : (
                                        unmatchedStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                onClick={() =>
                                                    setSelectedStudent(student)
                                                }
                                                className="p-3.5 bg-navy-mid border border-navy-border rounded-lg hover:border-gold-primary cursor-pointer transition-all flex items-center justify-between"
                                            >
                                                <div className="text-xs space-y-1">
                                                    <div className="font-bold text-white text-sm">
                                                        {student.fullName}
                                                    </div>
                                                    <div className="text-text-secondary">
                                                        Course:{" "}
                                                        {student.courseId} |{" "}
                                                        {student.gender}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-warning-faint text-warning border border-warning/10">
                                                    Needs Match
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Matched Students List */}
                    {!selectedStudent && (
                        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-navy-border pb-2">
                                Matched Students ({matchedStudents.length})
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {matchedStudents.length === 0 ? (
                                    <p className="text-xs text-text-muted text-center py-6">
                                        No matched students yet.
                                    </p>
                                ) : (
                                    matchedStudents.map((student) => {
                                        const tutor = teachers.find(
                                            (t) =>
                                                t.id ===
                                                student.assignedTeacherId,
                                        );
                                        return (
                                            <div
                                                key={student.id}
                                                className="p-3 bg-navy-mid/30 border border-navy-border rounded-lg flex items-center justify-between text-xs"
                                            >
                                                <div>
                                                    <div className="font-bold text-white">
                                                        {student.fullName}
                                                    </div>
                                                    <div className="text-text-muted">
                                                        Assigned to:{" "}
                                                        {tutor
                                                            ? tutor.fullName
                                                            : "Verified Tutor"}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-success-faint text-success">
                                                    Active Match
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
