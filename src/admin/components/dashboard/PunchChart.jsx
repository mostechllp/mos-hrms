import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";
import { useAppTheme } from "../../../context/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const PunchChart = () => {
  const { charts } = useSelector((state) => state.dashboard);
  const { primaryColor, themeMode } = useAppTheme();
  
  // Helper function to adjust color brightness
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

  // Get axis colors based on theme mode
  const axisTextColor = themeMode === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const data = {
    labels: ["Today", "Yesterday"],
    datasets: [
      {
        label: "In",
        data: [
          charts?.punch_chart?.today?.punched_in || 0,
          charts?.punch_chart?.yesterday?.punched_in || 0,
        ],
        backgroundColor: primaryColor,
        hoverBackgroundColor: adjustColor(primaryColor, -20),
        borderRadius: 6,
      },
      {
        label: "Out",
        data: [
          charts?.punch_chart?.today?.punched_out || 0,
          charts?.punch_chart?.yesterday?.punched_out || 0,
        ],
        backgroundColor: "#ef4444",
        hoverBackgroundColor: "#dc2626",
        borderRadius: 6,
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
        backgroundColor: primaryColor,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.raw || 0;
            return `${label}: ${value} employees`;
          }
        }
      },
    },
    scales: {
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
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
          color: axisTextColor,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Get dynamic values from charts data
  const todayIn = charts?.punch_chart?.today?.punched_in || 0;
  const yesterdayIn = charts?.punch_chart?.yesterday?.punched_in || 0;
  const todayOut = charts?.punch_chart?.today?.punched_out || 0;
  const yesterdayOut = charts?.punch_chart?.yesterday?.punched_out || 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 w-full transition-all duration-300">
      <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        <i className="fas fa-chart-bar mr-2" style={{ color: primaryColor }}></i>
        Punch Activity
      </h3>
      <div className="h-[180px] md:h-[200px] w-full mb-4">
        <Bar data={data} options={options} />
      </div>
      <div className="flex justify-center gap-4 md:gap-6 mb-4 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
          <span className="text-gray-600 dark:text-gray-400">Punched In</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-gray-600 dark:text-gray-400">Punched Out</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"></th>
              <th className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                Today
              </th>
              <th className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                Yesterday
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 text-center font-semibold text-gray-700 dark:text-gray-300 text-sm">
                In
              </td>
              <td className="py-2 text-center font-bold" style={{ color: primaryColor }}>
                {todayIn}
              </td>
              <td className="py-2 text-center font-bold" style={{ color: primaryColor }}>
                {yesterdayIn}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-center font-semibold text-gray-700 dark:text-gray-300 text-sm">
                Out
              </td>
              <td className="py-2 text-center text-red-500 font-bold">{todayOut}</td>
              <td className="py-2 text-center text-red-500 font-bold">{yesterdayOut}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PunchChart;