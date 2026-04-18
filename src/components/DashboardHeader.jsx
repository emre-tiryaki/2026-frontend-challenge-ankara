import { useMemo, useState } from "react";
import { useInvestigation } from "../context/useInvestigation";

const formatTime = (timestamp) => {
    if (!timestamp) return "--:--";

    return new Date(timestamp).toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function DashboardHeader() {
    const {
        caseTitle,
        allEvents,
        peopleOptions,
        typeOptions,
        selectedPeople,
        selectedTypes,
        timeBounds,
        timeRange,
        setSelectedPeople,
        setSelectedTypes,
        setTimeRange,
    } = useInvestigation();
    const [openMenu, setOpenMenu] = useState(null);

    const allPeopleSelected =
        peopleOptions.length > 0 &&
        selectedPeople.length === peopleOptions.length;

    const allTypesSelected =
        typeOptions.length > 0 && selectedTypes.length === typeOptions.length;

    const togglePerson = (person) => {
        setSelectedPeople((prev) => {
            if (prev.includes(person))
                return prev.filter((item) => item !== person);
            return [...prev, person];
        });
    };

    const toggleType = (type) => {
        setSelectedTypes((prev) => {
            if (prev.includes(type))
                return prev.filter((item) => item !== type);
            return [...prev, type];
        });
    };

    const updateMinTime = (nextMin) => {
        setTimeRange((prev) => ({
            min: Math.min(nextMin, prev.max),
            max: prev.max,
        }));
    };

    const updateMaxTime = (nextMax) => {
        setTimeRange((prev) => ({
            min: prev.min,
            max: Math.max(nextMax, prev.min),
        }));
    };

    const hasTimeRange = timeBounds.max > timeBounds.min;
    const sliderMin = hasTimeRange ? timeBounds.min : 0;
    const sliderMax = hasTimeRange ? timeBounds.max : 1;

    const rangeLeftPercent = useMemo(() => {
        if (!hasTimeRange) return 0;
        return (
            ((timeRange.min - timeBounds.min) /
                (timeBounds.max - timeBounds.min)) *
            100
        );
    }, [hasTimeRange, timeRange.min, timeBounds.min, timeBounds.max]);

    const rangeRightPercent = useMemo(() => {
        if (!hasTimeRange) return 100;
        return (
            ((timeRange.max - timeBounds.min) /
                (timeBounds.max - timeBounds.min)) *
            100
        );
    }, [hasTimeRange, timeRange.max, timeBounds.min, timeBounds.max]);

    return (
        <>
            <style>
                {`
                .range-shell { position: relative; height: 34px; }
                .range-track { position: absolute; left: 0; right: 0; top: 15px; height: 4px; background: #d9dce6; border-radius: 4px; }
                .range-selected { position: absolute; top: 15px; height: 4px; background: #2f6fed; border-radius: 4px; }
                .dual-range { position: absolute; left: 0; right: 0; top: 0; width: 100%; margin: 0; appearance: none; background: transparent; pointer-events: none; }
                .dual-range::-webkit-slider-runnable-track { height: 4px; background: transparent; }
                .dual-range::-moz-range-track { height: 4px; background: transparent; }
                .dual-range::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #2f6fed; border: 2px solid #fff; box-shadow: 0 0 0 1px #2f6fed; margin-top: -5px; pointer-events: auto; cursor: pointer; }
                .dual-range::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #2f6fed; border: 2px solid #fff; box-shadow: 0 0 0 1px #2f6fed; pointer-events: auto; cursor: pointer; }
                `}
            </style>
            <header
                style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minHeight: 88,
                    position: "relative",
                    zIndex: 5,
                }}
            >
                <div
                    style={{
                        minWidth: 320,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <div style={{ fontSize: 30, lineHeight: 1 }}>🐱</div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 19 }}>{caseTitle}</h1>
                        <p
                            style={{
                                margin: "4px 0 0 0",
                                color: "#5b6475",
                                fontSize: 13,
                            }}
                        >
                            Toplam veri: {allEvents.length}
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 0,
                    }}
                >
                    <div style={{ position: "relative", minWidth: 230 }}>
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu((prev) =>
                                    prev === "people" ? null : "people",
                                )
                            }
                            style={{ width: "100%", height: 38 }}
                        >
                            {allPeopleSelected
                                ? `Kişi: Hepsi (${peopleOptions.length})`
                                : `Kişi: ${selectedPeople.length} seçili`}
                        </button>

                        {openMenu === "people" && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 42,
                                    left: 0,
                                    width: "100%",
                                    maxHeight: 260,
                                    overflow: "auto",
                                    border: "1px solid #d7dbe7",
                                    borderRadius: 8,
                                    background: "#fff",
                                    padding: 10,
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                                }}
                            >
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={allPeopleSelected}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                setSelectedPeople(
                                                    peopleOptions,
                                                );
                                            } else {
                                                setSelectedPeople([]);
                                            }
                                        }}
                                    />{" "}
                                    Hepsi
                                </label>

                                {peopleOptions.map((person) => (
                                    <label
                                        key={person}
                                        style={{
                                            display: "block",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPeople.includes(
                                                person,
                                            )}
                                            onChange={() =>
                                                togglePerson(person)
                                            }
                                        />{" "}
                                        {person}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ position: "relative", minWidth: 230 }}>
                        <button
                            type="button"
                            onClick={() =>
                                setOpenMenu((prev) =>
                                    prev === "types" ? null : "types",
                                )
                            }
                            style={{ width: "100%", height: 38 }}
                        >
                            {allTypesSelected
                                ? "Tür: Hepsi açık"
                                : `Tür: ${selectedTypes.length} seçili`}
                        </button>

                        {openMenu === "types" && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 42,
                                    left: 0,
                                    width: "100%",
                                    maxHeight: 260,
                                    overflow: "auto",
                                    border: "1px solid #d7dbe7",
                                    borderRadius: 8,
                                    background: "#fff",
                                    padding: 10,
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                                }}
                            >
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 8,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={allTypesSelected}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                setSelectedTypes(
                                                    typeOptions.map(
                                                        (type) => type.value,
                                                    ),
                                                );
                                            } else {
                                                setSelectedTypes([]);
                                            }
                                        }}
                                    />{" "}
                                    Hepsi
                                </label>

                                {typeOptions.map((type) => (
                                    <label
                                        key={type.value}
                                        style={{
                                            display: "block",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(
                                                type.value,
                                            )}
                                            onChange={() =>
                                                toggleType(type.value)
                                            }
                                        />{" "}
                                        {type.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            minWidth: 300,
                            padding: "8px 10px",
                            border: "1px solid #e2e6f0",
                            borderRadius: 8,
                            background: "#fafbff",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                marginBottom: 6,
                                color: "#5b6475",
                            }}
                        >
                            Zaman: {formatTime(timeRange.min)} -{" "}
                            {formatTime(timeRange.max)}
                        </div>

                        <div className="range-shell">
                            <div className="range-track" />
                            <div
                                className="range-selected"
                                style={{
                                    left: `${rangeLeftPercent}%`,
                                    right: `${100 - rangeRightPercent}%`,
                                }}
                            />
                            <input
                                className="dual-range"
                                type="range"
                                min={sliderMin}
                                max={sliderMax}
                                step={60000}
                                value={Math.min(timeRange.min, timeRange.max)}
                                onChange={(event) =>
                                    updateMinTime(Number(event.target.value))
                                }
                                disabled={!hasTimeRange}
                            />
                            <input
                                className="dual-range"
                                type="range"
                                min={sliderMin}
                                max={sliderMax}
                                step={60000}
                                value={Math.max(timeRange.min, timeRange.max)}
                                onChange={(event) =>
                                    updateMaxTime(Number(event.target.value))
                                }
                                disabled={!hasTimeRange}
                            />
                        </div>
                    </div>
                </div>

                <button type="button" style={{ height: 38, minWidth: 92 }}>
                    Sıfırla
                </button>
            </header>
        </>
    );
}
