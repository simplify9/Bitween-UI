import { useEffect, useRef } from "react";
import authConfig from "src/authConfig";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CHECK_INTERVAL_MS = 30 * 1000;    // re-check every 30s
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
// Shared so activity in any tab keeps every tab alive (see the interval below).
const LAST_ACTIVITY_KEY = "last_activity";

const readSharedActivity = (): number => {
    try {
        return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
    } catch {
        return 0; // storage unavailable: fall back to this tab's own timer
    }
};

const writeSharedActivity = (ts: number) => {
    try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(ts));
    } catch {
        // ignore: the in-tab ref still tracks activity
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Logs the user out after a period of no activity in any tab. Reuses the existing
// logout handler (server logout + clear token + reload), so an idle session behaves
// exactly like clicking Sign Out.
export const useIdleLogout = (enabled: boolean, timeoutMs: number = IDLE_TIMEOUT_MS) => {
    const lastActivity = useRef<number>(Date.now());

    useEffect(() => {
        if (!enabled) return;

        // Start counting from the moment we become enabled. The ref is created when
        // App first mounts, which is while the login page is showing and no activity
        // listeners are attached, so without this a login page left open longer than
        // timeoutMs would log the user out immediately after signing in.
        const enabledAt = Date.now();
        lastActivity.current = enabledAt;
        writeSharedActivity(enabledAt);

        const markActivity = () => {
            const ts = Date.now();
            lastActivity.current = ts;
            writeSharedActivity(ts);
        };
        ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, markActivity, { passive: true }));

        const interval = window.setInterval(async () => {
            // Activity events only fire in the focused tab, so take the most recent
            // activity across tabs. Otherwise a background tab would log out a user
            // who is actively working in another one.
            const last = Math.max(lastActivity.current, readSharedActivity());
            if (Date.now() - last < timeoutMs) return;

            window.clearInterval(interval);
            ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, markActivity));
            try {
                await authConfig.logOutHandler();       // server logout + clear + reload
            } catch {
                // Only the server call invalidates the refresh-token cookie (it is
                // HttpOnly, so JS cannot clear it). Retry once before giving up.
                await sleep(2000);
                try {
                    await authConfig.logOutHandler();
                } catch {
                    localStorage.removeItem("access_token"); // safety net if the call fails
                    window.location.reload();
                }
            }
        }, CHECK_INTERVAL_MS);

        return () => {
            window.clearInterval(interval);
            ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, markActivity));
        };
    }, [enabled, timeoutMs]);
};
