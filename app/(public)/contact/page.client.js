// app/(public)/contact/page.client.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useLanguage } from "../../../src/context/LanguageContext";

const socialChannels = [
    {
        name: "Telegram",
        handle: "@arkegroup",
        href: "https://t.me/arkegroup",
        path: "M9.78 18.65l.28-4.28 7.76-7.01c.34-.3-.07-.47-.52-.17l-9.58 6.03-4.14-1.3c-.9-.28-.92-.9.19-1.33L20.1 4.25c.76-.28 1.43.18 1.18 1.34l-2.79 13.16c-.2 1-.8 1.25-1.63.78l-4.22-3.11-2.03 1.95c-.23.23-.42.42-.86.42z",
    },
    {
        name: "Facebook",
        handle: "Arke Digital Group",
        href: "https://facebook.com/share/17kUg7tM9n/",
        path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z",
    },
    {
        name: "Instagram",
        handle: "@arke_.group",
        href: "https://www.instagram.com/arke_.group",
        path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.76-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
    },
    {
        name: "TikTok",
        handle: "@arke_group",
        href: "https://tiktok.com/@arke_group",
        path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.14.88.98 2.08 1.64 3.39 1.83v3.9c-1.4-.04-2.79-.44-3.99-1.21-.29-.18-.56-.39-.81-.62v7.7c.05 4.39-3.79 8.28-8.29 8.23-4.8-.05-8.39-4.52-7.58-9.28.53-3.13 3.12-5.63 6.27-5.83.69-.04 1.39.04 2.06.24V13.5c-.56-.25-1.19-.32-1.78-.19-1.52.33-2.61 1.8-2.39 3.34.19 1.34 1.38 2.37 2.76 2.35 1.76-.02 2.94-1.63 2.9-3.32-.01-5.18-.01-10.36-.01-15.54z",
    },
];

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

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleContactSubmit = async (event) => {
        event.preventDefault();
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
        } catch (submitError) {
            console.error("Contact message submit error:", submitError);
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <header className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-extrabold text-white font-ethiopic sm:text-4xl">
                    {t("contactTitle")}
                </h1>
                <div className="h-1.5 w-20 rounded-full bg-gold-primary" />
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                    {t("contactIntro")}
                </p>
            </header>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Form */}
                <section className="rounded-2xl border border-navy-border bg-navy-surface p-6 sm:p-8">
                    <h2 className="text-xl font-extrabold text-white font-ethiopic">
                        {t("contactFormTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {t("contactSub")}
                    </p>

                    <form
                        onSubmit={handleContactSubmit}
                        className="mt-6 space-y-4"
                    >
                        <div className="space-y-1">
                            <label
                                htmlFor="contact-name"
                                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                            >
                                {t("formName")}
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                name="name"
                                required
                                disabled={loading || success}
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-md border border-navy-border bg-navy-deep px-4 py-3 text-sm text-white focus:border-gold-primary focus:outline-none disabled:opacity-60"
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="contact-email"
                                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                            >
                                {t("formEmail")}
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                name="email"
                                required
                                disabled={loading || success}
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-md border border-navy-border bg-navy-deep px-4 py-3 text-sm text-white focus:border-gold-primary focus:outline-none disabled:opacity-60"
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="contact-message"
                                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
                            >
                                {t("formMessage")}
                            </label>
                            <textarea
                                id="contact-message"
                                name="message"
                                required
                                rows="5"
                                disabled={loading || success}
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full resize-none rounded-md border border-navy-border bg-navy-deep px-4 py-3 text-sm text-white focus:border-gold-primary focus:outline-none disabled:opacity-60"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full rounded-lg bg-gold-primary py-3.5 text-sm font-bold text-navy-deep transition-colors hover:bg-gold-hover disabled:opacity-50"
                        >
                            {loading
                                ? lang === "am"
                                    ? "በመላክ ላይ..."
                                    : "Sending..."
                                : t("btnSendMessage")}
                        </button>

                        {success && (
                            <p
                                role="status"
                                className="text-center text-sm font-semibold text-success"
                            >
                                {t("contactSuccess")}
                            </p>
                        )}

                        {error && (
                            <p
                                role="alert"
                                className="text-center text-sm font-semibold text-error"
                            >
                                {error}
                            </p>
                        )}
                    </form>
                </section>

                {/* Direct contact */}
                <aside className="space-y-6">
                    <section className="rounded-2xl border border-navy-border bg-navy-surface p-6 sm:p-8">
                        <h2 className="text-xl font-extrabold text-white font-ethiopic">
                            {t("contactDetailsTitle")}
                        </h2>

                        <dl className="mt-5 space-y-4">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                    {t("contactCallLabel")}
                                </dt>
                                <dd className="mt-1 space-y-1">
                                    <a
                                        href="tel:+251990285748"
                                        className="block text-sm font-semibold text-gold-primary hover:underline"
                                    >
                                        +251 990 285 748
                                    </a>
                                    <a
                                        href="tel:+251976977475"
                                        className="block text-sm font-semibold text-gold-primary hover:underline"
                                    >
                                        +251 976 977 475
                                    </a>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                    {t("contactEmailLabel")}
                                </dt>
                                <dd className="mt-1">
                                    <a
                                        href="mailto:info@arke-group.com"
                                        className="text-sm font-semibold text-gold-primary hover:underline"
                                    >
                                        info@arke-group.com
                                    </a>
                                </dd>
                            </div>
                        </dl>

                        <p className="mt-5 rounded-lg border border-navy-border bg-navy-deep/50 p-3 text-xs leading-relaxed text-text-muted">
                            {t("contactResponseNote")}
                        </p>
                    </section>

                    <section className="rounded-2xl border border-navy-border bg-navy-surface p-6 sm:p-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                            {t("contactSocialLabel")}
                        </h2>
                        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {socialChannels.map((channel) => (
                                <li key={channel.name}>
                                    <a
                                        href={channel.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 rounded-lg border border-navy-border p-3 transition-colors hover:border-gold-primary"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-deep text-gold-primary">
                                            <svg
                                                className="h-4 w-4 fill-current"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path d={channel.path} />
                                            </svg>
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-xs font-bold text-white">
                                                {channel.name}
                                            </span>
                                            <span className="block truncate text-[11px] text-text-secondary">
                                                {channel.handle}
                                            </span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-navy-border border-l-4 border-l-ft-teal bg-navy-surface p-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-ft-teal-text">
                            {t("fidelBadge")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {t("fidelDesc")}
                        </p>
                        <Link
                            href="/fidel#courses"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold-primary hover:text-gold-hover"
                        >
                            {t("subjectsCta")} <span aria-hidden="true">→</span>
                        </Link>
                    </section>
                </aside>
            </div>
        </div>
    );
}
