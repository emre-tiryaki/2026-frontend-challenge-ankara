const STORAGE_KEY = "investigationFinalVerdict";

const isBrowser = () => typeof window !== "undefined";

const safeParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const finalVerdictService = {
    getFinalVerdict() {
        if (!isBrowser()) return null;

        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = safeParse(raw, null);
        if (!parsed || typeof parsed !== "object") return null;

        return parsed;
    },

    saveFinalVerdict(verdict) {
        if (!isBrowser()) return null;

        const timestamp = new Date().toISOString();
        const nextVerdict = {
            ...verdict,
            createdAt: verdict?.createdAt || timestamp,
            updatedAt: timestamp,
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVerdict));

        return nextVerdict;
    },

    clearFinalVerdict() {
        if (!isBrowser()) return;

        window.localStorage.removeItem(STORAGE_KEY);
    },
};
