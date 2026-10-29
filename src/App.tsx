import React, { useState, useEffect } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { UnifiedAuth } from './components/auth/UnifiedAuth';
import { StudentApp } from './components/student/StudentApp';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ToastNotification } from './components/common/ToastNotification';
import { ManagerTab, StudentTab } from './types/library';
import {
  Home,
  Search,
  BookOpen,
  User,
  LayoutGrid,
  Bell,
  ScanLine,
  LogOut,
} from 'lucide-react';

function LibraryWorkspace() {
  const { currentUser, logout } = useLibrary();

  const [studentTab, setStudentTab] = useState<StudentTab>('accueil');
  const [managerTab, setManagerTab] = useState<ManagerTab>('tableau');

  useEffect(() => {
    setStudentTab('accueil');
    setManagerTab('tableau');
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <ToastNotification />
        <UnifiedAuth />
      </div>
    );
  }

  const studentNavItems: {
    key: StudentTab;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { key: 'accueil', label: 'Accueil', icon: Home },
    { key: 'recherche', label: 'Recherche', icon: Search },
    { key: 'emprunts', label: 'Emprunts', icon: BookOpen },
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

      {/* Barre supérieure minimaliste */}
      <header className="h-12 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-lg mx-auto h-full px-4 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight text-slate-900">
            BiblioTech
          </span>

          <button
            type="button"
            onClick={logout}
            className="min-h-[40px] min-w-[40px] -mr-2 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Contenu de la section active */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-5 pb-24">
        {currentUser.role === 'etudiant' ? (
          <StudentApp
            activeTab={studentTab}
            onChangeTab={(t) => setStudentTab(t)}
          />
        ) : (
          <ManagerDashboard
            activeTab={managerTab}
            onChangeTab={(t) => setManagerTab(t)}
          />
        )}
      </main>

      {/* Barre de navigation inférieure à 4 icônes */}
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 h-16">
          {currentUser.role === 'etudiant'
            ? studentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = studentTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStudentTab(item.key)}
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
            : managerNavItems.map((item) => {
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
