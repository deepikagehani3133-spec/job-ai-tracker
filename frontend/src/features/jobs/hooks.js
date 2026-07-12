import { useCallback, useEffect, useState } from "react";
import {
    fetchJobs,
    fetchJobsMeta,
    createJob as apiCreate,
    updateJob as apiUpdate,
    deleteJob as apiDelete,
    archiveJob as apiArchive,
    bulkDeleteJobs as apiBulkDelete,
} from "./api";

/**
 * useJobs — list jobs with debounced search, status filter, and pagination.
 * @param {object} initialFilters
 */
export function useJobs(initialFilters = {}) {
    const [filters, setFilters] = useState({
        q: "",
        status: "All",
        per_page: 15,
        page: 1,
        ...initialFilters,
    });
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: filters.page,
                per_page: filters.per_page,
            };
            if (filters.q?.trim()) params.q = filters.q.trim();
            if (filters.status && filters.status !== "All") params.status = filters.status;

            const res = await fetchJobs(params);
            setJobs(res.data ?? []);
            setMeta({
                current_page: res.current_page ?? 1,
                last_page: res.last_page ?? 1,
                total: res.total ?? 0,
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [filters.q, filters.status, filters.per_page, filters.page]);

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [load]);

    return {
        jobs,
        meta,
        loading,
        error,
        filters,
        setFilters,
        reload: load,
    };
}

/**
 * useJobsMeta — list of statuses (driven by backend, never hardcoded).
 */
export function useJobsMeta() {
    const [statuses, setStatuses] = useState([]);
    useEffect(() => {
        let alive = true;
        fetchJobsMeta()
            .then((r) => alive && setStatuses(r.statuses ?? []))
            .catch(() => alive && setStatuses([]));
        return () => {
            alive = false;
        };
    }, []);
    return statuses;
}

/**
 * useJobMutations — single hook exposing all job mutations with loading
 * and error state per action.
 */
export function useJobMutations() {
    const [state, setState] = useState({ loading: false, error: null });

    const wrap = useCallback(async (fn) => {
        setState({ loading: true, error: null });
        try {
            const result = await fn();
            setState({ loading: false, error: null });
            return result;
        } catch (err) {
            setState({ loading: false, error: err });
            throw err;
        }
    }, []);

    return {
        ...state,
        create: (payload) => wrap(() => apiCreate(payload)),
        update: (id, payload) => wrap(() => apiUpdate(id, payload)),
        remove: (id) => wrap(() => apiDelete(id)),
        archive: (id) => wrap(() => apiArchive(id)),
        bulkDelete: (ids) => wrap(() => apiBulkDelete(ids)),
    };
}
