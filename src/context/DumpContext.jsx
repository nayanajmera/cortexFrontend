import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import api from "../utils/api";
import { AuthContext } from "./AuthContext";

export const DumpContext = createContext();

export const DumpProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [dumps, setDumps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Safeguards for background revalidation
    const isFetchingRef = useRef(false);
    const lastFetchedRef = useRef(0);
    const MIN_INTERVAL = 15000; // 15-second throttle to prevent excess network requests

    // Fetch dumps with client caching & safe background revalidation
    const fetchDumps = useCallback(async (force = false) => {
        const now = Date.now();

        // 1. Prevent overlapping requests
        if (isFetchingRef.current) return;

        // 2. Throttle background revalidation so we don't spam the server on rapid navigation
        if (hasLoaded && !force && (now - lastFetchedRef.current < MIN_INTERVAL)) {
            return;
        }

        // 3. Only show a visible loader on initial fetch when there is no cached data at all
        if (!hasLoaded) {
            setLoading(true);
        }

        isFetchingRef.current = true;
        setError(null);

        try {
            const res = await api.get("/dumps");
            lastFetchedRef.current = Date.now();

            // 4. Safe state update: never overwrite any in-flight optimistic notes
            setDumps((prev) => {
                const optimisticNotes = prev.filter(
                    (d) => d._id && d._id.toString().startsWith("temp-")
                );
                if (optimisticNotes.length === 0) {
                    return res.data;
                }
                const serverIds = new Set(res.data.map((d) => d._id));
                const pending = optimisticNotes.filter((o) => !serverIds.has(o._id));
                return [...pending, ...res.data];
            });

            setHasLoaded(true);
        } catch (err) {
            console.error("Error fetching dumps:", err);
            // 5. Silent failure during background sync so cached notes remain intact
            if (!hasLoaded) {
                setError("Error loading notes");
            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    }, [hasLoaded]);

    // Helpers to keep cache in sync
    const addDump = useCallback((newDump) => {
        setDumps((prev) => {
            // Avoid duplicates if already present
            if (prev.some((d) => d._id === newDump._id)) {
                return prev;
            }
            return [newDump, ...prev];
        });
    }, []);

    const replaceDump = useCallback((tempId, realDump) => {
        setDumps((prev) =>
            prev.map((dump) => (dump._id === tempId ? realDump : dump))
        );
    }, []);

    const restoreDump = useCallback((dump, index) => {
        setDumps((prev) => {
            if (typeof index === "number" && index >= 0 && index <= prev.length) {
                const next = [...prev];
                next.splice(index, 0, dump);
                return next;
            }
            return [dump, ...prev];
        });
    }, []);

    const updateDump = useCallback((updatedDump) => {
        setDumps((prev) =>
            prev.map((dump) => (dump._id === updatedDump._id ? updatedDump : dump))
        );
    }, []);

    const deleteDump = useCallback((dumpId) => {
        setDumps((prev) => prev.filter((dump) => dump._id !== dumpId));
    }, []);

    // Purge cache when user logs out or token changes
    useEffect(() => {
        if (!token) {
            setDumps([]);
            setHasLoaded(false);
            setLoading(false);
            setError(null);
            lastFetchedRef.current = 0;
            isFetchingRef.current = false;
        }
    }, [token]);

    return (
        <DumpContext.Provider
            value={{
                dumps,
                loading,
                hasLoaded,
                error,
                fetchDumps,
                addDump,
                replaceDump,
                restoreDump,
                updateDump,
                deleteDump,
                setDumps
            }}
        >
            {children}
        </DumpContext.Provider>
    );
};
