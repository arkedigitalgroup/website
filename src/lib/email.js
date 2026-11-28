// src/lib/email.js
// Server-only: branded HTML emails sent through Resend (RESEND_API_KEY, RESEND_FROM_EMAIL).
// Email clients ignore CSS variables and <style> blocks, so brand colours are inlined
// here as hex (same values as tailwind.config.ts: navy.deep, navy.mid, gold.primary).

const NAVY = "#002147";
const NAVY_MID = "#003570";
const GOLD = "#E8B84B";
const PRODUCTION_URL = "https://www.arke-group.com";

/** Public site URL for links and the logo (email clients can't load localhost images). */
export function siteUrl() {
    const url = process.env.NEXT_PUBLIC_APP_URL || "";
    return url.startsWith("https://") ? url.replace(/\/+$/, "") : PRODUCTION_URL;
}

const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * One bilingual email: Amharic block first (primary language), then English.
 * blocks: { am: { heading, lines[] }, en: { heading, lines[] } }; button: { url, am, en }
 */
export function brandedEmail({ preheader, am, en, button, footnote }) {
    const site = siteUrl();
    const section = (b, font) => `
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.35;color:${NAVY};font-family:${font}">${escapeHtml(b.heading)}</h1>
        ${b.lines.filter(Boolean).map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;font-family:${font}">${escapeHtml(l)}</p>`).join("")}`;
    const ethiopic = "'Noto Sans Ethiopic','Nyala','Abyssinica SIL',Arial,sans-serif";
    const latin = "Inter,Segoe UI,Arial,sans-serif";
    const cta = button
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 4px"><tr><td style="border-radius:8px;background:${GOLD}">
             <a href="${escapeHtml(button.url)}" style="display:inline-block;padding:14px 28px;font-family:${latin};font-size:15px;font-weight:700;color:${NAVY};text-decoration:none;border-radius:8px">${escapeHtml(button.am)} · ${escapeHtml(button.en)}</a>
           </td></tr></table>
           <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#64748b;font-family:${latin};text-align:center;word-break:break-all">${escapeHtml(button.url)}</p>`
        : "";

    return `<!doctype html>
<html lang="am"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Arke Digital Learning</title></head>
<body style="margin:0;padding:0;background:#eef2f7">
  <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
        <tr><td style="background:${NAVY};padding:28px 24px;text-align:center;border-bottom:4px solid ${GOLD}">
          <img src="${site}/arkelogo.png" width="72" height="72" alt="Arke" style="display:block;margin:0 auto 10px;border:0">
          <div style="font-family:${latin};font-size:18px;font-weight:800;color:#ffffff;letter-spacing:.5px">Arke Digital Learning</div>
          <div style="font-family:${ethiopic};font-size:13px;color:${GOLD};margin-top:4px">አርኬ ዲጂታል ትምህርት</div>
        </td></tr>
        <tr><td style="padding:28px 28px 8px">${section(am, ethiopic)}</td></tr>
        <tr><td style="padding:0 28px"><div style="border-top:1px solid #e2e8f0"></div></td></tr>
        <tr><td style="padding:20px 28px 8px">${section(en, latin)}</td></tr>
        <tr><td style="padding:8px 28px 28px">${cta}</td></tr>
        ${footnote ? `<tr><td style="padding:0 28px 24px;font-family:${latin};font-size:12px;line-height:1.5;color:#64748b">${escapeHtml(footnote)}</td></tr>` : ""}
        <tr><td style="background:${NAVY_MID};padding:18px 24px;text-align:center;font-family:${latin};font-size:12px;color:#cbd5e1">
          <a href="${site}" style="color:${GOLD};text-decoration:none;font-weight:700">arke-group.com</a>
          <div style="margin-top:6px">© ${new Date().getFullYear()} Arke Digital Learning · Addis Ababa, Ethiopia</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail({ to, subject, html }) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!key || !from) throw new Error("Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL).");
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `Arke Digital Learning <${from}>`, to: [to], subject, html }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
}

export function verificationEmail(link) {
    return {
        subject: "Email-ዎን ያረጋግጡ · Verify your email — Arke",
        html: brandedEmail({
            preheader: "Confirm your email to open your Arke Dashboard.",
            am: {
                heading: "Email-ዎን ያረጋግጡ",
                lines: ["ወደ አርኬ እንኳን በደህና መጡ! Account-ዎን ለመክፈት ከታች ያለውን Button ይጫኑ።", "ይህንን ምዝገባ ካላደረጉ ይህን Email ችላ ይበሉት።"],
            },
            en: {
                heading: "Verify your email",
                lines: ["Welcome to Arke! Tap the button below to confirm your email and open your Dashboard.", "If you didn't sign up, you can ignore this email."],
            },
            button: { url: link, am: "Email አረጋግጥ", en: "Verify email" },
        }),
    };
}

export function welcomeEmail({ role, serviceId, name }) {
    const teacher = role === "teacher";
    const site = siteUrl();
    const hi = name ? `${name}, ` : "";
    return {
        subject: "እንኳን ወደ አርኬ በደህና መጡ · Welcome to Arke",
        html: brandedEmail({
            preheader: "Your email is verified. Here's what happens next.",
            am: {
                heading: `${hi}እንኳን በደህና መጡ!`,
                lines: teacher
                    ? ["Email-ዎ ተረጋግጧል። ቀጣዩ ደረጃ፦ Profile-ዎን ያሟሉ፣ ID እና የትምህርት ማስረጃዎን ይስቀሉ።", "Admin ሰነዶችዎን ካጸደቀ በኋላ ተማሪዎች ይመደቡልዎታል።", serviceId ? `የእርስዎ Service ID፦ ${serviceId}` : ""]
                    : ["Email-ዎ ተረጋግጧል። ቀጣዩ ደረጃ፦ Profile-ዎን ያሟሉ (አካባቢ እና ስልክ)።", "በአቅራቢያዎ ያለ መምህር እንመድብልዎታለን፤ ክፍያ እና የትምህርት ሂደቱን በDashboard ይከታተላሉ።", serviceId ? `የእርስዎ Service ID፦ ${serviceId}` : ""],
            },
            en: {
                heading: `Welcome${name ? `, ${name}` : ""}!`,
                lines: teacher
                    ? ["Your email is verified. Next: complete your profile and upload your ID and education certificate.", "Once an Admin approves your documents, students will be matched to you.", serviceId ? `Your Service ID: ${serviceId}` : ""]
                    : ["Your email is verified. Next: complete your profile (location and phone).", "We'll match you with a nearby tutor, and you can follow payments and progress on your Dashboard.", serviceId ? `Your Service ID: ${serviceId}` : ""],
            },
            button: { url: `${site}/${teacher ? "teacher" : "student"}`, am: "Dashboard ክፈት", en: "Open Dashboard" },
        }),
    };
}
