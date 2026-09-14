import React from "react";
import { format } from "date-fns";

const RecentTasksList = ({ tasks }) => {
  const recentTasks = tasks?.slice(0, 5) || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-amber-500/15 dark:text-amber-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Recent Tasks
      </h3>
      <div className="space-y-3">
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                  {task.title}
                </p>
                {task.task_description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {task.task_description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    task.priority,
                  )}`}
                >
                  {task.priority || "N/A"}
                </span>
                {task.due_date && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {format(new Date(task.due_date), "MMM dd")}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No tasks assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTasksList;