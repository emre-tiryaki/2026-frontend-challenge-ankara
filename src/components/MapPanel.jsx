import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useInvestigation } from "../context/useInvestigation";

const DEFAULT_CENTER = [39.915, 32.85];
const DEFAULT_ZOOM = 12;

const TYPE_STYLES = {
    checkin: { color: "#2ea44f", icon: "📍", label: "Check-in" },
    message: { color: "#1f6feb", icon: "✉️", label: "Mesaj" },
    sighting: { color: "#e67e22", icon: "👀", label: "Görülme" },
    note: { color: "#8e44ad", icon: "📝", label: "Not" },
    tip: { color: "#c0392b", icon: "🕵️", label: "İhbar" },
};

function getPopupTitle(event) {
    switch (event.type) {
        case "message":
            return `${event.sender || "Bilinmeyen"} ➜ ${event.recipient || "Bilinmeyen"}`;
        case "checkin":
            return `${event.person || "Bilinmeyen"} check-in yaptı`;
        case "sighting":
            return `${event.person || "Bilinmeyen"} görüldü`;
        case "note":
            return `${event.author || "Bilinmeyen"} not bıraktı`;
        case "tip":
            return `${event.suspect || "Bilinmeyen"} hakkında ihbar`;
        default:
            return "Olay detayı";
    }
}

function buildMarkerIcon(type, isActive) {
    const style = TYPE_STYLES[type] || TYPE_STYLES.note;

    return L.divIcon({
        className: "event-pin-wrapper",
        html: `<div class="event-pin${isActive ? " event-pin--active" : ""}" style="background:${style.color};"><span>${style.icon}</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -14],
    });
}

function MapEffects({ events, focusedEventKey }) {
    const map = useMap();

    useEffect(() => {
        if (events.length === 0) {
            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
            return;
        }

        const bounds = L.latLngBounds(
            events.map((event) => [Number(event.lat), Number(event.lng)]),
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 16,
            animate: true,
        });
    }, [events, map]);

    useEffect(() => {
        if (!focusedEventKey) return;

        const focused = events.find(
            (event) => event.eventKey === focusedEventKey,
        );
        if (!focused) return;

        map.flyTo(
            [Number(focused.lat), Number(focused.lng)],
            Math.max(map.getZoom(), 15),
            {
                animate: true,
                duration: 0.7,
            },
        );
    }, [focusedEventKey, events, map]);

    return null;
}

export default function MapPanel({ onClose }) {
    const {
        filteredEventsWithCoordinates,
        focusedEventKey,
        setFocusedEventKey,
        openEventDetails,
        getEventKey,
    } = useInvestigation();

    const mapEvents = useMemo(() => {
        return filteredEventsWithCoordinates.map((event) => ({
            ...event,
            eventKey: getEventKey(event),
        }));
    }, [filteredEventsWithCoordinates, getEventKey]);

    return (
        <section
            style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                height: "100%",
                background: "#10141f",
                position: "relative",
                overflow: "hidden",
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

            <h2 style={{ marginTop: 0, marginBottom: 8, color: "#f5f8ff" }}>
                Harita Kısmı
            </h2>
            <p style={{ marginTop: 0, marginBottom: 10, color: "#a9b1c7" }}>
                Haritada gösterilecek kayıt: {mapEvents.length}
            </p>

            <div
                style={{
                    height: "calc(100% - 64px)",
                    borderRadius: 10,
                    overflow: "hidden",
                }}
            >
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    <MapEffects
                        events={mapEvents}
                        focusedEventKey={focusedEventKey}
                    />

                    {mapEvents.map((event) => {
                        const markerStyle =
                            TYPE_STYLES[event.type] || TYPE_STYLES.note;
                        const isActive = focusedEventKey === event.eventKey;

                        return (
                            <Marker
                                key={event.eventKey}
                                position={[
                                    Number(event.lat),
                                    Number(event.lng),
                                ]}
                                icon={buildMarkerIcon(event.type, isActive)}
                                eventHandlers={{
                                    click: () =>
                                        setFocusedEventKey(event.eventKey),
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: 220 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#697089",
                                                marginBottom: 6,
                                            }}
                                        >
                                            🕒 {event.timestampString || "-"}
                                        </div>
                                        <div
                                            style={{
                                                marginBottom: 8,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {markerStyle.icon}{" "}
                                            {getPopupTitle(event)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEventDetails(event.eventKey)
                                            }
                                            style={{ width: "100%" }}
                                        >
                                            Detayı İncele
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </section>
    );
}
