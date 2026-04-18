export default function Dashboard({ timeline }) {
    const previewItems = timeline.slice(0, 6);

    return (
        <main style={{ padding: 24 }}>
            <h1>Dashboard</h1>
            <p>Toplam olay sayısı: {timeline.length}</p>
            <h2>Kismi Veri Onizlemesi</h2>

            {previewItems.length === 0 ? (
                <p>Gosterilecek veri yok.</p>
            ) : (
                <ul style={{ paddingLeft: 20 }}>
                    {previewItems.map((event) => (
                        <li key={`${event.type}-${event.id}`} style={{ marginBottom: 10 }}>
                            <strong>{event.timestampString}</strong> - {event.type} - {event.location}
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
