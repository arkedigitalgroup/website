// app/(dashboard)/layout.js
//
// Admin, student and teacher dashboards contain private account data. They
// require authentication, but indexing is explicitly disabled here as a second
// line of defence alongside Firebase Security Rules.

export const metadata = {
    title: "Dashboard",
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

export default function DashboardGroupLayout({ children }) {
    return children;
}
