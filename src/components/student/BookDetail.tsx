import React, { useState } from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { ArrowLeft, BookOpen, CheckCircle, Info } from 'lucide-react';

interface BookDetailProps {
  ouvrage: Ouvrage;
  onBack: () => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ ouvrage, onBack }) => {
  const { getExemplairesOuvrage, getActiveLoanForExemplaire } = useLibrary();
  const exemplaires = getExemplairesOuvrage(ouvrage.id);

  // Modal d'instruction pour l'emprunt physique
  const [borrowInstructionCopy, setBorrowInstructionCopy] = useState<number | null>(null);

  return (
    <div className="w-full max-w-lg mx-auto py-4 px-4 sm:px-0">
      {/* Bouton retour */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 py-1.5 pr-3 rounded-lg active:scale-95 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au catalogue</span>
      </button>

      {/* Fiche de l'ouvrage */}
      <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        {/* Titre, Auteur, Thématique */}
        <div className="space-y-1 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
            {ouvrage.titre}
          </h1>
          <p className="text-sm font-medium text-slate-600">{ouvrage.auteur}</p>
          <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {ouvrage.thematique}
          </span>
        </div>

        {/* Liste des exemplaires NUMÉROTÉS */}
        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Exemplaires disponibles et statut
          </h2>

          <div className="divide-y divide-slate-100">
            {exemplaires.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">Aucun exemplaire répertorié.</p>
            ) : (
              exemplaires.map((ex) => {
                const estDisponible = ex.statut === 'disponible';
                const activeLoan = !estDisponible ? getActiveLoanForExemplaire(ex.id) : undefined;

                return (
                  <div
                    key={ex.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {/* Numéro d'exemplaire */}
                        <span className="font-semibold text-sm text-slate-900">
                          Exemplaire {ex.numero}
                        </span>

                        {/* Statut par couleur : vert = disponible, rouge = non disponible */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            estDisponible
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              estDisponible ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            aria-hidden="true"
                          />
                          {estDisponible ? 'Disponible' : 'Non disponible'}
                        </span>
                      </div>

                      {/* Si l'exemplaire n'est pas disponible, afficher la date prévue de retour */}
                      {!estDisponible && activeLoan && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="text-slate-400">Retour prévu le :</span>
                          <span className="font-medium text-slate-700">
                            {activeLoan.date_retour_prevue}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Bouton Emprunter pour chaque exemplaire */}
                    <div>
                      {estDisponible ? (
                        <button
                          type="button"
                          onClick={() => setBorrowInstructionCopy(ex.numero)}
                          className="w-full sm:w-auto py-1.5 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Emprunter</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto py-1.5 px-3 text-xs font-medium text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
                        >
                          Indisponible
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal / Message d'information claire sur la procédure d'emprunt à la bibliothèque */}
      {borrowInstructionCopy !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Info className="w-5 h-5" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                Procédure de prêt • Exemplaire {borrowInstructionCopy}
              </h3>
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 leading-relaxed font-medium">
                Pour emprunter ce livre, présentez-vous à la bibliothèque avec votre carte de bibliothèque.
              </div>
              <p className="text-[11px] text-slate-400">
                Le gestionnaire validera l'emprunt sur place après lecture du code physique de votre carte et du livre.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBorrowInstructionCopy(null)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
