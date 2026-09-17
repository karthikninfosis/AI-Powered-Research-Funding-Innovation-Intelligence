// Shared auth helper — stores JWT in localStorage and
// sends it via Authorization header on cross-domain requests.

function authHeaders() {
    var token = localStorage.getItem("access_token");
    if (token) {
        return { "Authorization": "Bearer " + token };
    }
    return {};
}

async function authFetch(url, options) {
    options = options || {};
    var headers = Object.assign({}, authHeaders(), options.headers || {});
    options.headers = headers;
    options.credentials = options.credentials || "include";

    var res = await fetch(url, options);

    if (res.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/auth/login.html";
        throw new Error("Not authenticated");
    }

    return res;
}