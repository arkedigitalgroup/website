// app/(auth)/login/page.js
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../src/lib/firebase';
import { useLanguage } from '../../../src/context/LanguageContext';
import { useAuth } from '../../../src/context/AuthContext';

export default function LoginPage() {
  const { t, lang } = useLanguage();
  const { loginWithEmail, loginWithGoogle, setProfile } = useAuth();
  const router = useRouter();

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP mock flow states
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtp, setMockOtp] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(lang === 'am' ? 'የተሳሳተ ኢሜል ወይም የይለፍ ቃል።' : 'Invalid email or password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  // Mock Phone OTP flow because free-tier Firebase phone OTP has billing constraints
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    
    // Generate a random 6 digit mock code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(randomCode);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setSuccessMsg(lang === 'am' 
        ? `የማረጋገጫ ኮድ ወደ ${phoneNumber} ተልኳል! [የሙከራ ኮድ፡ ${randomCode}]` 
        : `Verification code sent to ${phoneNumber}! [Test Code: ${randomCode}]`
      );
    }, 1200);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!verificationCode) return;
    setLoading(true);
    setError('');

    try {
      if (verificationCode !== mockOtp && verificationCode !== '123456') {
        throw new Error(t('invalidCodeError'));
      }

      // In a mock phone authentication, we simulate generating a firebase UID or logging in a generic phone user
      const mockUid = `phone-${phoneNumber.replace(/\s+/g, '')}`;
      
      // Check if user exists in Firestore `/users/{uid}`
      const userDocRef = doc(db, 'users', mockUid);
      const userSnap = await getDoc(userDocRef);
      let uProfile = null;

      if (userSnap.exists()) {
        uProfile = userSnap.data();
      } else {
        // Create new student profile if not exist
        const serviceId = `SY-${Math.floor(100 + Math.random() * 900)}`;
        uProfile = {
          id: mockUid,
          role: 'student',
          serviceId: serviceId,
          serviceLine: 'yeneta',
          email: `${phoneNumber}@arke.mock`,
          status: 'active',
          createdAt: new Date()
        };
        await setDoc(userDocRef, uProfile);

        // Student details in /students
        await setDoc(doc(db, 'students', mockUid), {
          id: mockUid,
          fullName: `User ${phoneNumber}`,
          christianName: "",
          age: 18,
          gender: "male",
          phone: phoneNumber,
          locationPin: { lat: 9.03, lng: 38.74 },
          courseId: "meserete-imnet",
          assignedTeacherId: null,
          registrationFeePaid: true,
          serviceId: serviceId,
          serviceLine: 'yeneta',
          dashboardLocked: false
        });
      }

      setProfile(uProfile);
      setSuccessMsg(lang === 'am' ? 'በተሳሳተ መንገድ ገብተዋል!' : 'Logged in successfully!');

      // Redirect
      if (uProfile.role === 'admin') router.push('/admin');
      else if (uProfile.role === 'teacher') router.push('/teacher');
      else if (uProfile.role === 'student') router.push('/student');

    } catch (err) {
      console.error("Phone verification error:", err);
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(lang === 'am' ? 'እባክዎ መጀመሪያ የኢሜል አድራሻዎን ያስገቡ።' : 'Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg(lang === 'am' 
        ? 'የይለፍ ቃል ማደሻ ሊንክ ወደ ኢሜልዎ ተልኳል!' 
        : 'Password reset link sent to your email!'
      );
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6 relative overflow-hidden">
        
        {/* Decorative gold/teal line */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yt-maroon to-ft-teal" />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gold-primary font-ethiopic leading-snug">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-text-secondary">
            {t('loginSub')}
          </p>
        </div>

        {/* Tab selector for Email vs Phone OTP */}
        <div className="grid grid-cols-2 gap-2 bg-navy-mid p-1 rounded-lg border border-navy-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsPhoneAuth(false);
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-md transition-colors ${
              !isPhoneAuth ? 'bg-gold-primary text-navy-deep' : 'text-text-secondary hover:text-white'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPhoneAuth(true);
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-md transition-colors ${
              isPhoneAuth ? 'bg-gold-primary text-navy-deep' : 'text-text-secondary hover:text-white'
            }`}
          >
            Phone Code (OTP)
          </button>
        </div>

        {/* Form Container */}
        {!isPhoneAuth ? (
          /* EMAIL LOGIN FORM */
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-semibold uppercase">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-text-secondary font-semibold uppercase">{t('passwordLabel')}</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-gold-primary hover:underline font-semibold"
                >
                  {t('forgotPasswordLink')}
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {loading ? (lang === 'am' ? 'በማረጋገጥ ላይ...' : 'Verifying...') : t('btnLoginSubmit')}
            </button>
          </form>
        ) : (
          /* PHONE OTP FORM (SSR & FREE-TIER MOCK METHOD) */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold uppercase">{t('phoneLabel')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="0911000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Sending...' : t('btnSendOTP')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-semibold uppercase">Enter 6-digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white focus:outline-none focus:border-gold-primary text-sm text-center tracking-widest font-mono text-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setSuccessMsg('');
                      setError('');
                    }}
                    className="py-3 font-semibold rounded-md border border-navy-border text-text-secondary hover:bg-navy-mid text-xs"
                  >
                    Resend SMS
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold text-xs"
                  >
                    {loading ? 'Verifying...' : t('btnVerifyOTP')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Google Continue (Unified) */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-navy-border"></div>
          <span className="flex-shrink mx-4 text-xs text-text-muted font-semibold uppercase">Or</span>
          <div className="flex-grow border-t border-navy-border"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-md border border-navy-border hover:border-gold-primary text-white bg-navy-mid font-semibold hover:bg-navy-hover flex items-center justify-center space-x-2 text-sm transition-all duration-200"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.013c1.55 0 2.902.583 3.923 1.545l3.15-3.14A9.95 9.95 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.3 0 9.75-3.87 9.75-10 0-.612-.048-1.285-.16-1.715h-11.34z"/>
          </svg>
          <span>{t('googleLoginBtn')}</span>
        </button>

        {/* Success / Error Messages */}
        {successMsg && (
          <p className="text-success text-xs font-semibold bg-success-faint p-2.5 rounded border border-success text-center">
            {successMsg}
          </p>
        )}

        {error && (
          <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error text-center">
            ❌ {error}
          </p>
        )}

        <div className="text-center pt-2 text-xs">
          <Link href="/register" className="text-gold-primary hover:underline font-semibold">
            {t('dontHaveAccount')}
          </Link>
        </div>

      </div>
    </div>
  );
}
