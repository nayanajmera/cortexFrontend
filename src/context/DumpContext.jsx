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

    const isFetchingRef = useRef(false);

    // Pure event-driven caching: fetch once on boot, reuse in-memory afterwards
    const fetchDumps = useCallback(async (force = false) => {
        // If already cached in memory and not forced, 0 network requests
        if (hasLoaded && !force) {
            return;
        }

        // Prevent concurrent in-flight requests
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        // Only show loading spinner on initial fetch when there is no cached data at all
        if (!hasLoaded) {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await api.get("/dumps");
            setDumps(res.data);
            setHasLoaded(true);
        } catch (err) {
            console.error("Error fetching dumps:", err);
            if (!hasLoaded) {
                setError("Error loading notes");
            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    }, [hasLoaded]);

    // Helpers to keep cache in sync via local events
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
