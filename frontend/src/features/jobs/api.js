import api from "../../lib/api";

/**
 * Thin API client for the Jobs module. Components never call `api.*` directly —
 * they go through these functions so the request shape is centralized and
 * easy to refactor / mock.
 */

export const STATUS_FILTER_ALL = "All";

/** @returns {Promise<{data: any[], meta: object}>} */
export async function fetchJobs(params = {}) {
    const res = await api.get("/jobs", { params });
    return res.data;
}

/** @returns {Promise<{statuses: Array<{value:string,label:string,color:string,bg:string}>}>} */
export async function fetchJobsMeta() {
    const res = await api.get("/jobs/meta");
    return res.data;
}

export async function createJob(payload) {
    const res = await api.post("/jobs", payload);
    return res.data.data ?? res.data;
}

export async function updateJob(id, payload) {
    const res = await api.put(`/jobs/${id}`, payload);
    return res.data.data ?? res.data;
}

export async function deleteJob(id) {
    await api.delete(`/jobs/${id}`);
}

export async function archiveJob(id) {
    const res = await api.post(`/jobs/${id}/archive`);
    return res.data.data ?? res.data;
}

export async function bulkDeleteJobs(ids) {
    const res = await api.post("/jobs/bulk-delete", { ids });
    return res.data;
}
