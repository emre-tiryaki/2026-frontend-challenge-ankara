import { useInvestigation } from "../context/useInvestigation";

const TYPE_META = {
    checkin: {
        icon: "📍",
        label: "Check-in",
        border: "#2ea44f",
        bg: "#103422",
    },
    message: { icon: "✉️", label: "Mesaj", border: "#1f6feb", bg: "#10253f" },
    sighting: {
        icon: "👀",
        label: "Görülme",
        border: "#e67e22",
        bg: "#3a2310",
    },
    note: { icon: "📝", label: "Not", border: "#8e44ad", bg: "#2a1335" },
    tip: { icon: "🕵️", label: "İhbar", border: "#c0392b", bg: "#3e1714" },
};

function getEventTitle(event) {
    switch (event.type) {
        case "checkin":
            return event.person || "Bilinmeyen kişi";
        case "message":
            return `${event.sender || "Bilinmeyen"} ➜ ${event.recipient || "Bilinmeyen"}`;
        case "sighting":
            return event.person || "Bilinmeyen kişi";
        case "note":
            return event.author || "Bilinmeyen yazar";
        case "tip":
            return event.suspect || "Bilinmeyen şüpheli";
        default:
            return "Bilinmeyen olay";
    }
}

function getEventSummary(event) {
    switch (event.type) {
        case "checkin":
            return event.note || "Not yok";
        case "message":
            return event.text || "Mesaj içeriği yok";
        case "sighting":
            return event.note || "Gözlem notu yok";
        case "note":
            return event.note || "Not içeriği yok";
        case "tip":
            return event.tipText || "İhbar içeriği yok";
        default:
            return "Detay yok";
    }
}

export default function DataPanel({ onClose }) {
    const {
        filteredEvents,
        focusedEventKey,
        setFocusedEventKey,
        openEventDetails,
        getEventKey,
    } = useInvestigation();

    return (
        <section className="relative h-full overflow-auto rounded-2xl border border-slate-800 bg-slate-900 p-3 text-slate-100">
            <button
                onClick={onClose}
                aria-label="Veri panelini kapat"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
                ✕
            </button>

            <h2 className="mb-1 mt-0 pr-10 text-lg font-semibold">
                Delil Kartları
            </h2>
            <p className="mt-0 text-sm text-slate-400">
                Filtrelenmiş olay: {filteredEvents.length}
            </p>

            {filteredEvents.length === 0 ? (
                <p className="text-sm text-slate-400">Gösterilecek veri yok.</p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                    {filteredEvents.map((event) => {
                        const eventKey = getEventKey(event);
                        const meta = TYPE_META[event.type] || TYPE_META.note;

                        return (
                            <button
                                type="button"
                                key={eventKey}
                                onClick={() => {
                                    setFocusedEventKey(eventKey);
                                    openEventDetails(eventKey);
                                }}
                                className="rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5"
                                style={{
                                    borderColor:
                                        focusedEventKey === eventKey
                                            ? meta.border
                                            : `${meta.border}99`,
                                    boxShadow:
                                        focusedEventKey === eventKey
                                            ? `0 0 0 2px ${meta.border}33`
                                            : "none",
                                    background:
                                        focusedEventKey === eventKey
                                            ? `linear-gradient(180deg, ${meta.bg} 0%, #0f172a 100%)`
                                            : `linear-gradient(180deg, ${meta.bg}cc 0%, #0b1220 100%)`,
                                }}
                            >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <strong className="text-sm text-slate-100">
                                        {meta.icon} {meta.label}
                                    </strong>
                                    <span className="text-[11px] text-slate-400">
                                        {event.timestampString || "-"}
                                    </span>
                                </div>

                                <div className="mb-1.5 text-sm font-semibold text-slate-100">
                                    {getEventTitle(event)}
                                </div>

                                <p className="m-0 text-xs leading-5 text-slate-300">
                                    {getEventSummary(event)}
                                </p>

                                <p className="mb-0 mt-2 text-[11px] text-slate-400">
                                    📌 {event.location || "Bilinmiyor"}
                                </p>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
