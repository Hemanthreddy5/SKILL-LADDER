import React from 'react';

export function PieChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
            {Object.entries(data).map(([key, value], index) => {
              const percentage = (value / total) * 100;
              const circumference = 2 * Math.PI * 16;
              const strokeDasharray = (percentage / 100) * circumference;
              const strokeDashoffset = circumference - strokeDasharray;
              const rotation = index === 0 ? 0 : 
                Object.entries(data).slice(0, index).reduce((sum, [_, val]) => 
                  sum + (val / total) * 360, 0
                );

              return (
                <circle
                  key={key}
                  cx="16"
                  cy="16"
                  r="16"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} 16 16)`}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(data).map(([key, value], index) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-700">{key}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {value} ({Math.round((value / total) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
