import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const AttendanceStatsChart = ({ stats }) => {
  console.log('AttendanceStatsChart stats:', stats); // Debug log

  const data = stats ? [
    {
      subject: 'Present',
      Today: stats.today?.present || 0,
      Yesterday: stats.yesterday?.present || 0,
      fullMark: 20,
    },
    {
      subject: 'Absent',
      Today: stats.today?.absent || 0,
      Yesterday: stats.yesterday?.absent || 0,
      fullMark: 20,
    },
    {
      subject: 'Late',
      Today: stats.today?.late || 0,
      Yesterday: stats.yesterday?.late || 0,
      fullMark: 20,
    },
    {
      subject: 'Punched In',
      Today: stats.today?.punched_in || 0,
      Yesterday: stats.yesterday?.punched_in || 0,
      fullMark: 20,
    },
    {
      subject: 'Punched Out',
      Today: stats.today?.punched_out || 0,
      Yesterday: stats.yesterday?.punched_out || 0,
      fullMark: 20,
    },
  ] : [];

  // Check if there's any data to display
  const hasData = data.some(item => item.Today > 0 || item.Yesterday > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Attendance Distribution
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
        Attendance Distribution
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            <Tooltip />
            <Legend />
            <Radar
              name="Today"
              dataKey="Today"
              stroke="#4F46E5"
              fill="#4F46E5"
              fillOpacity={0.6}
            />
            <Radar
              name="Yesterday"
              dataKey="Yesterday"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceStatsChart;