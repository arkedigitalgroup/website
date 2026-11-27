// src/components/payments/ArkeBankAccounts.jsx
// Arke's own accounts that students and teachers pay into (edited on /admin/settings).

export const DEFAULT_BANK_ACCOUNTS = [
    { bank: "Commercial Bank of Ethiopia (CBE)", number: "1000452367123", holder: "Arke Digital Group" },
    { bank: "Bank of Abyssinia (BOA)", number: "45210985", holder: "Arke Digital Group" },
    { bank: "Telebirr Merchant", number: "98520", holder: "ArkeDigital" },
];

export const bankAccountsOf = (config) =>
    Array.isArray(config?.bankAccounts) && config.bankAccounts.length ? config.bankAccounts : DEFAULT_BANK_ACCOUNTS;

export default function ArkeBankAccounts({ config, lang, compact = false }) {
    return (
        <div className="space-y-2">
            <p className="text-xs text-text-secondary font-semibold uppercase">
                {lang === "am" ? "ወደ አርኬ የባንክ ሂሳብ ይክፈሉ" : "Pay to an Arke account"}
            </p>
            <div className={`grid grid-cols-1 gap-2 ${compact ? "" : "sm:grid-cols-3 sm:gap-3"}`}>
                {bankAccountsOf(config).map((a) => (
                    <div key={`${a.bank}-${a.number}`} className="bg-navy-mid border border-navy-border p-3 rounded-lg space-y-0.5">
                        <span className="text-[10px] text-text-secondary uppercase font-semibold block">{a.bank}</span>
                        <div className="text-sm font-extrabold text-gold-primary font-mono break-all">{a.number}</div>
                        <span className="text-[10px] text-text-muted block">{a.holder}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
