import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import {
    fetchRoles,
    addRole,
    updateRole,
    deleteRole,
    fetchRolePermissions,
    updateRolePermissions,
    fetchModules
} from "../store/slices/roleSlice";

const FALLBACK_MODULES = [
    { id: 1, name: "Dashboard" },
    { id: 2, name: "Employees" },
    { id: 3, name: "Organizations" },
    { id: 4, name: "Agreements" },
    { id: 5, name: "Attendance" },
    { id: 6, name: "Leaves" },
    { id: 7, name: "Reports" },
    { id: 8, name: "Settings" },
    { id: 9, name: "Role management" }
];

function RoleManagement() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { roles, rolePermissions, modules } = useSelector((state) => state.roles);

    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const [selectedPermRoleId, setSelectedPermRoleId] = useState("");
    const [localPermissions, setLocalPermissions] = useState([]);

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchModules());
    }, [dispatch]);

    useEffect(() => {
        if (roles.length > 0 && !selectedPermRoleId) {
            setSelectedPermRoleId(roles[0].id);
        }
    }, [roles, selectedPermRoleId]);

    useEffect(() => {
        if (selectedPermRoleId) {
            dispatch(fetchRolePermissions(selectedPermRoleId));
        }
    }, [selectedPermRoleId, dispatch]);

    useEffect(() => {
        if (selectedPermRoleId) {
            const perms = rolePermissions[selectedPermRoleId] || [];
            const displayModules = modules && modules.length > 0 ? modules : FALLBACK_MODULES;
            const merged = displayModules.map(mod => {
                const existing = perms.find(p => p.module_id === mod.id) || {};
                return {
                    module_id: mod.id,
                    module_name: mod.name || mod.label,
                    can_read: !!existing.can_read,
                    can_edit: !!existing.can_edit,
                    can_delete: !!existing.can_delete
                };
            });
            setLocalPermissions(merged);
        }
    }, [rolePermissions, selectedPermRoleId, modules]);

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!newRoleName) {
            showToast("Role name is required", "error");
            return;
        }

        try {
            if (editingRoleId) {
                await dispatch(updateRole({ id: editingRoleId, data: { name: newRoleName, description: newRoleDesc } })).unwrap();
                showToast("Role updated", "success");
                setEditingRoleId(null);
            } else {
                await dispatch(addRole({ name: newRoleName, description: newRoleDesc, status: "active" })).unwrap();
                showToast("Role created", "success");
            }
            setNewRoleName("");
            setNewRoleDesc("");
        } catch (error) {
            showToast(error || "An error occurred", "error");
        }
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

    const handleDeleteConfirm = async () => {
        if (roleToDelete) {
            try {
                await dispatch(deleteRole(roleToDelete.id)).unwrap();
                showToast("Role deleted", "success");
                if (selectedPermRoleId === roleToDelete.id) {
                    setSelectedPermRoleId("");
                }
            } catch (error) {
                showToast(error || "Failed to delete role", "error");
            } finally {
                setRoleToDelete(null);
            }
        }
    };

    const togglePermission = (moduleId, field) => {
        setLocalPermissions((prev) =>
            prev.map((p) => {
                if (p.module_id === moduleId) {
                    const next = { ...p, [field]: !p[field] };
                    if (field === "can_read" && !next.can_read) {
                        next.can_edit = false;
                        next.can_delete = false;
                    }
                    if ((field === "can_edit" || field === "can_delete") && next[field]) {
                        next.can_read = true;
                    }
                    return next;
                }
                return p;
            })
        );
    };

    const handleSavePermissions = async () => {
        try {
            await dispatch(updateRolePermissions({
                id: selectedPermRoleId,
                permissions: localPermissions
            })).unwrap();
            showToast("Permissions saved", "success");
        } catch (error) {
            showToast(error || "Failed to save permissions", "error");
        }
    };

    return (
        <div className="w-full overflow-x-hidden p-4 md:p-6 space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-2xl font-bold gradient-heading bg-clip-text text-transparent">
                    Role Management
                </h2>
                <button
                    onClick={() => navigate("/admin/modules")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg shadow transition-all"
                >
                    <i className="fas fa-plus"></i> Add Module
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
                {/* Create role section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <i className="fas fa-plus-circle text-green-600 dark:text-green-400"></i>
                        </div>
                        <div>
                            <h2 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100">
                                {editingRoleId ? "Edit Role" : "Create Role"}
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
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                                <i className="fas fa-check mr-2"></i>
                                {editingRoleId ? "Update Role" : "Create Role"}
                            </button>
                            {editingRoleId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-5 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <i className="fas fa-list-ul"></i> Created Roles
                        </h3>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {roles.map((r) => (
                                <li
                                    key={r.id}
                                    className="flex items-center justify-between gap-2 text-xs md:text-sm py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-gray-800 dark:text-gray-200 truncate font-medium">
                                            {r.name}
                                        </span>
                                        {r.description && (
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                {r.description}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(r)}
                                            className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            title="Edit role"
                                        >
                                            <i className="fas fa-edit text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => setRoleToDelete(r)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Delete role"
                                        >
                                            <i className="fas fa-trash text-xs"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {roles.length === 0 && (
                                <li className="text-center text-gray-500 dark:text-gray-400 py-4 text-xs">
                                    No roles created yet
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Permissions matrix */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <i className="fas fa-shield-alt text-green-600 dark:text-green-400"></i>
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
                                Select Role
                            </label>
                            <select
                                value={selectedPermRoleId}
                                onChange={(e) => setSelectedPermRoleId(e.target.value)}
                                className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all cursor-pointer"
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
                        <table className="w-full text-left text-xs md:text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/80 border-b border-gray-200 dark:border-gray-600">
                                    <th className="px-2 md:px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                        Module
                                    </th>
                                    <th className="px-2 py-3 font-semibold text-center text-gray-600 dark:text-gray-300 w-14 md:w-20">
                                        Read
                                    </th>
                                    <th className="px-2 py-3 font-semibold text-center text-gray-600 dark:text-gray-300 w-14 md:w-20">
                                        Edit
                                    </th>
                                    <th className="px-2 py-3 font-semibold text-center text-gray-600 dark:text-gray-300 w-14 md:w-20">
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {localPermissions.map((p) => (
                                    <tr
                                        key={p.module_id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-2 md:px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                                            {p.module_name}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <label className="inline-flex items-center justify-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={p.can_read}
                                                    onChange={() => togglePermission(p.module_id, "can_read")}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                                                />
                                            </label>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <label className="inline-flex items-center justify-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={p.can_edit}
                                                    onChange={() => togglePermission(p.module_id, "can_edit")}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                                                />
                                            </label>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <label className="inline-flex items-center justify-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={p.can_delete}
                                                    onChange={() => togglePermission(p.module_id, "can_delete")}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                                                />
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                        <i className="fas fa-info-circle mr-1"></i>
                        Turning off Read clears Edit and Delete for that row.
                    </div>

                    <button
                        type="button"
                        onClick={handleSavePermissions}
                        className="mt-4 w-full sm:w-auto px-6 py-2.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-save"></i>
                        Save Permissions
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {roleToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <i className="fas fa-exclamation-triangle text-red-500"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Delete Role
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the role <strong className="text-gray-700 dark:text-gray-300">{roleToDelete.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRoleToDelete(null)}
                                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all"
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