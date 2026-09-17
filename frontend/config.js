(function (root) {

    // Backend API hosted on Render.
    // NOTE: the backend must enable CORS for your frontend's domain
    // (set the CORS_ORIGINS env var on Render) for cross-origin calls
    // to work from Vercel/Netlify.
    var config = {
        API_BASE_URL: "https://research-api-lioc.onrender.com",
        FRONTEND_BASE_URL: ""
    };

    for (var key in config) {
        if (Object.prototype.hasOwnProperty.call(config, key)) {
            root[key] = config[key];
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = config;
    }

})(typeof window !== "undefined" ? window : globalThis);