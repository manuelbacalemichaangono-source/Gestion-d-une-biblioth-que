import React, { useState } from 'react';
import { Ouvrage } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { StudentHome } from './StudentHome';
import { BookDetail } from './BookDetail';
import { StudentAuth } from '../auth/StudentAuth';
import { LogOut, GraduationCap } from 'lucide-react';

export const StudentApp: React.FC = () => {
  const { currentUser, logout } = useLibrary();
  const [selectedOuvrage, setSelectedOuvrage] = useState<Ouvrage | null>(null);

  // Si l'étudiant n'est pas encore connecté, afficher l'écran d'accès Google
  if (!currentUser) {
    return <StudentAuth />;
  }

  return (
    <div className="w-full flex flex-col font-sans">
      {/* En-tête de l'espace étudiant */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 text-xs block truncate leading-none">
              {currentUser.prenom} {currentUser.nom}
            </span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
              {currentUser.matricule} • {currentUser.filiere || 'Étudiant'}
            </span>
          </div>
        </div>

        {/* Déconnexion discrète */}
        <button
          type="button"
          onClick={logout}
          className="text-xs text-slate-400 hover:text-slate-700 py-1 px-2 rounded hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Contenu : 2 écrans seulement (Recherche & Fiche) */}
      <div className="flex-1 p-2 sm:p-4">
        {selectedOuvrage ? (
          <BookDetail
            ouvrage={selectedOuvrage}
            onBack={() => setSelectedOuvrage(null)}
          />
        ) : (
          <StudentHome onSelectOuvrage={(ouv) => setSelectedOuvrage(ouv)} />
        )}
      </div>
    </div>
  );
};
