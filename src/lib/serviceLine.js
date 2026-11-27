// src/lib/serviceLine.js
// Religious content (Christian name, church letter, spiritual wording) is shown
// only to users enrolled in Yeneta; everyone else sees a neutral academic UI.

export function isYenetaUser(record) {
    return (
        record?.serviceLine === "yeneta" ||
        (Array.isArray(record?.service_lines) && record.service_lines.includes("yeneta"))
    );
}
