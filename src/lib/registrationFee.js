// src/lib/registrationFee.js
// One-time registration fee: the user uploads a bank receipt, admin approves it
// on /admin/finances, which sets registrationFeePaid on the student/teacher doc.
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { uploadToSupabase } from "./supabase";

export const registrationFeeFor = (config, role) =>
    Number(role === "teacher" ? config.registrationFeeTeacher : config.registrationFeeStudent) || 0;

export async function submitRegistrationFee({ uid, role, amount, file, transactionRef }) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const receiptUrl = await uploadToSupabase(file, `registration/${uid}/receipt_${Date.now()}.${ext}`);
    await setDoc(
        doc(db, "registrationFees", uid),
        { uid, role, amount, status: "submitted", receiptUrl, transactionRef: transactionRef.trim(), submittedAt: serverTimestamp() },
        { merge: true },
    );
}
