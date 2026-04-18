import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useInvestigation } from "../context/useInvestigation";

export default function FinalVerdictModal() {
    const {
        peopleOptions,
        finalVerdict,
        isFinalVerdictModalOpen,
        saveFinalVerdict,
        closeFinalVerdictModal,
    } = useInvestigation();
    const [suspectName, setSuspectName] = useState(
        finalVerdict?.suspectName || peopleOptions[0] || "",
    );
    const [actionText, setActionText] = useState(
        finalVerdict?.actionText || "",
    );
    const [evidenceText, setEvidenceText] = useState(
        finalVerdict?.evidenceText || "",
    );
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isFinalVerdictModalOpen || typeof document === "undefined") return;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                closeFinalVerdictModal();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isFinalVerdictModalOpen, closeFinalVerdictModal]);

    const previewLabel = useMemo(() => {
        if (!finalVerdict?.suspectName) return null;
        return `${finalVerdict.suspectName} için kayıtlı teori`;
    }, [finalVerdict]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedSuspect = suspectName.trim();
        const normalizedAction = actionText.trim();
        const normalizedEvidence = evidenceText.trim();

        if (!normalizedSuspect) {
            setErrorMessage("Lütfen bir şüpheli seçin.");
            return;
        }

        if (!normalizedAction) {
            setErrorMessage("Lütfen ne yaptığını yazın.");
            return;
        }

        saveFinalVerdict({
            suspectName: normalizedSuspect,
            actionText: normalizedAction,
            evidenceText: normalizedEvidence,
        });
        setErrorMessage("");
    };

    if (!isFinalVerdictModalOpen || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[6500] grid place-items-center bg-slate-950/75 p-4"
            onClick={closeFinalVerdictModal}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-[min(720px,96vw)] overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900 text-slate-100 shadow-2xl shadow-black/40"
            >
                <div className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-5 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">
                            Sonuç Formu
                        </p>
                        <h2 className="text-lg font-semibold text-slate-50">
                            Katili işaretle, eylemini yaz
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={closeFinalVerdictModal}
                        className="grid h-9 w-9 place-items-center rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    >
                        ✕
                    </button>
                </div>

                <form className="space-y-4 p-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                        <label className="block space-y-2 text-sm text-slate-200">
                            <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                                Kimin yaptığı
                            </span>
                            <select
                                value={suspectName}
                                onChange={(event) =>
                                    setSuspectName(event.target.value)
                                }
                                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-amber-400"
                            >
                                <option value="">Şüpheli seçin</option>
                                {peopleOptions.map((person) => (
                                    <option key={person} value={person}>
                                        {person}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Kayıt durumu
                            </p>
                            {previewLabel ? (
                                <>
                                    <p className="mt-2 font-medium text-amber-100">
                                        {previewLabel}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Son güncelleme:{" "}
                                        {finalVerdict?.updatedAt
                                            ? new Date(
                                                  finalVerdict.updatedAt,
                                              ).toLocaleString("tr-TR")
                                            : "-"}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-2 text-slate-400">
                                    Henüz bir teori kaydedilmedi.
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="block space-y-2 text-sm text-slate-200">
                        <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                            Ne yaptı
                        </span>
                        <textarea
                            value={actionText}
                            onChange={(event) =>
                                setActionText(event.target.value)
                            }
                            rows={4}
                            placeholder="Örn: O gece toplantı sonrası mesajla yönlendirdi, delilleri sakladı..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-amber-400"
                        />
                    </label>

                    <label className="block space-y-2 text-sm text-slate-200">
                        <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                            Dayanak notu
                        </span>
                        <textarea
                            value={evidenceText}
                            onChange={(event) =>
                                setEvidenceText(event.target.value)
                            }
                            rows={3}
                            placeholder="Bu sonuca neden vardığını kısa not olarak yaz."
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-amber-400"
                        />
                    </label>

                    {errorMessage && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                        <button
                            type="button"
                            onClick={closeFinalVerdictModal}
                            className="h-10 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 hover:bg-slate-700"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="h-10 rounded-lg border border-amber-500/40 bg-amber-500 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-400"
                        >
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}
