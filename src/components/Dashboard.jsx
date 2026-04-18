import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DataPanel from "./DataPanel";
import MapPanel from "./MapPanel";
import EventDetailModal from "./EventDetailModal";
import FinalVerdictModal from "./FinalVerdictModal";
import FilesDrawer from "./FilesDrawer";
import CanvasPanel from "./CanvasPanel";
import { storageService } from "../services/storageService";
import { InvestigationProvider } from "../context/InvestigationContext";

const MIN_PANEL_WIDTH = 320;

function panelReducer(state, action) {
    if (action.type === "showOnly") {
        if (action.panel === "data") {
            return { isDataOpen: true, isMapOpen: false };
        }

        if (action.panel === "map") {
            return { isDataOpen: false, isMapOpen: true };
        }

        return state;
    }

    if (action.type !== "toggle") return state;

    if (action.panel === "data") {
        if (state.isDataOpen && !state.isMapOpen) {
            return { isDataOpen: false, isMapOpen: true };
        }

        return { ...state, isDataOpen: !state.isDataOpen };
    }

    if (action.panel === "map") {
        if (state.isMapOpen && !state.isDataOpen) {
            return { isDataOpen: true, isMapOpen: false };
        }

        return { ...state, isMapOpen: !state.isMapOpen };
    }

    return state;
}

export default function Dashboard({ timeline }) {
    const initialLayout = storageService.getLayout();
    const [panelState, dispatchPanel] = useReducer(panelReducer, {
        isDataOpen: initialLayout.isDataOpen,
        isMapOpen: initialLayout.isMapOpen,
    });
    const { isDataOpen, isMapOpen } = panelState;
    const [split, setSplit] = useState(initialLayout.split);
    const [isResizing, setIsResizing] = useState(false);
    const [contentWidth, setContentWidth] = useState(0);
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(max-width: 767px)").matches;
    });
    const [mobileActivePanel, setMobileActivePanel] = useState("data");
    const contentRef = useRef(null);

    useEffect(() => {
        storageService.setLayout({ isDataOpen, isMapOpen, split });
    }, [isDataOpen, isMapOpen, split]);

    const clampSplitByMinWidth = useCallback(
        (nextSplit) => {
            if (!contentWidth) return nextSplit;

            const minPercent = (MIN_PANEL_WIDTH / contentWidth) * 100;
            const boundedMin = Math.max(5, minPercent);
            const boundedMax = Math.min(95, 100 - minPercent);

            if (boundedMin > boundedMax) {
                return 50;
            }

            return Math.min(Math.max(nextSplit, boundedMin), boundedMax);
        },
        [contentWidth],
    );

    const togglePanel = (panel) => {
        dispatchPanel({ type: "toggle", panel });
    };

    const showOnlyPanel = (panel) => {
        dispatchPanel({ type: "showOnly", panel });
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const media = window.matchMedia("(max-width: 767px)");
        const onChange = (event) => setIsMobile(event.matches);
        media.addEventListener("change", onChange);

        return () => {
            media.removeEventListener("change", onChange);
        };
    }, []);

    useEffect(() => {
        if (!isMobile) return;

        if (mobileActivePanel === "data") {
            showOnlyPanel("data");
        } else {
            showOnlyPanel("map");
        }
    }, [isMobile, mobileActivePanel]);

    useEffect(() => {
        if (!(isResizing && isDataOpen && isMapOpen)) return;

        const onMouseMove = (event) => {
            const rect = contentRef.current?.getBoundingClientRect();
            if (!rect || rect.width === 0) return;

            const relativeX = event.clientX - rect.left;
            const percent = (relativeX / rect.width) * 100;
            setSplit(clampSplitByMinWidth(percent));
        };

        const onMouseUp = () => {
            setIsResizing(false);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isResizing, isDataOpen, isMapOpen, clampSplitByMinWidth]);

    useEffect(() => {
        const node = contentRef.current;
        if (!node) return;

        const updateWidth = () => {
            setContentWidth(node.getBoundingClientRect().width);
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, []);

    const effectiveSplit =
        isDataOpen && isMapOpen ? clampSplitByMinWidth(split) : split;

    const shouldShowData = isMobile ? mobileActivePanel === "data" : isDataOpen;
    const shouldShowMap = isMobile ? mobileActivePanel === "map" : isMapOpen;

    const switchMobilePanel = () => {
        setMobileActivePanel((prev) => (prev === "data" ? "map" : "data"));
    };

    return (
        <InvestigationProvider initialEvents={timeline}>
            <main className="h-screen overflow-hidden bg-slate-950 p-2 text-slate-100 md:p-3">
                <div className="flex h-full flex-col gap-2 md:gap-3">
                    <DashboardHeader />

                    <section
                        ref={contentRef}
                        className="relative flex min-h-0 w-full flex-1 overflow-hidden"
                    >
                        {!isMobile && !isDataOpen && (
                            <button
                                onClick={() => togglePanel("data")}
                                aria-label="Veri panelini ac"
                                className="absolute left-1 top-1/2 z-1400 h-12 w-7 -translate-y-1/2 rounded-md border border-slate-700 bg-slate-900/95 text-slate-200 shadow-lg"
                            >
                                {">"}
                            </button>
                        )}

                        {shouldShowData && (
                            <div
                                style={
                                    isMobile
                                        ? {
                                              flex: "1 1 auto",
                                              minWidth: 0,
                                              height: "100%",
                                              overflow: "hidden",
                                          }
                                        : {
                                              flex: isMapOpen
                                                  ? `0 0 ${effectiveSplit}%`
                                                  : "1 1 auto",
                                              minWidth: isMapOpen
                                                  ? MIN_PANEL_WIDTH
                                                  : 0,
                                              height: "100%",
                                              overflow: "hidden",
                                              paddingRight: isMapOpen ? 4 : 0,
                                          }
                                }
                            >
                                <DataPanel
                                    onClose={() => {
                                        if (isMobile) {
                                            setMobileActivePanel("map");
                                        } else {
                                            togglePanel("data");
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {!isMobile && isDataOpen && isMapOpen && (
                            <div
                                onMouseDown={() => setIsResizing(true)}
                                role="separator"
                                aria-label="Panel ayirici"
                                className={`mx-0.5 h-full w-2 flex-none rounded-md ${
                                    isResizing ? "bg-slate-500" : "bg-slate-700"
                                } cursor-col-resize`}
                            />
                        )}

                        {shouldShowMap && (
                            <div
                                style={
                                    isMobile
                                        ? {
                                              flex: "1 1 auto",
                                              minWidth: 0,
                                              height: "100%",
                                              overflow: "hidden",
                                          }
                                        : {
                                              flex: isDataOpen
                                                  ? `0 0 ${100 - effectiveSplit}%`
                                                  : "1 1 auto",
                                              minWidth: isDataOpen
                                                  ? MIN_PANEL_WIDTH
                                                  : 0,
                                              height: "100%",
                                              overflow: "hidden",
                                              paddingLeft: isDataOpen ? 4 : 0,
                                          }
                                }
                            >
                                <MapPanel
                                    onClose={() => {
                                        if (isMobile) {
                                            setMobileActivePanel("data");
                                        } else {
                                            togglePanel("map");
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {!isMobile && !isMapOpen && (
                            <button
                                onClick={() => togglePanel("map")}
                                aria-label="Harita panelini ac"
                                className="absolute right-1 top-1/2 z-1400 h-12 w-7 -translate-y-1/2 rounded-md border border-slate-700 bg-slate-900/95 text-slate-200 shadow-lg"
                            >
                                {"<"}
                            </button>
                        )}

                        {isMobile && (
                            <button
                                onClick={switchMobilePanel}
                                aria-label="Panel değiştir"
                                className="absolute right-2 top-1/2 z-30 h-14 w-8 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900/95 text-sm font-semibold text-slate-100 shadow-lg"
                            >
                                {mobileActivePanel === "data" ? ">" : "<"}
                            </button>
                        )}
                    </section>

                    <EventDetailModal />
                    <FinalVerdictModal />
                    <FilesDrawer />
                    <CanvasPanel />
                </div>
            </main>
        </InvestigationProvider>
    );
}
