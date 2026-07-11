// app/(dashboard)/admin/support/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy,
    addDoc,
} from "firebase/firestore";
import { db } from "../../../../src/lib/firebase";
import { useLanguage } from "../../../../src/context/LanguageContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts) {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function roleBadge(role) {
    if (role === "teacher")
        return (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-gold-primary/10 text-gold-primary border border-gold-primary/20 tracking-wider">
                Teacher
            </span>
        );
    return (
        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-sky-400/10 text-sky-400 border border-sky-400/20 tracking-wider">
            Student
        </span>
    );
}

// ─── Thread Sidebar Item ───────────────────────────────────────────────────────
function ThreadItem({ thread, isActive, onClick }) {
    const latestMsg = thread.messages[thread.messages.length - 1];
    const pendingCount = thread.messages.filter((m) => !m.reply).length;

    return (
        <div
            onClick={onClick}
            className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                isActive
                    ? "bg-navy-mid border-gold-primary shadow-gold"
                    : "bg-navy-mid/40 border-navy-border hover:border-gold-primary/40 hover:bg-navy-mid/70"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm truncate">
                            {thread.senderName}
                        </span>
                        {roleBadge(thread.senderRole)}
                    </div>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">
                        {latestMsg.message}
                    </p>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                    {pendingCount > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-warning text-navy-deep text-[10px] font-extrabold">
                            {pendingCount}
                        </span>
                    ) : (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-success/10 text-success border border-success/20">
                            All Replied
                        </span>
                    )}
                </div>
            </div>
            <p className="text-[9px] text-text-muted mt-1.5 font-mono">
                {formatTime(latestMsg.createdAt)}
            </p>
        </div>
    );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onReply, replying, replyText, setReplyText }) {
    const hasReply = msg.reply && msg.reply.trim() !== "";

    return (
        <div className="space-y-2">
            {/* Sender message */}
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-border flex items-center justify-center text-sm flex-shrink-0 font-bold text-text-secondary">
                    {msg.senderName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-grow max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">
                            {msg.senderName}
                        </span>
                        <span className="text-[9px] text-text-muted font-mono">
                            {formatTime(msg.createdAt)}
                        </span>
                        {hasReply ? (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-success/10 text-success border border-success/20">
                                Replied
                            </span>
                        ) : (
                            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-warning/10 text-warning border border-warning/20">
                                Pending
                            </span>
                        )}
                    </div>
                    <div className="bg-navy-mid border border-navy-border rounded-2xl rounded-tl-none px-4 py-3 text-sm text-white leading-relaxed">
                        {msg.message}
                    </div>
                </div>
            </div>

            {/* Admin reply (if exists) */}
            {hasReply && (
                <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gold-primary/20 border border-gold-primary/40 flex items-center justify-center text-sm flex-shrink-0 font-bold text-gold-primary">
                        A
                    </div>
                    <div className="flex-grow max-w-[85%]">
                        <div className="flex items-center gap-2 mb-1 flex-row-reverse">
                            <span className="text-xs font-bold text-gold-primary">
                                Admin
                            </span>
                        </div>
                        <div className="bg-gold-primary/10 border border-gold-primary/20 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white leading-relaxed text-right">
                            {msg.reply}
                        </div>
                    </div>
                </div>
            )}

            {/* Inline reply box (only for unreplied messages) */}
            {!hasReply && (
                <div className="ml-11 space-y-2">
                    {replying ? (
                        <div className="space-y-2">
                            <textarea
                                autoFocus
                                rows={3}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className="w-full px-3 py-2.5 bg-navy-mid border border-gold-primary/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-primary resize-none placeholder-text-muted transition-colors"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onReply(msg.id, replyText)}
                                    disabled={!replyText.trim()}
                                    className="px-4 py-1.5 bg-gold-primary text-navy-deep font-bold rounded-md text-xs hover:bg-gold-hover transition-all disabled:opacity-40"
                                >
                                    Send Reply
                                </button>
                                <button
                                    onClick={() => {
                                        setReplyText("");
                                        onReply(null, "");
                                    }}
                                    className="px-4 py-1.5 border border-navy-border text-text-secondary rounded-md text-xs hover:text-white hover:border-white/30 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => onReply(msg.id, null)}
                            className="text-[11px] font-semibold text-text-muted hover:text-gold-primary transition-colors"
                        >
                            ↩ Reply to this message
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSupport() {
    const { lang } = useLanguage();
    const bottomRef = useRef(null);

    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeThread, setActiveThread] = useState(null);
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState("all"); // all | pending | replied

    // New Message states
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
    const [allRecipients, setAllRecipients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [adminMessage, setAdminMessage] = useState("");
    const [threadInputText, setThreadInputText] = useState("");

    const loadMessages = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "supportMessages"),
                orderBy("createdAt", "asc"),
            );
            const snap = await getDocs(q);
            const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

            // Group by senderId — each sender gets one thread
            const threadMap = {};
            raw.forEach((msg) => {
                if (!threadMap[msg.senderId]) {
                    threadMap[msg.senderId] = {
                        senderId: msg.senderId,
                        senderName: msg.senderName,
                        senderRole: msg.senderRole,
                        messages: [],
                    };
                }
                threadMap[msg.senderId].messages.push(msg);
            });

            const threadList = Object.values(threadMap);
            setThreads(threadList);

            // Keep active thread in sync after reload
            if (activeThread) {
                const refreshed = threadList.find(
                    (t) => t.senderId === activeThread.senderId,
                );
                if (refreshed) setActiveThread(refreshed);
            }
        } catch (err) {
            console.error("Failed to load support messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    // Scroll to bottom when thread changes
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeThread]);

    const handleReply = async (msgId, text) => {
        // If msgId is null, user clicked Cancel
        if (msgId === null) {
            setReplyingToId(null);
            setReplyText("");
            return;
        }
        // If text is null, user clicked "Reply to this message" — open box
        if (text === null) {
            setReplyingToId(msgId);
            setReplyText("");
            return;
        }
        // Otherwise, send the reply
        if (!text.trim()) return;
        setSending(true);
        try {
            await updateDoc(doc(db, "supportMessages", msgId), {
                reply: text.trim(),
            });
            setReplyingToId(null);
            setReplyText("");
            await loadMessages();
        } catch (err) {
            console.error("Reply failed:", err);
        } finally {
            setSending(false);
        }
    };

    const openNewMessageModal = async () => {
        setIsNewMessageOpen(true);
        setSearchQuery("");
        setSelectedRecipient(null);
        setAdminMessage("");
        try {
            const studentsSnap = await getDocs(collection(db, "students"));
            const teachersSnap = await getDocs(collection(db, "teachers"));
            
            const list = [];
            studentsSnap.forEach((doc) => {
                const d = doc.data();
                list.push({ uid: doc.id, name: d.fullName, role: "student", email: d.email });
            });
            teachersSnap.forEach((doc) => {
                const d = doc.data();
                list.push({ uid: doc.id, name: d.fullName, role: "teacher", email: d.email });
            });
            setAllRecipients(list);
        } catch (err) {
            console.error("Failed to load recipients list:", err);
        }
    };

    const handleSendNewMessage = async (e) => {
        e.preventDefault();
        if (!selectedRecipient || !adminMessage.trim()) return;
        setSending(true);
        try {
            const messageSubject = lang === "am" ? "የአስተዳዳሪ መልዕክት" : "Message from Admin";
            await addDoc(collection(db, "supportMessages"), {
                senderId: selectedRecipient.uid,
                senderName: selectedRecipient.name || "User",
                senderRole: selectedRecipient.role,
                message: messageSubject,
                createdAt: new Date(),
                reply: adminMessage.trim(),
            });
            
            setIsNewMessageOpen(false);
            await loadMessages();
            
            // Automatically select the active thread for this recipient
            const q = query(
                collection(db, "supportMessages"),
                orderBy("createdAt", "asc"),
            );
            const snap = await getDocs(q);
            const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const threadMap = {};
            raw.forEach((msg) => {
                if (!threadMap[msg.senderId]) {
                    threadMap[msg.senderId] = {
                        senderId: msg.senderId,
                        senderName: msg.senderName,
                        senderRole: msg.senderRole,
                        messages: [],
                    };
                }
                threadMap[msg.senderId].messages.push(msg);
            });
            const refreshed = Object.values(threadMap).find(t => t.senderId === selectedRecipient.uid);
            if (refreshed) setActiveThread(refreshed);
        } catch (err) {
            console.error("Failed to send admin message:", err);
        } finally {
            setSending(false);
        }
    };

    const filteredRecipients = allRecipients.filter(r => 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleThreadSend = async (e) => {
        e.preventDefault();
        const text = threadInputText.trim();
        if (!text || !activeThread) return;
        setSending(true);
        try {
            // Find if there is any unreplied message in this thread
            const unreplied = activeThread.messages.find(
                (m) => !m.reply || m.reply.trim() === "",
            );

            if (unreplied) {
                // Reply to the unreplied message
                await updateDoc(doc(db, "supportMessages", unreplied.id), {
                    reply: text,
                });
            } else {
                // If all are replied to, create a new document in the collection
                const messageSubject = lang === "am" ? "የአስተዳዳሪ መልዕክት" : "Message from Admin";
                await addDoc(collection(db, "supportMessages"), {
                    senderId: activeThread.senderId,
                    senderName: activeThread.senderName || "User",
                    senderRole: activeThread.senderRole,
                    message: messageSubject,
                    createdAt: new Date(),
                    reply: text,
                });
            }
            setThreadInputText("");
            await loadMessages();
        } catch (err) {
            console.error("Failed to send message to thread:", err);
        } finally {
            setSending(false);
        }
    };

    // Filter sidebar threads
    const filteredThreads = threads.filter((thread) => {
        if (filter === "pending")
            return thread.messages.some(
                (m) => !m.reply || m.reply.trim() === "",
            );
        if (filter === "replied")
            return thread.messages.every(
                (m) => m.reply && m.reply.trim() !== "",
            );
        return true;
    });

    const totalPending = threads.reduce(
        (acc, t) =>
            acc +
            t.messages.filter((m) => !m.reply || m.reply.trim() === "").length,
        0,
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary text-sm animate-pulse">
                    Loading support messages...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white font-ethiopic">
                        {lang === "am" ? "የድጋፍ መልዕክቶች" : "Support Messages"}
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        {threads.length} sender{threads.length !== 1 ? "s" : ""}{" "}
                        ·{" "}
                        {totalPending > 0 ? (
                            <span className="text-warning font-semibold">
                                {totalPending} message
                                {totalPending !== 1 ? "s" : ""} pending reply
                            </span>
                        ) : (
                            <span className="text-success font-semibold">
                                All caught up ✓
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openNewMessageModal}
                        className="px-4 py-2 bg-gold-primary hover:bg-gold-hover text-navy-deep font-bold rounded-lg text-xs transition-all flex items-center gap-1.5"
                    >
                        <span>➕</span>
                        <span>{lang === "am" ? "አዲስ መልዕክት" : "New Message"}</span>
                    </button>
                    <button
                        onClick={loadMessages}
                        className="px-4 py-2 border border-navy-border text-text-secondary rounded-lg text-xs font-semibold hover:border-gold-primary hover:text-gold-primary transition-all"
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3 bg-navy-surface border border-navy-border rounded-xl">
                    <p className="text-4xl">📭</p>
                    <p className="text-white font-bold">No messages yet</p>
                    <p className="text-text-muted text-sm">
                        When students or teachers send a support message, it
                        will appear here.
                    </p>
                </div>
            ) : (
                <div
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    style={{ minHeight: "600px" }}
                >
                    {/* ── Sidebar: Thread List ─────────────────────────────── */}
                    <div className="lg:col-span-4 bg-navy-surface border border-navy-border rounded-xl p-4 shadow-md flex flex-col gap-3">
                        {/* Filter tabs */}
                        <div className="flex gap-1 bg-navy-mid rounded-lg p-1 flex-shrink-0">
                            {[
                                { key: "all", label: "All" },
                                { key: "pending", label: "Pending" },
                                { key: "replied", label: "Replied" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                                        filter === tab.key
                                            ? "bg-gold-primary text-navy-deep"
                                            : "text-text-secondary hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Thread items */}
                        <div className="space-y-2 overflow-y-auto flex-grow pr-1">
                            {filteredThreads.length === 0 ? (
                                <p className="text-xs text-text-muted text-center py-8">
                                    No {filter} messages.
                                </p>
                            ) : (
                                filteredThreads.map((thread) => (
                                    <ThreadItem
                                        key={thread.senderId}
                                        thread={thread}
                                        isActive={
                                            activeThread?.senderId ===
                                            thread.senderId
                                        }
                                        onClick={() => {
                                            setActiveThread(thread);
                                            setReplyingToId(null);
                                            setReplyText("");
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Main: Conversation View ──────────────────────────── */}
                    <div className="lg:col-span-8 bg-navy-surface border border-navy-border rounded-xl shadow-md flex flex-col">
                        {!activeThread ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-3 p-8">
                                <p className="text-4xl">💬</p>
                                <p className="text-white font-bold">
                                    Select a conversation
                                </p>
                                <p className="text-text-muted text-sm text-center">
                                    Click on a sender from the left panel to
                                    view their messages and reply.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Thread header */}
                                <div className="px-6 py-4 border-b border-navy-border flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-navy-mid border border-navy-border flex items-center justify-center font-bold text-white">
                                            {activeThread.senderName?.[0]?.toUpperCase() ??
                                                "?"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">
                                                    {activeThread.senderName}
                                                </span>
                                                {roleBadge(
                                                    activeThread.senderRole,
                                                )}
                                            </div>
                                            <p className="text-[10px] text-text-muted font-mono">
                                                ID: {activeThread.senderId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-text-secondary font-semibold">
                                            {activeThread.messages.length}{" "}
                                            message
                                            {activeThread.messages.length !== 1
                                                ? "s"
                                                : ""}
                                        </p>
                                        <p className="text-[10px] text-text-muted">
                                            {
                                                activeThread.messages.filter(
                                                    (m) =>
                                                        !m.reply ||
                                                        m.reply.trim() === "",
                                                ).length
                                            }{" "}
                                            pending
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-grow overflow-y-auto px-6 py-5 space-y-6">
                                    {activeThread.messages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            msg={msg}
                                            onReply={handleReply}
                                            replying={replyingToId === msg.id}
                                            replyText={
                                                replyingToId === msg.id
                                                    ? replyText
                                                    : ""
                                            }
                                            setReplyText={setReplyText}
                                        />
                                    ))}
                                    <div ref={bottomRef} />
                                </div>

                                {/* Sending indicator */}
                                {sending && (
                                    <div className="px-6 py-3 border-t border-navy-border text-xs text-text-muted animate-pulse flex-shrink-0">
                                        Sending...
                                    </div>
                                )}

                                {/* ── Persistent bottom chat input ── */}
                                <form
                                    onSubmit={handleThreadSend}
                                    className="p-4 border-t border-navy-border bg-navy-mid/50 flex gap-3 flex-shrink-0"
                                >
                                    <input
                                        type="text"
                                        placeholder={
                                            lang === "am"
                                                ? "ለተጠቃሚው መልዕክት ይጻፉ..."
                                                : "Type a message to this user..."
                                        }
                                        value={threadInputText}
                                        onChange={(e) =>
                                            setThreadInputText(e.target.value)
                                        }
                                        className="flex-grow px-4 py-3 bg-navy-deep border border-navy-border rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-gold-primary transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            sending ||
                                            !threadInputText.trim()
                                        }
                                        className="px-6 py-3 bg-gold-primary text-navy-deep hover:bg-gold-hover font-bold rounded-xl text-sm transition-all shadow-gold disabled:opacity-50"
                                    >
                                        {sending
                                            ? "..."
                                            : lang === "am"
                                              ? "ላክ"
                                              : "Send"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── New Message Modal ─────────────────────────────────────────── */}
            {isNewMessageOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-navy-surface border border-navy-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-border">
                            <h3 className="text-base font-bold text-white">
                                {lang === "am" ? "ለተማሪ ወይም መምህር መልዕክት መላኪያ" : "Send Message to Student/Teacher"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsNewMessageOpen(false)}
                                className="text-text-secondary hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSendNewMessage} className="p-6 space-y-4 flex-grow overflow-y-auto">
                            {/* Step 1: Select recipient */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-text-secondary uppercase">
                                    {lang === "am" ? "ተቀባይ ፈልግ" : "Search Recipient"}
                                </label>
                                <input
                                    type="text"
                                    placeholder={lang === "am" ? "በስም ወይም በኢሜል ይፈልጉ..." : "Search by name or email..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-navy-mid border border-navy-border rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-gold-primary transition-colors"
                                />

                                {/* Search results */}
                                {searchQuery.trim() && (
                                    <div className="mt-2 border border-navy-border rounded-xl max-h-40 overflow-y-auto bg-navy-deep/40 divide-y divide-navy-border/40">
                                        {filteredRecipients.length === 0 ? (
                                            <p className="p-3 text-xs text-text-muted text-center">
                                                No matches found.
                                            </p>
                                        ) : (
                                            filteredRecipients.map((rec) => (
                                                <div
                                                    key={rec.uid}
                                                    onClick={() => {
                                                        setSelectedRecipient(rec);
                                                        setSearchQuery("");
                                                    }}
                                                    className="p-3 text-xs flex justify-between items-center cursor-pointer hover:bg-navy-mid/60 transition-colors"
                                                >
                                                    <div>
                                                        <p className="font-bold text-white">{rec.name}</p>
                                                        <p className="text-[10px] text-text-muted">{rec.email}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rec.role === 'teacher' ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20' : 'bg-sky-400/10 text-sky-400 border border-sky-400/20'}`}>
                                                        {rec.role}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected recipient badge */}
                            {selectedRecipient && (
                                <div className="p-3 bg-navy-mid/60 border border-gold-primary/30 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase font-bold tracking-wider mb-0.5">
                                            {lang === "am" ? "የተመረጠ ተቀባይ" : "Selected Recipient"}
                                        </p>
                                        <p className="text-sm font-bold text-white">
                                            {selectedRecipient.name} ({selectedRecipient.email})
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRecipient(null)}
                                        className="text-xs text-error hover:underline font-bold"
                                    >
                                        {lang === "am" ? "ቀይር" : "Change"}
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Message input */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-text-secondary uppercase">
                                    {lang === "am" ? "መልዕክት" : "Message"}
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                    placeholder={lang === "am" ? "መልዕክትዎን እዚህ ይጻፉ..." : "Type your message to support inbox..."}
                                    className="w-full px-4 py-3 bg-navy-mid border border-navy-border rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-gold-primary resize-none transition-colors"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-2 flex justify-end gap-3 border-t border-navy-border">
                                <button
                                    type="button"
                                    onClick={() => setIsNewMessageOpen(false)}
                                    className="px-5 py-2.5 border border-navy-border text-text-secondary rounded-xl text-xs font-bold hover:text-white hover:border-white/30 transition-all"
                                >
                                    {lang === "am" ? "ይቅር" : "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending || !selectedRecipient || !adminMessage.trim()}
                                    className="px-5 py-2.5 bg-gold-primary text-navy-deep font-bold rounded-xl text-xs hover:bg-gold-hover transition-all shadow-gold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {sending ? "..." : (lang === "am" ? "መልዕክት ላክ" : "Send Message")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
