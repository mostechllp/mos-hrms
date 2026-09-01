/* eslint-disable no-unused-vars */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DepartmentDistributionChart = ({ employees = [] }) => {
  // Group employees by department
  const departmentMap = {};
  employees.forEach(emp => {
    const deptName = emp?.user?.department?.name || 'Unassigned';
    if (departmentMap[deptName]) {
      departmentMap[deptName] += 1;
    } else {
      departmentMap[deptName] = 1;
    }
  });

  const data = Object.keys(departmentMap).map(key => ({
    name: key,
    value: departmentMap[key]
  }));

  const COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#e34948', '#4a3aa7', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Department Distribution</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No employee data available
        </div>
      </div>
    );
  }

  // Custom label rendering - only show labels for segments with enough space
  const renderLabel = ({ name, percent, cx, cy, midAngle, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is significant enough (>= 8%)
    if (percent < 0.08) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
        fontSize={11}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Department Distribution</h3>
        <span className="text-xs text-gray-400">{data.length} departments</span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderLabel}
              outerRadius={70}
              innerRadius={30}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} employees`, name]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                fontSize: '11px',
                paddingTop: '8px',
                gap: '4px'
              }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-gray-600 text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentDistributionChart;