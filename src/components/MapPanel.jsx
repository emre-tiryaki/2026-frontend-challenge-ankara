import { useInvestigation } from "../context/useInvestigation";

export default function MapPanel({ onClose }) {
    const { filteredEvents } = useInvestigation();

    return (
        <section
            style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                position: "relative",
            }}
        >
            <button
                onClick={onClose}
                aria-label="Harita panelini kapat"
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

            <div>
                <h2 style={{ marginTop: 0 }}>Harita Kismi</h2>
                <p>Harita bileşeni daha sonra eklenecek.</p>
                <p>Haritada gösterilecek kayıt: {filteredEvents.length}</p>
            </div>
        </section>
    );
}
