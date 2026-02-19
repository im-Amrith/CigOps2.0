import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Utility to generate random chart data
function getRandomChartData() {
  const cravings = Array.from({ length: 8 }, () => Math.floor(Math.random() * 30) + 2);
  const mood = Array.from({ length: 8 }, () => (Math.random() * 5 + 3).toFixed(1));
  return { cravings, mood };
}

const ProgressChart = () => {
  const chartRef = useRef(null);
  const { cravings, mood } = getRandomChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#8b5cf6',
          font: { size: 16, weight: 'bold', family: 'Inter, Segoe UI, sans-serif' },
          boxWidth: 20,
          boxHeight: 20,
          padding: 24,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(43, 39, 62, 0.95)',
        titleFont: { size: 16, weight: 'bold', family: 'Inter, Segoe UI, sans-serif' },
        bodyFont: { size: 15, family: 'Inter, Segoe UI, sans-serif' },
        padding: 16,
        borderColor: 'rgba(139, 92, 246, 0.25)',
        borderWidth: 1.5,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
        caretSize: 8,
        cornerRadius: 8,
        boxPadding: 8,
      },
    },
    layout: {
      padding: { left: 8, right: 8, top: 8, bottom: 8 },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(139, 92, 246, 0.08)',
          borderDash: [4, 4],
        },
        ticks: {
          color: '#8b5cf6',
          font: { size: 14, weight: 'bold', family: 'Inter, Segoe UI, sans-serif' },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8b5cf6',
          font: { size: 14, weight: 'bold', family: 'Inter, Segoe UI, sans-serif' },
        },
      },
    },
    elements: {
      line: {
        tension: 0.45,
        borderWidth: 4,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        shadowBlur: 8,
        shadowColor: 'rgba(139,92,246,0.12)',
      },
      point: {
        radius: 7,
        hoverRadius: 12,
        backgroundColor: function(context) {
          return context.dataset.label === 'Cravings' ? '#8b5cf6' : '#ec4899';
        },
        borderWidth: 3,
        borderColor: '#fff',
        hoverBorderColor: '#8b5cf6',
        hoverBorderWidth: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(139,92,246,0.18)',
      },
    },
    animation: {
      duration: 1800,
      easing: 'easeInOutQuart',
    },
  };

  // Gradient background for the chart area
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Cravings',
        data: cravings,
        borderColor: '#8b5cf6',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return 'rgba(139, 92, 246, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
          return gradient;
        },
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8b5cf6',
        tension: 0.45,
      },
      {
        fill: false,
        label: 'Mood Score',
        data: mood,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ec4899',
        borderDash: [6, 6],
        tension: 0.45,
      },
    ],
  };

  // Animate chart on mount
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, []);

  return (
    <div className="progress-chart-container" style={{ position: 'relative', minHeight: 320, borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(139,92,246,0.08)' }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        background: 'radial-gradient(circle at 60% 40%, rgba(139,92,246,0.10) 0%, transparent 70%), radial-gradient(circle at 30% 80%, rgba(236,72,153,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '1.5rem',
      }} />
      <Line ref={chartRef} options={options} data={data} style={{ zIndex: 1, borderRadius: '1.5rem' }} />
    </div>
  );
};

export default ProgressChart; 