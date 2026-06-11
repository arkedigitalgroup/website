// app/(public)/contact/page.client.js
"use client";

import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";

export default function ContactPageClient() {
    const { t, lang } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;

        setLoading(true);
        setError("");
        try {
            await addDoc(collection(db, "contactMessages"), {
                name: formData.name.trim(),
                email: formData.email.trim(),
                message: formData.message.trim(),
                createdAt: new Date(),
            });
            setSuccess(true);
            setFormData({ name: "", email: "", message: "" });
        } catch (err) {
            console.error("Contact message submit error:", err);
            setError(
                lang === "am"
                    ? "ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
                    : "Could not send message. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* 1. Contact Form Card */}
            <div className="bg-navy-surface border border-navy-border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gold-primary font-ethiopic">
                        {t("contactTitle")}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        {t("contactSub")}
                    </p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider block">
                            {t("formName")}
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            disabled={loading || success}
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm transition-colors"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider block">
                            {t("formEmail")}
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            disabled={loading || success}
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm transition-colors"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider block">
                            {t("formMessage")}
                        </label>
                        <textarea
                            name="message"
                            required
                            rows="5"
                            disabled={loading || success}
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-md text-white placeholder-text-muted focus:outline-none focus:border-gold-primary text-sm transition-colors resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full py-3.5 font-bold rounded-md bg-gold-primary text-navy-deep hover:bg-gold-hover shadow-gold transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                        {loading
                            ? lang === "am"
                                ? "በመላክ ላይ..."
                                : "Sending..."
                            : t("btnSendMessage")}
                    </button>

                    {success && (
                        <p className="text-success text-sm font-semibold animate-pulse text-center">
                            🎉 {t("contactSuccess")}
                        </p>
                    )}

                    {error && (
                        <p className="text-error text-sm font-semibold text-center">
                            ❌ {error}
                        </p>
                    )}
                </form>
            </div>

            {/* 2. Brand & Social Info Block */}
            <div className="flex flex-col justify-center space-y-8 lg:px-8">
                <div className="space-y-4">
                    <span className="text-3xl font-extrabold text-gold-primary font-ethiopic block">
                        {t("logoText")}
                    </span>
                    <p className="text-base text-text-secondary leading-relaxed">
                        {lang === "am"
                            ? "አርኬ ዲጂታል ግሩፕ በኢትዮጵያ ውስጥ የትምህርት ጥራትና የስነ-ምግባር እሴቶችን ለማስተሳሰር የተቋቋመ ተቋም ነው። ማንኛውም ጥያቄ፣ የስራ ቅጥር፣ ወይም የትብብር ጥያቄ ካለዎት እባክዎ ያግኙን።"
                            : "Arke Digital Group is a social educational enterprise established in Ethiopia. For collaborations, partnerships, or career opportunities, connect with us through our contact form or official social channels."}
                    </p>
                </div>

                {/* Social channels cards list */}
                <div className="space-y-4">
                    {/* Telegram */}
                    <a
                        href="https://t.me/arkegroup"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-4 p-4 bg-navy-surface border border-navy-border rounded-xl hover:border-gold-primary transition-colors"
                    >
                        <span className="p-3 bg-navy-mid text-gold-primary rounded-lg">
                            <svg
                                className="w-6 h-6 fill-current"
                                viewBox="0 0 24 24"
                            >
                                <path d="M9.78 18.65l.28-4.28 7.76-7.01c.34-.3-.07-.47-.52-.17l-9.58 6.03-4.14-1.3c-.9-.28-.92-.9.19-1.33L20.1 4.25c.76-.28 1.43.18 1.18 1.34l-2.79 13.16c-.2 1-.8 1.25-1.63.78l-4.22-3.11-2.03 1.95c-.23.23-.42.42-.86.42z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="font-bold text-white text-sm">
                                Telegram
                            </h3>
                            <p className="text-xs text-text-secondary">
                                @arkegroup
                            </p>
                        </div>
                    </a>

                    {/* Facebook */}
                    <a
                        href="https://facebook.com/share/17kUg7tM9n/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-4 p-4 bg-navy-surface border border-navy-border rounded-xl hover:border-gold-primary transition-colors"
                    >
                        <span className="p-3 bg-navy-mid text-gold-primary rounded-lg">
                            <svg
                                className="w-6 h-6 fill-current"
                                viewBox="0 0 24 24"
                            >
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="font-bold text-white text-sm">
                                Facebook
                            </h3>
                            <p className="text-xs text-text-secondary">
                                facebook.com/share/17kUg7tM9n/{" "}
                            </p>
                        </div>
                    </a>

                    {/* TikTok */}
                    <a
                        href="https://tiktok.com/@arke_group"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-4 p-4 bg-navy-surface border border-navy-border rounded-xl hover:border-gold-primary transition-colors"
                    >
                        <span className="p-3 bg-navy-mid text-gold-primary rounded-lg">
                            <svg
                                className="w-6 h-6 fill-current"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14.88.98 2.08 1.64 3.39 1.83v3.9c-1.4-.04-2.79-.44-3.99-1.21-.29-.18-.56-.39-.81-.62v7.7c.05 4.39-3.79 8.28-8.29 8.23-4.8-.05-8.39-4.52-7.58-9.28.53-3.13 3.12-5.63 6.27-5.83.69-.04 1.39.04 2.06.24V13.5c-.56-.25-1.19-.32-1.78-.19-1.52.33-2.61 1.8-2.39 3.34.19 1.34 1.38 2.37 2.76 2.35 1.76-.02 2.94-1.63 2.9-3.32-.01-5.18-.01-10.36-.01-15.54z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="font-bold text-white text-sm">
                                TikTok
                            </h3>
                            <p className="text-xs text-text-secondary">
                                @arke_group
                            </p>
                        </div>
                    </a>
                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/arke_.group"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-4 p-4 bg-navy-surface border border-navy-border rounded-xl hover:border-gold-primary transition-colors"
                    >
                        <span className="p-3 bg-navy-mid text-gold-primary rounded-lg">
                            <svg
                                className="w-5 h-5 fill-current"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.76-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="font-bold text-white text-sm">
                                Instagram
                            </h3>
                            <p className="text-xs text-text-secondary">
                                @arke_.group
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
