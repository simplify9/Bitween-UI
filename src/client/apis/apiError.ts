// A rejected write comes back as either a validation map — { CODE: ["what went wrong"] } — or a
// problem detail. This pulls the first human sentence out of whichever it is.
//
// The middleware already toasts failures, but it toasts the raw JSON, which tells a reader nothing
// they can act on. A form that knows why its save was refused can say so where the reader is
// looking.
export const apiErrorMessage = (error: unknown, fallback: string): string => {
    const data = (error as { data?: unknown } | undefined)?.data;

    if (typeof data === "string" && data.trim()) return data;

    if (data && typeof data === "object")
        for (const value of Object.values(data as Record<string, unknown>)) {
            if (typeof value === "string" && value.trim()) return value;
            if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
        }

    return fallback;
};
