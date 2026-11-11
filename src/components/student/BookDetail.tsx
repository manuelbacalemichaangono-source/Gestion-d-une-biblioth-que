import React, { useState } from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import {
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

interface BookDetailProps {
  ouvrage: Ouvrage;
  onBack: () => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ ouvrage }) => {
  const {
    currentUser,
    getExemplairesOuvrage,
    emprunterOuvrageEtudiant,
    ouvrirAuthModal,
  } = useLibrary();

  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exemplaires = getExemplairesOuvrage(ouvrage.id);
  const exemplairesDisponibles = exemplaires.filter(
    (ex) => ex.statut === 'disponible'
  );
  const estDisponible = exemplairesDisponibles.length > 0;

  const handleEmprunter = () => {
    if (!currentUser) {
      ouvrirAuthModal('login');
      return;
    }

    if (!estDisponible) return;

    setIsSubmitting(true);
    const res = emprunterOuvrageEtudiant(ouvrage.id);
    setIsSubmitting(false);

    if (res.success) {
      setConfirmationMessage(
        `Votre demande est enregistrée. Veuillez passer retirer votre exemplaire à la bibliothèque.`
      );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Confirmation automatique d'emprunt */}
      {confirmationMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Emprunt validé</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            {confirmationMessage}
          </p>
        </div>
      )}

      {/* Fiche de l'ouvrage */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {ouvrage.titre}
          </h1>
        </div>

        {/* Disponibilité */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-xs text-slate-500 block">Disponibilité</span>
            <div className="mt-1">
              {estDisponible ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Disponible</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>Indisponible</span>
                </span>
              )}
            </div>
          </div>

          {/* Bouton Ajouter Emprunt */}
          <button
            type="button"
            onClick={handleEmprunter}
            disabled={!estDisponible || isSubmitting}
            className={`min-h-[46px] px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              estDisponible
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {!currentUser
                ? 'Se connecter pour emprunter'
                : estDisponible
                ? 'Ajouter un emprunt'
                : 'Indisponible'}
            </span>
          </button>
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Description
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {ouvrage.description ||
              `Découvrez cet ouvrage disponible au prêt pour les étudiants de l’université.`}
          </p>
        </div>
      </div>
    </div>
  );
};
