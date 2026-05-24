// src/components/auth/ProtectedRoute.jsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
        // Not authorized, redirect to appropriate role dashboard
        if (profile.role === 'admin') router.push('/admin');
        else if (profile.role === 'teacher') router.push('/teacher');
        else if (profile.role === 'student') router.push('/student');
        else router.push('/');
      }
    }
  }, [user, profile, loading, router, allowedRoles]);

  if (loading || !user || (allowedRoles && (!profile || !allowedRoles.includes(profile.role)))) {
    return (
      <div className="min-h-screen bg-navy-deep flex flex-col items-center justify-center space-y-4">
        {/* Loading Spinner */}
        <div className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm font-semibold tracking-wide animate-pulse">
          Securing session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
