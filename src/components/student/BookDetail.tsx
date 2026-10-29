import React from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

interface BookDetailProps {
  ouvrage: Ouvrage;
  onBack: () => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ ouvrage, onBack }) => {
  const { getExemplairesOuvrage, getActiveLoanForExemplaire } = useLibrary();
  const exemplaires = getExemplairesOuvrage(ouvrage.id);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 pr-3 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {ouvrage.titre}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {ouvrage.auteur} · {ouvrage.thematique}
          </p>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {exemplaires.map((ex) => {
            const estDisponible = ex.statut === 'disponible';
            const activeLoan = !estDisponible
              ? getActiveLoanForExemplaire(ex.id)
              : undefined;

            return (
              <div
                key={ex.id}
                className="py-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    Exemplaire {ex.numero}
                  </span>
                  {!estDisponible && activeLoan && (
                    <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                      Retour prévu le {activeLoan.date_retour_prevue}
                    </p>
                  )}
                </div>

                {estDisponible ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Disponible</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 whitespace-nowrap">
                    <Clock className="w-4 h-4" />
                    <span>Indisponible</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
