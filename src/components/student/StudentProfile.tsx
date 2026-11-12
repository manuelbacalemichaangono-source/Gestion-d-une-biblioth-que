import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Camera, Pencil, X, Check, Phone, Mail, Award, BookOpen } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, mettreAJourProfilEtudiant } = useLibrary();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: currentUser?.nom || '',
    prenom: currentUser?.prenom || '',
    email: currentUser?.email || '',
    code_massar: currentUser?.code_massar || currentUser?.matricule || '',
    filiere: currentUser?.filiere || '',
    telephone: currentUser?.telephone || '+212 601 786299',
    etablissement: currentUser?.etablissement || 'EST Fès',
  });

  if (!currentUser) return null;

  const initials = `${currentUser.prenom?.charAt(0) || ''}${currentUser.nom?.charAt(0) || ''}`.toUpperCase() || 'ET';

  const handleOpenEdit = () => {
    setFormData({
      nom: currentUser.nom,
      prenom: currentUser.prenom,
      email: currentUser.email,
      code_massar: currentUser.code_massar || currentUser.matricule || '',
      filiere: currentUser.filiere || 'Master en Informatique et Systèmes Distribués',
      telephone: currentUser.telephone || '+212 601 786299',
      etablissement: currentUser.etablissement || 'EST Fès',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    mettreAJourProfilEtudiant({
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      filiere: formData.filiere.trim(),
      telephone: formData.telephone.trim(),
      etablissement: formData.etablissement.trim(),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Carte de profil principale identique à la capture de référence */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
        {/* Header de la carte */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
            Profil du Candidat
          </h1>

          <button
            type="button"
            onClick={handleOpenEdit}
            className="min-h-[34px] px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Modifier le profil</span>
          </button>
        </div>

        {/* Section centrale : Avatar, Nom et Sous-titre */}
        <div className="flex flex-col items-center justify-center text-center pb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center select-none shadow-2xs">
              {initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs border-2 border-white"
              title="Photo de profil"
            >
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {currentUser.prenom} {currentUser.nom}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentUser.code_massar || currentUser.matricule || 'N138091823'} · {currentUser.etablissement || 'EST Fès'}
          </p>
        </div>

        {/* Tableau détaillé des informations */}
        <div className="divide-y divide-slate-100 text-xs md:text-sm">
          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">Nom</span>
            <span className="font-semibold text-slate-900 text-right">
              {currentUser.nom}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">Prénom</span>
            <span className="font-semibold text-slate-900 text-right">
              {currentUser.prenom}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">Email académique</span>
            <span className="font-semibold text-slate-900 text-right font-mono text-xs">
              {currentUser.email}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">CNE / Code Massar</span>
            <span className="font-semibold text-slate-900 text-right font-mono text-xs">
              {currentUser.code_massar || currentUser.matricule || 'N138091823'}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">Téléphone</span>
            <span className="font-semibold text-slate-900 text-right font-mono text-xs text-blue-700">
              {currentUser.telephone || '+212 601 786299'}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">Établissement d’origine</span>
            <span className="font-semibold text-slate-900 text-right">
              {currentUser.etablissement || 'EST Fès'}
            </span>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <span className="text-slate-500 font-normal">Diplôme d’accès / Filière</span>
            <span className="font-semibold text-slate-900 text-right max-w-[65%] truncate">
              {currentUser.filiere || 'Master en Informatique et Systèmes Distribués'}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de modification des informations de profil */}
      {isEditing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Modifier les informations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Téléphone (+212...)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    placeholder="+212 601 786299"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Filière / Spécialité
                </label>
                <input
                  type="text"
                  required
                  value={formData.filiere}
                  onChange={(e) =>
                    setFormData({ ...formData, filiere: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Établissement d’origine
                </label>
                <input
                  type="text"
                  required
                  value={formData.etablissement}
                  onChange={(e) =>
                    setFormData({ ...formData, etablissement: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="min-h-[38px] px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[38px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
