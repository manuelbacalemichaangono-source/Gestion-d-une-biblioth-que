import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { notification, fermerNotification } = useLibrary();

  if (!notification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw] animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium border border-slate-800">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="truncate">{notification.message}</span>

        {notification.actionLabel && notification.onAction && (
          <button
            type="button"
            onClick={() => {
              notification.onAction?.();
              fermerNotification();
            }}
            className="ml-2 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            {notification.actionLabel}
          </button>
        )}

        <button
          type="button"
          onClick={fermerNotification}
          className="text-slate-400 hover:text-white p-1 ml-1 rounded-md transition-colors"
          aria-label="Fermer la notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
