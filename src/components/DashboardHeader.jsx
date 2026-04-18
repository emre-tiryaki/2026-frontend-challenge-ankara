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
        finalVerdict,
        openFinalVerdictModal,
    } = useInvestigation();

    const [openMenu, setOpenMenu] = useState(null);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

    const showFilters = isMobileFiltersOpen;

    return (
        <header className="relative z-1200 rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-2xl shadow-black/20 backdrop-blur md:p-4">
            <div className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-xl">
                        🐱
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-sm font-semibold text-slate-100 md:text-base">
                            {caseTitle}
                        </h1>
                        <p className="text-xs text-slate-400">
                            Toplam veri: {allEvents.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openFinalVerdictModal}
                        className="hidden h-9 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 text-xs font-medium text-amber-100 hover:bg-amber-500/25 md:block"
                    >
                        {finalVerdict ? "Teoriyi Güncelle" : "Katil Bul"}
                    </button>

                    <button
                        type="button"
                        className="hidden h-9 min-w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 md:block"
                    >
                        Sıfırla
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                    className="h-9 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 md:hidden"
                >
                    {showFilters ? "Filtreleri Gizle" : "Filtreleri Göster"}
                </button>
            </div>

            <div
                className={`${showFilters ? "mt-3 grid" : "hidden"} grid-cols-1 gap-2 md:mt-3 md:grid md:grid-cols-[minmax(200px,0.9fr)_minmax(200px,0.9fr)_minmax(280px,1.2fr)_auto] md:items-center`}
            >
                <div className="relative min-w-0">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenMenu((prev) =>
                                prev === "people" ? null : "people",
                            )
                        }
                        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-left text-xs text-slate-200 hover:bg-slate-700"
                    >
                        {allPeopleSelected
                            ? `Kişi: Hepsi (${peopleOptions.length})`
                            : `Kişi: ${selectedPeople.length} seçili`}
                    </button>

                    {openMenu === "people" && (
                        <div className="absolute left-0 top-11 z-1300 max-h-72 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl shadow-black/40">
                            <label className="mb-2 block text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={allPeopleSelected}
                                    onChange={(event) => {
                                        if (event.target.checked)
                                            setSelectedPeople(peopleOptions);
                                        else setSelectedPeople([]);
                                    }}
                                />
                                Hepsi
                            </label>

                            {peopleOptions.map((person) => (
                                <label
                                    key={person}
                                    className="mb-2 block text-sm text-slate-300"
                                >
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedPeople.includes(
                                            person,
                                        )}
                                        onChange={() => togglePerson(person)}
                                    />
                                    {person}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative min-w-0">
                    <button
                        type="button"
                        onClick={() =>
                            setOpenMenu((prev) =>
                                prev === "types" ? null : "types",
                            )
                        }
                        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-left text-xs text-slate-200 hover:bg-slate-700"
                    >
                        {allTypesSelected
                            ? "Tür: Hepsi açık"
                            : `Tür: ${selectedTypes.length} seçili`}
                    </button>

                    {openMenu === "types" && (
                        <div className="absolute left-0 top-11 z-1300 max-h-72 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl shadow-black/40">
                            <label className="mb-2 block text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mr-2"
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
                                />
                                Hepsi
                            </label>

                            {typeOptions.map((type) => (
                                <label
                                    key={type.value}
                                    className="mb-2 block text-sm text-slate-300"
                                >
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedTypes.includes(
                                            type.value,
                                        )}
                                        onChange={() => toggleType(type.value)}
                                    />
                                    {type.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2">
                    <div className="mb-2 text-xs text-slate-400">
                        Zaman: {formatTime(timeRange.min)} -{" "}
                        {formatTime(timeRange.max)}
                    </div>

                    <div className="range-shell-dark">
                        <div className="range-track-dark" />
                        <div
                            className="range-selected-dark"
                            style={{
                                left: `${rangeLeftPercent}%`,
                                right: `${100 - rangeRightPercent}%`,
                            }}
                        />
                        <input
                            className="dual-range-dark"
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
                            className="dual-range-dark"
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

                <button
                    type="button"
                    onClick={openFinalVerdictModal}
                    className="h-10 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 text-xs font-medium text-amber-100 hover:bg-amber-500/25 md:hidden"
                >
                    {finalVerdict ? "Teoriyi Güncelle" : "Suçluyu Bul"}
                </button>

                <button
                    type="button"
                    className="h-10 min-w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 md:hidden"
                >
                    Sıfırla
                </button>
            </div>
        </header>
    );
}
