import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { useAppTheme } from "../../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const AttendanceChart = () => {
  const { charts } = useSelector((state) => state.dashboard);
  const { primaryColor, themeMode } = useAppTheme();
  
  // Helper function to adjust color brightness for better contrast
  const adjustColor = (color, percent) => {
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }
    
    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));
    
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // Create dynamic colors based on primary theme color
  const lineColor = primaryColor;
  const fillColor = `${primaryColor}33`; // 20% opacity
  const pointColor = primaryColor;
  const pointBorderColor = primaryColor;
  const tooltipBgColor = primaryColor;
  
  // For dark mode, adjust grid color
  const gridColor = themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  
  // For axis text color
  const axisTextColor = themeMode === 'dark' ? '#9ca3af' : '#6b7280';

  const data = {
    labels: charts?.weekly_attendance?.labels || [],
    datasets: [
      {
        label: "Present",
        data: charts?.weekly_attendance?.data || [],
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: pointColor,
        pointBorderColor: pointBorderColor,
        pointHoverBackgroundColor: adjustColor(primaryColor, -20),
        pointHoverBorderColor: adjustColor(primaryColor, -20),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 8,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: true,
        },
        ticks: {
          font: {
            size: 10,
          },
          color: axisTextColor,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          font: {
            size: 10,
          },
          color: axisTextColor,
        },
        grid: {
          color: gridColor,
          drawBorder: true,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">
            Attendance Analytics
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily presence trend for the last 7 days
          </p>
        </div>
        <select 
          className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300"
          style={{ 
            borderColor: primaryColor,
            outline: `none`
          }}
        >
          <option>Last 7 Days</option>
        </select>
      </div>
      <div className="h-[240px] md:h-[280px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default AttendanceChart;