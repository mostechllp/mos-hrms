/* eslint-disable no-unused-vars */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MonthlyTrendChart = ({ tasks = [] }) => {
  // Group tasks by month
  const monthMap = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  tasks.forEach(task => {
    if (task?.created_at) {
      const date = new Date(task.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()] + ' ' + date.getFullYear();
      
      if (monthMap[monthKey]) {
        monthMap[monthKey].count += 1;
        // Track priority distribution
        const priority = task?.priority || 'unassigned';
        if (monthMap[monthKey][priority] !== undefined) {
          monthMap[monthKey][priority] += 1;
        } else {
          monthMap[monthKey][priority] = 1;
        }
      } else {
        monthMap[monthKey] = {
          month: monthName,
          count: 1,
          high: task?.priority === 'high' ? 1 : 0,
          medium: task?.priority === 'medium' ? 1 : 0,
          low: task?.priority === 'low' ? 1 : 0,
          unassigned: !task?.priority || task?.priority === 'unassigned' ? 1 : 0
        };
      }
    }
  });

  const data = Object.keys(monthMap)
    .sort()
    .map(key => monthMap[key]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Task Trend</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No task data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Task Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} tasks`} />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} name="Total Tasks" />
            <Line type="monotone" dataKey="high" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="High Priority" />
            <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Medium Priority" />
            <Line type="monotone" dataKey="low" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Low Priority" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;