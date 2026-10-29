import React, { useMemo } from 'react';
import { StudentTab } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { Bell, BookOpen, ChevronRight, Search } from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: StudentTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateTab,
}) => {
  const { currentUser, getEmpruntsEtudiant, calculerRetard } = useLibrary();

  const studentLoans = useMemo(() => {
    if (!currentUser) return [];
    return getEmpruntsEtudiant(currentUser.id, currentUser.email);
  }, [currentUser, getEmpruntsEtudiant]);

  const activeLoans = useMemo(
    () => studentLoans.filter((l) => !l.date_retour_effective),
    [studentLoans]
  );

  const returnedLoans = useMemo(
    () => studentLoans.filter((l) => Boolean(l.date_retour_effective)),
    [studentLoans]
  );

  const overdueNotifications = useMemo(
    () =>
      activeLoans.filter(
        (l) => calculerRetard(l).estEnRetard || l.rappel_envoye
      ),
    [activeLoans, calculerRetard]
  );

  if (!currentUser) return null;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Bonjour, {currentUser.prenom}
      </h1>

      {/* Notification système en cas de dépassement d'échéance */}
      {overdueNotifications.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 text-sm font-semibold">
            <Bell className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Notification de retour</span>
          </div>
          <div className="space-y-1">
            {overdueNotifications.map((loan) => (
              <p key={loan.id} className="text-xs text-amber-900 leading-relaxed">
                Le délai de prêt pour « {loan.ouvrage_titre} » est dépassé. Merci
                de restituer l’ouvrage à la bibliothèque.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Résumé compact en 2 cartes */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('emprunts')}
          className="bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl p-5 text-left transition-colors cursor-pointer"
        >
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {activeLoans.length}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            En cours
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('emprunts')}
          className="bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl p-5 text-left transition-colors cursor-pointer"
        >
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {returnedLoans.length}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            Restitués
          </div>
        </button>
      </div>

      {/* Accès rapide */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => onNavigateTab('recherche')}
          className="w-full min-h-[60px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Rechercher un livre
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('emprunts')}
          className="w-full min-h-[60px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Voir mes emprunts
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
