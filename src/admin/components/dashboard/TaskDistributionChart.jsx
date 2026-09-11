import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const TaskDistributionChart = ({ tasks }) => {
  console.log('TaskDistributionChart received tasks:', tasks);

  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const priorityCount = {
      high: 0,
      medium: 0,
      low: 0,
    };

    tasks.forEach(task => {
      if (task.priority === 'high') priorityCount.high++;
      else if (task.priority === 'medium') priorityCount.medium++;
      else if (task.priority === 'low') priorityCount.low++;
    });

    const result = [
      { name: 'High Priority', value: priorityCount.high },
      { name: 'Medium Priority', value: priorityCount.medium },
      { name: 'Low Priority', value: priorityCount.low },
    ].filter(item => item.value > 0);

    console.log('Processed task data:', result);
    return result;
  }, [tasks]);

  const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Task Priority Distribution
      </h3>
      <div className="h-64 md:h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No tasks available
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDistributionChart;