import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DataPanel from "./DataPanel";
import MapPanel from "./MapPanel";
import { storageService } from "../services/storageService";

const MIN_PANEL_WIDTH = 320;

function panelReducer(state, action) {
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

    return (
        <main
            style={{
                padding: 12,
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            <DashboardHeader timelineCount={timeline.length} />

            <section
                ref={contentRef}
                style={{
                    display: "flex",
                    flex: 1,
                    width: "100%",
                    minHeight: 0,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {!isDataOpen && (
                    <button
                        onClick={() => togglePanel("data")}
                        aria-label="Veri panelini ac"
                        style={{
                            position: "absolute",
                            left: 4,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 28,
                            height: 48,
                            zIndex: 2,
                        }}
                    >
                        {">"}
                    </button>
                )}

                {isDataOpen && (
                    <div
                        style={{
                            flex: isMapOpen
                                ? `0 0 ${effectiveSplit}%`
                                : "1 1 auto",
                            minWidth: isMapOpen ? MIN_PANEL_WIDTH : 0,
                            height: "100%",
                            overflow: "hidden",
                            paddingRight: isMapOpen ? 4 : 0,
                        }}
                    >
                        <DataPanel
                            timeline={timeline}
                            onClose={() => togglePanel("data")}
                        />
                    </div>
                )}

                {isDataOpen && isMapOpen && (
                    <div
                        onMouseDown={() => setIsResizing(true)}
                        role="separator"
                        aria-label="Panel ayirici"
                        style={{
                            width: 8,
                            cursor: "col-resize",
                            background: isResizing ? "#d7d7d7" : "#ececec",
                            borderRadius: 6,
                            margin: "0 2px",
                            flex: "0 0 8px",
                        }}
                    />
                )}

                {isMapOpen && (
                    <div
                        style={{
                            flex: isDataOpen
                                ? `0 0 ${100 - effectiveSplit}%`
                                : "1 1 auto",
                            minWidth: isDataOpen ? MIN_PANEL_WIDTH : 0,
                            height: "100%",
                            overflow: "hidden",
                            paddingLeft: isDataOpen ? 4 : 0,
                        }}
                    >
                        <MapPanel onClose={() => togglePanel("map")} />
                    </div>
                )}

                {!isMapOpen && (
                    <button
                        onClick={() => togglePanel("map")}
                        aria-label="Harita panelini ac"
                        style={{
                            position: "absolute",
                            right: 4,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 28,
                            height: 48,
                            zIndex: 2,
                        }}
                    >
                        {"<"}
                    </button>
                )}
            </section>
        </main>
    );
}
