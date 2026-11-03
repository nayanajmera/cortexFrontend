import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../utils/api";
import { AuthContext } from "./AuthContext";

export const DumpContext = createContext();

export const DumpProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [dumps, setDumps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Fetch dumps with client caching
    const fetchDumps = useCallback(async (force = false) => {
        // If already cached and not forced, do not refetch
        if (hasLoaded && !force) {
            return;
        }

        // Only show loading spinner on initial fetch when there is no cached data
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
            setError("Error loading notes");
        } finally {
            setLoading(false);
        }
    }, [hasLoaded]);

    // Helpers to keep cache in sync
    const addDump = useCallback((newDump) => {
        setDumps((prev) => [newDump, ...prev]);
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
