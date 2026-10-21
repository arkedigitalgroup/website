// app/(auth)/layout.js
//
// Sign-in and registration are private account routes. They are reachable by
// anyone but must never be indexed, so indexing is disabled at the group level
// (the pages themselves are client components and cannot export metadata).

export const metadata = {
    title: "Sign in or create an account",
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default function AuthGroupLayout({ children }) {
    return children;
}
