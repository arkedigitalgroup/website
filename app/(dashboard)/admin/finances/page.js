// app/(dashboard)/admin/finances/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';
import { useLanguage } from '../../../src/context/LanguageContext';
import { 
  calcMonthlyTotal, 
  calcCompanyRevenue, 
  calcTeacherPayout,
  REGISTRATION_FEE_STUDENT,
  REGISTRATION_FEE_TEACHER,
  SERVICE_FEE
} from '../../../src/types/index';

export default function AdminFinances() {
  const { t, lang } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentsList = [];
      studentsSnap.forEach((doc) => {
        studentsList.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentsList);

      // Fetch teachers
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teachersList = [];
      teachersSnap.forEach((doc) => {
        teachersList.push({ id: doc.id, ...doc.data() });
      });
      setTeachers(teachersList);

      // Fetch payments
      const snap = await getDocs(collection(db, 'payments'));
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPayments(list);

    } catch (err) {
      console.error("Error loading finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  // Aggregate financials by month
  const monthlyAggregates = {};
  payments.forEach((payment) => {
    const month = payment.month || new Date().toISOString().slice(0, 7);
    if (!monthlyAggregates[month]) {
      monthlyAggregates[month] = {
        month,
        studentsCount: 0,
        totalCollected: 0,
        companyCut: 0,
        teacherPayouts: 0,
        paidCount: 0
      };
    }

    const price = payment.coursePrice || 4200;
    const isPaid = payment.status === 'paid';

    monthlyAggregates[month].studentsCount++;
    if (isPaid) {
      monthlyAggregates[month].paidCount++;
      monthlyAggregates[month].totalCollected += calcMonthlyTotal(price);
      monthlyAggregates[month].companyCut += calcCompanyRevenue(price);
      monthlyAggregates[month].teacherPayouts += calcTeacherPayout(price);
    }
  });

  const monthlyList = Object.values(monthlyAggregates).sort((a, b) => b.month.localeCompare(a.month));

  // Compute teacher payout table
  const teacherPayoutsList = teachers.map((teacher) => {
    let activeStudentsCount = 0;
    let earnedThisMonth = 0;

    // Count matched students
    students.forEach((student) => {
      if (student.assignedTeacherId === teacher.id) {
        activeStudentsCount++;
        // Get price based on student course
        const price = student.courseId === 'all-courses' ? 7100 : (student.courseId === 'diquna-zegajat' ? 4700 : 4200);
        earnedThisMonth += calcTeacherPayout(price);
      }
    });

    return {
      ...teacher,
      activeStudentsCount,
      earnedThisMonth
    };
  }).filter((teacher) => teacher.verified && teacher.activeStudentsCount > 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm animate-pulse">Loading finance statements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-ethiopic">
          {lang === 'am' ? 'የፋይናንስ አስተዳደር' : 'Financial Management'}
        </h1>
        <p className="text-sm text-text-secondary">
          Track billing, monthly total collections, company cut, and teacher payouts according to the 85/15 ratio.
        </p>
      </div>

      {/* Corporate Rates Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md text-sm">
        <div className="space-y-1">
          <span className="text-xs text-text-secondary font-semibold uppercase">Registration Fee (Student)</span>
          <div className="text-xl font-extrabold text-gold-primary">{REGISTRATION_FEE_STUDENT} ETB</div>
          <p className="text-xs text-text-muted">One-time payment upon registration</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-text-secondary font-semibold uppercase">Registration Fee (Teacher)</span>
          <div className="text-xl font-extrabold text-gold-primary">{REGISTRATION_FEE_TEACHER} ETB</div>
          <p className="text-xs text-text-muted">One-time activation fee</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-text-secondary font-semibold uppercase">Monthly Service Fee</span>
          <div className="text-xl font-extrabold text-gold-primary">{SERVICE_FEE} ETB</div>
          <p className="text-xs text-text-muted">Paid per student per month (Arke cut)</p>
        </div>
      </div>

      {/* Monthly Performance Overview */}
      <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
          Monthly Billings &amp; Collections
        </h2>

        {monthlyList.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No payments logged yet. Complete student matches to generate invoices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                  <th className="p-4">Billing Month</th>
                  <th className="p-4">Total Students</th>
                  <th className="p-4">Paid Invoices</th>
                  <th className="p-4">Total Collected</th>
                  <th className="p-4">Company Cut (15% + 100 ETB)</th>
                  <th className="p-4">Teacher Payout (85%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-border font-medium">
                {monthlyList.map((row) => (
                  <tr key={row.month} className="hover:bg-navy-hover transition-colors">
                    <td className="p-4 text-white font-bold">{row.month}</td>
                    <td className="p-4 text-white">{row.studentsCount}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-success-faint text-success">
                        {row.paidCount} / {row.studentsCount} Paid
                      </span>
                    </td>
                    <td className="p-4 text-gold-primary font-bold">{row.totalCollected.toLocaleString()} ETB</td>
                    <td className="p-4 text-success">{row.companyCut.toLocaleString()} ETB</td>
                    <td className="p-4 text-white">{row.teacherPayouts.toLocaleString()} ETB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teacher Payout Overview */}
      <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden space-y-4 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white font-ethiopic border-b border-navy-border pb-3">
          {t('payoutBreakdown')}
        </h2>

        {teacherPayoutsList.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No active payouts for teachers. Complete matches and lessons first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-navy-mid border-b border-navy-border text-xs text-text-secondary uppercase font-bold tracking-wider">
                  <th className="p-4">Tutor Details</th>
                  <th className="p-4">Payment Channel</th>
                  <th className="p-4">Bank Provider</th>
                  <th className="p-4">Active Students</th>
                  <th className="p-4">This Month Payout (85% Net)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-border font-medium">
                {teacherPayoutsList.map((row) => (
                  <tr key={row.id} className="hover:bg-navy-hover transition-colors">
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-white">{row.fullName}</div>
                      <div className="text-[10px] text-text-muted">ID: {row.serviceId}</div>
                    </td>
                    <td className="p-4 font-mono text-white text-xs">{row.bankAccount}</td>
                    <td className="p-4 text-white">{row.bankProvider}</td>
                    <td className="p-4 text-gold-primary">{row.activeStudentsCount} matched</td>
                    <td className="p-4 text-white font-bold">{row.earnedThisMonth.toLocaleString()} ETB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
