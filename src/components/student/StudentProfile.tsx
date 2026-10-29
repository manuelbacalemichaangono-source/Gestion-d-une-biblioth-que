import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { LogOut } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, logout } = useLibrary();

  if (!currentUser) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Profil
      </h1>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-sm">
        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <span className="text-slate-500">Nom</span>
          <span className="font-semibold text-slate-900 text-right">
            {currentUser.prenom} {currentUser.nom}
          </span>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <span className="text-slate-500">Matricule</span>
          <span className="font-mono text-slate-900 text-right">
            {currentUser.matricule || '—'}
          </span>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <span className="text-slate-500">Filière</span>
          <span className="font-medium text-slate-900 text-right">
            {currentUser.filiere || '—'}
          </span>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <span className="text-slate-500">E-mail</span>
          <span className="font-mono text-xs text-slate-700 truncate">
            {currentUser.email}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full min-h-[48px] bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
};
