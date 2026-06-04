// src/types/index.ts
// Firestore document types for Arke Digital Learning
// Every Firestore read must be cast to one of these types — never use raw `data()`

import type { Timestamp } from 'firebase/firestore'

// ── User roles ──────────────────────────────────────────────
export type UserRole = 'admin' | 'teacher' | 'student'
export type ServiceLine = 'yeneta' | 'fidel'
export type UserStatus = 'pending' | 'active' | 'suspended'
export type BankProvider = 'CBE' | 'BOA' | 'Telebirr'
export type PaymentStatus = 'pending' | 'paid' | 'overdue'
export type CourseId = 'meserete-imnet' | 'quanquanna-zema' | 'diquna-zegajat' | 'all-courses'

// ── /users/{uid} ────────────────────────────────────────────
export interface UserDoc {
  id: string
  role: UserRole
  serviceId: string        // e.g. "YT-001", "SY-042"
  serviceLine: ServiceLine
  email: string
  status: UserStatus
  createdAt: Timestamp
}

// ── /teachers/{uid} ─────────────────────────────────────────
export interface TeacherProfile {
  id: string
  fullName: string
  christianName: string
  gender: 'male' | 'female'
  phone: string
  locationPin: { lat: number; lng: number }
  churchDocUrl: string
  profilePhotoUrl?: string
  idCardUrl?: string          // government-issued ID scan URL
  educationCertUrl?: string   // educational certificate / diploma URL
  bankProvider: BankProvider
  bankAccount: string      // stored as string, never process as number
  verified: boolean
  rating: number           // 0.0 – 5.0, calculated average from reports
  serviceId: string        // YT-xxx or FT-xxx
  serviceLine: ServiceLine
  assignedStudentIds: string[]
}

// ── /students/{uid} ─────────────────────────────────────────
export interface StudentProfile {
  id: string
  fullName: string
  christianName: string
  age: number
  gender: 'male' | 'female'
  phone: string
  locationPin: { lat: number; lng: number }
  courseId: CourseId
  assignedTeacherId: string | null
  registrationFeePaid: boolean
  serviceId: string        // SY-xxx or SF-xxx
  serviceLine: ServiceLine
  dashboardLocked: boolean // true if payment overdue past day 10
}

// ── /courses/{id} ───────────────────────────────────────────
export interface Course {
  id: CourseId
  name: string             // English name
  nameAm: string           // Amharic name
  description: string
  descriptionAm: string
  price: number            // ETB — the base course price (no service fee)
  serviceLine: ServiceLine
  // Financial formula (admin-only, never expose to student UI):
  // monthlyTotal = price + 100 (service fee shown to parent)
  // companyRevenue = (price * 0.15) + 100
  // teacherPayout = price * 0.85
}

// ── /attendanceReports/{id} ─────────────────────────────────
export interface AttendanceReport {
  id: string
  teacherId: string
  studentId: string
  date: Timestamp
  topic: string            // today's lesson topic
  topicAm: string
  engagementStars: 1 | 2 | 3 | 4 | 5
  moralNotes: string       // behavioral/moral progress text
  mediaUrl: string | null  // photo or video of student studying/praying
  weeklyReport?: string    // filled on weekly submission
}

// ── /payments/{id} ──────────────────────────────────────────
export interface Payment {
  id: string
  studentId: string
  teacherId: string
  month: string            // "YYYY-MM" format
  coursePrice: number
  serviceFee: 100          // always 100, typed as literal
  totalAmount: number      // coursePrice + 100
  status: PaymentStatus
  paidAt: Timestamp | null
  // Admin-only fields:
  companyRevenue: number   // (coursePrice * 0.15) + 100
  teacherPayout: number    // coursePrice * 0.85
}

// ── Counters (for ID generation) ────────────────────────────
export interface Counter {
  count: number
}

// ── Financial helpers (shared logic, use everywhere) ────────
export const REGISTRATION_FEE_STUDENT = 400  // ETB, one-time
export const REGISTRATION_FEE_TEACHER = 200  // ETB, one-time
export const SERVICE_FEE = 100               // ETB, per month per student

export function calcMonthlyTotal(coursePrice: number): number {
  return coursePrice + SERVICE_FEE
}
export function calcCompanyRevenue(coursePrice: number): number {
  return (coursePrice * 0.15) + SERVICE_FEE
}
export function calcTeacherPayout(coursePrice: number): number {
  return coursePrice * 0.85
}
