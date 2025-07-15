import React from 'react';

function StatsCard({ title, value, change, icon, color = 'primary', trend = 'neutral' }) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      border: 'border-primary-200',
    },
    success: {
      bg: 'bg-success-50',
      icon: 'text-success-600',
      border: 'border-success-200',
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'text-warning-600',
      border: 'border-warning-200',
    },
    danger: {
      bg: 'bg-danger-50',
      icon: 'text-danger-600',
      border: 'border-danger-200',
    },
  };

  const trendClasses = {
    up: 'text-success-600',
    down: 'text-danger-600',
    neutral: 'text-gray-600',
  };

  const trendIcons = {
    up: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    down: 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6',
    neutral: 'M5 12h14',
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft border ${colorClasses[color].border} p-6 transition-all duration-300 hover:shadow-medium hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${colorClasses[color].bg} rounded-lg flex items-center justify-center`}>
              <svg className={`w-6 h-6 ${colorClasses[color].icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          
          {change && (
            <div className="mt-4 flex items-center">
              <svg className={`w-4 h-4 ${trendClasses[trend]} mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={trendIcons[trend]} />
              </svg>
              <span className={`text-sm font-medium ${trendClasses[trend]}`}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsCard; 