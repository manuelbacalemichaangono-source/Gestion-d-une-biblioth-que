import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  Shield,
  User,
  UserPlus,
  Check,
  AlertCircle,
  ChevronRight,
  X,
  LogIn,
  GraduationCap,
} from 'lucide-react';

interface GoogleAccountOption {
  name: string;
  email: string;
  isAdmin?: boolean;
  avatarBg: string;
}

type AuthCategory = 'google' | 'etudiant' | 'admin' | 'register';

export const UnifiedAuth: React.FC = () => {
  const {
    verifierEtConnecterEmail,
    inscrireEtudiant,
    emailGestionnaire,
    authModal,
    fermerAuthModal,
    etudiants,
  } = useLibrary();

  const [activeCategory, setActiveCategory] = useState<AuthCategory>('google');
  const [studentInput, setStudentInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Formulaire d'inscription
  const [regEmail, setRegEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [filiere, setFiliere] = useState('Informatique');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (authModal.isOpen) {
      if (authModal.mode === 'register') {
        setActiveCategory('register');
      } else {
        setActiveCategory('google');
      }
      setFormError(null);
      if (!matricule) {
        setMatricule(
          `ETU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
        );
      }
    }
  }, [authModal.isOpen, authModal.mode]);

  const googleAccounts: GoogleAccountOption[] = [
    {
      name: 'Thomas Martin',
      email: 'thomas.martin@sorbonne.fr',
      avatarBg: 'bg-indigo-600',
    },
    {
      name: 'Sophie Bernard',
      email: 'sophie.bernard@polytechnique.edu',
      avatarBg: 'bg-teal-700',
    },
    {
      name: 'Lucas Moreau',
      email: 'lucas.moreau@univ-paris.fr',
      avatarBg: 'bg-slate-700',
    },
    {
      name: 'Claire Dupont',
      email: emailGestionnaire,
      isAdmin: true,
      avatarBg: 'bg-slate-900',
    },
  ];

  if (!authModal.isOpen) {
    return null;
  }

  const handleLoginWithEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;

    const result = verifierEtConnecterEmail(clean);
    if (result.status === 'gestionnaire' || result.status === 'etudiant') {
      fermerAuthModal();
      return;
    }

    setRegEmail(clean);
    setActiveCategory('register');
    setFormError('Compte non trouvé. Veuillez finaliser votre inscription ci-dessous.');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInput.trim()) return;

    // Chercher par matricule ou par email
    const match = etudiants.find(
      (etu) =>
        etu.matricule.toLowerCase() === studentInput.trim().toLowerCase() ||
        etu.email.toLowerCase() === studentInput.trim().toLowerCase()
    );

    if (match) {
      handleLoginWithEmail(match.email);
    } else {
      handleLoginWithEmail(studentInput);
    }
  };

  const handleAdminDirectLogin = () => {
    handleLoginWithEmail(emailGestionnaire);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailToUse = regEmail.trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setFormError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    const res = inscrireEtudiant({
      email: emailToUse,
      nom,
      prenom,
      matricule,
      filiere,
    });

    if (res.success) {
      fermerAuthModal();
    } else {
      setFormError(res.error || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[90vh]">
        {/* En-tête avec onglets */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('google');
                setFormError(null);
              }}
              className={`min-h-[34px] px-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
                activeCategory === 'google'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('etudiant');
                setFormError(null);
              }}
              className={`min-h-[34px] px-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
                activeCategory === 'etudiant'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Étudiant
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('admin');
                setFormError(null);
              }}
              className={`min-h-[34px] px-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
                activeCategory === 'admin'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('register');
                setFormError(null);
              }}
              className={`min-h-[34px] px-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
                activeCategory === 'register'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              S’inscrire
            </button>
          </div>

          <button
            type="button"
            onClick={fermerAuthModal}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-5 overflow-y-auto space-y-4">
          {formError && (
            <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Connexion Google */}
          {activeCategory === 'google' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Sélectionnez un compte Google préenregistré :
              </p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {googleAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleLoginWithEmail(acc.email)}
                    className="w-full min-h-[54px] px-4 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                          {acc.name}
                        </span>
                        {acc.isAdmin && (
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {acc.email}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Connexion Étudiant */}
          {activeCategory === 'etudiant' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Connectez-vous avec votre matricule ou adresse e-mail :
              </p>

              <form onSubmit={handleStudentLogin} className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  placeholder="Ex : ETU-2024-001 ou adresse@univ.fr"
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />

                <button
                  type="submit"
                  className="w-full min-h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter comme étudiant</span>
                </button>
              </form>

              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Comptes étudiants existants :
                </span>
                <div className="space-y-1">
                  {etudiants.map((etu) => (
                    <button
                      key={etu.id}
                      type="button"
                      onClick={() => handleLoginWithEmail(etu.email)}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer"
                    >
                      <span className="font-semibold">{etu.prenom} {etu.nom}</span>
                      <span className="font-mono text-slate-400 text-[11px]">{etu.matricule}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Connexion Administrateur */}
          {activeCategory === 'admin' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Espace Gestionnaire
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {emailGestionnaire}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAdminDirectLogin}
                  className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Accéder à l’administration</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Inscription */}
          {activeCategory === 'register' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Renseignez vos coordonnées pour créer un compte étudiant :
              </p>

              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Prénom"
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom"
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="Matricule"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={filiere}
                    onChange={(e) => setFiliere(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Informatique">Informatique</option>
                    <option value="Lettres Modernes">Lettres Modernes</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Physique">Physique</option>
                    <option value="Droit & Éco">Droit & Éco</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[42px] mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Créer mon compte</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
