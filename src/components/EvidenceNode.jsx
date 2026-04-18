import { Handle, Position } from "reactflow";

const TYPE_COLORS = {
    checkin: { bg: "#103422", border: "#2ea44f", text: "#d8ffe8", icon: "📍" },
    message: { bg: "#10243d", border: "#1f6feb", text: "#deebff", icon: "✉️" },
    sighting: {
        bg: "#3a220f",
        border: "#e67e22",
        text: "#ffe7cf",
        icon: "👀",
    },
    note: { bg: "#2b1336", border: "#8e44ad", text: "#efd8ff", icon: "📝" },
    tip: { bg: "#3c1513", border: "#c0392b", text: "#ffd9d6", icon: "🕵️" },
};

function getEventTitle(event) {
    if (event.person) return event.person;
    if (event.sender && event.recipient)
        return `${event.sender} → ${event.recipient}`;
    if (event.author) return event.author;
    if (event.suspect) return event.suspect;
    return "Bilinmiyor";
}

export default function EvidenceNode({ data }) {
    const { event, onDelete } = data;
    if (!event) return null;

    const colors = TYPE_COLORS[event.type] || TYPE_COLORS.note;

    return (
        <div
            className="rounded-lg border-2 p-3 shadow-lg"
            style={{
                background: colors.bg,
                borderColor: colors.border,
                color: colors.text,
                minWidth: "200px",
                maxWidth: "240px",
            }}
        >
            {/* Connection Handles */}
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />

            {/* Header */}
            <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{colors.icon}</span>
                    <span className="text-xs font-semibold uppercase opacity-75">
                        {event.type}
                    </span>
                </div>
                <button
                    onClick={() => onDelete()}
                    className="text-lg opacity-50 hover:opacity-100 transition-opacity"
                    title="Delili kaldır"
                >
                    ✕
                </button>
            </div>

            {/* Title */}
            <h4 className="mb-1 line-clamp-2 text-sm font-bold">
                {getEventTitle(event)}
            </h4>

            {/* Time */}
            <p className="mb-2 text-xs opacity-70">
                {event.timestampString || "-"}
            </p>

            {/* Location */}
            {event.location && (
                <p className="text-xs opacity-70">📍 {event.location}</p>
            )}

            {/* Preview */}
            <p className="mt-2 line-clamp-2 text-xs opacity-80">
                {event.note || event.text || event.tipText || "-"}
            </p>
        </div>
    );
}
