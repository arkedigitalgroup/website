// src/lib/phoneAuth.js
// Phone + password accounts reuse Firebase's Email/Password provider: the
// phone number is mapped to a fixed, non-deliverable email on our own domain.
// shortcut: no SMS verification and no self-service password reset for phone
// accounts; switch to Firebase Phone Auth (needs Blaze plan) when that matters.

const PHONE_AUTH_DOMAIN = "phone.arke-group.com";

/** Returns "+<country><number>" or null. Local Ethiopian forms get +251. */
export function normalizePhone(input) {
    const raw = String(input || "").trim();
    let digits = raw.replace(/\D/g, "");
    if (!raw.startsWith("+")) {
        if (digits.startsWith("0")) digits = "251" + digits.slice(1);
        else if (digits.length === 9) digits = "251" + digits;
    }
    return digits.length >= 10 && digits.length <= 15 ? "+" + digits : null;
}

export function phoneToAuthEmail(normalizedPhone) {
    return `${normalizedPhone.slice(1)}@${PHONE_AUTH_DOMAIN}`;
}

/** True for the placeholder email of a phone account (it can never be verified). */
export function isPhoneAuthEmail(email) {
    return String(email || "").endsWith(`@${PHONE_AUTH_DOMAIN}`);
}
