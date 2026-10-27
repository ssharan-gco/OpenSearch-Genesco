import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { MetricPoint } from '../../lib/types';

interface MetricChartProps {
  title: string;
  points: MetricPoint[];
  color: string;
  unit: string;
  theme: 'dark' | 'light';
}

/** Single-series Chart.js line chart for a VictoriaMetrics range result. */
export const MetricChart = ({ title, points, color, unit, theme }: MetricChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;
    const grid = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tick = theme === 'dark' ? '#9ca3af' : '#64748b';
    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: points.map((p) =>
          new Date(p.t).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        ),
        datasets: [
          {
            label: title,
            data: points.map((p) => p.v),
            borderColor: color,
            backgroundColor: `${color}33`,
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}${unit}` } },
        },
        scales: {
          x: { ticks: { color: tick, maxTicksLimit: 8 }, grid: { color: grid } },
          y: { min: 0, max: unit === '%' ? 100 : undefined, ticks: { color: tick }, grid: { color: grid } },
        },
      },
    });
    return () => chart.destroy();
  }, [points, color, unit, theme, title]);

  return (
    <div className="gm-chart-card">
      <div className="gm-chart-title">{title}</div>
      <div className="gm-chart-wrap">
        {points.length === 0 ? <div className="gm-empty">No data in range</div> : <canvas ref={canvasRef} />}
      </div>
    </div>
  );
};
