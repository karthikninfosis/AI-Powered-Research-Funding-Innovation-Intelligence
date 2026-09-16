(function (root) {

    var config = {
        API_BASE_URL: "http://192.168.1.13:8000",
        FRONTEND_BASE_URL: "http://192.168.1.13:5500"
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