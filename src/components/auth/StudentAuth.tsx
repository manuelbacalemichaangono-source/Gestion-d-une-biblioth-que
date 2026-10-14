import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookOpen, UserPlus, ArrowLeft, Check, Lock, AlertCircle, ChevronRight, User } from 'lucide-react';

interface GoogleAccount {
  name: string;
  email: string;
  avatarColor: string;
}

// Comptes Google détectés sur le dispositif
const DEVICE_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Thomas Martin',
    email: 'thomas.martin@sorbonne.fr',
    avatarColor: 'bg-blue-600',
  },
  {
    name: 'Sophie Bernard',
    email: 'sophie.bernard@polytechnique.edu',
    avatarColor: 'bg-emerald-600',
  },
  {
    name: 'Lucas Moreau',
    email: 'lucas.moreau@univ-paris.fr',
    avatarColor: 'bg-purple-600',
  },
  {
    name: 'Alexandre Dupont',
    email: 'alexandre.dupont@gmail.com',
    avatarColor: 'bg-amber-600',
  },
];

export const StudentAuth: React.FC = () => {
  const { loginWithGoogleAccount, inscrireEtudiant } = useLibrary();

  // États du flux d'authentification
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Saisie "Utiliser un autre compte"
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  // Formulaire d'inscription
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [filiere, setFiliere] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Gestion de la sélection d'un compte Google
  const handleSelectAccount = (email: string, prefillName?: string) => {
    setIsPickerOpen(false);
    setShowCustomEmailInput(false);

    const result = loginWithGoogleAccount(email);
    if (result.registered) {
      // Compte déjà inscrit : accès direct sans rien écrire
      setUnregisteredEmail(null);
      setShowRegisterForm(false);
    } else {
      // Compte non inscrit : afficher l'écran "Vous n'êtes pas encore inscrit..."
      setUnregisteredEmail(email);
      setShowRegisterForm(false);
      if (prefillName) {
        const parts = prefillName.split(' ');
        setPrenom(parts[0] || '');
        setNom(parts.slice(1).join(' ') || '');
      } else {
        setNom('');
        setPrenom('');
      }
      setMatricule(`ETU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setFiliere('Informatique');
    }
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    handleSelectAccount(customEmail.trim().toLowerCase());
  };

  // Soumission du formulaire d'inscription
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unregisteredEmail) return;

    if (!nom.trim() || !prenom.trim() || !matricule.trim() || !filiere.trim()) {
      setFormError('Tous les champs sont requis.');
      return;
    }

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
      setFormError(res.error || "Erreur lors de l'inscription");
    }
  };

  // Écran 1 : Formulaire d'inscription (si demandé après "S'inscrire")
  if (unregisteredEmail && showRegisterForm) {
    return (
      <div className="w-full max-w-sm mx-auto py-6 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base">Inscription à la bibliothèque</h2>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* E-mail pré-rempli et non modifiable */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Adresse e-mail Google
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={unregisteredEmail}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 text-xs bg-slate-100 text-slate-600 font-mono rounded-xl border border-slate-200 cursor-not-allowed pr-8"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex : Sophie"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex : Bernard"
                  className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Numéro d'étudiant
              </label>
              <input
                type="text"
                required
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Ex : ETU-2026-452"
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Filière / UFR
              </label>
              <input
                type="text"
                required
                value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                placeholder="Ex : Informatique, Droit, Médecine..."
                className="w-full px-3 py-2 text-xs bg-white text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {formError && (
              <div className="text-xs text-rose-600 flex items-center gap-1.5 p-2 bg-rose-50 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmer l'inscription</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRegisterForm(false);
                  setUnregisteredEmail(null);
                  setIsPickerOpen(true);
                }}
                className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Changer de compte</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Écran 2 : "Vous n'êtes pas encore inscrit à la bibliothèque"
  if (unregisteredEmail && !showRegisterForm) {
    return (
      <div className="w-full max-w-sm mx-auto py-8 px-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              Vous n'êtes pas encore inscrit à la bibliothèque
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 font-mono break-all bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              {unregisteredEmail}
            </p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Pour consulter les disponibilités et effectuer des démarches, veuillez finaliser votre inscription universitaire.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {/* Bouton S'inscrire */}
            <button
              type="button"
              onClick={() => setShowRegisterForm(true)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>S'inscrire</span>
            </button>

            {/* Bouton pour revenir et choisir un autre compte */}
            <button
              type="button"
              onClick={() => {
                setUnregisteredEmail(null);
                setIsPickerOpen(true);
              }}
              className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Choisir un autre compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran d'accueil Étudiant non connecté : Bouton Se connecter avec Google
  return (
    <div className="w-full max-w-sm mx-auto py-10 px-4 text-center">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600">
          <BookOpen className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Espace Étudiant
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Connectez-vous avec votre compte universitaire pour accéder au catalogue.
          </p>
        </div>

        {/* Bouton officiel Google Sign-in */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            {/* Icône officielle Google G */}
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
      </div>

      {/* Modal Sélecteur de comptes Google (Google Account Chooser) */}
      {isPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left">
            {/* En-tête Google */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                <div>
                  <h3 className="text-xs font-semibold text-slate-800">
                    Se connecter avec Google
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choisir un compte pour continuer
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(false);
                  setShowCustomEmailInput(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
              >
                Fermer
              </button>
            </div>

            {/* Liste des comptes du téléphone / dispositif */}
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {DEVICE_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc.email, acc.name)}
                  className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${acc.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {acc.email}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                </button>
              ))}

              {/* Option "Utiliser un autre compte" */}
              {!showCustomEmailInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(true)}
                  className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-50 text-indigo-600 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-indigo-300 flex items-center justify-center shrink-0 text-indigo-600">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold">
                    Utiliser un autre compte
                  </span>
                </button>
              ) : (
                <form
                  onSubmit={handleCustomEmailSubmit}
                  className="p-3 bg-slate-50 space-y-2"
                >
                  <label className="block text-[11px] font-medium text-slate-600">
                    Adresse e-mail Google
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="etudiant@sorbonne.fr ou @gmail.com"
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                    >
                      Continuer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomEmailInput(false)}
                      className="py-1.5 px-3 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg cursor-pointer"
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
