import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { LogOut, User, CheckCircle2, BookOpen } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, logout, getEmpruntsEtudiant } = useLibrary();

  if (!currentUser) return null;

  const emprunts = getEmpruntsEtudiant(currentUser.id, currentUser.email);
  const empruntsEnCours = emprunts.filter((e) => !e.date_retour_effective).length;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Profil étudiant
      </h1>

      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-sm shadow-2xs">
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Nom & Prénom</span>
          <span className="font-bold text-slate-900 text-right">
            {currentUser.prenom} {currentUser.nom}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Matricule</span>
          <span className="font-mono text-xs font-semibold text-slate-900 text-right">
            {currentUser.matricule || 'Non renseigné'}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Filière</span>
          <span className="font-semibold text-slate-900 text-right">
            {currentUser.filiere || 'Informatique'}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Adresse e-mail</span>
          <span className="font-mono text-xs text-slate-700 truncate">
            {currentUser.email}
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Statut adhérent</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Adhésion active</span>
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Prêts en cours</span>
          <span className="font-bold text-slate-900 text-right">
            {empruntsEnCours} emprunt(s)
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full min-h-[46px] bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Se déconnecter</span>
      </button>
    </div>
  );
};
