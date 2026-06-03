// src/components/ui/OtpModal.js
import React, { useState, useRef, useEffect } from "react";

export default function OtpModal({
    isOpen,
    phone,
    onConfirm,
    onResend,
    onClose,
    lang,
}) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setCode(["", "", "", "", "", ""]);
            setError("");
            setLoading(false);
            // Autofocus first input after rendering
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (value, index) => {
        // Only allow digits
        if (!/^[0-9]?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError("");

        // Auto-focus next input if we entered a digit
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            setError("");
            if (!code[index] && index > 0 && inputRefs.current[index - 1]) {
                // Focus previous and clear it
                inputRefs.current[index - 1].focus();
                const newCode = [...code];
                newCode[index - 1] = "";
                setCode(newCode);
            } else if (code[index]) {
                // Clear current
                const newCode = [...code];
                newCode[index] = "";
                setCode(newCode);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^[0-9]{6}$/.test(pastedData)) {
            const newCode = pastedData.split("");
            setCode(newCode);
            setError("");
            // Focus the last input
            if (inputRefs.current[5]) {
                inputRefs.current[5].focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const codeString = code.join("");
        if (codeString.length !== 6) {
            setError(
                lang === "am"
                    ? "እባክዎ ባለ 6 አሃዝ ኮድ ያስገቡ።"
                    : "Please enter the 6-digit code."
            );
            return;
        }

        setLoading(true);
        setError("");
        try {
            await onConfirm(codeString);
        } catch (err) {
            console.error("Verification error in OtpModal:", err);
            setError(
                lang === "am"
                    ? "የተሳሳተ የማረጋገጫ ኮድ ነው። እባክዎ እንደገና ይሞክሩ።"
                    : "Invalid verification code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="max-w-md w-full bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6 relative overflow-hidden">
                {/* Brand border strip on top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yt-maroon to-ft-teal" />

                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-extrabold text-gold-primary font-ethiopic leading-snug">
                        {lang === "am" ? "የማረጋገጫ ኮድ ያስገቡ" : "Enter Verification Code"}
                    </h2>
                    <p className="text-sm text-text-secondary">
                        {lang === "am"
                            ? `የማረጋገጫ ኮድ ወደ ስልክ ቁጥርዎ ${phone} ተልኳል።`
                            : `Verification code sent to your phone ${phone}.`}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 6 Digit Input Boxes */}
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                        {code.map((num, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={num}
                                onChange={(e) => handleChange(e.target.value, idx)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-navy-mid border border-navy-border rounded-lg text-white focus:outline-none focus:border-gold-primary transition-colors"
                            />
                        ))}
                    </div>

                    {/* Error display */}
                    {error && (
                        <p className="text-error text-xs font-semibold bg-error-faint p-2.5 rounded border border-error text-center">
                            ❌ {error}
                        </p>
                    )}

                    {/* Confirm Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg
                                className="animate-spin h-5 w-5 text-navy-deep"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    disabled={true}
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        )}
                        {loading
                            ? lang === "am"
                                ? "በማረጋገጥ ላይ..."
                                : "Verifying..."
                            : lang === "am"
                            ? "አረጋግጥ"
                            : "Confirm"}
                    </button>

                    {/* Resend and Cancel */}
                    <div className="flex flex-col items-center gap-2 pt-2 text-xs">
                        <button
                            type="button"
                            onClick={onResend}
                            className="text-text-secondary hover:text-white underline transition-colors"
                        >
                            {lang === "am" ? "ኮድ ድጋሚ ላክ" : "Resend Verification Code"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-text-secondary hover:text-white transition-colors"
                        >
                            {lang === "am" ? "ሰርዝ" : "Cancel"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
