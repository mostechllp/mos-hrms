/* eslint-disable no-unused-vars */
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PriorityDistributionChart = ({ tasks = [] }) => {
  // Group tasks by priority
  const priorityMap = {};
  tasks.forEach(task => {
    const priority = task?.priority || 'unassigned';
    if (priorityMap[priority]) {
      priorityMap[priority] += 1;
    } else {
      priorityMap[priority] = 1;
    }
  });

  const data = Object.keys(priorityMap).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: priorityMap[key]
  }));

  const COLORS = {
    'High': '#EF4444',
    'Medium': '#F59E0B',
    'Low': '#10B981',
    'Unassigned': '#9CA3AF'
  };

  const getColor = (name) => COLORS[name] || '#9CA3AF';

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Task Priority Distribution</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No task data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Task Priority Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={80} />
            <Tooltip formatter={(value) => `${value} tasks`} />
            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriorityDistributionChart;