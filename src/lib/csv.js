// src/lib/csv.js
// Rows (arrays) → CSV text that Excel opens correctly (quotes escaped, BOM for Amharic).
export function toCsv(rows) {
    const cell = (v) => {
        const s = v == null ? "" : String(v);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return "\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
}

export function downloadCsv(filename, rows) {
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
}
