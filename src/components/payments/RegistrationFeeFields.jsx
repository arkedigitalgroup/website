// src/components/payments/RegistrationFeeFields.jsx
// Amount + Arke bank accounts + receipt upload + transaction reference.
import ArkeBankAccounts from "./ArkeBankAccounts";

const INPUT = "w-full px-3 py-2 bg-navy-mid border border-navy-border rounded-md text-white text-sm focus:outline-none focus:border-gold-primary";

export default function RegistrationFeeFields({ amount, config, lang, file, onFile, transactionRef, onRef }) {
    const am = lang === "am";
    return (
        <div className="bg-navy-surface border border-gold-primary/30 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white">{am ? "የምዝገባ ክፍያ (አንድ ጊዜ)" : "Registration fee (one-time)"}</span>
                <span className="font-extrabold text-gold-primary">{amount} ETB</span>
            </div>
            <ArkeBankAccounts config={config} lang={lang} compact />
            <div className="space-y-1">
                <label htmlFor="fee-receipt" className="text-xs text-text-secondary font-semibold uppercase">
                    {am ? "የክፍያ ደረሰኝ (ፎቶ ወይም PDF)" : "Payment receipt (photo or PDF)"}
                </label>
                <input id="fee-receipt" type="file" accept="image/*,application/pdf" required
                    onChange={(e) => onFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gold-primary file:text-navy-deep file:font-bold" />
                {file && <p className="text-[11px] text-text-muted">{file.name}</p>}
            </div>
            <div className="space-y-1">
                <label htmlFor="fee-ref" className="text-xs text-text-secondary font-semibold uppercase">
                    {am ? "የግብይት ቁጥር" : "Transaction reference"}
                </label>
                <input id="fee-ref" type="text" required value={transactionRef} onChange={(e) => onRef(e.target.value)}
                    placeholder="FT26145892" className={INPUT} />
            </div>
            <p className="text-[11px] text-text-muted">
                {am ? "አስተዳዳሪው ደረሰኙን ካረጋገጠ በኋላ መለያዎ ይነቃል።" : "Your account is activated once an admin verifies the receipt."}
            </p>
        </div>
    );
}
