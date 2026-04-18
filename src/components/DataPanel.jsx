import { useMemo, useState } from "react";
import { useInvestigation } from "../context/useInvestigation";

const TYPE_META = {
    checkin: {
        icon: "📍",
        label: "Check-in",
        border: "#2ea44f",
        bg: "#f2fff6",
    },
    message: {
        icon: "✉️",
        label: "Mesaj",
        border: "#1f6feb",
        bg: "#f2f8ff",
    },
    sighting: {
        icon: "👀",
        label: "Görülme",
        border: "#e67e22",
        bg: "#fff7ef",
    },
    note: {
        icon: "📝",
        label: "Not",
        border: "#8e44ad",
        bg: "#fbf4ff",
    },
    tip: {
        icon: "🕵️",
        label: "İhbar",
        border: "#c0392b",
        bg: "#fff3f2",
    },
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

function renderEventDetail(event) {
    switch (event.type) {
        case "checkin":
            return (
                <>
                    <p>
                        <strong>Kişi:</strong> {event.person || "-"}
                    </p>
                    <p>
                        <strong>Not:</strong> {event.note || "-"}
                    </p>
                </>
            );
        case "message":
            return (
                <>
                    <p>
                        <strong>Gönderen:</strong> {event.sender || "-"}
                    </p>
                    <p>
                        <strong>Alıcı:</strong> {event.recipient || "-"}
                    </p>
                    <p>
                        <strong>Mesaj:</strong> {event.text || "-"}
                    </p>
                    <p>
                        <strong>Aciliyet:</strong> {event.urgency || "-"}
                    </p>
                </>
            );
        case "sighting":
            return (
                <>
                    <p>
                        <strong>Kişi:</strong> {event.person || "-"}
                    </p>
                    <p>
                        <strong>Görüldüğü kişi:</strong> {event.seenWith || "-"}
                    </p>
                    <p>
                        <strong>Gözlem:</strong> {event.note || "-"}
                    </p>
                </>
            );
        case "note":
            return (
                <>
                    <p>
                        <strong>Yazar:</strong> {event.author || "-"}
                    </p>
                    <p>
                        <strong>Bahsi geçenler:</strong>{" "}
                        {event.mentionedPeople?.length
                            ? event.mentionedPeople.join(", ")
                            : "-"}
                    </p>
                    <p>
                        <strong>Not:</strong> {event.note || "-"}
                    </p>
                </>
            );
        case "tip":
            return (
                <>
                    <p>
                        <strong>Şüpheli:</strong> {event.suspect || "-"}
                    </p>
                    <p>
                        <strong>İhbar:</strong> {event.tipText || "-"}
                    </p>
                    <p>
                        <strong>Güvenilirlik:</strong> {event.confidence || "-"}
                    </p>
                </>
            );
        default:
            return <p>Detay bilgisi yok.</p>;
    }
}

export default function DataPanel({ onClose }) {
    const { filteredEvents } = useInvestigation();
    const [selectedEvent, setSelectedEvent] = useState(null);

    const modalMeta = useMemo(() => {
        if (!selectedEvent) return null;
        return TYPE_META[selectedEvent.type] || TYPE_META.note;
    }, [selectedEvent]);

    return (
        <>
            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 12,
                    height: "100%",
                    overflow: "auto",
                    position: "relative",
                    background: "#ffffff",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Veri panelini kapat"
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 28,
                        height: 28,
                    }}
                >
                    ✕
                </button>

                <h2 style={{ marginTop: 0, marginBottom: 6 }}>Veri Kısmı</h2>
                <p style={{ marginTop: 0, color: "#5b6475" }}>
                    Filtrelenmiş olay: {filteredEvents.length}
                </p>

                {filteredEvents.length === 0 ? (
                    <p>Gösterilecek veri yok.</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: 10,
                        }}
                    >
                        {filteredEvents.map((event) => {
                            const meta =
                                TYPE_META[event.type] || TYPE_META.note;

                            return (
                                <button
                                    type="button"
                                    key={`${event.type}-${event.id}`}
                                    onClick={() => setSelectedEvent(event)}
                                    style={{
                                        textAlign: "left",
                                        border: `1px solid ${meta.border}`,
                                        borderRadius: 10,
                                        background: meta.bg,
                                        padding: 10,
                                        cursor: "pointer",
                                        minHeight: 132,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <strong>
                                            {meta.icon} {meta.label}
                                        </strong>
                                        <span
                                            style={{
                                                color: "#6c7386",
                                                fontSize: 12,
                                            }}
                                        >
                                            {event.timestampString || "-"}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            fontWeight: 600,
                                            marginBottom: 6,
                                            color: "#1f2430",
                                        }}
                                    >
                                        {getEventTitle(event)}
                                    </div>

                                    <p
                                        style={{
                                            margin: 0,
                                            color: "#444a58",
                                            fontSize: 13,
                                            lineHeight: 1.35,
                                        }}
                                    >
                                        {getEventSummary(event)}
                                    </p>

                                    <p
                                        style={{
                                            marginTop: 8,
                                            marginBottom: 0,
                                            fontSize: 12,
                                            color: "#5b6475",
                                        }}
                                    >
                                        📌 {event.location || "Bilinmiyor"}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedEvent && modalMeta && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(9, 13, 24, 0.48)",
                        display: "grid",
                        placeItems: "center",
                        padding: 16,
                        zIndex: 60,
                    }}
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "min(640px, 96vw)",
                            borderRadius: 12,
                            border: `2px solid ${modalMeta.border}`,
                            background: "#fff",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: "10px 14px",
                                background: modalMeta.bg,
                                borderBottom: `1px solid ${modalMeta.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <strong>
                                {modalMeta.icon} {modalMeta.label} Detayı
                            </strong>
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                style={{ width: 28, height: 28 }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ padding: 14 }}>
                            <p>
                                <strong>Zaman:</strong>{" "}
                                {selectedEvent.timestampString || "-"}
                            </p>
                            <p>
                                <strong>Konum:</strong>{" "}
                                {selectedEvent.location || "-"}
                            </p>

                            {renderEventDetail(selectedEvent)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
