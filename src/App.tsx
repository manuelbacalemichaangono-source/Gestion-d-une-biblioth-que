import React, { useState, useEffect, useMemo } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { UnifiedAuth } from './components/auth/UnifiedAuth';
import { StudentApp } from './components/student/StudentApp';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ToastNotification } from './components/common/ToastNotification';
import { ManagerTab, StudentTab, Ouvrage } from './types/library';
import {
  Home,
  BookOpen,
  User,
  LayoutGrid,
  Bell,
  ScanLine,
  Search,
  LogOut,
  ArrowLeft,
} from 'lucide-react';

function LibraryWorkspace() {
  const {
    currentUser,
    logout,
    getNotificationsEtudiant,
  } = useLibrary();

  const [studentTab, setStudentTab] = useState<StudentTab>('home');
  const [managerTab, setManagerTab] = useState<ManagerTab>('tableau');
  const [selectedOuvrage, setSelectedOuvrage] = useState<Ouvrage | null>(null);

  useEffect(() => {
    setStudentTab('home');
    setManagerTab('tableau');
    setSelectedOuvrage(null);
  }, [currentUser?.id, currentUser?.role]);

  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser || currentUser.role !== 'etudiant') return 0;
    return getNotificationsEtudiant(currentUser.id).filter((n) => !n.lu).length;
  }, [currentUser, getNotificationsEtudiant]);

  // Si aucun utilisateur n'est connecté, afficher l'interface d'authentification initiale (pas une fenêtre ou un dialogue)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <ToastNotification />
        <UnifiedAuth />
      </div>
    );
  }

  // Retour à la page initiale
  const handleGoHome = () => {
    setSelectedOuvrage(null);
    setStudentTab('home');
    setManagerTab('tableau');
  };

  // Détection de l'état pour la flèche de retour dans le header du body (jamais dans le menubar)
  const isManager = currentUser.role === 'gestionnaire';
  const canGoBack = isManager
    ? managerTab !== 'tableau'
    : selectedOuvrage !== null || studentTab !== 'home';

  const handleGoBack = () => {
    if (isManager) {
      setManagerTab('tableau');
    } else {
      if (selectedOuvrage) {
        setSelectedOuvrage(null);
      } else {
        setStudentTab('home');
      }
    }
  };

  const studentNavItems: {
    key: StudentTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'emprunts', label: 'Emprunts', icon: BookOpen },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    { key: 'profil', label: 'Profil', icon: User },
  ];

  const managerNavItems: {
    key: ManagerTab;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { key: 'tableau', label: 'Tableau', icon: LayoutGrid },
    { key: 'retards', label: 'Retards', icon: Bell },
    { key: 'guichet', label: 'Guichet', icon: ScanLine },
    { key: 'catalogue', label: 'Recherche', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <ToastNotification />

      {/* Barre supérieure (Menubar) */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-lg mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo cliquable pour revenir à la page initiale */}
          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-colors">
              B
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-none group-hover:text-indigo-600 transition-colors">
                BiblioTech
              </span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1 leading-none">
                {currentUser.prenom} {currentUser.nom.charAt(0)}. ({isManager ? 'Admin' : 'Étudiant'})
              </span>
            </div>
          </button>

          {/* Déconnexion rapide dans le menubar */}
          <button
            type="button"
            onClick={logout}
            className="min-h-[36px] px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Contenu principal de la section active */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-3 pb-24">
        {/* Header du body : Flèche de retour à gauche & Se déconnecter à droite */}
        <div className="mb-3 flex items-center justify-between min-h-[40px]">
          <div>
            {canGoBack && (
              <button
                type="button"
                onClick={handleGoBack}
                className="min-h-[38px] px-2.5 py-1 -ml-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                aria-label="Retourner en arrière"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            className="min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>
        </div>

        {isManager ? (
          <ManagerDashboard
            activeTab={managerTab}
            onChangeTab={(t) => setManagerTab(t)}
          />
        ) : (
          <StudentApp
            activeTab={studentTab}
            onChangeTab={(t) => {
              setSelectedOuvrage(null);
              setStudentTab(t);
            }}
            selectedOuvrage={selectedOuvrage}
            onSelectOuvrage={setSelectedOuvrage}
          />
        )}
      </main>

      {/* Barre de navigation inférieure à 4 icônes */}
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 h-16">
          {isManager
            ? managerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = managerTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setManagerTab(item.key)}
                    className={`flex flex-col items-center justify-center min-h-[48px] transition-colors cursor-pointer ${
                      isActive
                        ? 'text-indigo-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-semibold mt-1 leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })
            : studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = !selectedOuvrage && studentTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedOuvrage(null);
                      setStudentTab(item.key);
                    }}
                    className={`relative flex flex-col items-center justify-center min-h-[48px] transition-colors cursor-pointer ${
                      isActive
                        ? 'text-indigo-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-5 h-5" />
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold mt-1 leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <LibraryWorkspace />
    </LibraryProvider>
  );
}
