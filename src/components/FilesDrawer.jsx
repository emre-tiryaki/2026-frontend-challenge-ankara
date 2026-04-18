import { useContext, useState, useRef } from "react";
import { InvestigationContext } from "../context/investigationContextObject";

export default function FilesDrawer() {
    const { allFiles, openCanvas, createNewFile, renameFile, deleteFile } =
        useContext(InvestigationContext);

    const [isOpen, setIsOpen] = useState(false);
    const [renamingId, setRenamingId] = useState(null);
    const [newName, setNewName] = useState("");
    const renameInputRef = useRef(null);

    const handleCreateNewFile = () => {
        const name = prompt("Dosya adı:");
        if (name && name.trim()) {
            createNewFile(name.trim());
        }
    };

    const handleRename = (file) => {
        setRenamingId(file.id);
        setNewName(file.name);
        setTimeout(() => renameInputRef.current?.focus(), 0);
    };

    const saveRename = () => {
        if (newName.trim() && renamingId) {
            renameFile(renamingId, newName.trim());
        }
        setRenamingId(null);
        setNewName("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            saveRename();
        } else if (e.key === "Escape") {
            setRenamingId(null);
            setNewName("");
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-0 left-1/2 z-900 -translate-x-1/2 transform rounded-t-2xl border-b-0 border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium text-slate-200 shadow-xl hover:bg-slate-800 transition-colors"
            >
                📂 Dosyalar ({allFiles.length}){isOpen ? " ▲" : " ▼"}
            </button>

            {/* Drawer Panel */}
            {isOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-950 max-h-[60vh] overflow-hidden bg-slate-950 shadow-2xl border-t-2 border-slate-800">
                    <div className="h-full overflow-y-auto p-4">
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-100">
                                Dedektif Dosyaları
                            </h3>
                            <button
                                onClick={handleCreateNewFile}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                                + Yeni Dosya
                            </button>
                        </div>

                        {/* Files Grid */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {allFiles.length === 0 ? (
                                <div className="col-span-full py-8 text-center text-slate-400">
                                    Henüz dosya oluşturmadınız. "+ Yeni Dosya"
                                    ile başlayın.
                                </div>
                            ) : (
                                allFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="group relative rounded-xl border border-slate-700 bg-linear-to-br from-slate-900 to-slate-800 p-4 hover:border-slate-600 hover:shadow-lg transition-all"
                                    >
                                        {/* File Name */}
                                        {renamingId === file.id ? (
                                            <input
                                                ref={renameInputRef}
                                                type="text"
                                                value={newName}
                                                onChange={(e) =>
                                                    setNewName(e.target.value)
                                                }
                                                onBlur={saveRename}
                                                onKeyDown={handleKeyDown}
                                                className="mb-2 w-full rounded bg-slate-700 px-2 py-1 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Dosya adı..."
                                            />
                                        ) : (
                                            <div
                                                onDoubleClick={() =>
                                                    handleRename(file)
                                                }
                                                className="mb-2 cursor-text select-none text-sm font-semibold text-slate-100 hover:text-blue-400 transition-colors"
                                            >
                                                📁 {file.name}
                                            </div>
                                        )}

                                        {/* File Info */}
                                        <div className="mb-3 text-xs text-slate-400">
                                            <div>
                                                Deliller:{" "}
                                                {file.savedEvidences.length}
                                            </div>
                                            <div>
                                                Bağlantılar:{" "}
                                                {file.connections.length}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() =>
                                                    openCanvas(file.id)
                                                }
                                                className="flex-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                                            >
                                                🖼️ Aç
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRename(file)
                                                }
                                                className="flex-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
                                            >
                                                ✏️ Düzenle
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            `"${file.name}" dosyasını silmek istediğinize emin misiniz?`,
                                                        )
                                                    ) {
                                                        deleteFile(file.id);
                                                    }
                                                }}
                                                className="flex-1 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay when drawer is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-900 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
