// src/admin/components/crm/settings/PermissionSettings.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, Save } from "lucide-react";
import { showToast } from "../../../../components/common/Toast";
import {
  fetchCrmPermissions,
  updateCrmPermissionsAll,
} from "../../../store/slices/crmSettingsSlice";

const SettingsCard = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
    {children}
  </div>
);

// Human-readable labels for each permission key
const PERMISSION_LABELS = {
  view_all_customers: "Who can view all customers?",
  create_leads: "Who can create leads?",
  assign_leads: "Who can assign leads?",
  delete_customer_records: "Who can delete customer records?",
  edit_quotations: "Who can edit quotations?",
  view_sales_reports: "Who can view sales reports?",
  change_opportunity_stages: "Who can change opportunity stages?",
};

const PermissionSettings = () => {
  const dispatch = useDispatch();
  const { permissions } = useSelector((s) => s.crmSettings);
  const { roles = [], permissionKeys = [], data } = permissions;

  const [localPermissions, setLocalPermissions] = useState(null);

  useEffect(() => {
    dispatch(fetchCrmPermissions());
  }, [dispatch]);

  // 👇 FIX: Deep clone the data so we don't mutate the Redux store directly
  useEffect(() => {
    if (data) {
      setLocalPermissions(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  const toggleRole = (permKey, roleName) => {
    setLocalPermissions((prev) => {
      const current = prev[permKey] || [];
      const next = current.includes(roleName)
        ? current.filter((r) => r !== roleName)
        : [...current, roleName];
      return { ...prev, [permKey]: next };
    });
  };

  const handleSave = async () => {
  try {
    await dispatch(
      updateCrmPermissionsAll({
        uiPermissions: localPermissions,
        roles,
        permissionKeys,
      })
    ).unwrap();
    showToast("Permissions updated successfully", "success");
  } catch (err) {
    showToast(err || "Failed to update permissions", "error");
  }
};

  if (permissions.loading || !localPermissions) {
    return (
      <div className="flex justify-center py-10 text-sm text-gray-500 gap-2">
        <Loader size={14} className="animate-spin" /> Loading permissions…
      </div>
    );
  }

  const hasChanges =
    JSON.stringify(localPermissions) !== JSON.stringify(data);

  return (
    <div className="space-y-4">
      <SettingsCard
        title="CRM Permissions"
        description="Choose which roles can perform each action"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide min-w-[220px]">
                  Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionKeys.map((key) => (
                <tr
                  key={key}
                  className="border-b border-gray-100 dark:border-gray-700/40"
                >
                  <td className="px-3 py-3 text-sm text-gray-800 dark:text-gray-200">
                    {PERMISSION_LABELS[key] || key.replace(/_/g, " ")}
                  </td>
                  {roles.map((role) => {
                    const checked =
                      localPermissions[key]?.includes(role.name) || false;
                    // Super Admin cannot be restricted — hide the toggle
                    const disabled = role.name === "Super Admin";
                    return (
                      <td key={role.id} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={disabled ? true : checked}
                          disabled={disabled}
                          onChange={() => toggleRole(key, role.name)}
                          className="w-4 h-4 accent-blue-500 disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
          Super Admin always has all permissions and cannot be restricted.
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges || permissions.submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {permissions.submitting ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}{" "}
            Save Changes
          </button>
        </div>
      </SettingsCard>
    </div>
  );
};

export default PermissionSettings;