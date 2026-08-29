import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const WeeklyAttendanceChart = ({ data }) => {
  console.log('WeeklyAttendanceChart received data:', data);

  // Handle different data structures
  let chartData = [];
  
  if (data) {
    // If data has labels and data arrays (expected structure)
    if (data.labels && Array.isArray(data.labels) && data.data && Array.isArray(data.data)) {
      chartData = data.labels.map((label, index) => ({
        day: label,
        attendance: data.data[index] || 0,
      }));
    } 
    // If data is an array of numbers
    else if (Array.isArray(data)) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      chartData = data.map((value, index) => ({
        day: days[index] || `Day ${index + 1}`,
        attendance: value || 0,
      }));
    }
  }

  console.log('Processed chart data:', chartData);

  // Check if there's any attendance data > 0
  const hasData = chartData.some(item => item.attendance > 0);

  if (chartData.length === 0 || !hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Weekly Attendance Overview
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No attendance data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Weekly Attendance Overview
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="attendance"
              fill="#4F46E5"
              name="Present Days"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAttendanceChart;