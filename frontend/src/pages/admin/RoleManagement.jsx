import { useEffect, useState, useCallback } from "react";
import {
    FaPlus,
    FaTrash,
    FaEdit,
    FaUserShield,
    FaSearch,
    FaUndo,
    FaTimes,
} from "react-icons/fa";
import api from "../../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../../layouts/MainLayout";

const emptyForm = { name: "", slug: "", description: "" };

function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [includeTrashed, setIncludeTrashed] = useState(false);

    // Form state — used for both create and edit (null = create mode).
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    const fetchRoles = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };
            if (search.trim()) params.q = search.trim();
            if (includeTrashed) params.with_trashed = 1;

            const res = await api.get("/roles", { params });
            setRoles(res.data.data ?? []);
            setMeta({
                current_page: res.data.current_page ?? 1,
                last_page: res.data.last_page ?? 1,
                total: res.data.total ?? 0,
            });
        } catch (err) {
            toast.error(err.message || "Failed to load roles");
        } finally {
            setLoading(false);
        }
    }, [search, includeTrashed]);

    // Debounce search.
    useEffect(() => {
        const t = setTimeout(() => fetchRoles(1), 300);
        return () => clearTimeout(t);
    }, [search, includeTrashed, fetchRoles]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (role) => {
        setEditing(role);
        setForm({
            name: role.name ?? "",
            slug: role.slug ?? "",
            description: role.description ?? "",
        });
        setShowForm(true);
    };

    const closeForm = () => {
        if (submitting) return;
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Role name is required");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                name: form.name.trim(),
                description: form.description?.trim() || null,
            };
            // Only send slug if the user typed one — backend auto-generates otherwise.
            if (form.slug.trim()) payload.slug = form.slug.trim();

            if (editing) {
                await api.put(`/roles/${editing.id}`, payload);
                toast.success("Role updated successfully 🎉");
            } else {
                await api.post("/roles", payload);
                toast.success("Role created successfully 🎉");
            }
            closeForm();
            fetchRoles(meta.current_page);
        } catch (err) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (role) => {
        if (["admin", "user"].includes(role.slug)) {
            toast.error("System roles cannot be deleted");
            return;
        }
        if (!window.confirm(`Delete role "${role.name}"? This is a soft delete.`)) return;
        try {
            await api.delete(`/roles/${role.id}`);
            toast.success("Role deleted");
            fetchRoles(meta.current_page);
        } catch (err) {
            toast.error(err.message || "Failed to delete role");
        }
    };

    const handleRestore = async (role) => {
        try {
            await api.post(`/roles/${role.id}/restore`);
            toast.success("Role restored");
            fetchRoles(meta.current_page);
        } catch (err) {
            toast.error(err.message || "Failed to restore role");
        }
    };

    return (
        <MainLayout>
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                            <FaUserShield className="text-violet-400" />
                            Role Management
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Create and manage system roles.
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-violet-600 hover:bg-violet-700 transition px-6 py-3 rounded-xl flex items-center gap-2 self-start md:self-auto"
                    >
                        <FaPlus /> New Role
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, slug, or description..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-violet-500"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeTrashed}
                            onChange={(e) => setIncludeTrashed(e.target.checked)}
                            className="accent-violet-500"
                        />
                        Show deleted
                    </label>
                </div>

                {/* Form modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">
                                    {editing ? "Edit Role" : "Create New Role"}
                                </h2>
                                <button
                                    onClick={closeForm}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label className="block mb-2 text-zinc-400">
                                        Role Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Manager"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-zinc-400">
                                        Slug{" "}
                                        <span className="text-zinc-500 text-xs">
                                            (auto-generated if left empty)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        placeholder="e.g. manager"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-zinc-400">Description</label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({ ...form, description: e.target.value })
                                        }
                                        placeholder="What can this role do?"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition disabled:opacity-50"
                                    >
                                        {submitting
                                            ? "Saving..."
                                            : editing
                                                ? "Save Changes"
                                                : "Create Role"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Roles list */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">
                            Existing Roles{" "}
                            <span className="text-zinc-500 text-base">({meta.total})</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center text-zinc-500 py-10">Loading...</div>
                    ) : roles.length === 0 ? (
                        <div className="text-center text-zinc-500 py-10">
                            No roles found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {roles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`bg-zinc-950 border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition ${
                                        role.deleted_at
                                            ? "border-red-900/50 opacity-70"
                                            : "border-zinc-800 hover:border-violet-500"
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-semibold flex items-center gap-3 flex-wrap">
                                            <FaUserShield className="text-violet-400" />
                                            {role.name}
                                            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono">
                                                {role.slug}
                                            </span>
                                            {role.deleted_at && (
                                                <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-md">
                                                    Deleted
                                                </span>
                                            )}
                                        </h3>
                                        {role.description && (
                                            <p className="text-zinc-400 mt-2 break-words">
                                                {role.description}
                                            </p>
                                        )}
                                        {role.users_count !== undefined && (
                                            <p className="text-zinc-500 text-sm mt-2">
                                                {role.users_count} user
                                                {role.users_count === 1 ? "" : "s"}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 self-end md:self-auto">
                                        {role.deleted_at ? (
                                            <button
                                                onClick={() => handleRestore(role)}
                                                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                                            >
                                                <FaUndo /> Restore
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => openEdit(role)}
                                                    className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role)}
                                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                disabled={meta.current_page <= 1}
                                onClick={() => fetchRoles(meta.current_page - 1)}
                                className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <span className="px-4 py-2 text-zinc-400">
                                Page {meta.current_page} of {meta.last_page}
                            </span>
                            <button
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => fetchRoles(meta.current_page + 1)}
                                className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </MainLayout>
    );
}

export default RoleManagement;
