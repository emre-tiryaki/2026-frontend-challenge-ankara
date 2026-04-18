import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { useInvestigation } from "../context/useInvestigation";
import EvidenceNode from "./EvidenceNode";

const nodeTypes = {
    evidence: EvidenceNode,
};

export default function CanvasPanel() {
    const {
        currentFile,
        closeCanvas,
        updateEvidencePosition,
        removeEvidenceFromFile,
        addConnection,
        allEvents,
    } = useInvestigation();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);

    // Build nodes and edges from currentFile
    useMemo(() => {
        if (!currentFile) return;

        const newNodes = currentFile.savedEvidences
            .map((evidenceKey) => {
                const [type, id] = evidenceKey.split("-");
                const event = allEvents.find(
                    (e) => e.type === type && e.id === id,
                );

                if (!event) return null;

                const position = currentFile.layout[evidenceKey] || {
                    x: 100,
                    y: 100,
                };

                return {
                    id: evidenceKey,
                    type: "evidence",
                    position,
                    data: {
                        event,
                        onDelete: () => {
                            removeEvidenceFromFile(currentFile.id, evidenceKey);
                        },
                    },
                };
            })
            .filter(Boolean);

        const newEdges = currentFile.connections.map((conn) => ({
            id: conn.id,
            source: conn.source,
            target: conn.target,
            label: conn.label || "",
            animated: true,
            style: { stroke: "#64748b", strokeWidth: 2 },
            markerEnd: { type: "arrowclosed", color: "#64748b" },
            data: { connectionId: conn.id },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
    }, [currentFile, allEvents, setNodes, setEdges, removeEvidenceFromFile]);

    const onNodeDragStop = useCallback(
        (event, node) => {
            if (currentFile) {
                updateEvidencePosition(
                    currentFile.id,
                    node.id,
                    node.position.x,
                    node.position.y,
                );
            }
        },
        [currentFile, updateEvidencePosition],
    );

    const onConnect = useCallback(
        (connection) => {
            if (currentFile) {
                addConnection(
                    currentFile.id,
                    connection.source,
                    connection.target,
                );
            }
            setEdges((eds) => addEdge(connection, eds));
        },
        [currentFile, addConnection, setEdges],
    );

    const onEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        setSelectedEdgeId(edge.id);
    }, []);

    if (!currentFile) return null;

    return (
        <div className="fixed inset-0 z-[4000] flex flex-col bg-slate-950">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 shadow-lg">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-100">
                        🕵️ Canvas: {currentFile.name}
                    </h2>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                        {currentFile.savedEvidences.length} Delil
                    </span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={closeCanvas}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                        ← Kapat
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-slate-900">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDragStop={onNodeDragStop}
                    onConnect={onConnect}
                    onEdgeClick={onEdgeClick}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <CanvasContent
                        selectedEdgeId={selectedEdgeId}
                        setSelectedEdgeId={setSelectedEdgeId}
                    />
                    <Background color="#1e293b" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}

function CanvasContent({ selectedEdgeId, setSelectedEdgeId }) {
    const { currentFile, updateConnectionLabel } = useInvestigation();

    return (
        <>
            {selectedEdgeId && (
                <EdgeLabelEditor
                    edgeId={selectedEdgeId}
                    fileId={currentFile.id}
                    onClose={() => setSelectedEdgeId(null)}
                    updateConnectionLabel={updateConnectionLabel}
                />
            )}
        </>
    );
}

function EdgeLabelEditor({ edgeId, fileId, onClose, updateConnectionLabel }) {
    const [label, setLabel] = useState("");

    const handleSave = () => {
        updateConnectionLabel(fileId, edgeId, label);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-5000 grid place-items-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-96 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            >
                <h3 className="mb-4 text-lg font-bold text-slate-100">
                    İp Notu
                </h3>
                <input
                    autoFocus
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") onClose();
                    }}
                    placeholder="Bu bağlantı hakkında not yazın..."
                    className="mb-4 w-full rounded-lg bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        Kaydet
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
}
