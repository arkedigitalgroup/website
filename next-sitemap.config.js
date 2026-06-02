/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: "https://www.arke-group.com",
    generateRobotsTxt: true,
    changefreq: "weekly",
    priority: 0.7,
    sitemapSize: 5000,

    exclude: ["/login", "/register", "/register/*", "/api/*", "/404", "/500"],

    additionalPaths: async (config) => [
        await config.transform(config, "/"),
        await config.transform(config, "/about"),
        await config.transform(config, "/yeneta"),
        await config.transform(config, "/fidel"),
        await config.transform(config, "/contact"),
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/login", "/register", "/api"],
            },
        ],
        additionalSitemaps: ["https://www.arke-group.com/sitemap.xml"],
    },

    transform: async (config, path) => {
        const priorities = {
            "/": 1.0,
            "/yeneta": 0.9,
            "/fidel": 0.9,
            "/about": 0.8,
            "/contact": 0.8,
        };

        const frequencies = {
            "/": "daily",
            "/yeneta": "weekly",
            "/fidel": "weekly",
            "/about": "monthly",
            "/contact": "monthly",
        };

        return {
            loc: path,
            changefreq: frequencies[path] ?? config.changefreq,
            priority: priorities[path] ?? config.priority,
            lastmod: new Date().toISOString(),
            alternateRefs: [],
        };
    },
};
