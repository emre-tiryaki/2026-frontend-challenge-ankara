import { useCallback, useEffect, useState } from "react";
import { apiService } from "./services/apiService";
import { combineAndSortAllData } from "./services/dataParser";
import Dashboard from "./components/Dashboard";
import { storageService } from "./services/storageService";

function App() {
    const cachedTimeline = storageService.getTimeline();
    const [timeline, setTimeline] = useState(cachedTimeline);
    const [loading, setLoading] = useState(cachedTimeline.length === 0);
    const [error, setError] = useState(null);

    const fetchTimeline = useCallback(async () => {
        const [checkinsData, messagesData, sightingsData, notesData, tipsData] =
            await Promise.all([
                apiService.getCheckins(),
                apiService.getMessages(),
                apiService.getSightings(),
                apiService.getPersonalNotes(),
                apiService.getAnonymousTips(),
            ]);

        return combineAndSortAllData({
            checkins: checkinsData,
            messages: messagesData,
            sightings: sightingsData,
            notes: notesData,
            tips: tipsData,
        });
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const sortedEvents = await fetchTimeline();
            setTimeline(sortedEvents);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Beklenmeyen bir hata oluştu.",
            );
        } finally {
            setLoading(false);
        }
    }, [fetchTimeline]);

    useEffect(() => {
        let cancelled = false;

        const initialLoad = async () => {
            try {
                const sortedEvents = await fetchTimeline();
                if (cancelled) return;
                setTimeline(sortedEvents);
            } catch (err) {
                if (cancelled) return;
                if (cachedTimeline.length === 0) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Beklenmeyen bir hata oluştu.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        initialLoad();

        return () => {
            cancelled = true;
        };
    }, [fetchTimeline, cachedTimeline.length]);

    useEffect(() => {
        storageService.setTimeline(timeline);
    }, [timeline]);

    if (loading) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Loading...</h1>
                <p>Veriler hazırlanıyor.</p>
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Yükleme Hatası</h1>
                <p>{error}</p>
                <button onClick={loadData}>Tekrar Dene</button>
            </main>
        );
    }

    return <Dashboard timeline={timeline} />;
}

export default App;
