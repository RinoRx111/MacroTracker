import React from 'react';

export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'bg-purple-600',
  showLabel = true 
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">{value}</span>
          <span className="text-gray-600 dark:text-gray-400">{max}</span>
        </div>
      )}
    </div>
  );
};

export const CircularProgress = ({ value, max = 100, color = 'text-purple-600', size = 'md' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = size === 'sm' ? 30 : size === 'md' ? 45 : 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const svgSize = radius * 2 + 20;

  return (
    <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={radius + 10}
          cy={radius + 10}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs font-bold text-gray-900 dark:text-white">{Math.round(percentage)}%</div>
      </div>
    </div>
  );
};
