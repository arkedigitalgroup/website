/** @type {import('next-sitemap').IConfig} */
//
// Public sitemap/robots for the academic-first site.
//
// Only marketing pages are listed. Authentication, dashboards and API routes are
// excluded here and disallowed in robots.txt, and the matching route groups emit
// `noindex` metadata as a second line of defence.

const PUBLIC_PAGES = [
    "/",
    "/fidel",
    "/fidel/mathematics-tutoring",
    "/fidel/exam-preparation",
    "/about",
    "/contact",
    "/yeneta",
];

const PRIVATE_PREFIXES = [
    "/admin",
    "/student",
    "/teacher",
    "/login",
    "/register",
    "/api",
];

module.exports = {
    siteUrl: "https://www.arke-group.com",
    generateRobotsTxt: true,
    changefreq: "monthly",
    priority: 0.5,
    sitemapSize: 5000,

    exclude: [
        ...PRIVATE_PREFIXES,
        ...PRIVATE_PREFIXES.map((prefix) => `${prefix}/*`),
        "/404",
        "/500",
    ],

    additionalPaths: async (config) =>
        // `config.transform` is async; resolve every entry before returning, or
        // next-sitemap receives unresolved promises and drops the paths.
        Promise.all(PUBLIC_PAGES.map((path) => config.transform(config, path))),

    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/student",
                    "/student/",
                    "/teacher",
                    "/teacher/",
                    "/login",
                    "/register",
                    "/api",
                ],
            },
        ],
        // No `additionalSitemaps`: next-sitemap already references the sitemap
        // index it generates. Listing it again made sitemap.xml include itself.
    },

    transform: async (config, path) => {
        const priorities = {
            "/": 1.0,
            "/fidel": 0.9,
            "/fidel/mathematics-tutoring": 0.8,
            "/fidel/exam-preparation": 0.8,
            "/about": 0.6,
            "/contact": 0.5,
            // Yeneta is a real, maintained branch but not the main service.
            "/yeneta": 0.5,
        };

        const frequencies = {
            "/": "weekly",
            "/fidel": "weekly",
            "/fidel/mathematics-tutoring": "monthly",
            "/fidel/exam-preparation": "monthly",
            "/about": "monthly",
            "/contact": "yearly",
            "/yeneta": "monthly",
        };

        // `lastmod` is intentionally omitted. The previous config wrote the
        // build timestamp on every page, which claims that every page changed on
        // every deploy. Omit it rather than publish a false date.
        return {
            loc: path,
            changefreq: frequencies[path] ?? config.changefreq,
            priority: priorities[path] ?? config.priority,
            alternateRefs: [],
        };
    },
};
