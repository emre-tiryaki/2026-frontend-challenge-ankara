const KEYS = {
    timeline: "detective_timeline_cache_v1",
    layout: "detective_dashboard_layout_v1",
};

const isBrowser = () => typeof window !== "undefined";

const safeParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const storageService = {
    getTimeline() {
        if (!isBrowser()) return [];

        const raw = window.localStorage.getItem(KEYS.timeline);
        if (!raw) return [];

        const parsed = safeParse(raw, []);
        if (!Array.isArray(parsed)) return [];

        return parsed.map((event) => ({
            ...event,
            dateObj: event?.dateObj ? new Date(event.dateObj) : null,
        }));
    },

    setTimeline(timeline) {
        if (!isBrowser()) return;
        window.localStorage.setItem(KEYS.timeline, JSON.stringify(timeline));
    },

    getLayout() {
        if (!isBrowser()) {
            return { isDataOpen: true, isMapOpen: true, split: 55 };
        }

        const raw = window.localStorage.getItem(KEYS.layout);
        if (!raw) {
            return { isDataOpen: true, isMapOpen: true, split: 55 };
        }

        const parsed = safeParse(raw, {
            isDataOpen: true,
            isMapOpen: true,
            split: 55,
        });

        return {
            isDataOpen: Boolean(parsed.isDataOpen),
            isMapOpen: Boolean(parsed.isMapOpen),
            split: Number.isFinite(parsed.split) ? parsed.split : 55,
        };
    },

    setLayout(layout) {
        if (!isBrowser()) return;
        window.localStorage.setItem(KEYS.layout, JSON.stringify(layout));
    },
};
