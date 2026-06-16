"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    // Helper: fetch the role-specific sub-profile and merge it
    async function fetchFullProfile(uid, baseProfile) {
        if (!baseProfile?.role || baseProfile.role === "admin")
            return baseProfile;
        const collection =
            baseProfile.role === "teacher" ? "teachers" : "students";
        try {
            const subSnap = await getDoc(doc(db, collection, uid));
            if (subSnap.exists()) {
                // Merge: base fields first, sub-profile fields layer on top
                return { ...baseProfile, ...subSnap.data() };
            }
        } catch (err) {
            console.error("Error fetching sub-profile:", err);
        }
        return baseProfile;
    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        const fullProfile = await fetchFullProfile(
                            firebaseUser.uid,
                            userSnap.data(),
                        );
                        setProfile(fullProfile);
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
            const userDocRef = doc(db, "users", res.user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const uProfile = userSnap.data();
                const fullProfile = await fetchFullProfile(
                    res.user.uid,
                    uProfile,
                );
                setProfile(fullProfile);

                // Redirect based on role
                if (fullProfile.role === "admin") router.push("/admin");
                else if (fullProfile.role === "teacher")
                    router.push("/teacher");
                else if (fullProfile.role === "student")
                    router.push("/student");
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
            const uid = res.user.uid;

            // Look up their existing Firestore profile (created during email registration)
            const userDocRef = doc(db, "users", uid);
            const userSnap = await getDoc(userDocRef);

            if (!userSnap.exists()) {
                // No registration found — block sign-in, tell them to register first
                await signOut(auth);
                throw new Error("NO_PROFILE");
            }

            const fullProfile = await fetchFullProfile(uid, userSnap.data());
            setProfile(fullProfile);

            if (fullProfile.role === "admin") router.push("/admin");
            else if (fullProfile.role === "teacher") router.push("/teacher");
            else router.push("/student");

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
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                loginWithEmail,
                loginWithGoogle,
                logout,
                setProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
