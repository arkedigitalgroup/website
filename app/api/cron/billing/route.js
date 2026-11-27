// app/api/cron/billing/route.js
// Daily billing job, triggered by Vercel Cron (see vercel.json, 06:00 Addis).
//  1. Creates this month's invoice for every assigned student who has none.
//  2. Marks unpaid invoices past their due date "overdue" and locks the student.
//  3. Deletes receipt files from Supabase 30 days after admin approved/rejected them.
// Every step is idempotent, so a re-run on the same day changes nothing.
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createClient } from "@supabase/supabase-js";
import { getAdminDb } from "../../../../src/lib/firebaseAdmin";
import { addisDate, buildInvoice, shouldMarkOverdue, parseSupabasePublicUrl } from "../../../../src/lib/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RECEIPT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getAdminDb();
        const { monthKey, today } = addisDate();
        const summary = { today, invoicesCreated: 0, skippedNoPrice: [], markedOverdue: 0, locked: 0, receiptsDeleted: 0, receiptCleanup: "ok" };

        // ── 1. Monthly invoices ─────────────────────────────────────────────
        const [configSnap, coursesSnap, studentsSnap] = await Promise.all([
            db.doc("platform_config/global").get(),
            db.collection("courses").get(),
            db.collection("students").where("assignedTeacherId", "!=", null).get(),
        ]);
        const config = configSnap.data();
        if (!config) throw new Error("platform_config/global is missing");
        const priceOf = new Map(coursesSnap.docs.map((d) => [d.id, d.data().price ?? 0]));

        const students = studentsSnap.docs;
        const invoiceRefs = students.map((s) => db.doc(`payments/${s.id}-${monthKey}`));
        const existing = invoiceRefs.length ? await db.getAll(...invoiceRefs) : [];

        const writer = db.bulkWriter();
        students.forEach((s, i) => {
            if (existing[i].exists) return;
            const { assignedTeacherId, courseId } = s.data();
            const fullCoursePrice = priceOf.get(courseId) || 0;
            if (!fullCoursePrice) return summary.skippedNoPrice.push(s.id); // never bill 0 by accident
            writer.create(invoiceRefs[i], {
                ...buildInvoice(config, { studentId: s.id, teacherId: assignedTeacherId, fullCoursePrice }),
                createdAt: FieldValue.serverTimestamp(),
                createdBy: "cron",
            });
            summary.invoicesCreated++;
        });

        // ── 2. Overdue + lock ──────────────────────────────────────────────
        const unpaidSnap = await db.collection("payments").where("status", "in", ["pending", "rejected"]).get();
        const toLock = new Set();
        unpaidSnap.docs.forEach((p) => {
            if (!shouldMarkOverdue(p.data(), today)) return;
            writer.update(p.ref, { status: "overdue", overdueAt: FieldValue.serverTimestamp() });
            toLock.add(p.data().studentId);
            summary.markedOverdue++;
        });
        toLock.forEach((sid) => {
            if (sid) writer.set(db.doc(`students/${sid}`), { dashboardLocked: true }, { merge: true });
        });
        summary.locked = toLock.size;
        await writer.close();

        // ── 3. Expired receipt files ────────────────────────────────────────
        // Supabase "secret" key (sb_secret_…) replaced the legacy service_role key; server-only, never NEXT_PUBLIC.
        const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) {
            summary.receiptCleanup = "skipped: SUPABASE_SECRET_KEY not set";
        } else {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
            const cutoff = Date.now() - RECEIPT_TTL_MS;
            const withReceipt = await db.collection("payments").where("receiptUrl", "!=", null).get();
            for (const p of withReceipt.docs) {
                const d = p.data();
                const decidedAt = (d.status === "paid" ? d.approvedAt : d.rejectedAt)?.toMillis?.();
                if (d.status === "submitted" || !decidedAt || decidedAt > cutoff) continue;
                const file = parseSupabasePublicUrl(d.receiptUrl);
                if (file) {
                    const { error } = await supabase.storage.from(file.bucket).remove([file.path]);
                    if (error) { summary.receiptCleanup = `partial: ${error.message}`; continue; }
                }
                await p.ref.update({ receiptUrl: null, receiptDeletedAt: FieldValue.serverTimestamp() });
                summary.receiptsDeleted++;
            }
        }

        return NextResponse.json(summary);
    } catch (err) {
        console.error("[cron/billing]", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
