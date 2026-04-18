import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useInvestigation } from "../context/useInvestigation";

const TYPE_META = {
    checkin: {
        icon: "📍",
        label: "Check-in",
        border: "#2ea44f",
        bg: "#f2fff6",
    },
    message: { icon: "✉️", label: "Mesaj", border: "#1f6feb", bg: "#f2f8ff" },
    sighting: {
        icon: "👀",
        label: "Görülme",
        border: "#e67e22",
        bg: "#fff7ef",
    },
    note: { icon: "📝", label: "Not", border: "#8e44ad", bg: "#fbf4ff" },
    tip: { icon: "🕵️", label: "İhbar", border: "#c0392b", bg: "#fff3f2" },
};

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

export default function EventDetailModal() {
    const { modalEvent, closeEventDetails } = useInvestigation();

    const modalMeta = useMemo(() => {
        if (!modalEvent) return null;
        return TYPE_META[modalEvent.type] || TYPE_META.note;
    }, [modalEvent]);

    if (!modalEvent || !modalMeta || typeof document === "undefined")
        return null;

    return createPortal(
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
                zIndex: 5000,
            }}
            onClick={closeEventDetails}
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
                        onClick={closeEventDetails}
                        style={{ width: 28, height: 28 }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: 14 }}>
                    <p>
                        <strong>Zaman:</strong>{" "}
                        {modalEvent.timestampString || "-"}
                    </p>
                    <p>
                        <strong>Konum:</strong> {modalEvent.location || "-"}
                    </p>
                    {renderEventDetail(modalEvent)}
                </div>
            </div>
        </div>,
        document.body,
    );
}
