import React, { useState } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { StudentApp } from './components/student/StudentApp';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { ToastNotification } from './components/common/ToastNotification';
import { BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

function LibraryApp() {
  // Sur mobile : onglet actif (par défaut Espace Étudiant)
  // Sur grand écran : les deux zones sont affichées côte à côte en permanence
  const [mobileActiveZone, setMobileActiveZone] = useState<'etudiant' | 'gestionnaire'>('etudiant');

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <ToastNotification />

      {/* Barre institutionnelle de l'université */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-wide block leading-none">
                Bibliothèque Universitaire
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 leading-none">
                Système intégré des services documentaires
              </span>
            </div>
          </div>

          {/* Sélecteur mobile pour basculer facilement entre les deux zones en affichage vertical */}
          <div className="lg:hidden flex bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMobileActiveZone('etudiant')}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mobileActiveZone === 'etudiant'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Étudiant</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveZone('gestionnaire')}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mobileActiveZone === 'gestionnaire'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Gestionnaire</span>
            </button>
          </div>
        </div>
      </header>

      {/* Structure principale : DEUX ZONES EN UNE SEULE APPLICATION
          - Gauche : interface de l'étudiant (la seule qui requiert authentification Google)
          - Droite : tableau de bord du gestionnaire (intégré à droite sans login)
      */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Zone Gauche : Interface Étudiant */}
          <section
            aria-label="Espace Étudiant"
            className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden ${
              mobileActiveZone !== 'etudiant' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Zone Étudiant (Connexion requise)
                </span>
              </div>
            </div>

            <StudentApp />
          </section>

          {/* Zone Droite : Tablero de bord del gestor (sans authentification ni login) */}
          <section
            aria-label="Tableau de bord Gestionnaire"
            className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden ${
              mobileActiveZone !== 'gestionnaire' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Zone Gestionnaire (Accès direct)
                </span>
              </div>
            </div>

            <ManagerDashboard />
          </section>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <LibraryApp />
    </LibraryProvider>
  );
}
