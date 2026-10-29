import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  BookOpen,
  UserPlus,
  ArrowLeft,
  Check,
  Lock,
  AlertCircle,
  ChevronRight,
  User,
} from 'lucide-react';

interface GoogleAccountOption {
  name: string;
  email: string;
  isAdmin?: boolean;
  avatarBg: string;
}

export const UnifiedAuth: React.FC = () => {
  const { verifierEtConnecterEmail, inscrireEtudiant, emailGestionnaire } =
    useLibrary();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(
    null
  );
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [filiere, setFiliere] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleSelectAccount = (rawEmail: string, prefillName?: string) => {
    const clean = rawEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;

    setIsPickerOpen(false);
    setShowCustomEmailInput(false);

    const result = verifierEtConnecterEmail(clean);

    if (result.status === 'gestionnaire' || result.status === 'etudiant') {
      setUnregisteredEmail(null);
      setShowRegisterForm(false);
      return;
    }

    setUnregisteredEmail(clean);
    setShowRegisterForm(false);

    if (prefillName) {
      const parts = prefillName.split(' ');
      setPrenom(parts[0] || '');
      setNom(parts.slice(1).join(' ') || '');
    } else {
      setPrenom('');
      setNom('');
    }
    setMatricule(
      `ETU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    );
    setFiliere('Informatique');
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    handleSelectAccount(customEmail);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unregisteredEmail) return;

    const res = inscrireEtudiant({
      email: unregisteredEmail,
      nom,
      prenom,
      matricule,
      filiere,
    });

    if (res.success) {
      setUnregisteredEmail(null);
      setShowRegisterForm(false);
    } else {
      setFormError(res.error || 'Erreur lors de l’inscription.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {unregisteredEmail && showRegisterForm ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
            <h1 className="text-lg font-bold text-slate-900">
              Inscription étudiant
            </h1>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="relative">
                <input
                  type="email"
                  value={unregisteredEmail}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-3 text-xs bg-slate-100 text-slate-600 font-mono rounded-xl border border-slate-200 pr-9"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  className="w-full px-3.5 py-3 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom"
                  className="w-full px-3.5 py-3 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <input
                type="text"
                required
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Matricule"
                className="w-full px-3.5 py-3 text-sm bg-white text-slate-900 font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <input
                type="text"
                required
                value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                placeholder="Filière"
                className="w-full px-3.5 py-3 text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {formError && (
                <div className="text-xs text-rose-700 flex items-center gap-2 p-2.5 bg-rose-50 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Valider</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setUnregisteredEmail(null);
                    setIsPickerOpen(true);
                  }}
                  className="w-full min-h-[44px] text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Changer de compte</span>
                </button>
              </div>
            </form>
          </div>
        ) : unregisteredEmail && !showRegisterForm ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-slate-900">
                Compte non inscrit
              </h1>
              <p className="text-xs font-mono text-slate-500 break-all">
                {unregisteredEmail}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowRegisterForm(true)}
                className="w-full min-h-[48px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>S’inscrire</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnregisteredEmail(null);
                  setIsPickerOpen(true);
                }}
                className="w-full min-h-[44px] text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Choisir un autre compte
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-7 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                BiblioTech
              </h1>
              <p className="text-xs text-slate-500">
                Bibliothèque universitaire
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full min-h-[48px] px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 transition-all cursor-pointer flex items-center justify-center gap-3 whitespace-nowrap"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Fenêtre de vérification de compte Google */}
      {isPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-sm font-semibold text-slate-900">
                  Choisir un compte
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(false);
                  setShowCustomEmailInput(false);
                }}
                className="min-h-[36px] px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pb-safe">
              {googleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc.email, acc.name)}
                  className="w-full min-h-[60px] px-5 py-3 flex items-center gap-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                        {acc.name}
                      </span>
                      {acc.isAdmin && (
                        <span className="text-[11px] font-medium text-indigo-600 shrink-0">
                          · Gestionnaire
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">
                      {acc.email}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                </button>
              ))}

              {!showCustomEmailInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(true)}
                  className="w-full min-h-[56px] px-5 py-3 flex items-center gap-3.5 text-left hover:bg-slate-50 text-indigo-600 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full border border-dashed border-indigo-300 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">
                    Utiliser un autre compte
                  </span>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomEmailSubmit}
                  className="p-4 bg-slate-50 space-y-2.5"
                >
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Adresse e-mail Google"
                    className="w-full text-sm px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 min-h-[42px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Continuer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomEmailInput(false)}
                      className="min-h-[42px] px-3 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
