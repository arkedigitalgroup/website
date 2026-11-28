// app/api/admin/students/route.js
// Admin-only student management that the browser cannot do under security rules:
//   deactivate — blocks sign-in, marks suspended, unassigns the teacher (stops billing)
//   reactivate — allows sign-in again (teacher must be re-matched)
//   delete     — removes the student everywhere: Auth account, profile docs,
//                invoices, lesson reports, support messages and Supabase files
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth, verifyAdmin } from "../../../../src/lib/firebaseAdmin";
import { getSupabaseAdmin, removeSupabaseFiles } from "../../../../src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function unassignTeacher(db, studentId, teacherId) {
    if (!teacherId) return;
    await db.doc(`teachers/${teacherId}`).set({ assignedStudentIds: FieldValue.arrayRemove(studentId) }, { merge: true });
}

async function setAuthDisabled(uid, disabled) {
    try {
        await getAdminAuth().updateUser(uid, { disabled });
    } catch (err) {
        if (err.code !== "auth/user-not-found") throw err;
    }
}

export async function POST(request) {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, studentId, reason = "" } = await request.json().catch(() => ({}));
    if (!studentId || !["deactivate", "reactivate", "delete"].includes(action)) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    try {
        const db = getAdminDb();
        const [userSnap, studentSnap] = await Promise.all([
            db.doc(`users/${studentId}`).get(),
            db.doc(`students/${studentId}`).get(),
        ]);
        // Never let this route touch an admin or teacher account.
        if (userSnap.exists && userSnap.data().role !== "student") {
            return NextResponse.json({ error: "Not a student account" }, { status: 400 });
        }
        if (!userSnap.exists && !studentSnap.exists) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        const teacherId = studentSnap.data()?.assignedTeacherId || null;

        if (action === "deactivate") {
            await setAuthDisabled(studentId, true);
            await unassignTeacher(db, studentId, teacherId);
            await db.doc(`users/${studentId}`).set(
                { status: "suspended", suspendReason: String(reason).slice(0, 500), suspendedAt: FieldValue.serverTimestamp(), suspendedBy: adminUid },
                { merge: true },
            );
            if (studentSnap.exists) await studentSnap.ref.update({ assignedTeacherId: null });
            return NextResponse.json({ ok: true });
        }

        if (action === "reactivate") {
            await setAuthDisabled(studentId, false);
            await db.doc(`users/${studentId}`).set({ status: "active", suspendReason: FieldValue.delete() }, { merge: true });
            return NextResponse.json({ ok: true });
        }

        // ── delete ──
        const [payments, reports, messages, regFee] = await Promise.all([
            db.collection("payments").where("studentId", "==", studentId).get(),
            db.collection("attendanceReports").where("studentId", "==", studentId).get(),
            db.collection("supportMessages").where("senderId", "==", studentId).get(),
            db.doc(`registrationFees/${studentId}`).get(),
        ]);

        let fileErrors = [];
        const supabase = getSupabaseAdmin();
        if (supabase) {
            const urls = [
                studentSnap.data()?.profileUrl,
                ...payments.docs.map((d) => d.data().receiptUrl),
                ...reports.docs.map((d) => d.data().mediaUrl),
                regFee.data()?.receiptUrl,
            ].filter(Boolean);
            fileErrors = await removeSupabaseFiles(supabase, urls, [`receipts/${studentId}`, `students/${studentId}`, `registration/${studentId}`]);
        } else {
            fileErrors = ["Supabase URL or SUPABASE_SECRET_KEY not set for this deployment — files were not deleted"];
        }

        await unassignTeacher(db, studentId, teacherId);
        const writer = db.bulkWriter();
        [...payments.docs, ...reports.docs, ...messages.docs].forEach((d) => writer.delete(d.ref));
        writer.delete(regFee.ref);
        writer.delete(db.doc(`students/${studentId}`));
        writer.delete(db.doc(`users/${studentId}`));
        await writer.close();

        try {
            await getAdminAuth().deleteUser(studentId);
        } catch (err) {
            if (err.code !== "auth/user-not-found") throw err;
        }

        return NextResponse.json({
            ok: true,
            deleted: { invoices: payments.size, reports: reports.size, messages: messages.size },
            fileErrors,
        });
    } catch (err) {
        console.error("[admin/students]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
