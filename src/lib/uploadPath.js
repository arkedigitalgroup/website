// src/lib/uploadPath.js
// Which storage paths a signed-in user may upload to: "<folder>/<their uid>/<file>".
export const UPLOAD_FOLDERS = ["registration", "receipts", "students", "teachers", "reports"];

export function isAllowedUploadPath(path, uid) {
    if (typeof path !== "string" || !uid || path.length > 300) return false;
    const parts = path.split("/");
    return (
        parts.length >= 3 &&
        UPLOAD_FOLDERS.includes(parts[0]) &&
        parts[1] === uid &&
        parts.every((p) => p && p !== "." && p !== "..")
    );
}
