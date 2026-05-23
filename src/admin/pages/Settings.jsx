import { useState } from "react";
import ProfileTab from "../components/settings/ProfileTab";
import SecurityTab from "../components/settings/SecurityTab";
import AppSettingsTab from "../components/settings/AppSettingsTab";
import ThemeTab from "../components/settings/ThemeTab";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: "fas fa-user", color: "blue" },
    { id: "security", label: "Security", icon: "fas fa-lock", color: "green" },
    { id: "app-settings", label: "App Settings", icon: "fas fa-cog", color: "purple" },
    { id: "theme", label: "Others", icon: "fas fa-palette", color: "orange" },
  ];

  const getColorClasses = (color, isActive) => {
    if (isActive) {
      switch (color) {
        case "blue": return "bg-blue-500 text-white";
        case "green": return "bg-green-500 text-white";
        case "purple": return "bg-purple-500 text-white";
        case "orange": return "bg-orange-500 text-white";
        default: return "bg-green-500 text-white";
      }
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="w-full overflow-x-hidden">
      <main className="content px-4 py-4 md:px-6 md:py-6 w-full overflow-x-hidden">
        {/* Page Header*/}
        <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
            <i className="fas fa-sliders-h mr-2"></i> Settings
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 -mt-3 mb-4 md:mb-6">
          Manage your account settings and preferences
        </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-4 transition-all border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                  activeTab === tab.id
                    ? "bg-green-500 shadow-md rounded-xl"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                style={
                  activeTab === tab.id
                    ? { backgroundColor: 'var(--primary-color)', color: 'var(--primary-contrast)' }
                    : {}
                }
              >
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    activeTab === tab.id ? "" : getColorClasses(tab.color, false)
                  }`}
                  style={
                    activeTab === tab.id
                      ? { backgroundColor: 'var(--primary-contrast)', color: 'var(--primary-color)' }
                      : {}
                  }
                >
                  <i className={`${tab.icon} text-base`}></i>
                </div>
                <div className="flex-1 text-left">
                  <div 
                    className="text-sm font-semibold transition-colors duration-200"
                    style={activeTab === tab.id ? { color: 'var(--primary-contrast)' } : { color: '' }}
                  >
                    {tab.label}
                  </div>
                  <div 
                    className="text-xs transition-colors duration-200"
                    style={activeTab === tab.id ? { color: 'var(--primary-contrast)', opacity: 0.85 } : { color: '' }}
                  >
                    {tab.id === "profile" && <ProfileTab/>}
                    {tab.id === "security" && <SecurityTab/>}
                    {tab.id === "app-settings" && <AppSettingsTab/>}
                    {tab.id === "theme" && <ThemeTab/>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;