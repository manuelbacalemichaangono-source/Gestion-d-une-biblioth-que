import React, { useState, useMemo } from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

interface StudentHomeProps {
  onSelectOuvrage: (ouvrage: Ouvrage) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onSelectOuvrage,
}) => {
  const {
    ouvrages,
    exemplaires,
    rechercheAutomatique,
    rechercheAvancee,
  } = useLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Recherche avancée
  const [advTitre, setAdvTitre] = useState('');
  const [advAuteur, setAdvAuteur] = useState('');
  const [advTheme, setAdvTheme] = useState('');
  const [advDisponible, setAdvDisponible] = useState(false);

  // Pagination à 3 livres par page
  const [currentPage, setCurrentPage] = useState(0);
  const BOOKS_PER_PAGE = 3;

  const themes = useMemo(() => {
    return Array.from(new Set(ouvrages.map((o) => o.thematique))).sort();
  }, [ouvrages]);

  const hasAdvancedCriteria =
    Boolean(advTitre.trim()) ||
    Boolean(advAuteur.trim()) ||
    Boolean(advTheme) ||
    advDisponible;

  const isSearchActive = Boolean(searchTerm.trim()) || hasAdvancedCriteria;

  const listeOuvrages = useMemo(() => {
    if (isAdvancedOpen && hasAdvancedCriteria) {
      return rechercheAvancee({
        titre: advTitre,
        auteur: advAuteur,
        thematique: advTheme,
        disponibleUniquement: advDisponible,
      });
    }

    if (searchTerm.trim()) {
      return rechercheAutomatique(searchTerm);
    }

    return ouvrages;
  }, [
    isAdvancedOpen,
    hasAdvancedCriteria,
    advTitre,
    advAuteur,
    advTheme,
    advDisponible,
    searchTerm,
    rechercheAvancee,
    rechercheAutomatique,
    ouvrages,
  ]);

  const totalPages = Math.max(1, Math.ceil(listeOuvrages.length / BOOKS_PER_PAGE));

  // Réinitialiser la page si les résultats changent
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, advTitre, advAuteur, advTheme, advDisponible, isAdvancedOpen]);

  const livresAffiches = useMemo(() => {
    const start = currentPage * BOOKS_PER_PAGE;
    return listeOuvrages.slice(start, start + BOOKS_PER_PAGE);
  }, [listeOuvrages, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  const isOuvrageDispo = (ouvrageId: string) => {
    return exemplaires.some(
      (ex) => ex.ouvrage_id === ouvrageId && ex.statut === 'disponible'
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Barre de recherche simple + Bouton recherche avancée à côté */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (isAdvancedOpen && e.target.value.trim()) {
                setIsAdvancedOpen(false);
              }
            }}
            placeholder="Rechercher un livre..."
            className="w-full min-h-[46px] pl-11 pr-10 py-2.5 text-sm bg-white rounded-2xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
              aria-label="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsAdvancedOpen((v) => !v)}
          className={`min-h-[46px] px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            isAdvancedOpen || hasAdvancedCriteria
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Recherche avancée</span>
        </button>
      </div>

      {/* Panneau de recherche avancée */}
      {isAdvancedOpen && (
        <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={advTitre}
              onChange={(e) => setAdvTitre(e.target.value)}
              placeholder="Titre"
              className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={advAuteur}
              onChange={(e) => setAdvAuteur(e.target.value)}
              placeholder="Auteur"
              className="w-full min-h-[40px] px-3.5 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <select
              value={advTheme}
              onChange={(e) => setAdvTheme(e.target.value)}
              className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Toutes les thématiques</option>
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="min-h-[40px] px-3 flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={advDisponible}
                onChange={(e) => setAdvDisponible(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Disponibles uniquement</span>
            </label>
          </div>
        </div>
      )}

      {/* Liste des 3 livres par page avec glissement gauche / droite */}
      <div className="space-y-3">
        {livresAffiches.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            Aucun livre correspondant.
          </div>
        ) : (
          <div className="space-y-3">
            {livresAffiches.map((ouvrage) => {
              const dispo = isOuvrageDispo(ouvrage.id);

              return (
                <div
                  key={ouvrage.id}
                  onClick={() => onSelectOuvrage(ouvrage)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  {/* Seulement le titre */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {ouvrage.titre}
                  </h3>

                  {/* Seulement la disponibilité */}
                  <div className="shrink-0">
                    {dispo ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Disponible</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>Indisponible</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contrôles de glissement / pagination gauche-droite */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 px-1">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentPage === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-white bg-slate-100 hover:shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            <span className="text-xs font-mono font-semibold text-slate-500">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentPage >= totalPages - 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-700 hover:bg-white bg-slate-100 hover:shadow-2xs'
              }`}
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
