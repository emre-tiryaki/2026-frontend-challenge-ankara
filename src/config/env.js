// src/config.js
export const config = {
    baseUrl: import.meta.env.VITE_JOTFORM_BASE_URL || "https://api.jotform.com",

    // Form ID'lerini merkezi bir objede tutuyoruz
    formIds: {
        checkins: import.meta.env.VITE_CHECKINS,
        messages: import.meta.env.VITE_MESSAGES,
        sightings: import.meta.env.VITE_SIGHTINGS,
        personalNotes: import.meta.env.VITE_PERSONAL_NOTES,
        anonymousTips: import.meta.env.VITE_ANONYMOUS_TIPS,
    },

    // API Key'leri bir diziye alıyoruz ki aralarında geçiş yapabilelim
    apiKeys: [
        import.meta.env.VITE_KEY_1,
        import.meta.env.VITE_KEY_2,
        import.meta.env.VITE_KEY_3,
    ].filter(Boolean), // Sadece tanımlı olan key'leri tutar
};
