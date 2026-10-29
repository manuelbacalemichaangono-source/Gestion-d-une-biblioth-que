import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';

type LoanView = 'actifs' | 'passes';

export const StudentLoans: React.FC = () => {
  const { currentUser, getEmpruntsEtudiant } = useLibrary();
  const [view, setView] = useState<LoanView>('actifs');

  const allLoans = useMemo(() => {
    if (!currentUser) return [];
    return getEmpruntsEtudiant(currentUser.id, currentUser.email);
  }, [currentUser, getEmpruntsEtudiant]);

  const displayedLoans = useMemo(() => {
    return view === 'actifs'
      ? allLoans.filter((l) => !l.date_retour_effective)
      : allLoans.filter((l) => Boolean(l.date_retour_effective));
  }, [allLoans, view]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Mes emprunts
        </h1>

        <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setView('actifs')}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              view === 'actifs'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En cours
          </button>
          <button
            type="button"
            onClick={() => setView('passes')}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              view === 'passes'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Passés
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {displayedLoans.length === 0 ? (
          <div className="py-10 px-4 text-center text-xs text-slate-400">
            {view === 'actifs'
              ? 'Aucun emprunt en cours.'
              : 'Aucun prêt terminé.'}
          </div>
        ) : (
          displayedLoans.map((loan) => (
            <div
              key={loan.id}
              className="px-5 py-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {loan.ouvrage_titre}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {loan.ouvrage_auteur} · Exemplaire {loan.exemplaire_numero}
                </div>
              </div>

              <div className="text-right shrink-0 text-xs font-mono text-slate-500 tabular-nums">
                {loan.date_retour_effective
                  ? loan.date_retour_effective
                  : loan.date_retour_prevue}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
