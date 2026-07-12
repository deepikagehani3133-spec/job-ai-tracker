import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    Card,
    Modal,
    ConfirmDialog,
    Input,
    Select,
    Badge,
    Pagination,
    EmptyState,
    Button,
} from "../components/ui";
import JobForm from "../features/jobs/JobForm";
import { useJobs, useJobMutations } from "../features/jobs/hooks";
import { STATUS_BADGES, DATE_FORMAT, SALARY_FORMAT } from "../lib/theme";
import toast from "react-hot-toast";
import {
    FaPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaArchive,
    FaBriefcase,
} from "react-icons/fa";

const STATUS_FILTER_OPTIONS = [
    { value: "All", label: "All statuses" },
    { value: "Applied", label: "Applied" },
    { value: "Interview", label: "Interview" },
    { value: "Offer", label: "Offer" },
    { value: "Rejected", label: "Rejected" },
    { value: "Withdrawn", label: "Withdrawn" },
];

export default function Jobs() {
    const { jobs, meta, loading, setFilters, reload } = useJobs();
    const mutations = useJobMutations();

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selected, setSelected] = useState(new Set());

    // Push search + status into filters (debounced via the hook).
    useEffect(() => {
        setFilters((f) => ({ ...f, q: search, status: statusFilter, page: 1 }));
    }, [search, statusFilter, setFilters]);

    const allSelected = jobs.length > 0 && jobs.every((j) => selected.has(j.id));
    const someSelected = selected.size > 0 && !allSelected;

    const toggleAll = () => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(jobs.map((j) => j.id)));
        }
    };
    const toggleOne = (id) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };
    const openEdit = (job) => {
        setEditing(job);
        setFormOpen(true);
    };

    const handleSubmit = async (payload) => {
        if (editing) {
            await mutations.update(editing.id, payload);
            toast.success("Job updated 🎉");
        } else {
            await mutations.create(payload);
            toast.success("Job added 🎉");
        }
        setFormOpen(false);
        setEditing(null);
        reload();
    };

    const handleDelete = async () => {
        if (!deleting) return;
        try {
            await mutations.remove(deleting.id);
            toast.success("Job deleted");
            setDeleting(null);
            reload();
        } catch (e) {
            toast.error(e.message || "Failed to delete");
        }
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selected);
        if (ids.length === 0) return;
        if (!window.confirm(`Delete ${ids.length} selected job(s)?`)) return;
        try {
            const res = await mutations.bulkDelete(ids);
            toast.success(res.message ?? `${ids.length} deleted`);
            setSelected(new Set());
            reload();
        } catch (e) {
            toast.error(e.message || "Bulk delete failed");
        }
    };

    const handleArchive = async (job) => {
        try {
            await mutations.archive(job.id);
            toast.success("Job archived");
            reload();
        } catch (e) {
            toast.error(e.message || "Failed to archive");
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Jobs</h1>
                    <p className="text-zinc-400 mt-1">
                        {meta.total} {meta.total === 1 ? "application" : "applications"} tracked
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <FaPlus /> Add job
                </Button>
            </div>

            <Card>
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <Input
                            placeholder="Search by company, role, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11"
                        />
                    </div>
                    <div className="w-full md:w-56">
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={STATUS_FILTER_OPTIONS}
                        />
                    </div>
                </div>

                {/* Bulk actions bar */}
                {selected.size > 0 && (
                    <div className="mb-4 flex items-center justify-between bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-2">
                        <span className="text-sm text-violet-200">
                            {selected.size} selected
                        </span>
                        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                            <FaTrash /> Delete selected
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center text-zinc-500 py-10">Loading...</div>
                ) : jobs.length === 0 ? (
                    <EmptyState
                        icon={<FaBriefcase />}
                        title="No jobs yet"
                        description="Add your first application to start tracking."
                        action={<Button onClick={openCreate}><FaPlus /> Add job</Button>}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-zinc-400 text-sm border-b border-zinc-800">
                                    <th className="py-3 pr-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someSelected;
                                            }}
                                            onChange={toggleAll}
                                            className="accent-violet-500"
                                        />
                                    </th>
                                    <th className="py-3 pr-3">Company</th>
                                    <th className="py-3 pr-3">Role</th>
                                    <th className="py-3 pr-3">Status</th>
                                    <th className="py-3 pr-3">Location</th>
                                    <th className="py-3 pr-3">Applied</th>
                                    <th className="py-3 pr-3">Salary</th>
                                    <th className="py-3 pr-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr
                                        key={job.id}
                                        className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition"
                                    >
                                        <td className="py-3 pr-3">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(job.id)}
                                                onChange={() => toggleOne(job.id)}
                                                className="accent-violet-500"
                                            />
                                        </td>
                                        <td className="py-3 pr-3 font-medium">{job.company}</td>
                                        <td className="py-3 pr-3 text-zinc-300">{job.role}</td>
                                        <td className="py-3 pr-3">
                                            <Badge className={STATUS_BADGES[job.status] || ""}>
                                                {job.status_label ?? job.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 pr-3 text-zinc-400">
                                            {job.location || "—"}
                                        </td>
                                        <td className="py-3 pr-3 text-zinc-400 text-sm">
                                            {DATE_FORMAT(job.applied_at)}
                                        </td>
                                        <td className="py-3 pr-3 text-zinc-400 text-sm">
                                            {SALARY_FORMAT(job.salary_min, job.salary_max)}
                                        </td>
                                        <td className="py-3 pr-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(job)}
                                                    className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(job)}
                                                    className="p-2 rounded-lg bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 transition"
                                                    title="Archive"
                                                >
                                                    <FaArchive />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(job)}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={meta.current_page}
                    lastPage={meta.last_page}
                    total={meta.total}
                    onChange={(p) => setFilters((f) => ({ ...f, page: p }))}
                />
            </Card>

            <Modal
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditing(null);
                }}
                title={editing ? "Edit job" : "Add a new job"}
                maxWidth="max-w-3xl"
            >
                <JobForm
                    initial={editing}
                    onSubmit={handleSubmit}
                    submitting={mutations.loading}
                    onCancel={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Delete job?"
                message={`This will permanently delete the application to ${deleting?.company}.`}
                confirmText="Delete"
                loading={mutations.loading}
            />
        </MainLayout>
    );
}
