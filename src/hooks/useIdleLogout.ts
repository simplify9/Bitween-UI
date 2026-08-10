import { useEffect, useRef } from "react";
import authConfig from "src/authConfig";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CHECK_INTERVAL_MS = 30 * 1000;    // re-check every 30s
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

// Logs the user out after a period of no activity. Reuses the existing logout
// handler (server logout + clear token + reload), so an idle session behaves
// exactly like clicking Sign Out.
export const useIdleLogout = (enabled: boolean, timeoutMs: number = IDLE_TIMEOUT_MS) => {
    const lastActivity = useRef<number>(Date.now());

    useEffect(() => {
        if (!enabled) return;

        const markActivity = () => { lastActivity.current = Date.now(); };
        ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, markActivity, { passive: true }));

        const interval = window.setInterval(async () => {
            if (Date.now() - lastActivity.current < timeoutMs) return;
            window.clearInterval(interval);
            ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, markActivity));
            try {
                await authConfig.logOutHandler();       // server logout + clear + reload
            } catch {
                localStorage.removeItem("access_token"); // safety net if the call fails
                window.location.reload();
            }
        }, CHECK_INTERVAL_MS);

        return () => {
            window.clearInterval(interval);
            ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, markActivity));
        };
    }, [enabled, timeoutMs]);
};
