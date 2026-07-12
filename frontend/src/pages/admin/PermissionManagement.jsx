import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUsersCog,
  FaSearch,
} from "react-icons/fa";
import api from "../../lib/api";
import toast from "react-hot-toast";
import MainLayout from "../../layouts/MainLayout";

function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolePermissions, setRolePermissions] = useState({}); // roleId => [permissionIds]
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const fetchPermissions = async () => {
    try {
      // Since we don't have a direct permissions endpoint, we'll get them from a role
      // or use the seeder data as fallback
      const res = await api.get("/api/roles?per_page=1");
      // We don't actually get permissions from this, so let's use the seeder data
      // In a real app, we would have a dedicated /api/permissions endpoint
      setPermissions([
        { id: 1, name: "View dashboard", slug: "dashboard.view" },
        { id: 2, name: "Manage jobs", slug: "jobs.manage" },
        { id: 3, name: "Use AI tools", slug: "ai.use" },
        { id: 4, name: "Manage profile", slug: "profile.manage" },
        { id: 5, name: "Manage users", slug: "users.manage" },
        { id: 6, name: "Manage roles", slug: "roles.manage" },
        { id: 7, name: "View administration", slug: "admin.view" },
      ]);
    } catch (err) {
      // Fallback to hardcoded permissions
      setPermissions([
        { id: 1, name: "View dashboard", slug: "dashboard.view" },
        { id: 2, name: "Manage jobs", slug: "jobs.manage" },
        { id: 3, name: "Use AI tools", slug: "ai.use" },
        { id: 4, name: "Manage profile", slug: "profile.manage" },
        { id: 5, name: "Manage users", slug: "users.manage" },
        { id: 6, name: "Manage roles", slug: "roles.manage" },
        { id: 7, name: "View administration", slug: "admin.view" },
      ]);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/roles", { params: { with_trashed: 0 } });
      setRoles(res.data.data ?? []);

      // Load permissions for each role
      const rolePerms = {};
      for (const role of roles) {
        try {
          const res = await api.get(`/api/roles/${role.id}/permissions`);
          const permissionIds = res.data.data.map(p => p.id);
          rolePerms[role.id] = permissionIds;
        } catch (err) {
          // If we can't get permissions for a role, assume none
          console.warn(`Could not load permissions for role ${role.id}`);
          rolePerms[role.id] = [];
        }
      }
      setRolePermissions(rolePerms);
    } catch (err) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (roleId, permissionId) => {
    const isChecked = !rolePermissions[roleId]?.includes(permissionId);

    try {
      if (isChecked) {
        // Attach permission
        await api.post(`/api/roles/${roleId}/permissions`, { permission_id: permissionId });
      } else {
        // Detach permission
        await api.delete(`/api/roles/${roleId}/permissions/${permissionId}`);
      }

      // Update local state optimistically
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: isChecked
          ? [...(prev[roleId] || []), permissionId]
          : (prev[roleId] || []).filter(id => id !== permissionId)
      }));

      toast.success(
        isChecked ? "Permission granted" : "Permission revoked"
      );
    } catch (err) {
      // Revert optimistic update on error
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: !isChecked
          ? [...(prev[roleId] || []), permissionId]
          : (prev[roleId] || []).filter(id => id !== permissionId)
      }));
      toast.error(err.message || "Failed to update permission");
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            <p className="mt-2 text-zinc-400">Loading permissions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <FaLock />
                Permission Management
              </h1>
              <p className="text-zinc-400 mt-2">
                Control what users can do in the system by assigning permissions to roles.
              </p>
            </div>
          </div>

          {/* Permissions Legend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Permissions</h2>
            <div className="space-y-2">
              {permissions.map((perm) => (
                <div key={perm.id} className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center bg-violet-900/20 rounded-lg text-violet-400">
                      <FaCheckCircle className="text-violet-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{perm.name}</h3>
                    <p className="text-sm text-zinc-400 truncate">{perm.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Permissions Matrix */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-6">Role Permissions</h2>

            {roles.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">No roles found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-4 pl-4 text-left w-32">Role</th>
                      {permissions.map((perm) => (
                        <th key={perm.id} className="py-4 pr-4 text-center w-24">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 flex items-center justify-center bg-violet-900/20 rounded-full text-xs">
                              {perm.slug.split(".").map((part, idx) =>
                                idx === 0 ?
                                  <span key={idx} className="capitalize">{part[0]}</span> :
                                  <span key={idx} className="ml-1">{part[0]}</span>
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                        <td className="py-4 pl-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-900/20 rounded-full text-blue-400">
                              <FaUsersCog />
                            </div>
                            <div>
                              <p className="text-white">{role.name}</p>
                              <p className="text-sm text-zinc-400 truncate">{role.slug}</p>
                            </div>
                          </div>
                        </td>
                        {permissions.map((perm) => (
                          <td key={perm.id} className="py-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rolePermissions[role.id]?.includes(perm.id) ?? false}
                                onChange={(e) => togglePermission(role.id, perm.id)}
                                className="sr-only peer"
                              />
                              <div className="w-8 h-8 flex items-center justify-center rounded-full transition-colors">
                                {rolePermissions[role.id]?.includes(perm.id) ? (
                                  <div className="bg-violet-600">
                                    <FaCheckCircle className="text-white" />
                                  </div>
                                ) : (
                                  <div className="bg-zinc-800/50">
                                    <FaTimesCircle className="text-zinc-400" />
                                  </div>
                                )}
                              </div>
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-6 bg-zinc-900 rounded-3xl border border-zinc-800">
              <h2 className="font-semibold mb-4">How to Use</h2>
              <ol className="list-decimal list-inset space-y-2 text-sm text-zinc-400">
                <li>
                  <strong>Grant Permission:</strong> Check the box for a permission under a role
                </li>
                <li>
                  <strong>Revoke Permission:</strong> Uncheck the box for a permission under a role
                </li>
                <li>
                  Changes are saved automatically as you interact with the checkboxes
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default PermissionManagement;