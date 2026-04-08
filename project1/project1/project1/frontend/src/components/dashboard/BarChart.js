import React from 'react';

export function BarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const maxValue = Math.max(...Object.values(data));
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {Object.entries(data).map(([key, value], index) => {
          const percentage = (value / maxValue) * 100;
          const barColor = colors[index % colors.length];
          
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">{key}</span>
                <span className="text-gray-900 font-semibold">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: barColor
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-4">
        Showing top {Object.keys(data).length} skills by frequency
      </div>
    </div>
  );
}
