// app/(dashboard)/teacher/messages/page.js
"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useAuth } from "../../../../src/context/AuthContext";
import { useLanguage } from "../../../../src/context/LanguageContext";

export default function TeacherMessages() {
    const { user, profile } = useAuth();
    const { t, lang } = useLanguage();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        
        // Listen to support messages in real-time
        const q = query(
            collection(db, "supportMessages"),
            where("senderId", "==", user.uid),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            console.error("Failed to load messages:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        setError("");
        try {
            await addDoc(collection(db, "supportMessages"), {
                senderId: user.uid,
                senderName: profile?.fullName || "Teacher/Tutor",
                senderRole: "teacher",
                message: newMessage.trim(),
                createdAt: new Date(),
                reply: ""
            });
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
            setError(lang === "am" ? "መልዕክት መላክ አልተሳካም።" : "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    {lang === "am" ? "መልዕክቶችን በመጫን ላይ..." : "Loading messages..."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="border-b border-navy-border pb-6">
                <h1 className="text-3xl font-extrabold text-white font-ethiopic leading-snug">
                    {lang === "am" ? "ለአስተዳዳሪው መልዕክት መላኪያ" : "Message Admin / Support"}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                    {lang === "am"
                        ? "ማንኛውም ጥያቄ ወይም አስተያየት ካለዎት ለአስተዳዳሪው ይላኩ። በቅርቡ ምላሽ እንሰጣለን።"
                        : "Have any questions or need assistance? Write to the administration and support team here."}
                </p>
            </div>

            {/* Message Area */}
            <div className="bg-navy-surface border border-navy-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
                {/* Messages list */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-navy-deep/20">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-text-muted space-y-2">
                            <span className="text-4xl">💬</span>
                            <p className="text-sm font-medium">
                                {lang === "am" ? "እስካሁን ምንም መልዕክት የለም" : "No messages yet"}
                            </p>
                            <p className="text-xs max-w-xs">
                                {lang === "am" ? "የመጀመሪያ መልዕክትዎን ከታች በመጻፍ ይጀምሩ።" : "Start the conversation by sending a message below."}
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="space-y-3">
                                {/* Teacher Message */}
                                <div className="flex justify-end">
                                    <div className="bg-gold-primary text-navy-deep px-4 py-3 rounded-2xl rounded-tr-none max-w-md shadow-md space-y-1">
                                        <p className="text-sm font-medium leading-relaxed break-words">{msg.message}</p>
                                        <span className="block text-[9px] opacity-70 text-right font-mono">
                                            {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                        </span>
                                    </div>
                                </div>

                                {/* Admin Reply */}
                                {msg.reply && (
                                    <div className="flex justify-start">
                                        <div className="bg-navy-mid border border-navy-border text-white px-4 py-3 rounded-2xl rounded-tl-none max-w-md shadow-md space-y-1">
                                            <p className="text-xs font-semibold text-gold-primary uppercase tracking-wider">Arke Admin</p>
                                            <p className="text-sm leading-relaxed break-words">{msg.reply}</p>
                                            <span className="block text-[9px] text-text-muted font-mono">
                                                {lang === "am" ? "ምላሽ ተሰጥቷል" : "Replied"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Message input form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-navy-border bg-navy-mid/50 flex gap-3">
                    <input
                        type="text"
                        required
                        placeholder={lang === "am" ? "መልዕክትዎን እዚህ ይጻፉ..." : "Type your message to support..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow px-4 py-3 bg-navy-deep border border-navy-border rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-gold-primary transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-gold-primary text-navy-deep hover:bg-gold-hover font-bold rounded-xl text-sm transition-all shadow-gold disabled:opacity-50"
                    >
                        {sending ? "..." : (lang === "am" ? "ላክ" : "Send")}
                    </button>
                </form>
            </div>

            {error && (
                <p className="text-error text-xs font-semibold bg-error/10 border border-error/30 px-3 py-2.5 rounded-lg">
                    ❌ {error}
                </p>
            )}
        </div>
    );
}
