import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Emprunt, NiveauRetard, SEUILS_RETARD } from '../../types/library';
import { ScannerModal, ScannerModalMode } from './ScannerModal';
import {
  Send,
  Camera,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Bell,
  Check,
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const {
    emprunts,
    calculerRetard,
    envoyerRappels,
  } = useLibrary();

  // Accordéon des niveaux de retard : par défaut tous repliés
  const [expandedLevel, setExpandedLevel] = useState<NiveauRetard | null>(null);

  // Lignes cochées (style boîte de réception)
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);

  // Ligne dont les détails sont dépliés au toucher
  const [expandedDetailLoanId, setExpandedDetailLoanId] = useState<string | null>(null);

  // État du scanner / actions physiques
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerModalMode>('scan_ticket');

  // Filtrer uniquement les emprunts en retard actifs
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

  const levelsConfig: {
    key: NiveauRetard;
    label: string;
    subLabel: string;
    badgeBg: string;
    textColor: string;
    dotColor: string;
    loans: Emprunt[];
  }[] = [
    {
      key: 'faible',
      label: 'Retard faible',
      subLabel: `1 à ${SEUILS_RETARD.FAIBLE_MAX_JOURS} jours`,
      badgeBg: 'bg-amber-50 hover:bg-amber-100/70',
      textColor: 'text-amber-900',
      dotColor: 'bg-amber-500',
      loans: overduesGrouped.faible,
    },
    {
      key: 'moyen',
      label: 'Retard moyen',
      subLabel: `${SEUILS_RETARD.FAIBLE_MAX_JOURS + 1} à ${SEUILS_RETARD.MOYEN_MAX_JOURS} jours`,
      badgeBg: 'bg-orange-50 hover:bg-orange-100/70',
      textColor: 'text-orange-900',
      dotColor: 'bg-orange-500',
      loans: overduesGrouped.moyen,
    },
    {
      key: 'eleve',
      label: 'Retard élevé',
      subLabel: `${SEUILS_RETARD.MOYEN_MAX_JOURS + 1} jours et +`,
      badgeBg: 'bg-rose-50 hover:bg-rose-100/70',
      textColor: 'text-rose-900',
      dotColor: 'bg-rose-600',
      loans: overduesGrouped.eleve,
    },
  ];

  // Gestion du repliage accordéon (un seul niveau déplié à la fois)
  const toggleLevel = (lvl: NiveauRetard) => {
    setExpandedLevel((curr) => (curr === lvl ? null : lvl));
  };

  // Sélection individuelle
  const toggleSelectLoan = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedLoanIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sélection globale d'un niveau
  const toggleSelectAllInLevel = (loans: Emprunt[], e: React.MouseEvent) => {
    e.stopPropagation();
    const loanIdsInLevel = loans.map((l) => l.id);
    const allSelected = loanIdsInLevel.every((id) => selectedLoanIds.includes(id));

    if (allSelected) {
      setSelectedLoanIds((prev) => prev.filter((id) => !loanIdsInLevel.includes(id)));
    } else {
      setSelectedLoanIds((prev) => Array.from(new Set([...prev, ...loanIdsInLevel])));
    }
  };

  // Envoi groupé en 1 clic
  const handleSendBatchReminders = () => {
    if (selectedLoanIds.length === 0) return;
    envoyerRappels(selectedLoanIds);
    setSelectedLoanIds([]);
  };

  const openScanner = (mode: ScannerModalMode) => {
    setScannerMode(mode);
    setIsScannerOpen(true);
  };

  const totalOverduesCount =
    overduesGrouped.faible.length +
    overduesGrouped.moyen.length +
    overduesGrouped.eleve.length;

  return (
    <div className="w-full flex flex-col font-sans">
      {/* En-tête dense du gestionnaire avec boutons d'actions visibles EN HAUT */}
      <div className="bg-white border-b border-slate-200 p-3 sticky top-0 z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm leading-none">
              Tableau de bord
            </h2>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Gestion des retards et scanner
            </span>
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {totalOverduesCount} retard{totalOverduesCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Boutons d'actions visibles EN HAUT : Escanear ticket, Devolver préstamo, Enviar ticket */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => openScanner('scan_ticket')}
            className="flex-1 min-w-[110px] py-2 px-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Escanear ticket</span>
          </button>

          <button
            type="button"
            onClick={() => openScanner('devolver')}
            className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Devolver</span>
          </button>

          <button
            type="button"
            onClick={() => openScanner('envoyer_ticket')}
            className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Enviar ticket</span>
          </button>
        </div>
      </div>

      {/* Contenu compact : liste des niveaux de retard */}
      <div className="p-2 sm:p-3 space-y-2">
        {totalOverduesCount === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 shadow-2xs">
            <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-semibold text-xs text-slate-800">Aucun emprunt en retard</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tous les retours sont actuellement en règle.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {levelsConfig.map((lvl) => {
              const isExpanded = expandedLevel === lvl.key;
              const loansCount = lvl.loans.length;
              const loanIdsInLevel = lvl.loans.map((l) => l.id);
              const allInLevelSelected =
                loansCount > 0 && loanIdsInLevel.every((id) => selectedLoanIds.includes(id));
              const someInLevelSelected =
                loansCount > 0 &&
                !allInLevelSelected &&
                loanIdsInLevel.some((id) => selectedLoanIds.includes(id));

              return (
                <div
                  key={lvl.key}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  {/* En-tête de niveau replié par défaut */}
                  <div
                    onClick={() => toggleLevel(lvl.key)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors ${lvl.badgeBg}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Case Tout sélectionner */}
                      <input
                        type="checkbox"
                        checked={allInLevelSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someInLevelSelected;
                        }}
                        onChange={(e) => toggleSelectAllInLevel(lvl.loans, e as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        aria-label={`Tout sélectionner dans ${lvl.label}`}
                      />

                      <span className={`w-2 h-2 rounded-full ${lvl.dotColor} shrink-0`} />

                      <span className={`font-semibold text-xs ${lvl.textColor} truncate`}>
                        {lvl.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-white/90 text-slate-700">
                        {loansCount}
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Lignes d'emprunts pour ce niveau */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100">
                      {loansCount === 0 ? (
                        <div className="py-4 px-3 text-center text-xs text-slate-400">
                          Aucun emprunt dans ce niveau.
                        </div>
                      ) : (
                        lvl.loans.map((loan) => {
                          const isSelected = selectedLoanIds.includes(loan.id);
                          const isDetailOpen = expandedDetailLoanId === loan.id;
                          const info = calculerRetard(loan);

                          return (
                            <div
                              key={loan.id}
                              onClick={() =>
                                setExpandedDetailLoanId(isDetailOpen ? null : loan.id)
                              }
                              className={`px-3 py-2 transition-colors cursor-pointer ${
                                isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              {/* Ligne d'emprunt = case + nom + titre ex n° + jours retard */}
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => toggleSelectLoan(loan.id, e as any)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                                  />

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-slate-900 truncate">
                                        {loan.etudiant_nom}
                                      </span>

                                      {loan.rappel_envoye && (
                                        <span
                                          title="Rappel envoyé"
                                          className="inline-flex items-center text-[10px] font-medium text-indigo-600"
                                        >
                                          <Bell className="w-2.5 h-2.5" />
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-[11px] text-slate-500 truncate">
                                      {loan.ouvrage_titre} (Ex. {loan.exemplaire_numero})
                                    </p>
                                  </div>
                                </div>

                                <span
                                  className={`font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                                    lvl.key === 'faible'
                                      ? 'bg-amber-100 text-amber-800'
                                      : lvl.key === 'moyen'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  +{info.joursRetard} j
                                </span>
                              </div>

                              {/* Détails dépliables au toucher */}
                              {isDetailOpen && (
                                <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5 animate-in fade-in duration-100">
                                  <div>
                                    <span className="text-slate-400">Prêt : </span>
                                    <span>{loan.date_emprunt}</span>
                                    <span className="text-slate-400"> • Retour prévu : </span>
                                    <span className="font-medium text-rose-600">
                                      {loan.date_retour_prevue}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">E-mail : </span>
                                    <span>{loan.etudiant_email}</span>
                                  </div>
                                  {loan.etudiant_matricule && (
                                    <div>
                                      <span className="text-slate-400">Matricule : </span>
                                      <span>{loan.etudiant_matricule}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barre d'action groupée dès qu'une ligne est cochée */}
      {selectedLoanIds.length > 0 && (
        <div className="sticky bottom-3 mx-2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="bg-slate-900 text-white rounded-xl p-2 shadow-lg flex items-center justify-between border border-slate-800">
            <span className="text-xs font-medium pl-2 text-slate-300">
              {selectedLoanIds.length} sélectionné{selectedLoanIds.length > 1 ? 's' : ''}
            </span>

            <button
              type="button"
              onClick={handleSendBatchReminders}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>Envoyer un rappel ({selectedLoanIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Scanner / Gestion physique */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        initialMode={scannerMode}
      />
    </div>
  );
};
