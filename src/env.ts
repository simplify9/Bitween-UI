const ENV = {
    API_BASE_URL: "/api/",
    CONFIG: {
        XCHANGE_REFRESH_DEFAULT_INTERVAL: 5000,
        XCHANGE_REFRESH_DEFAULT_INTERVAL_OPTIONS: [
            {id: (5 * 1000), title: "5 Seconds"},
            {id: (30 * 1000), title: "30 Seconds"},
            {id: (60 * 1000), title: "1 Minute"},
            {id: (5 * 60 * 1000), title: "5 Minutes"}
        ]
    },
    THEME: {
        LOGIN_LOGO: "/Graphics/s9.png",
        BITWEEN_LOGO: "/Graphics/BitweenFull.svg",
        BITWEEEN_TEXT: "is all-in-one solution to solving integration with third parties, automating workflows\n" +
            "                                with exchanges coming from all forms of requests, ranging from internal messages to\n" +
            "                                files dumped on a server.",
        LINKEDIN_LINK: "https://www.linkedin.com/company/simplify9",
        GITHUB_LINK: "https://github.com/simplify9",
        BTIWEEN_ICON: "/Graphics/BitweenIcon.png",
        BITWEEN_HEADER_ICON: "/Graphics/BitweenIcon.svg",
        WEBSITE_LINK: "https://www.simplify9.com/",
        COMPANY_NAME: "Simplify9",
        ALL_RIGHTS_RESERVED: 'All Rights Reserved.',
        COPY_RIGHTS_ICON: '©',
        TAB_TITLE: "Bitween",
        TAB_ICON: "/favicon.ico"
    }
}
export default ENV

