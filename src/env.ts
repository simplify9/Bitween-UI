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
}
export default ENV

