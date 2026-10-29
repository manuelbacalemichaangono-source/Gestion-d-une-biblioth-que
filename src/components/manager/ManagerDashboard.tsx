import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Emprunt, ManagerTab, NiveauRetard } from '../../types/library';
import { ManagerGuichet } from './ManagerGuichet';
import {
  Send,
  Bell,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

interface ManagerDashboardProps {
  activeTab: ManagerTab;
  onChangeTab: (tab: ManagerTab) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const {
    emprunts,
    exemplaires,
    etudiants,
    calculerRetard,
    envoyerRappels,
    rechercheAutomatique,
  } = useLibrary();

  const [retardLevel, setRetardLevel] = useState<NiveauRetard>('eleve');
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);

  const [lookupMode, setLookupMode] = useState<'ouvrages' | 'etudiants'>(
    'ouvrages'
  );
  const [lookupQuery, setLookupQuery] = useState('');

  const overduesGrouped = useMemo(() => {
    const faible: Emprunt[] = [];
    const moyen: Emprunt[] = [];
    const eleve: Emprunt[] = [];

    emprunts.forEach((emp) => {
      if (emp.date_retour_effective) return;
      const info = calculerRetard(emp);
      if (info.estEnRetard && info.niveau) {
        if (info.niveau === 'faible') faible.push(emp);
        else if (info.niveau === 'moyen') moyen.push(emp);
        else if (info.niveau === 'eleve') eleve.push(emp);
      }
    });

    return { faible, moyen, eleve };
  }, [emprunts, calculerRetard]);

  const activeLoansCount = useMemo(
    () => emprunts.filter((e) => !e.date_retour_effective).length,
    [emprunts]
  );

  const availableCopiesCount = useMemo(
    () => exemplaires.filter((ex) => ex.statut === 'disponible').length,
    [exemplaires]
  );

  const totalOverduesCount =
    overduesGrouped.faible.length +
    overduesGrouped.moyen.length +
    overduesGrouped.eleve.length;

  const currentLevelLoans = overduesGrouped[retardLevel];

  const toggleSelectLoan = (id: string) => {
    setSelectedLoanIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allInCurrentSelected =
    currentLevelLoans.length > 0 &&
    currentLevelLoans.every((l) => selectedLoanIds.includes(l.id));

  const toggleSelectAllCurrent = () => {
    const ids = currentLevelLoans.map((l) => l.id);
    if (allInCurrentSelected) {
      setSelectedLoanIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedLoanIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleSendReminders = () => {
    if (selectedLoanIds.length === 0) return;
    envoyerRappels(selectedLoanIds);
    setSelectedLoanIds([]);
  };

  const searchedBooks = useMemo(() => {
    if (lookupMode !== 'ouvrages' || !lookupQuery.trim()) return [];
    return rechercheAutomatique(lookupQuery);
  }, [lookupMode, lookupQuery, rechercheAutomatique]);

  const searchedStudents = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (lookupMode !== 'etudiants' || !q) return [];
    return etudiants.filter(
      (etu) =>
        `${etu.prenom} ${etu.nom}`.toLowerCase().includes(q) ||
        etu.matricule.toLowerCase().includes(q) ||
        etu.email.toLowerCase().includes(q)
    );
  }, [lookupMode, lookupQuery, etudiants]);

  if (activeTab === 'guichet') {
    return <ManagerGuichet />;
  }

  if (activeTab === 'retards') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Retards
          </h1>

          <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
            {(
              [
                { key: 'faible', label: `Faible (${overduesGrouped.faible.length})` },
                { key: 'moyen', label: `Moyen (${overduesGrouped.moyen.length})` },
                { key: 'eleve', label: `Élevé (${overduesGrouped.eleve.length})` },
              ] as { key: NiveauRetard; label: string }[]
            ).map((lvl) => (
              <button
                key={lvl.key}
                type="button"
                onClick={() => setRetardLevel(lvl.key)}
                className={`min-h-[36px] px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                  retardLevel === lvl.key
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {currentLevelLoans.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-medium text-slate-500">
                Aucun emprunt dans cette catégorie.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-3 bg-slate-50 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2.5 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allInCurrentSelected}
                    onChange={toggleSelectAllCurrent}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Tout sélectionner</span>
                </label>
                <span className="text-slate-400 tabular-nums">
                  {currentLevelLoans.length} dossier(s)
                </span>
              </div>

              {currentLevelLoans.map((loan) => {
                const isSelected = selectedLoanIds.includes(loan.id);
                const info = calculerRetard(loan);

                return (
                  <div
                    key={loan.id}
                    onClick={() => toggleSelectLoan(loan.id)}
                    className={`min-h-[60px] px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLoan(loan.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {loan.etudiant_nom}
                          </span>
                          {loan.rappel_envoye && (
                            <Bell
                              className="w-3.5 h-3.5 text-indigo-600 shrink-0"
                              aria-label="Rappel envoyé"
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {loan.ouvrage_titre} · Ex. {loan.exemplaire_numero}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-rose-600 tabular-nums shrink-0">
                      +{info.joursRetard} j
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedLoanIds.length > 0 && (
          <button
            type="button"
            onClick={handleSendReminders}
            className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer tabular-nums"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer un rappel ({selectedLoanIds.length})</span>
          </button>
        )}
      </div>
    );
  }

  if (activeTab === 'catalogue') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Recherche
          </h1>

          <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setLookupMode('ouvrages');
                setLookupQuery('');
              }}
              className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                lookupMode === 'ouvrages'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ouvrages
            </button>
            <button
              type="button"
              onClick={() => {
                setLookupMode('etudiants');
                setLookupQuery('');
              }}
              className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                lookupMode === 'etudiants'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Étudiants
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            placeholder={
              lookupMode === 'ouvrages'
                ? 'Rechercher un titre ou auteur...'
                : 'Rechercher un nom ou matricule...'
            }
            className="w-full min-h-[48px] pl-11 pr-10 py-3 text-sm bg-white rounded-2xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {lookupQuery && (
            <button
              type="button"
              onClick={() => setLookupQuery('')}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
              aria-label="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {Boolean(lookupQuery.trim()) && (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {lookupMode === 'ouvrages' ? (
              searchedBooks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Aucun ouvrage trouvé.
                </div>
              ) : (
                searchedBooks.map((ouv) => {
                  const copies = exemplaires.filter(
                    (ex) => ex.ouvrage_id === ouv.id
                  );
                  const free = copies.filter(
                    (c) => c.statut === 'disponible'
                  ).length;

                  return (
                    <div
                      key={ouv.id}
                      className="px-4 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {ouv.titre}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {ouv.auteur}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 tabular-nums shrink-0">
                        {free}/{copies.length} disp.
                      </span>
                    </div>
                  );
                })
              )
            ) : searchedStudents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucun étudiant trouvé.
              </div>
            ) : (
              searchedStudents.map((etu) => (
                <div
                  key={etu.id}
                  className="px-4 py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {etu.prenom} {etu.nom}
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">
                      {etu.email}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-600 shrink-0">
                    {etu.matricule}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Onglet par défaut : Tableau de bord épuré du gestionnaire
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeLoansCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">En cours</div>
        </div>

        <button
          type="button"
          onClick={() => onChangeTab('retards')}
          className="bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl p-4 text-left transition-colors cursor-pointer"
        >
          <div
            className={`text-2xl font-bold tabular-nums ${
              totalOverduesCount > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {totalOverduesCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Retards</div>
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {availableCopiesCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Disponibles</div>
        </div>
      </div>

      {/* Répartition directe vers les niveaux de retard */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setRetardLevel('eleve');
            onChangeTab('retards');
          }}
          className="w-full min-h-[58px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="text-sm font-semibold text-rose-700">
            Retard élevé
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tabular-nums">
            <span>{overduesGrouped.eleve.length}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setRetardLevel('moyen');
            onChangeTab('retards');
          }}
          className="w-full min-h-[58px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="text-sm font-semibold text-orange-700">
            Retard moyen
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tabular-nums">
            <span>{overduesGrouped.moyen.length}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setRetardLevel('faible');
            onChangeTab('retards');
          }}
          className="w-full min-h-[58px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="text-sm font-semibold text-amber-700">
            Retard faible
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 tabular-nums">
            <span>{overduesGrouped.faible.length}</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>
      </div>
    </div>
  );
};
