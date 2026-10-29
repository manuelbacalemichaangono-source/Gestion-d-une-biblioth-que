import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Bell, X } from 'lucide-react';

export const ToastNotification: React.FC = () => {
  const { notification, fermerNotification } = useLibrary();

  if (!notification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[92vw]"
    >
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 text-xs font-medium border border-slate-800">
        <Bell className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate">{notification.message}</span>

        {notification.actionLabel && notification.onAction && (
          <button
            type="button"
            onClick={() => {
              notification.onAction?.();
              fermerNotification();
            }}
            className="ml-1 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-slate-800 rounded-lg cursor-pointer shrink-0"
          >
            {notification.actionLabel}
          </button>
        )}

        <button
          type="button"
          onClick={fermerNotification}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer shrink-0"
          aria-label="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
