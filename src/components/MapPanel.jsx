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
        <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <button
                onClick={onClose}
                aria-label="Harita panelini kapat"
                className="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
                ✕
            </button>

            <h2 className="mb-1 mt-0 pr-10 text-lg font-semibold text-slate-100">
                Harita Kısmı
            </h2>
            <p className="mb-2 mt-0 text-sm text-slate-400">
                Haritada gösterilecek kayıt: {mapEvents.length}
            </p>

            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-700">
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
                                    <div className="min-w-220px">
                                        <div className="mb-1.5 text-xs text-slate-500">
                                            🕒 {event.timestampString || "-"}
                                        </div>
                                        <div className="mb-2 text-sm font-semibold text-slate-800">
                                            {markerStyle.icon}{" "}
                                            {getPopupTitle(event)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEventDetails(event.eventKey)
                                            }
                                            className="w-full rounded-md border border-slate-300 bg-slate-100 py-1 text-xs font-medium text-slate-700 hover:bg-white"
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
