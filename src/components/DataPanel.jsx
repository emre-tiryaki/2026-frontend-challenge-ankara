export default function DataPanel({ timeline, onClose }) {
    const previewItems = timeline.slice(0, 6);

    return (
        <section
            style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                height: "100%",
                overflow: "auto",
                position: "relative",
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

            <h2 style={{ marginTop: 0 }}>Veri Kismi</h2>
            <p style={{ marginTop: 0 }}>Toplam olay: {timeline.length}</p>

            {previewItems.length === 0 ? (
                <p>Gosterilecek veri yok.</p>
            ) : (
                <ul style={{ paddingLeft: 20 }}>
                    {previewItems.map((event) => (
                        <li
                            key={`${event.type}-${event.id}`}
                            style={{ marginBottom: 8 }}
                        >
                            <strong>{event.timestampString}</strong> -{" "}
                            {event.type} - {event.location}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
