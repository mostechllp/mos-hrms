import React, { useState } from "react";
import { showToast } from "../components/common/Toast";

/** Frontend-only mock data — replace with API when backend is ready */
const MOCK_ROLES = [
    { id: "admin", name: "Administrator", description: "Full system access" },
    { id: "hr_manager", name: "HR Manager", description: "HR operations & reports" },
    { id: "manager", name: "Manager", description: "Team & attendance oversight" },
    { id: "employee", name: "Employee", description: "Self-service only" },
    { id: "viewer", name: "Viewer", description: "Read-only access" },
];



const MODULES = [
    { key: "dashboard", label: "Dashboard" },
    { key: "employees", label: "Employees" },
    { key: "organizations", label: "Organizations" },
    { key: "agreements", label: "Agreements" },
    { key: "attendance", label: "Attendance" },
    { key: "leaves", label: "Leaves" },
    { key: "reports", label: "Reports" },
    { key: "settings", label: "Settings" },
    { key: "role_management", label: "Role management" },
];

const emptyPermsForRole = () =>
    MODULES.reduce((acc, m) => {
        acc[m.key] = { read: false, edit: false, delete: false };
        return acc;
    }, {});

const defaultRolePermissions = () => {
    const base = {};
    MOCK_ROLES.forEach((r) => {
        base[r.id] = emptyPermsForRole();
        if (r.id === "admin") {
            MODULES.forEach((m) => {
                base[r.id][m.key] = { read: true, edit: true, delete: true };
            });
        } else if (r.id === "viewer") {
            MODULES.forEach((m) => {
                base[r.id][m.key] = { read: true, edit: false, delete: false };
            });
        }
    });
    return base;
};


function RoleManagement() {
    const [roles, setRoles] = useState(MOCK_ROLES);
    const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);

    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const [selectedPermRoleId, setSelectedPermRoleId] = useState(MOCK_ROLES[0]?.id || "");



    const handleCreateRole = (e) => {
        e.preventDefault();
        if (!newRoleName) {
            showToast("Role name is required", "error");
            return;
        }
        const newId = newRoleName.toLowerCase().replace(/\s+/g, '_');

        if (editingRoleId) {
            setRoles(roles.map(r => r.id === editingRoleId ? { ...r, name: newRoleName, description: newRoleDesc } : r));
            showToast("Role updated", "success");
            setEditingRoleId(null);
            setNewRoleName("");
            setNewRoleDesc("");
            return;
        }

        if (roles.find(r => r.id === newId)) {
            showToast("Role already exists", "error");
            return;
        }
        const newRole = {
            id: newId,
            name: newRoleName,
            description: newRoleDesc || "Custom role"
        };
        setRoles((prev) => [...prev, newRole]);
        setRolePermissions((prev) => ({ ...prev, [newRole.id]: emptyPermsForRole() }));
        showToast("Role created", "success");
        setNewRoleName("");
        setNewRoleDesc("");
    };

    const handleEditClick = (role) => {
        setEditingRoleId(role.id);
        setNewRoleName(role.name);
        setNewRoleDesc(role.description);
    };

    const handleCancelEdit = () => {
        setEditingRoleId(null);
        setNewRoleName("");
        setNewRoleDesc("");
    };

    const handleDeleteConfirm = () => {
        if (roleToDelete) {
            setRoles(roles.filter(r => r.id !== roleToDelete.id));
            const newPerms = { ...rolePermissions };
            delete newPerms[roleToDelete.id];
            setRolePermissions(newPerms);
            if (selectedPermRoleId === roleToDelete.id) {
                const remainingRoles = roles.filter(r => r.id !== roleToDelete.id);
                setSelectedPermRoleId(remainingRoles[0]?.id || "");
            }
            showToast("Role deleted", "success");
            setRoleToDelete(null);
        }
    };

    const togglePermission = (roleId, moduleKey, field) => {
        setRolePermissions((prev) => {
            const role = prev[roleId] || emptyPermsForRole();
            const mod = role[moduleKey] || { read: false, edit: false, delete: false };
            const next = { ...mod, [field]: !mod[field] };
            if (field === "read" && !next.read) {
                next.edit = false;
                next.delete = false;
            }
            if ((field === "edit" || field === "delete") && next[field]) {
                next.read = true;
            }
            return {
                ...prev,
                [roleId]: { ...role, [moduleKey]: next },
            };
        });
    };

    const handleSavePermissions = () => {
        showToast("Permissions saved (frontend preview — no API yet)", "success");
    };

    const permMatrix = rolePermissions[selectedPermRoleId] || emptyPermsForRole();

    return (
        <div className="w-full max-w-7xl mx-auto pb-10">
                    <div className="mb-6">
                        <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-emerald-600 dark:from-gray-200 dark:to-emerald-400 bg-clip-text text-transparent">
                            Roles
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Create roles and configure read, edit, and delete access per module (UI only).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
                        {/* Create role */}
                        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft p-4 md:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <i className="fas fa-plus-circle text-emerald-600 dark:text-emerald-400"></i>
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100">
                                        {editingRoleId ? "Edit role" : "Create role"}
                                    </h2>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {editingRoleId ? "Update role details" : "Add a new role to the system"}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateRole} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                        Role Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        placeholder="e.g. Developer"
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={newRoleDesc}
                                        onChange={(e) => setNewRoleDesc(e.target.value)}
                                        placeholder="Short description"
                                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-md"
                                    >
                                        <i className="fas fa-check mr-2"></i>
                                        {editingRoleId ? "Update role" : "Create role"}
                                    </button>
                                    {editingRoleId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-semibold transition shadow-md"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                                    Created roles
                                </h3>
                                <ul className="space-y-2 max-h-48 overflow-y-auto">
                                    {roles.map((r) => (
                                        <li
                                            key={r.id}
                                            className="flex items-center justify-between gap-2 text-xs md:text-sm py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 group"
                                        >
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-gray-800 dark:text-gray-200 truncate font-medium">
                                                    {r.name}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                    {r.description}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(r)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                    title="Edit role"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => setRoleToDelete(r)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                    title="Delete role"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* Permissions matrix */}
                        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft p-4 md:p-6 xl:col-span-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <i className="fas fa-shield-alt text-emerald-600 dark:text-emerald-400"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100">
                                            Permissions
                                        </h2>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            Read, edit, delete per module
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                        Role
                                    </label>
                                    <select
                                        value={selectedPermRoleId}
                                        onChange={(e) => setSelectedPermRoleId(e.target.value)}
                                        className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                                <table className="w-full text-left text-xs md:text-sm border-collapse min-w-[520px]">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-600">
                                            <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                                Module
                                            </th>
                                            <th className="px-3 py-3 font-semibold text-center text-gray-600 dark:text-gray-300 w-24">
                                                Read
                                            </th>
                                            <th className="px-3 py-3 font-semibold text-center text-gray-600 dark:text-gray-300 w-24">
                                                Edit
                                            </th>
                                            <th className="px-3 py-3 font-semibold text-center text-gray-600 dark:text-gray-300 w-24">
                                                Delete
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MODULES.map((m) => {
                                            const p = permMatrix[m.key] || {
                                                read: false,
                                                edit: false,
                                                delete: false,
                                            };
                                            return (
                                                <tr
                                                    key={m.key}
                                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
                                                >
                                                    <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                                        {m.label}
                                                    </td>
                                                    {["read", "edit", "delete"].map((field) => (
                                                        <td key={field} className="px-3 py-2 text-center">
                                                            <label className="inline-flex items-center justify-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={p[field]}
                                                                    onChange={() =>
                                                                        togglePermission(selectedPermRoleId, m.key, field)
                                                                    }
                                                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                                                />
                                                            </label>
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                <span>
                                    <i className="fas fa-info-circle mr-1"></i>
                                    Turning off Read clears Edit and Delete for that row.
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleSavePermissions}
                                className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
                            >
                                <i className="fas fa-save mr-2"></i>
                                Save permissions
                            </button>
                        </section>
                    </div>
            {/* Delete Confirmation Modal */}
            {roleToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 overflow-hidden">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Delete Role
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the role <strong>{roleToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRoleToDelete(null)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoleManagement;
