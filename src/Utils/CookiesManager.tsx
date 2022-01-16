const accessTokenName = "accessToken";
const refreshTokenName = "refreshToken";
const localeName = "locale"


const C = {
    getAccessToken: () => getCookieValue(accessTokenName),
    getLocale: () => getCookieValue(localeName),
    getRefreshToken: () => getCookieValue(refreshTokenName),
    setAccessToken: (val: string) => setCookieValue(accessTokenName, val),
    setLocale: (val: string) => setCookieValue(localeName, val),
    setRefreshToken: (val: string) => setCookieValue(refreshTokenName, val),
    setCookieValue: (name: string, val: string) => setCookieValue(name, val),
    setCookieValues,
    getCookieValue,
    deleteAllCookies,
    deleteCookie,
};
export default C;
function deleteAllCookies() {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

function setCookieValue(key: string, value: string): void {
    document.cookie = `${key}=${value}; path=/;`;
}

function deleteCookie(cookieName: string) {
    document.cookie = `${cookieName}=; expires=${new Date().toUTCString()}; path=/;`;
}

function getCookieDictionary(cookie: string): { [k: string]: string } {
    return cookie
        .split(";")
        .map((cv) => cv.split("="))
        .reduce<{ [k: string]: string }>((pv, cv) => {
            const pvCopy = {
                ...pv,
            };
            pvCopy[cv[0].trim()] = cv[1];
            return pvCopy;
        }, {});
}

function setCookieValues(values: { [k: string]: string }) {
    for (let entry in Object.entries(values)) {
        setCookieValue(entry[0], entry[1]);
    }
}

function getCookieValue(key: string): string {
    const val = getCookieDictionary(document.cookie)[key];

    return val;
}
