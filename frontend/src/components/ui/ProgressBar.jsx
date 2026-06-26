import React, { useState, useEffect } from 'react';

export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'bg-[var(--accent-primary)]',
  showLabel = true 
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate the progress bar fill on load/update
    const timer = setTimeout(() => {
      setWidth(Math.min(percentage, 100));
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div className="w-full">
      <div className="w-full bg-[var(--border-main)] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-2 text-xs font-semibold text-[var(--text-secondary)]">
          <span className="stat-number">{Math.round(value)}</span>
          <span className="stat-number">{Math.round(max)}</span>
        </div>
      )}
    </div>
  );
};

export const CircularProgress = ({ value, max = 100, color = 'bg-[var(--accent-primary)]', size = 'md' }) => {
  // Translate text-color based arguments to bg-color classes
  let barColor = 'bg-[var(--accent-primary)]';
  
  if (color.includes('rose') || color.includes('emerald') || color.includes('green') || color.includes('cyan') || color.includes('yellow') || color.includes('red')) {
    barColor = 'bg-[var(--accent-primary)]';
  } else if (color.includes('blue')) {
    barColor = 'bg-[var(--hydration-accent)]';
  }

  // CircularProgress is now rendered as a clean horizontal progress bar (no rings allowed)
  return (
    <div className="w-full min-w-[120px]">
      <ProgressBar 
        value={value} 
        max={max} 
        color={barColor} 
        showLabel={false} 
      />
    </div>
  );
};
