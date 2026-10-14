import React, { useState, useMemo } from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { Search, ChevronRight } from 'lucide-react';

interface StudentHomeProps {
  onSelectOuvrage: (ouvrage: Ouvrage) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ onSelectOuvrage }) => {
  const { rechercherOuvrages } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');

  const resultats = useMemo(() => {
    return rechercherOuvrages(searchTerm);
  }, [searchTerm, rechercherOuvrages]);

  return (
    <div className="w-full max-w-lg mx-auto py-4 px-4 sm:px-0">
      {/* Grande barre de recherche (titre, auteur, thématique) */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par titre, auteur, thématique..."
          className="w-full pl-12 pr-4 py-4 text-base bg-white rounded-2xl border border-slate-200 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          autoFocus
        />
      </div>

      {/* Résultats en temps réel sous forme de liste simple (titre + auteur, rien d'autre) */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {resultats.length === 0 ? (
          <div className="py-12 px-6 text-center text-slate-400 text-sm">
            Aucun résultat trouvé pour « {searchTerm} ».
          </div>
        ) : (
          resultats.map((ouvrage) => (
            <button
              key={ouvrage.id}
              type="button"
              onClick={() => onSelectOuvrage(ouvrage)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="pr-3 min-w-0">
                {/* Titre */}
                <h2 className="text-base font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {ouvrage.titre}
                </h2>
                {/* Auteur */}
                <p className="text-sm text-slate-500 truncate mt-0.5">
                  {ouvrage.auteur}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 ml-2" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
