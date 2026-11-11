import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { LogOut } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, logout, ouvrirAuthModal } = useLibrary();

  if (!currentUser) return null;

  const handleDeconnexion = () => {
    logout();
    ouvrirAuthModal('login');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Profil étudiant
      </h1>

      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-sm shadow-2xs">
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Prénom</span>
          <span className="font-bold text-slate-900 text-right">
            {currentUser.prenom}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Nom</span>
          <span className="font-bold text-slate-900 text-right">
            {currentUser.nom}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Code Massar</span>
          <span className="font-mono text-xs font-semibold text-slate-900 text-right">
            {currentUser.code_massar || currentUser.matricule || 'M130123456'}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Filière</span>
          <span className="font-semibold text-slate-900 text-right">
            {currentUser.filiere || 'Informatique'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDeconnexion}
        className="w-full min-h-[46px] bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
};
