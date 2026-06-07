// src/admin/pages/settings/AppSettingsTab.jsx
import { Link } from "react-router-dom";

const AppSettingsTab = () => {
  const settingsCards = [
    {
      title: "Organizations",
      description: "Manage organization details, settings, and configurations",
      icon: "fas fa-building",
      route: "/admin/organizations",
      color: "green",
    },
    {
      title: "Designations",
      description: "Configure job titles and position hierarchies",
      icon: "fas fa-briefcase",
      route: "/admin/designations",
      color: "blue",
    },
    {
      title: "Departments",
      description: "Organize teams and department structures",
      icon: "fas fa-diagram-project",
      route: "/admin/departments",
      color: "purple",
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          icon: "text-green-600 dark:text-green-400",
          hover: "hover:border-green-500",
        };
      case "blue":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          icon: "text-blue-600 dark:text-blue-400",
          hover: "hover:border-blue-500",
        };
      case "purple":
        return {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          icon: "text-purple-600 dark:text-purple-400",
          hover: "hover:border-purple-500",
        };
      case "orange":
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          icon: "text-orange-600 dark:text-orange-400",
          hover: "hover:border-orange-500",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          icon: "text-gray-600 dark:text-gray-400",
          hover: "hover:border-gray-500",
        };
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100 dark:border-green-900/30 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <i className="fas fa-cog text-green-600 dark:text-green-400 text-base md:text-xl"></i>
        </div>
        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
          Application Settings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {settingsCards.map((card) => {
          const colors = getColorClasses(card.color);
          return (
            <Link
              key={card.title}
              to={card.route}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-all hover:shadow-md ${colors.hover}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`${card.icon} text-xl ${colors.icon}`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-green-500 text-xs font-semibold">
                    <span>Configure</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AppSettingsTab;