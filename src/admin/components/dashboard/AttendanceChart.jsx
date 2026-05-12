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
  const data = {
    labels: charts?.weekly_attendance?.labels || [],
    datasets: [
      {
        label: "Present",
        data: charts?.weekly_attendance?.data || [],
        borderColor: "#22c55e", //line color
        backgroundColor: "#22c55e33", //light fill under line
        fill: true, // enables area fill
        tension: 0.4, // smooth curve
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#22c55e",
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
        backgroundColor: "#2ecc71",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          font: {
            size: 10,
          },
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
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
        <select className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300">
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
