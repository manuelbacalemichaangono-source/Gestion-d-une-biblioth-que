import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  Bell,
  CheckCheck,
  BookOpen,
  AlertTriangle,
  Clock,
  Info,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { NotificationType } from '../../types/library';

type FilterType = 'all' | 'unread' | 'emprunts' | 'retards';

export const StudentNotifications: React.FC = () => {
  const {
    currentUser,
    getNotificationsEtudiant,
    marquerNotificationLue,
    marquerToutesNotificationsLues,
  } = useLibrary();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return getNotificationsEtudiant(currentUser.id);
  }, [currentUser, getNotificationsEtudiant]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.lu).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.lu);
      case 'emprunts':
        return notifications.filter((n) => n.type === 'emprunt');
      case 'retards':
        return notifications.filter(
          (n) => n.type === 'retard' || n.type === 'rappel'
        );
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  if (!currentUser) {
    return (
      <div className="py-12 px-4 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Bell className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Connectez-vous pour consulter vos notifications
        </p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Les alertes automatiques pour vos réservations et vos délais de prêt apparaîtront ici.
        </p>
      </div>
    );
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'emprunt':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      case 'retard':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'rappel':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête de la section */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi automatique de vos prêts et retraits
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => marquerToutesNotificationsLues(currentUser.id)}
            className="min-h-[36px] px-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tout marquer lu</span>
          </button>
        )}
      </div>

      {/* Filtres de catégorie */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { key: 'all', label: `Toutes (${notifications.length})` },
            { key: 'unread', label: `Non lues (${unreadCount})` },
            {
              key: 'emprunts',
              label: `Retraits (${notifications.filter((n) => n.type === 'emprunt').length})`,
            },
            {
              key: 'retards',
              label: `Rappels & Retards (${notifications.filter((n) => n.type === 'retard' || n.type === 'rappel').length})`,
            },
          ] as { key: FilterType; label: string }[]
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={`min-h-[34px] px-3 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === f.key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">
              Aucune notification
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Vous êtes à jour. Dès que vous effectuez un emprunt ou que la date limite approche, une notification automatique apparaîtra ici.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.lu) marquerNotificationLue(notif.id);
              }}
              className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                notif.lu ? 'bg-white hover:bg-slate-50/70' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
              }`}
            >
              {getIcon(notif.type)}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-xs font-bold ${
                      notif.lu ? 'text-slate-800' : 'text-slate-900'
                    }`}
                  >
                    {notif.titre}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{notif.date}</span>
                    </span>
                    {!notif.lu && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {notif.message}
                </p>

                {notif.ouvrage_titre && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700">
                    <BookOpen className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[200px]">
                      {notif.ouvrage_titre}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
