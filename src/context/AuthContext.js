"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data());
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
        
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', res.user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const uProfile = userSnap.data();
        setProfile(uProfile);
        
        // Redirect based on role
        if (uProfile.role === 'admin') router.push('/admin');
        else if (uProfile.role === 'teacher') router.push('/teacher');
        else if (uProfile.role === 'student') router.push('/student');
      } else {
        throw new Error("User profile data not found in Firestore.");
      }
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, 'users', res.user.uid);
      const userSnap = await getDoc(userDocRef);
      let uProfile = null;
      if (userSnap.exists()) {
        uProfile = userSnap.data();
        setProfile(uProfile);
      } else {
        // Create student by default if new user signs up via Google
        const serviceId = `SY-${Math.floor(100 + Math.random() * 900)}`;
        uProfile = {
          id: res.user.uid,
          role: 'student',
          serviceId: serviceId,
          serviceLine: 'yeneta',
          email: res.user.email,
          status: 'active',
          createdAt: new Date()
        };
        await setDoc(userDocRef, uProfile);
        
        // Also set up empty studentProfile in /students/{uid}
        const studentProfileRef = doc(db, 'students', res.user.uid);
        await setDoc(studentProfileRef, {
          id: res.user.uid,
          fullName: res.user.displayName || "Google User",
          christianName: "",
          age: 18,
          gender: "male",
          phone: "",
          locationPin: { lat: 9.03, lng: 38.74 }, // Default Addis Ababa
          courseId: "meserete-imnet",
          assignedTeacherId: null,
          registrationFeePaid: true,
          serviceId: serviceId,
          serviceLine: 'yeneta',
          dashboardLocked: false
        });
        setProfile(uProfile);
      }

      if (uProfile.role === 'admin') router.push('/admin');
      else if (uProfile.role === 'teacher') router.push('/teacher');
      else if (uProfile.role === 'student') router.push('/student');
      
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithEmail, loginWithGoogle, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
