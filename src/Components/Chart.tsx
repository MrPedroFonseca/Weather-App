import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartContainerStyle = {
  width: "90%", // Use percentage to make the container responsive
  maxWidth: "800px", // Restrict maximum width
  height: "auto", // Let the height adjust dynamically
  aspectRatio: "2", // Maintain a 2:1 aspect ratio
  margin: "20px auto",
  padding: "1%",
  background: "#f9f9f9",
  borderRadius: "12px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
};

const Chart = ({ chartData, unit }: { chartData: any; unit: string }) => {
  const generateHourlyData = () => {
    const temperatures: number[] = [];
    const labels: string[] = [];

    let index = 0;

    for (const temp of chartData) {
      if (index < 24) {
        // Limit to 24 hours of data
        labels.push(temp.time.slice(11, 16)); // Extract "HH:mm" from time
        temperatures.push(temp.temperature);
        index++;
      }
    }

    return { labels, temperatures };
  };

  const { labels, temperatures } = generateHourlyData();

  const data = {
    labels,
    datasets: [
      {
        label: `Temperature ${unit}`,
        data: temperatures,
        borderColor: "rgba(41, 80, 228, 1)",
        backgroundColor: "rgba(41, 80, 228, 0.2)",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Temperature Over the Next 24 Hours",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: `Temperature ${unit}`,
        },
        suggestedMin: 0,
        suggestedMax: 20,
      },
    },
  };

  return (
    <div style={chartContainerStyle}>
      <Line data={data} options={options} />
    </div>
  );
};

export default Chart;
