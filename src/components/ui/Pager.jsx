// src/components/ui/Pager.jsx
// Client-side paging for admin lists.
// shortcut: the whole collection is still read once; switch to Firestore cursors (limit/startAfter) past a few thousand docs.
export const PAGE_SIZE = 25;

export function pageOf(list, page) {
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const p = Math.min(page, pages - 1); // filters can shrink the list under the current page
    return { rows: list.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE), page: p, pages };
}

export default function Pager({ page, pages, onPage, lang }) {
    if (pages <= 1) return null;
    const am = lang === "am";
    const btn = "px-3 py-1.5 rounded border border-navy-border text-xs font-semibold text-text-secondary hover:text-white disabled:opacity-40";
    return (
        <nav className="flex items-center justify-center gap-3 py-3" aria-label={am ? "ገጾች" : "Pages"}>
            <button className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>‹ {am ? "ቀዳሚ" : "Prev"}</button>
            <span className="text-xs text-text-muted">{am ? `ገጽ ${page + 1} ከ ${pages}` : `Page ${page + 1} of ${pages}`}</span>
            <button className={btn} disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>{am ? "ቀጣይ" : "Next"} ›</button>
        </nav>
    );
}
