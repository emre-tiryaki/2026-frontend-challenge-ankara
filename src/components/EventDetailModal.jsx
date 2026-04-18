import { useMemo } from "react";
import { createPortal } from "react-dom";
import { useInvestigation } from "../context/useInvestigation";

const TYPE_META = {
    checkin: {
        icon: "📍",
        label: "Check-in",
        border: "#2ea44f",
        bg: "#0f2c1d",
        text: "#d8ffe8",
    },
    message: {
        icon: "✉️",
        label: "Mesaj",
        border: "#1f6feb",
        bg: "#10243d",
        text: "#deebff",
    },
    sighting: {
        icon: "👀",
        label: "Görülme",
        border: "#e67e22",
        bg: "#3a220f",
        text: "#ffe7cf",
    },
    note: {
        icon: "📝",
        label: "Not",
        border: "#8e44ad",
        bg: "#2b1336",
        text: "#efd8ff",
    },
    tip: {
        icon: "🕵️",
        label: "İhbar",
        border: "#c0392b",
        bg: "#3c1513",
        text: "#ffd9d6",
    },
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
            className="fixed inset-0 z-[5000] grid place-items-center bg-slate-950/70 p-4"
            onClick={closeEventDetails}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-[min(680px,96vw)] overflow-hidden rounded-2xl border-2 bg-slate-900 text-slate-100"
                style={{ borderColor: modalMeta.border }}
            >
                <div
                    className="flex items-center justify-between border-b px-4 py-3"
                    style={{
                        background: modalMeta.bg,
                        borderColor: modalMeta.border,
                    }}
                >
                    <strong
                        className="text-sm md:text-base"
                        style={{ color: modalMeta.text }}
                    >
                        {modalMeta.icon} {modalMeta.label} Detayı
                    </strong>
                    <button
                        type="button"
                        onClick={closeEventDetails}
                        className="grid h-8 w-8 place-items-center rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-2 p-4 text-sm leading-6 text-slate-200 md:text-[15px]">
                    <p className="m-0">
                        <strong>Zaman:</strong>{" "}
                        {modalEvent.timestampString || "-"}
                    </p>
                    <p className="m-0">
                        <strong>Konum:</strong> {modalEvent.location || "-"}
                    </p>
                    {renderEventDetail(modalEvent)}
                </div>
            </div>
        </div>,
        document.body,
    );
}
