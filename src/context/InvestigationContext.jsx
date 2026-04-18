import { useMemo, useState, useCallback } from "react";
import { InvestigationContext } from "./investigationContextObject";
import { fileStorageService } from "../services/fileStorageService";
import { finalVerdictService } from "../services/finalVerdictService";

const EVENT_TYPE_OPTIONS = [
    { value: "checkin", label: "📍 Check-in'ler" },
    { value: "message", label: "✉️ Mesajlar" },
    { value: "sighting", label: "👀 Görülmeler" },
    { value: "note", label: "📝 Notlar" },
    { value: "tip", label: "🕵️ İhbarlar" },
];

const EMPTY_RANGE = { min: 0, max: 0 };

const normalizePersonNames = (event) => {
    const names = [];

    if (event.person) names.push(event.person);
    if (event.sender) names.push(event.sender);
    if (event.recipient) names.push(event.recipient);
    if (event.suspect) names.push(event.suspect);
    if (event.author) names.push(event.author);

    if (Array.isArray(event.mentionedPeople)) {
        names.push(...event.mentionedPeople);
    }

    return names.map((name) => String(name).trim()).filter(Boolean);
};

const getEventTimestamp = (event) => {
    if (
        event?.dateObj instanceof Date &&
        !Number.isNaN(event.dateObj.getTime())
    ) {
        return event.dateObj.getTime();
    }

    if (typeof event?.dateObj === "string") {
        const parsed = new Date(event.dateObj).getTime();
        return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
};

const getEventKey = (event) => `${event.type}-${event.id}`;

export function InvestigationProvider({ initialEvents, children }) {
    const allEvents = initialEvents;

    const peopleOptions = useMemo(() => {
        const people = new Set();

        allEvents.forEach((event) => {
            normalizePersonNames(event).forEach((name) => people.add(name));
        });

        return Array.from(people).sort((a, b) => a.localeCompare(b, "tr"));
    }, [allEvents]);

    const availableTypeValues = useMemo(() => {
        const available = new Set(allEvents.map((event) => event.type));
        return EVENT_TYPE_OPTIONS.filter((type) => available.has(type.value));
    }, [allEvents]);

    const timeBounds = useMemo(() => {
        const timestamps = allEvents
            .map(getEventTimestamp)
            .filter((value) => typeof value === "number");

        if (timestamps.length === 0) return EMPTY_RANGE;

        return {
            min: Math.min(...timestamps),
            max: Math.max(...timestamps),
        };
    }, [allEvents]);

    const [selectedPeopleState, setSelectedPeopleState] = useState(null);
    const [selectedTypesState, setSelectedTypesState] = useState(null);
    const [timeRangeState, setTimeRangeState] = useState(null);
    const [focusedEventKey, setFocusedEventKey] = useState(null);
    const [modalEventKey, setModalEventKey] = useState(null);
    const [allFiles, setAllFiles] = useState(() =>
        fileStorageService.getAllFiles(),
    );
    const [openCanvasFileId, setOpenCanvasFileId] = useState(null);
    const [finalVerdict, setFinalVerdict] = useState(() =>
        finalVerdictService.getFinalVerdict(),
    );
    const [isFinalVerdictModalOpen, setIsFinalVerdictModalOpen] =
        useState(false);

    const selectedPeople = useMemo(() => {
        if (selectedPeopleState === null) return peopleOptions;

        const optionSet = new Set(peopleOptions);
        return selectedPeopleState.filter((name) => optionSet.has(name));
    }, [selectedPeopleState, peopleOptions]);

    const selectedTypes = useMemo(() => {
        const allTypeValues = availableTypeValues.map((item) => item.value);
        if (selectedTypesState === null) return allTypeValues;

        const typeSet = new Set(allTypeValues);
        return selectedTypesState.filter((type) => typeSet.has(type));
    }, [selectedTypesState, availableTypeValues]);

    const timeRange = useMemo(() => {
        if (timeRangeState === null) return timeBounds;

        return {
            min: Math.max(
                timeBounds.min,
                Math.min(timeRangeState.min, timeRangeState.max),
            ),
            max: Math.min(
                timeBounds.max,
                Math.max(timeRangeState.min, timeRangeState.max),
            ),
        };
    }, [timeRangeState, timeBounds]);

    const setSelectedPeople = (updater) => {
        const previous = selectedPeople;
        const next =
            typeof updater === "function" ? updater(previous) : updater;

        if (next === null) {
            setSelectedPeopleState(null);
            return;
        }

        setSelectedPeopleState(Array.isArray(next) ? next : []);
    };

    const setSelectedTypes = (updater) => {
        const previous = selectedTypes;
        const next =
            typeof updater === "function" ? updater(previous) : updater;

        if (next === null) {
            setSelectedTypesState(null);
            return;
        }

        setSelectedTypesState(Array.isArray(next) ? next : []);
    };

    const setTimeRange = (updater) => {
        const previous = timeRange;
        const next =
            typeof updater === "function" ? updater(previous) : updater;

        if (!next || typeof next !== "object") {
            setTimeRangeState(null);
            return;
        }

        setTimeRangeState({
            min: Number(next.min),
            max: Number(next.max),
        });
    };

    const filteredEvents = useMemo(() => {
        if (allEvents.length === 0) return [];

        const selectedPeopleSet = new Set(selectedPeople);
        const selectedTypeSet = new Set(selectedTypes);

        return allEvents.filter((event) => {
            if (!selectedTypeSet.has(event.type)) return false;

            const timestamp = getEventTimestamp(event);
            if (timestamp === null) return false;
            if (timestamp < timeRange.min || timestamp > timeRange.max)
                return false;

            const eventPeople = normalizePersonNames(event);
            return eventPeople.some((name) => selectedPeopleSet.has(name));
        });
    }, [allEvents, selectedPeople, selectedTypes, timeRange]);

    const filteredEventsWithCoordinates = useMemo(() => {
        return filteredEvents.filter((event) => {
            const lat = Number(event.lat);
            const lng = Number(event.lng);

            return Number.isFinite(lat) && Number.isFinite(lng);
        });
    }, [filteredEvents]);

    const modalEvent = useMemo(() => {
        if (!modalEventKey) return null;
        return (
            allEvents.find((event) => getEventKey(event) === modalEventKey) ||
            null
        );
    }, [allEvents, modalEventKey]);

    const openEventDetails = (eventKey) => {
        setModalEventKey(eventKey);
        setFocusedEventKey(eventKey);
    };

    const closeEventDetails = () => {
        setModalEventKey(null);
    };

    const currentFile = useMemo(() => {
        if (!openCanvasFileId) return null;
        return allFiles.find((f) => f.id === openCanvasFileId) || null;
    }, [allFiles, openCanvasFileId]);

    const createNewFile = useCallback((name) => {
        const newFile = fileStorageService.createFile(name);
        setAllFiles(fileStorageService.getAllFiles());
        return newFile;
    }, []);

    const renameFile = useCallback((fileId, newName) => {
        fileStorageService.renameFile(fileId, newName);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const deleteFile = useCallback(
        (fileId) => {
            fileStorageService.deleteFile(fileId);
            setAllFiles(fileStorageService.getAllFiles());
            if (openCanvasFileId === fileId) {
                setOpenCanvasFileId(null);
            }
        },
        [openCanvasFileId],
    );

    const addEvidenceToFile = useCallback((fileId, eventId, eventType) => {
        fileStorageService.addEvidenceToFile(fileId, eventId, eventType);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const removeEvidenceFromFile = useCallback((fileId, evidenceKey) => {
        fileStorageService.removeEvidenceFromFile(fileId, evidenceKey);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const updateEvidencePosition = useCallback((fileId, evidenceKey, x, y) => {
        fileStorageService.updateEvidencePosition(fileId, evidenceKey, x, y);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const addConnection = useCallback((fileId, source, target, label = "") => {
        fileStorageService.addConnection(fileId, source, target, label);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const deleteConnection = useCallback((fileId, connectionId) => {
        fileStorageService.deleteConnection(fileId, connectionId);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const updateConnectionLabel = useCallback((fileId, connectionId, label) => {
        fileStorageService.updateConnectionLabel(fileId, connectionId, label);
        setAllFiles(fileStorageService.getAllFiles());
    }, []);

    const openCanvas = useCallback((fileId) => {
        setOpenCanvasFileId(fileId);
    }, []);

    const closeCanvas = useCallback(() => {
        setOpenCanvasFileId(null);
    }, []);

    const openFinalVerdictModal = useCallback(() => {
        setIsFinalVerdictModalOpen(true);
    }, []);

    const closeFinalVerdictModal = useCallback(() => {
        setIsFinalVerdictModalOpen(false);
    }, []);

    const saveFinalVerdict = useCallback((verdict) => {
        const savedVerdict = finalVerdictService.saveFinalVerdict(verdict);
        setFinalVerdict(savedVerdict);
        setIsFinalVerdictModalOpen(false);
        return savedVerdict;
    }, []);

    const clearFinalVerdict = useCallback(() => {
        finalVerdictService.clearFinalVerdict();
        setFinalVerdict(null);
    }, []);

    const value = {
        caseTitle: "Ankara 18 Nisan: Case #2610",
        allEvents,
        filteredEvents,
        filteredEventsWithCoordinates,
        peopleOptions,
        typeOptions: availableTypeValues,
        selectedPeople,
        selectedTypes,
        timeBounds,
        timeRange,
        setSelectedPeople,
        setSelectedTypes,
        setTimeRange,
        focusedEventKey,
        setFocusedEventKey,
        modalEvent,
        openEventDetails,
        closeEventDetails,
        getEventKey,
        allFiles,
        currentFile,
        openCanvasFileId,
        finalVerdict,
        isFinalVerdictModalOpen,
        createNewFile,
        renameFile,
        deleteFile,
        addEvidenceToFile,
        removeEvidenceFromFile,
        updateEvidencePosition,
        addConnection,
        deleteConnection,
        updateConnectionLabel,
        openCanvas,
        closeCanvas,
        openFinalVerdictModal,
        closeFinalVerdictModal,
        saveFinalVerdict,
        clearFinalVerdict,
    };

    return (
        <InvestigationContext.Provider value={value}>
            {children}
        </InvestigationContext.Provider>
    );
}
