import { useEffect, useState, useCallback } from "react";
import {
  FaUsers,
  FaUserEdit,
  FaTrash,
  FaSearch,
  FaEllipsisV,
  FaCheck,
} from "react-icons/fa";
import api from "../../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../../layouts/MainLayout";

const emptyForm = { name: "", email: "", role_id: "" };

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Form state — used for both create and edit (null = create mode).
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get("/admin/user-roles");
      setRoles(res.data.data ?? []);
    } catch (err) {
      toast.error("Failed to load roles");
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (search.trim()) params.q = search.trim();
      if (roleFilter) params.role = roleFilter;

      const res = await api.get("/admin/users", { params });
      setUsers(res.data.data ?? []);
      setMeta({
        current_page: res.data.current_page ?? 1,
        last_page: res.data.last_page ?? 1,
        total: res.data.total ?? 0,
      });
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  // Debounce search.
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(t);
  }, [search, roleFilter, fetchUsers]);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [fetchRoles, fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      role_id: user.role?.id ?? "",
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
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role_id: form.role_id || null,
      };

      if (editing) {
        await api.put(`/admin/users/${editing.id}`, payload);
        toast.success("User updated successfully 🎉");
      } else {
        await api.post("/admin/users", payload);
        toast.success("User created successfully 🎉");
      }
      closeForm();
      fetchUsers(meta.current_page);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success("User deleted");
      fetchUsers(meta.current_page);
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <FaUsers />
                User Management
              </h1>
              <p className="text-zinc-400 mt-2">
                Manage platform users and their roles.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-violet-600 hover:bg-violet-700 transition px-6 py-3 rounded-xl flex items-center gap-2 self-start md:self-auto"
            >
              <FaUserEdit /> New User
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
                placeholder="Search by name or email..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-violet-500"
              />
            </div>
            <div className="relative flex-1 md:w-56">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {editing ? "Edit User" : "Create New User"}
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
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-zinc-400">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-zinc-400">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.role_id}
                      onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                      required
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end pt-2">
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
                      {submitting ? "Saving..." : editing ? "Update User" : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Users{" "}
                <span className="text-zinc-500 text-base">({meta.total})</span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center text-zinc-500 py-10">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-zinc-500 py-10">
                No users found.
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`bg-zinc-950 border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition ${
                      !user.deleted_at ? "border-zinc-800 hover:border-violet-500" : "border-red-900/50 opacity-70"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold flex items-center gap-3 flex-wrap">
                        <FaUsers className="text-violet-400" />
                        {user.name}
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono">
                          {user.email}
                        </span>
                        {user.deleted_at && (
                          <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-md">
                            Deleted
                          </span>
                        )}
                      </h3>
                      {user.role && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-200">
                            {user.role.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 self-end md:self-auto">
                      {!user.deleted_at && (
                        <>
                          <button
                            onClick={() => openEdit(user)}
                            className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                          >
                            <FaUserEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
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
                  onClick={() => fetchUsers(meta.current_page - 1)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-4 py-2 text-zinc-400">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <button
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => fetchUsers(meta.current_page + 1)}
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

export default UserManagement;