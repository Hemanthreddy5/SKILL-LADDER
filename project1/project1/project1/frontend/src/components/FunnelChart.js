import React from "react";

export default function FunnelChart({ stages }) {
  // stages: [{ label, count }]
  const max = Math.max(...stages.map(s => s.count), 1);
  return (
    <div className="w-full flex flex-col items-center gap-2 mt-2">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2 w-full">
          <div className="text-sm text-gray-700 w-24 text-right">{s.label}</div>
          <div className="bg-blue-500 h-6 rounded-r transition-all" style={{ width: `${(s.count / max) * 80 + 20}%`, minWidth: 40 }}>
            <span className="text-white pl-2 text-sm">{s.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
