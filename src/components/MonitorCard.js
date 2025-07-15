import React from 'react';
import { useNavigate } from 'react-router-dom';

function MonitorCard({ monitor }) {
  const navigate = useNavigate();

  const statusConfig = {
    Working: {
      color: 'success',
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    Broken: {
      color: 'danger',
      bg: 'bg-danger-50',
      text: 'text-danger-700',
      border: 'border-danger-200',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
    },
    Pending: {
      color: 'warning',
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      border: 'border-warning-200',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
  };

  const config = statusConfig[monitor.status] || statusConfig.Working;

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft border ${config.border} p-6 transition-all duration-300 hover:shadow-medium hover:scale-[1.02] cursor-pointer`} onClick={() => navigate(`/monitor/${monitor.id}`)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{monitor.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={config.icon} />
              </svg>
              {monitor.status === 'Working' ? 'Operational' : monitor.status === 'Broken' ? 'Needs Attention' : 'Pending'}
            </span>
            <span className="text-xs text-gray-500">
              Last checked: {getTimeAgo(monitor.lastChecked)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {monitor.status === 'Broken' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/fix/${monitor.id}`);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-danger-600 hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500 transition-colors duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Fix Now
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/monitor/${monitor.id}`);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className={`font-medium ${config.text}`}>
            {monitor.status === 'Working' ? 'Operational' : monitor.status === 'Broken' ? 'Needs Attention' : 'Pending'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last Action</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {monitor.lastAction}
          </span>
        </div>

        {monitor.errorSummary && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-600">{monitor.errorSummary}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Monitor ID: {monitor.id}</span>
          <span>{getTimeAgo(monitor.lastChecked)}</span>
        </div>
      </div>
    </div>
  );
}

export default MonitorCard; 