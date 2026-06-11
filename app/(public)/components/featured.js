"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

const tutors = [
    {
        type: "religious",
        name: "Abba Tewodros",
        credentials: "Geez Scholar",
        specialty: "Geez Language",
        bio: "Master of ancient Geez texts with 15+ years of teaching experience.",
        verified: true,
    },
    {
        type: "academic",
        name: "Dr. Addis Mehari",
        credentials: "PhD Mathematics",
        specialty: "Math Specialist",
        bio: "Oxford-trained mathematician dedicated to making math engaging.",
        verified: true,
    },
    {
        type: "religious",
        name: "Sister Almaz",
        credentials: "Zemaa Instructor",
        specialty: "Orthodox Hymns",
        bio: "Keeper of traditional hymns and cultural music heritage.",
        verified: true,
    },
    {
        type: "academic",
        name: "Mr. Samuel Bekele",
        credentials: "Science Educator",
        specialty: "Natural Sciences",
        bio: "Creative science teacher who makes labs exciting for students.",
        verified: true,
    },
    {
        type: "religious",
        name: "Prof. Yohannes",
        credentials: "Church History",
        specialty: "Theology & Ethics",
        bio: "University professor specializing in Orthodox theology.",
        verified: true,
    },
    {
        type: "academic",
        name: "Marta Desta",
        credentials: "English Specialist",
        specialty: "Languages",
        bio: "Native English speaker with passion for literature.",
        verified: true,
    },
];

export function FeaturesSection() {
    const [filter, setFilter] = useState("all");

    const filteredTutors =
        filter === "all" ? tutors : tutors.filter((t) => t.type === filter);

    return (
        <section id="tutors" className="py-20 bg-muted/30">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
                        Meet Our Tutors
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Verified experts committed to your child&apos;s success.
                    </p>

                    {/* Filter Tabs */}
                    <div className="flex gap-4 justify-center flex-wrap">
                        {["all", "religious", "academic"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-full font-medium transition-all capitalize ${
                                    filter === f
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background border border-border text-foreground hover:bg-muted"
                                }`}
                            >
                                {f === "all" ? "All Tutors" : `${f} Tutors`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTutors.map((tutor, index) => (
                        <div
                            key={index}
                            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                        >
                            {/* Avatar Placeholder */}
                            <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-center group-hover:opacity-80 transition">
                                <div className="text-center">
                                    <div className="text-5xl font-heading font-bold text-primary/40 mb-2">
                                        {tutor.name.split(" ")[0][0]}
                                        {tutor.name.split(" ")[1]?.[0]}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Profile Photo
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {tutor.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {tutor.credentials}
                                        </p>
                                    </div>
                                    {tutor.verified && (
                                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    )}
                                </div>

                                <div className="mb-4 inline-block px-3 py-1 bg-accent/20 border border-accent rounded-full">
                                    <span className="text-xs font-medium text-accent-foreground">
                                        {tutor.specialty}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground mb-6">
                                    {tutor.bio}
                                </p>

                                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
