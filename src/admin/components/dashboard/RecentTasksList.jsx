import React from 'react';
import { format } from 'date-fns';

const RecentTasksList = ({ tasks }) => {
  const recentTasks = tasks?.slice(0, 5) || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Tasks
      </h3>
      <div className="space-y-3">
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {task.title}
                </p>
                {task.task_description && (
                  <p className="text-sm text-gray-500 truncate">
                    {task.task_description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority || 'N/A'}
                </span>
                {task.due_date && (
                  <span className="text-xs text-gray-500">
                    Due: {format(new Date(task.due_date), 'MMM dd')}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No tasks assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTasksList;