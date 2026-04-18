export default function DashboardHeader({ timelineCount }) {
    return (
        <header
            style={{
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 8,
                marginBottom: 12,
            }}
        >
            <h1 style={{ marginTop: 0, marginBottom: 12 }}>Dashboard</h1>
            <p style={{ marginTop: 0, marginBottom: 12 }}>
                Toplam olay: {timelineCount}
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(140px, 1fr))",
                    gap: 8,
                    marginBottom: 12,
                }}
            >
                <select defaultValue="all" aria-label="Kisi filtresi">
                    <option value="all">Kisi (yakinda)</option>
                </select>
                <select defaultValue="all" aria-label="Tur filtresi">
                    <option value="all">Tur (yakinda)</option>
                </select>
                <select defaultValue="all" aria-label="Zaman filtresi">
                    <option value="all">Zaman (yakinda)</option>
                </select>
            </div>
        </header>
    );
}
