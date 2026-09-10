import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Weather Data Temporarily Unavailable',
  message = "We couldn't refresh the latest atmospheric telemetry from the station. Please try again.",
  onRetry,
  className = ''
}) => {
  return (
    <div className={`glass-panel border-red-500/30 bg-red-950/20 rounded-3xl p-8 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
