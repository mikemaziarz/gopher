import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ScoreTrendChart = ({ rounds }) => {
  const sortedRounds = [...rounds]
    .filter(r => r.final_score != null && r.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  //console.log("Rendering ScoreTrendChart with", sortedRounds.length, "rounds");

  const data = {
    labels: sortedRounds.map(r => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Final Score',
        data: sortedRounds.map(r => r.final_score),
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function (tooltipItems) {
            const item = tooltipItems[0];
            const round = sortedRounds[item.dataIndex];
            const date = new Date(round.date).toLocaleDateString();
            return `${round.course_name} - ${date}`;
          },
          label: function (tooltipItem) {
            const round = sortedRounds[tooltipItem.dataIndex];
            return `Score: ${tooltipItem.formattedValue} (${round.course_name})`;
          }
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'Score' }
      },
      x: {
        title: { display: true, text: 'Date' }
      }
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Score Trend</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default ScoreTrendChart;