import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  GraduationCap,
  Shield,
  ChevronRight,
  AlertCircle,
  X,
  UserPlus,
} from 'lucide-react';

interface GoogleAccountOption {
  name: string;
  email: string;
  isAdmin?: boolean;
  avatarBg: string;
}

export const UnifiedAuth: React.FC = () => {
  const {
    verifierEtConnecterEmail,
    emailGestionnaire,
    etudiants,
  } = useLibrary();

  const [activeRole, setActiveRole] = useState<'etudiant' | 'admin'>('etudiant');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSelectGoogleAccount = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;

    setErrorMessage(null);
    setShowGooglePicker(false);
    setShowCustomGoogle(false);

    const res = verifierEtConnecterEmail(clean);
    if (res.status === 'non_inscrit') {
      setErrorMessage(
        `L’adresse ${clean} n’est pas enregistrée. Veuillez utiliser un compte étudiant valide.`
      );
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeRole === 'admin') {
      // Connexion administrateur
      const clean = emailInput.trim().toLowerCase() || emailGestionnaire.toLowerCase();
      const res = verifierEtConnecterEmail(clean);
      if (res.status !== 'gestionnaire') {
        setErrorMessage(
          'Adresse administrateur invalide. Utilisez le compte gestionnaire.'
        );
      }
      return;
    }

    // Connexion étudiant (par email ou par matricule)
    const raw = emailInput.trim().toLowerCase();
    if (!raw) {
      setErrorMessage('Veuillez saisir votre adresse e-mail ou matricule.');
      return;
    }

    const match = etudiants.find(
      (etu) =>
        etu.email.toLowerCase() === raw ||
        etu.matricule.toLowerCase() === raw
    );

    const emailToConnect = match ? match.email : raw;
    const res = verifierEtConnecterEmail(emailToConnect);

    if (res.status === 'non_inscrit') {
      setErrorMessage(
        'Identifiant ou e-mail introuvable. Veuillez vérifier vos identifiants étudiants.'
      );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      {/* Fenêtre principale fidèle à la maquette de l'utilisateur */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl text-left space-y-5 animate-in fade-in duration-150">
        {/* Titre Connexion */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Connexion
          </h1>
        </div>

        {/* Sélecteur de rôle selon nos 2 acteurs : Étudiant & Administrateur */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveRole('etudiant');
              setErrorMessage(null);
              setEmailInput('');
            }}
            className={`flex-1 min-h-[38px] px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeRole === 'etudiant'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-slate-700" />
            <span>Étudiant</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setErrorMessage(null);
              setEmailInput(emailGestionnaire);
            }}
            className={`flex-1 min-h-[38px] px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Administrateur</span>
          </button>
        </div>

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bouton Continuer avec Google */}
        <button
          type="button"
          onClick={() => setShowGooglePicker(true)}
          className="w-full min-h-[46px] px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 transition-all cursor-pointer flex items-center justify-center gap-3 shadow-2xs"
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
          <span>Continuer avec Google</span>
        </button>

        {/* Séparateur OU PAR EMAIL */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase shrink-0">
            OU PAR EMAIL
          </span>
        </div>

        {/* Formulaire Email et Mot de passe */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          <div>
            <input
              type="text"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={
                activeRole === 'admin'
                  ? 'Adresse email administrateur'
                  : 'Adresse email ou matricule'
              }
              className="w-full min-h-[46px] px-3.5 py-2.5 bg-white text-sm text-slate-900 rounded-xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mot de passe"
              className="w-full min-h-[46px] px-3.5 py-2.5 bg-white text-sm text-slate-900 rounded-xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Bouton Se connecter en bleu primaire comme sur l'image */}
          <button
            type="submit"
            className="w-full min-h-[46px] bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm mt-2 flex items-center justify-center"
          >
            Se connecter
          </button>
        </form>
      </div>

      {/* Sélecteur de compte Google natif du desktop */}
      {showGooglePicker && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left">
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
                  Choisir un compte Google
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowGooglePicker(false);
                  setShowCustomGoogle(false);
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {googleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(acc.email)}
                  className="w-full min-h-[58px] px-5 py-3 flex items-center gap-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div
                    className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                        {acc.name}
                      </span>
                      {acc.isAdmin && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      {acc.email}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0" />
                </button>
              ))}

              {!showCustomGoogle ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogle(true)}
                  className="w-full min-h-[52px] px-5 py-3 flex items-center gap-3.5 text-left hover:bg-slate-50 text-blue-600 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full border border-dashed border-blue-300 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">
                    Utiliser un autre compte
                  </span>
                </button>
              ) : (
                <div className="p-4 bg-slate-50 space-y-2.5">
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="adresse.google@univ.fr"
                    className="w-full text-xs px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectGoogleAccount(customGoogleEmail)}
                      className="flex-1 min-h-[38px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogle(false)}
                      className="min-h-[38px] px-3 bg-white border border-slate-200 text-slate-600 text-xs rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
