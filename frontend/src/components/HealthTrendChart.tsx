'use client';

import React from 'react';

interface HealthTrendProps {
  key?: number;
  trend: HealthTrend;
}

interface DataPoint {
  date: string;
  value: number;
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'worsening';
  data: DataPoint[];
  analysis: string;
}

export function HealthTrendChart({ trend }: HealthTrendProps): React.JSX.Element {
  const getTrendStyle = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'worsening':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return '↗ En amélioration';
      case 'worsening':
        return '↘ En détérioration';
      default:
        return '→ Stable';
    }
  };

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 capitalize">
            {trend.metric}
          </h3>
          <div className="text-sm text-gray-500">
            Tendance: 
            <span className={`ml-2 ${getTrendStyle(trend.trend)}`}>
              {getTrendIcon(trend.trend)}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="relative h-40">
          <div className="absolute inset-0 flex items-end justify-between">
            {trend.data.map((point: DataPoint, idx: number) => {
              const maxValue = Math.max(...trend.data.map((p: DataPoint) => p.value));
              const height = (point.value / maxValue) * 100;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col items-center"
                  style={{ height: '100%', width: `${100 / trend.data.length}%` }}
                >
                  <div className="absolute bottom-0 w-2 bg-blue-500 rounded-t transition-all duration-300 cursor-pointer hover:bg-blue-600"
                    style={{ height: `${height}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      <div>{point.value}</div>
                      <div>{new Date(point.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
          {trend.analysis}
        </div>
      </div>
    </div>
  );
};
