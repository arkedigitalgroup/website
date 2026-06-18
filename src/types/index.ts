// src/types/index.ts
// Firestore document types for Arke Digital Learning
// Every Firestore read must be cast to one of these types — never use raw `data()`

import type { Timestamp } from "firebase/firestore";

// ── User roles ──────────────────────────────────────────────
export type UserRole = "admin" | "teacher" | "student";
export type ServiceLine = "yeneta" | "fidel";
export type UserStatus = "pending" | "active" | "suspended";
export type BankProvider = "CBE" | "BOA" | "Telebirr";
export type PaymentStatus = "pending" | "paid" | "overdue";
export type PricingModel = "monthly" | "per-hour" | "per-session";

// CourseId is no longer a hardcoded union — courses are dynamic in Firestore.
// Use string and validate against the courses collection at runtime.
export type CourseId = string;

// ── /users/{uid} ────────────────────────────────────────────
export interface UserDoc {
    id: string;
    role: UserRole;
    serviceId: string;
    serviceLine: ServiceLine;
    email: string;
    status: UserStatus;
    createdAt: Timestamp;
}

// ── /teachers/{uid} ─────────────────────────────────────────
export interface TeacherProfile {
    id: string;
    fullName: string;
    christianName: string;
    gender: "male" | "female";
    phone: string;
    locationPin: { lat: number; lng: number };
    churchDocUrl: string;
    profileUrl?: string;
    idCardUrl?: string;
    educationCertUrl?: string;
    bankProvider: BankProvider;
    bankAccount: string;
    verified: boolean;
    rating: number;
    serviceId: string;
    serviceLine: ServiceLine;
    assignedStudentIds: string[];
}

// ── /students/{uid} ─────────────────────────────────────────
export interface StudentProfile {
    id: string;
    fullName: string;
    christianName: string;
    age: number;
    gender: "male" | "female";
    phone: string;
    locationPin: { lat: number; lng: number };
    courseId: CourseId;
    assignedTeacherId: string | null;
    registrationFeePaid: boolean;
    serviceId: string;
    serviceLine: ServiceLine;
    dashboardLocked: boolean;
}

// ── /courses/{id} ───────────────────────────────────────────
// Matches the schema seeded by scripts/seed-courses.js
export interface Course {
    id: CourseId;
    nameEn: string;
    nameAm: string;
    descEn: string;
    descAm: string;
    syllabusEn: string;
    syllabusAm: string;
    price: number; // ETB — base course price, no service fee included
    pricingModel: PricingModel;
    serviceLine: ServiceLine;
    isActive: boolean;
    gradeRange: string | null;
    subject: string | null;
    sortOrder: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    updatedBy: string;
}

// ── /platform_config/global ──────────────────────────────────
// Matches the document seeded by scripts/seed-platform-config.js.
// Read via usePlatformConfig() hook — never import constants directly.
export interface PlatformConfig {
    registrationFeeStudent: number; // ETB, one-time
    registrationFeeTeacher: number; // ETB, one-time
    serviceFeeMonthly: number; // ETB, per student per month (Arke cut)
    teacherPayoutRatio: number; // 0–1, e.g. 0.85 means teacher gets 85%
    updatedAt: Timestamp | null;
    updatedBy: string | null;
}

// ── /attendanceReports/{id} ─────────────────────────────────
export interface AttendanceReport {
    id: string;
    teacherId: string;
    studentId: string;
    date: Timestamp;
    topic: string;
    topicAm: string;
    engagementStars: 1 | 2 | 3 | 4 | 5;
    moralNotes: string;
    mediaUrl: string | null;
    weeklyReport?: string;
}

// ── /payments/{id} ──────────────────────────────────────────
export interface Payment {
    id: string;
    studentId: string;
    teacherId: string;
    month: string; // "YYYY-MM"
    coursePrice: number; // snapshot of price at billing time
    serviceFee: number; // snapshot of serviceFeeMonthly at billing time
    totalAmount: number; // coursePrice + serviceFee
    status: PaymentStatus;
    paidAt: Timestamp | null;
    companyRevenue: number; // snapshot: (coursePrice × (1-ratio)) + serviceFee
    teacherPayout: number; // snapshot: coursePrice × ratio
}

// ── Counters ─────────────────────────────────────────────────
export interface Counter {
    count: number;
}

// ── REMOVED ──────────────────────────────────────────────────
// The following exports have been deleted. Use the hooks instead:
//
//   REGISTRATION_FEE_STUDENT  → config.registrationFeeStudent  (usePlatformConfig)
//   REGISTRATION_FEE_TEACHER  → config.registrationFeeTeacher  (usePlatformConfig)
//   SERVICE_FEE               → config.serviceFeeMonthly       (usePlatformConfig)
//   calcMonthlyTotal()        → calcMonthlyTotal(config, price) (usePlatformConfig)
//   calcCompanyRevenue()      → calcCompanyRevenue(config, price)(usePlatformConfig)
//   calcTeacherPayout()       → calcTeacherPayout(config, price)(usePlatformConfig)
