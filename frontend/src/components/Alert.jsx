import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 icon-emerald',
    error: 'bg-red-50 text-red-800 border-red-200 icon-red',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 icon-amber',
    info: 'bg-blue-50 text-blue-800 border-blue-200 icon-blue',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  };

  return (
    <div className={`alert-box alert-${type}`} role="alert">
      <div className="alert-content">
        {icons[type] || icons.info}
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close" aria-label="Dismiss alert">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
