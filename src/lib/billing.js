// src/lib/billing.js
// Pure billing helpers shared by the browser (matching, finances) and the
// daily cron route. No Firebase imports here so both sides can use it.

// ── Money formulas (platform_config/global drives every value) ──────────────
export function calcMonthlyTotal(config, coursePrice) {
    return coursePrice + config.serviceFeeMonthly;
}
export function calcCompanyRevenue(config, coursePrice) {
    return coursePrice * (1 - config.teacherPayoutRatio) + config.serviceFeeMonthly;
}
export function calcTeacherPayout(config, coursePrice) {
    return coursePrice * config.teacherPayoutRatio;
}

// ── Dates (Ethiopia is UTC+3 all year, no daylight saving) ──────────────────
const ADDIS_OFFSET_MS = 3 * 60 * 60 * 1000;
export const DUE_DAY = 10; // invoices are due on the 10th; locked from the 11th

const pad = (n) => String(n).padStart(2, "0");

/** Today's date in Addis Ababa: { year, month (1-12), day, monthKey "YYYY-MM", today "YYYY-MM-DD" } */
export function addisDate(now = new Date()) {
    const d = new Date(now.getTime() + ADDIS_OFFSET_MS);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const monthKey = `${year}-${pad(month)}`;
    return { year, month, day, monthKey, today: `${monthKey}-${pad(day)}` };
}

export function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addDays(year, month, day, n) {
    const d = new Date(Date.UTC(year, month - 1, day + n));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Invoice due date; legacy invoices without dueDate fall back to the 10th of their month. */
export function invoiceDueDate(invoice) {
    return invoice.dueDate || `${invoice.month}-${pad(DUE_DAY)}`;
}

/** Unpaid (pending/rejected) and past its due date. "submitted" is under review, never overdue. */
export function shouldMarkOverdue(invoice, today) {
    return (
        (invoice.status === "pending" || invoice.status === "rejected") &&
        invoiceDueDate(invoice) < today
    );
}

/**
 * Builds a monthly invoice document.
 * Due on the 10th; an invoice created after the 1st gets 10 days from
 * creation (or the 10th if later), so nobody is locked the day they are billed.
 * prorate: true for the first invoice at matching — it covers the days left in
 * the month (match day included). The service fee is always charged in full.
 */
export function buildInvoice(config, { studentId, teacherId, fullCoursePrice, prorate = false, now = new Date() }) {
    const { year, month, day, monthKey } = addisDate(now);
    let coursePrice = fullCoursePrice;
    let dueDate = `${monthKey}-${pad(DUE_DAY)}`;
    let prorated = false;

    if (day > 1) {
        const tenDaysLater = addDays(year, month, day, 10);
        if (tenDaysLater > dueDate) dueDate = tenDaysLater;
        if (prorate) {
            const dim = daysInMonth(year, month);
            coursePrice = Math.round((fullCoursePrice * (dim - day + 1)) / dim);
            prorated = true;
        }
    }

    const id = `${studentId}-${monthKey}`;
    return {
        id,
        studentId,
        teacherId,
        month: monthKey,
        coursePrice,
        fullCoursePrice,
        prorated,
        serviceFee: config.serviceFeeMonthly,
        totalAmount: calcMonthlyTotal(config, coursePrice),
        companyRevenue: calcCompanyRevenue(config, coursePrice),
        teacherPayout: calcTeacherPayout(config, coursePrice),
        dueDate,
        status: "pending",
        paidAt: null,
    };
}

/** Supabase public URL → { bucket, path } so the cron can delete the file. */
export function parseSupabasePublicUrl(url) {
    const m = String(url || "").match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    return m ? { bucket: m[1], path: decodeURIComponent(m[2].split("?")[0]) } : null;
}

/**
 * Teacher salary per month: the teacher's share of invoices admin approved as paid.
 * Returns [{ id: "<teacherId>_<YYYY-MM>", teacherId, month, earned, invoiceCount }], newest month first.
 */
export function teacherEarnings(payments, config) {
    const rows = new Map();
    for (const p of payments) {
        if (p.status !== "paid" || !p.teacherId || !p.month) continue;
        const id = `${p.teacherId}_${p.month}`;
        const row = rows.get(id) || { id, teacherId: p.teacherId, month: p.month, earned: 0, invoiceCount: 0 };
        row.earned += p.teacherPayout ?? calcTeacherPayout(config, Number(p.coursePrice) || 0);
        row.invoiceCount++;
        rows.set(id, row);
    }
    return [...rows.values()].sort((a, b) => b.month.localeCompare(a.month));
}
