// app/(dashboard)/student/page.js
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';
import { useAuth } from '../../../src/context/AuthContext';
import { useLanguage } from '../../../src/context/LanguageContext';

export default function StudentHome() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Locked overlay simulated payment reference
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const fetchStudentDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch Student profile from /students/{uid}
      const studentSnap = await getDoc(doc(db, 'students', user.uid));
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        setStudent(studentData);

        // 2. Fetch assigned teacher if assignedTeacherId is present
        if (studentData.assignedTeacherId) {
          const teacherSnap = await getDoc(doc(db, 'teachers', studentData.assignedTeacherId));
          if (teacherSnap.exists()) {
            setTeacher(teacherSnap.data());
          }
        }
      }

      // 3. Fetch announcements targeting student or all
      const annSnap = await getDocs(collection(db, 'announcements'));
      const anns = [];
      annSnap.forEach((doc) => {
        const data = doc.data();
        if (data.targetRole === 'all' || data.targetRole === 'student') {
          anns.push({ id: doc.id, ...data });
        }
      });
      anns.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAnnouncements(anns);

    } catch (err) {
      console.error("Error loading student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboardData();
  }, [user]);

  // Handler to self-verify mock payment to unlock dashboard
  const handleVerifyMockPayment = async (e) => {
    e.preventDefault();
    if (!paymentRefInput) return;
    setUnlocking(true);

    try {
      // Update dashboardLocked: false, registrationFeePaid: true on Student profile
      const studentRef = doc(db, 'students', user.uid);
      await updateDoc(studentRef, {
        dashboardLocked: false,
        registrationFeePaid: true
      });

      // Reload dashboard
      fetchStudentDashboardData();
    } catch (err) {
      console.error("Unlock dashboard error:", err);
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm animate-pulse">Loading parent/student dashboard...</p>
      </div>
    );
  }

  // RENDER LOCKED DASHBOARD COVER OVERLAY
  if (student?.dashboardLocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-navy-surface border border-error/30 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-error" />
          
          <div className="text-center space-y-3">
            <span className="text-5xl block animate-bounce">🔒</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-error font-ethiopic">
              {t('lockTitle')}
            </h1>
            <p className="text-sm text-text-secondary">
              {lang === 'am'
                ? 'የየኔታ አስጠኚ ወርሃዊ ክፍያ ባለመፈጸሙ ምክንያት የርስዎ ዳሽቦርድ ለጊዜው ተዘግቷል። እባክዎን ክፍያ ፈጽመው የማረጋገጫ ቁጥር ያስገቡ።'
                : 'Your parent portal has been temporarily locked past the 10th of the month due to an outstanding invoice. Please clear payment to restore access.'}
            </p>
          </div>

          {/* Payment Instructions Card */}
          <div className="bg-navy-mid border border-navy-border p-5 rounded-xl space-y-3 text-xs leading-relaxed text-text-secondary">
            <h3 className="font-bold text-white text-sm">Arke Corporate Bank Channels:</h3>
            <div className="space-y-1 font-mono">
              <div>🏦 Commercial Bank of Ethiopia (CBE): <span className="text-gold-primary font-bold">1000452367123</span></div>
              <div>🏦 Bank of Abyssinia (BOA): <span className="text-gold-primary font-bold">45210985</span></div>
              <div>📱 Telebirr merchant ID: <span className="text-gold-primary font-bold">ArkeDigital (98520)</span></div>
            </div>
            <div className="text-[10px] text-text-muted mt-2 border-t border-navy-border/40 pt-2">
              Note: Include student ID <span className="text-white font-bold">{student.serviceId}</span> in transfer description.
            </div>
          </div>

          {/* Quick Mock Verify ref to self-unlock */}
          <form onSubmit={handleVerifyMockPayment} className="space-y-3">
            <input
              type="text"
              required
              placeholder={lang === 'am' ? 'የማስተላለፊያ ማረጋገጫ ቁጥር (Transaction Ref)' : 'Enter Bank Transaction Reference'}
              value={paymentRefInput}
              onChange={(e) => setPaymentRefInput(e.target.value)}
              className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-error text-sm text-center font-mono"
            />
            <button
              type="submit"
              disabled={unlocking}
              className="w-full py-3.5 font-bold rounded-md bg-error text-white hover:bg-error-faint hover:text-error transition-all duration-200 text-sm"
            >
              {unlocking ? 'Verifying payment...' : 'Confirm Payment & Unlock'}
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="border-b border-navy-border pb-6">
        <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
          {t('studentDashTitle')}
        </h1>
        <p className="text-sm text-text-secondary">
          Welcome to Arke parent portal. Monitor course calendar, moral reports, and monthly billing status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Teacher info and active Course details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Matched Teacher Card */}
          <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-3">
              {t('assignedTeacher')}
            </h2>

            {teacher ? (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {teacher.profilePhotoUrl && (
                  <img 
                    src={teacher.profilePhotoUrl} 
                    alt="tutor photo" 
                    className="w-24 h-24 rounded-xl border-2 border-gold-primary object-cover shadow-gold"
                  />
                )}
                <div className="space-y-3 flex-grow text-center sm:text-left">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start space-x-2">
                      <span>{teacher.fullName}</span>
                      {teacher.christianName && (
                        <span className="text-xs font-normal text-gold-primary font-ethiopic">({teacher.christianName})</span>
                      )}
                    </h3>
                    <p className="text-xs text-text-secondary">Service ID: {teacher.serviceId} | Rating: {teacher.rating} ⭐</p>
                  </div>
                  
                  <div className="text-xs text-text-secondary space-y-1">
                    <div>📞 Phone: <span className="font-semibold text-white">{teacher.phone}</span></div>
                    {teacher.churchDocUrl && (
                      <div>
                        ⛪ church endorsement:{' '}
                        <a 
                          href={teacher.churchDocUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-gold-primary hover:underline font-bold"
                        >
                          View Recommendation Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted text-sm space-y-2">
                <p>⚠️ {t('noTeacherAssigned')}</p>
                <p className="text-xs text-text-muted">Matches are based on geolocation proximity. An administrator is matching your profile.</p>
              </div>
            )}
          </div>

          {/* Course Progress Brief card */}
          <div className="bg-navy-surface border border-navy-border rounded-xl p-6 sm:p-8 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-navy-border pb-3">
              Active Package
            </h2>
            <div className="flex justify-between items-center bg-navy-mid border border-navy-border rounded-lg p-5">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase block">Enrolled Course</span>
                <span className="font-bold text-white text-base capitalize font-ethiopic">{student?.courseId}</span>
              </div>
              <Link 
                href="/student/progress" 
                className="px-4 py-2 bg-gold-primary text-navy-deep font-bold rounded text-xs hover:bg-gold-hover transition-all"
              >
                Track Progress
              </Link>
            </div>
          </div>

        </div>

        {/* Right Side: Announcements */}
        <div className="lg:col-span-5 bg-navy-surface border border-navy-border rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-navy-border pb-3 uppercase tracking-wider">
            Important Notices
          </h2>

          <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
            {announcements.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">No active notices published yet.</p>
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
