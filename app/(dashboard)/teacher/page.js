// app/(dashboard)/teacher/page.js
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';
import { useAuth } from '../../../src/context/AuthContext';
import { useLanguage } from '../../../src/context/LanguageContext';

export default function TeacherHome() {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const [studentsList, setStudentsList] = useState([]);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeacherData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch Assigned Students where assignedTeacherId == user.uid
      const studentsQuery = query(collection(db, 'students'), where('assignedTeacherId', '==', user.uid));
      const studentsSnap = await getDocs(studentsQuery);
      const students = [];
      studentsSnap.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() });
      });
      setStudentsList(students);

      // 2. Fetch Attendance Reports submitted by this teacher
      const reportsQuery = query(collection(db, 'attendanceReports'), where('teacherId', '==', user.uid));
      const reportsSnap = await getDocs(reportsQuery);
      const repList = [];
      reportsSnap.forEach((doc) => {
        repList.push({ id: doc.id, ...doc.data() });
      });
      setReports(repList);

      // 3. Fetch announcements targeting "all" or "teacher"
      const annSnap = await getDocs(collection(db, 'announcements'));
      const anns = [];
      annSnap.forEach((doc) => {
        const data = doc.data();
        if (data.targetRole === 'all' || data.targetRole === 'teacher') {
          anns.push({ id: doc.id, ...data });
        }
      });
      anns.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAnnouncements(anns);

    } catch (err) {
      console.error("Error fetching teacher dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [user]);

  // Calculations
  const sessionsThisMonth = reports.filter((r) => {
    const reportDate = r.date ? new Date(r.date.seconds * 1000) : new Date();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
  }).length;

  const totalRatingStars = reports.reduce((acc, curr) => acc + (curr.engagementStars || 5), 0);
  const avgEngagementRating = reports.length > 0 ? (totalRatingStars / reports.length).toFixed(1) : "5.0";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm animate-pulse">Loading teacher dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
            {t('teacherDashTitle')}
          </h1>
          <p className="text-sm text-text-secondary">
            {lang === 'am' ? `እንኳን ደህና መጡ መምህር ${profile?.fullName}!` : `Welcome back, Tutor ${profile?.fullName}!`}
          </p>
        </div>
        <Link
          href="/teacher/attendance"
          className="self-start px-5 py-3 rounded-md bg-gold-primary text-navy-deep font-semibold hover:bg-gold-hover shadow-gold transition-all"
        >
          📝 {t('fillReportBtn')}
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Sessions this Month */}
        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-20">📅</div>
          <span className="text-xs font-semibold text-text-secondary uppercase block">{t('sessionsThisMonth')}</span>
          <span className="text-3xl font-extrabold text-white">{sessionsThisMonth}</span>
        </div>

        {/* Avg Engagement Rating */}
        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-20">⭐</div>
          <span className="text-xs font-semibold text-text-secondary uppercase block">{t('avgRating')}</span>
          <span className="text-3xl font-extrabold text-gold-primary">{avgEngagementRating} <span className="text-sm text-text-muted">/ 5.0</span></span>
        </div>

        {/* Assigned Students Count */}
        <div className="bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-4 right-4 text-3xl opacity-20">👶</div>
          <span className="text-xs font-semibold text-text-secondary uppercase block">Matched Students</span>
          <span className="text-3xl font-extrabold text-white">{studentsList.length}</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Student List */}
        <div className="lg:col-span-7 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
            {t('assignedStudents')}
          </h2>

          {studentsList.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm space-y-2">
              <p>{t('noTeacherAssigned')}</p>
              <p className="text-xs text-text-muted">You will be notified as soon as students are matched to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentsList.map((student) => (
                <div key={student.id} className="bg-navy-mid border border-navy-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base flex items-center space-x-2">
                      <span>{student.fullName}</span>
                      {student.christianName && (
                        <span className="text-xs font-normal text-gold-primary">({student.christianName})</span>
                      )}
                    </h3>
                    <p className="text-xs text-text-secondary capitalize">
                      Course: {student.courseId} | Gender: {student.gender} | Age: {student.age}
                    </p>
                    <p className="text-xs text-text-muted">Phone: {student.phone}</p>
                  </div>
                  
                  {/* Action Link directly to report filling for this student */}
                  <Link
                    href={`/teacher/attendance?studentId=${student.id}`}
                    className="px-3 py-1.5 rounded bg-gold-primary text-navy-deep font-bold text-xs hover:bg-gold-hover transition-all"
                  >
                    Submit Report
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Announcements */}
        <div className="lg:col-span-5 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
            Platform Bulletins
          </h2>

          <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
            {announcements.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">No active announcements for tutors.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="bg-navy-mid border-l-4 border-l-gold-primary border-t border-r border-b border-navy-border rounded-r-lg p-4 space-y-2">
                  <h3 className="font-bold text-gold-primary text-sm">{ann.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{ann.content}</p>
                  <div className="text-[10px] text-text-muted text-right">
                    {ann.createdAt ? new Date(ann.createdAt.seconds * 1000).toLocaleDateString() : 'Today'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
