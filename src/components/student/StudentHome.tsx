import React, { useState, useMemo } from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { Search, SlidersHorizontal, X, ChevronRight } from 'lucide-react';

interface StudentHomeProps {
  onSelectOuvrage: (ouvrage: Ouvrage) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  onSelectOuvrage,
}) => {
  const { ouvrages, rechercheAutomatique, rechercheAvancee } = useLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Champs de recherche avancée
  const [advTitre, setAdvTitre] = useState('');
  const [advAuteur, setAdvAuteur] = useState('');
  const [advTheme, setAdvTheme] = useState('');
  const [advDisponible, setAdvDisponible] = useState(false);

  const themes = useMemo(() => {
    return Array.from(new Set(ouvrages.map((o) => o.thematique))).sort();
  }, [ouvrages]);

  const hasAdvancedCriteria =
    Boolean(advTitre.trim()) ||
    Boolean(advAuteur.trim()) ||
    Boolean(advTheme) ||
    advDisponible;

  const hasQuery = Boolean(searchTerm.trim()) || hasAdvancedCriteria;

  const resultats = useMemo(() => {
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
    return [];
  }, [
    isAdvancedOpen,
    hasAdvancedCriteria,
    advTitre,
    advAuteur,
    advTheme,
    advDisponible,
    searchTerm,
    rechercheAutomatique,
    rechercheAvancee,
  ]);

  const handleResetAdvanced = () => {
    setAdvTitre('');
    setAdvAuteur('');
    setAdvTheme('');
    setAdvDisponible(false);
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Barre de recherche type Google + Bouton Recherche avancée juste à côté */}
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
            placeholder="Rechercher un ouvrage..."
            className="w-full min-h-[48px] pl-11 pr-10 py-3 text-sm bg-white rounded-2xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            autoFocus
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
          className={`min-h-[48px] px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isAdvancedOpen || hasAdvancedCriteria
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Avancée</span>
        </button>
      </div>

      {/* Panneau de recherche avancée (uniquement si ouvert) */}
      {isAdvancedOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              value={advTitre}
              onChange={(e) => setAdvTitre(e.target.value)}
              placeholder="Titre"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={advAuteur}
              onChange={(e) => setAdvAuteur(e.target.value)}
              placeholder="Auteur"
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <select
              value={advTheme}
              onChange={(e) => setAdvTheme(e.target.value)}
              className="flex-1 min-h-[44px] px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Toutes les thématiques</option>
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="min-h-[44px] px-2 flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={advDisponible}
                onChange={(e) => setAdvDisponible(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Disponibles uniquement</span>
            </label>
          </div>

          {hasAdvancedCriteria && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetAdvanced}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 py-1 px-2 cursor-pointer"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggestions automatiques / Résultats : RIEN ne s'affiche tant qu'aucune recherche n'est saisie */}
      {hasQuery && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {resultats.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-slate-400">
              Aucun ouvrage correspondant.
            </div>
          ) : (
            resultats.map((ouvrage) => (
              <button
                key={ouvrage.id}
                type="button"
                onClick={() => onSelectOuvrage(ouvrage)}
                className="w-full min-h-[58px] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                      {ouvrage.titre}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {ouvrage.auteur}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
