import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  Emprunt,
  ManagerTab,
  NiveauRetard,
  EtudiantInscrit,
} from '../../types/library';
import { ManagerGuichet } from './ManagerGuichet';
import {
  Send,
  Bell,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
  Phone,
  Mail,
  BookOpen,
  Clock,
  User,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
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
    envoyerRappelDirect,
    rechercheAutomatique,
  } = useLibrary();

  const [retardLevel, setRetardLevel] = useState<NiveauRetard>('eleve');
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);

  const [lookupMode, setLookupMode] = useState<'ouvrages' | 'etudiants'>('ouvrages');
  const [lookupQuery, setLookupQuery] = useState('');

  // Étudiant sélectionné pour voir sa fiche complète
  const [selectedStudent, setSelectedStudent] = useState<EtudiantInscrit | null>(null);

  // Modal de confirmation d'envoi de rappel par SMS et app
  const [rappelResultModal, setRappelResultModal] = useState<{
    isOpen: boolean;
    titre: string;
    message: string;
    etudiantsTouches: { nom: string; telephone: string; book?: string }[];
    smsUrl?: string;
  } | null>(null);

  // Regroupement des retards par niveau
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

  // CORRECTION DU BUG : Ne retenir que les sélections qui appartiennent strictement au niveau de retard actif
  const selectedInCurrentLevel = useMemo(() => {
    const currentIds = currentLevelLoans.map((l) => l.id);
    return selectedLoanIds.filter((id) => currentIds.includes(id));
  }, [selectedLoanIds, currentLevelLoans]);

  // Changement de niveau de retard : réinitialise la sélection pour ne pas garder de rappel actif
  const handleSwitchRetardLevel = (lvl: NiveauRetard) => {
    setRetardLevel(lvl);
    setSelectedLoanIds([]); // Réinitialisation immédiate pour corriger le bug
  };

  const toggleSelectLoan = (id: string) => {
    setSelectedLoanIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allInCurrentSelected =
    currentLevelLoans.length > 0 &&
    currentLevelLoans.every((l) => selectedInCurrentLevel.includes(l.id));

  const toggleSelectAllCurrent = () => {
    if (allInCurrentSelected) {
      setSelectedLoanIds((prev) =>
        prev.filter((id) => !currentLevelLoans.some((l) => l.id === id))
      );
    } else {
      const currentIds = currentLevelLoans.map((l) => l.id);
      setSelectedLoanIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  // Envoi de rappels groupés depuis l'onglet retards via SMS normal
  const handleSendReminders = () => {
    if (selectedInCurrentLevel.length === 0) return;
    const res = envoyerRappels(selectedInCurrentLevel);
    setSelectedLoanIds([]);

    const touches = res.etudiantsDetails.map((d) => ({
      nom: d.nom,
      telephone: d.telephone,
      book: d.book,
    }));

    const premierNumero = touches[0]?.telephone || '+212 601 786299';
    const cleanPhone = premierNumero.replace(/\s+/g, '');
    const defaultMsg = `BiblioTech : Rappel de restitution pour vos emprunts en cours. Merci de déposer vos ouvrages au guichet de la bibliothèque.`;
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(defaultMsg)}`;

    try {
      window.location.href = smsUrl;
    } catch {
      // Ignore si non pris en charge
    }

    setRappelResultModal({
      isOpen: true,
      titre: touches.length === 1 ? 'Rappel SMS envoyé avec succès' : `${touches.length} rappels SMS envoyés`,
      message: `Le rappel a été envoyé par SMS normal aux numéros de téléphone et déposé sur le compte BiblioTech de chaque étudiant.`,
      etudiantsTouches: touches,
      smsUrl,
    });
  };

  // Envoi d'un rappel direct à un étudiant depuis sa fiche via SMS normal
  const handleSendSingleStudentReminder = (student: EtudiantInscrit) => {
    const res = envoyerRappelDirect({ etudiantId: student.id });
    const targetPhone = student.telephone || '+212 601 786299';

    if (res.smsUrl) {
      try {
        window.location.href = res.smsUrl;
      } catch {
        // Fallback
      }
    }

    setRappelResultModal({
      isOpen: true,
      titre: `SMS envoyé à ${student.prenom} ${student.nom}`,
      message: `Rappel par SMS normal transmis au ${targetPhone} et notifié dans son espace BiblioTech.`,
      etudiantsTouches: [
        {
          nom: `${student.prenom} ${student.nom}`,
          telephone: targetPhone,
        },
      ],
      smsUrl: res.smsUrl,
    });
  };

  const searchedBooks = useMemo(() => {
    if (lookupMode !== 'ouvrages' || !lookupQuery.trim()) return [];
    return rechercheAutomatique(lookupQuery);
  }, [lookupMode, lookupQuery, rechercheAutomatique]);

  const searchedStudents = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (lookupMode !== 'etudiants') return [];
    if (!q) return etudiants; // Afficher tous les étudiants par défaut pour faciliter la navigation
    return etudiants.filter(
      (etu) =>
        `${etu.prenom} ${etu.nom}`.toLowerCase().includes(q) ||
        etu.matricule.toLowerCase().includes(q) ||
        (etu.code_massar && etu.code_massar.toLowerCase().includes(q)) ||
        etu.email.toLowerCase().includes(q) ||
        (etu.telephone && etu.telephone.includes(q)) ||
        (etu.filiere && etu.filiere.toLowerCase().includes(q))
    );
  }, [lookupMode, lookupQuery, etudiants]);

  // Récupérer les prêts actifs de l'étudiant sélectionné pour sa fiche
  const selectedStudentLoans = useMemo(() => {
    if (!selectedStudent) return [];
    return emprunts.filter(
      (emp) =>
        !emp.date_retour_effective &&
        (emp.etudiant_id === selectedStudent.id ||
          emp.etudiant_email.toLowerCase() === selectedStudent.email.toLowerCase())
    );
  }, [selectedStudent, emprunts]);

  if (activeTab === 'guichet') {
    return <ManagerGuichet />;
  }

  // --- ONGLET RETARDS ---
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
                onClick={() => handleSwitchRetardLevel(lvl.key)}
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

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {currentLevelLoans.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-medium text-slate-500">
                Aucun emprunt en retard dans cette catégorie.
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
                const isSelected = selectedInCurrentLevel.includes(loan.id);
                const info = calculerRetard(loan);
                const phone =
                  loan.etudiant_telephone ||
                  (loan.etudiant_nom.includes('Manuel') || loan.etudiant_id === 'etu-001'
                    ? '+212 601 786299'
                    : '+212 632 574752');

                return (
                  <div
                    key={loan.id}
                    onClick={() => toggleSelectLoan(loan.id)}
                    className={`min-h-[64px] px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {loan.etudiant_nom}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                            {phone}
                          </span>
                          {loan.rappel_envoye && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md"
                              title="Rappel déjà envoyé"
                            >
                              <Bell className="w-3 h-3 text-emerald-600" />
                              Rappel envoyé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {loan.ouvrage_titre} · Ex. {loan.exemplaire_numero}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-600 tabular-nums block">
                        +{info.joursRetard} j
                      </span>
                      <span className="text-[10px] text-slate-400">de retard</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Le bouton n'apparaît STRICTEMENT que si des étudiants du niveau actif sont cochés */}
        {selectedInCurrentLevel.length > 0 && (
          <button
            type="button"
            onClick={handleSendReminders}
            className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer tabular-nums shadow-sm animate-in fade-in duration-150"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer un rappel SMS ({selectedInCurrentLevel.length})</span>
          </button>
        )}

        {/* Modal de résultat après envoi */}
        {rappelResultModal?.isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {rappelResultModal.titre}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRappelResultModal(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {rappelResultModal.message}
              </p>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 max-h-48 overflow-y-auto text-xs">
                {rappelResultModal.etudiantsTouches.map((et, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                    <span className="font-semibold text-slate-900 truncate">
                      {et.nom}
                    </span>
                    <span className="font-mono text-blue-700 shrink-0 font-medium">
                      {et.telephone}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {rappelResultModal.smsUrl && (
                  <a
                    href={rappelResultModal.smsUrl}
                    className="w-full min-h-[42px] px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ouvrir l'application SMS</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setRappelResultModal(null)}
                  className="w-full min-h-[38px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ONGLET RECHERCHE / CATALOGUE ---
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
              Étudiants ({etudiants.length})
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
                : 'Rechercher nom, code massar ou téléphone (+212...)'
            }
            className="w-full min-h-[48px] pl-11 pr-10 py-3 text-sm bg-white rounded-2xl border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
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

        {/* LISTE DES RÉSULTATS */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {lookupMode === 'ouvrages' ? (
            !lookupQuery.trim() ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Saisissez un titre ou un auteur pour rechercher dans le catalogue.
              </div>
            ) : searchedBooks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucun ouvrage trouvé pour « {lookupQuery} ».
              </div>
            ) : (
              searchedBooks.map((ouv) => {
                const copies = exemplaires.filter((ex) => ex.ouvrage_id === ouv.id);
                const free = copies.filter((c) => c.statut === 'disponible').length;

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
            searchedStudents.map((etu) => {
              const activeCount = emprunts.filter(
                (e) => !e.date_retour_effective && (e.etudiant_id === etu.id || e.etudiant_email === etu.email)
              ).length;

              return (
                <div
                  key={etu.id}
                  onClick={() => setSelectedStudent(etu)}
                  className="px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {etu.prenom.charAt(0)}{etu.nom.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <span>{etu.prenom} {etu.nom}</span>
                        <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {etu.code_massar || etu.matricule}
                        </span>
                      </div>
                      <div className="text-xs text-blue-700 font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{etu.telephone || '+212 601 786299'}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-sans truncate">{etu.filiere || 'Filière'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {activeCount > 0 && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {activeCount} prêt(s)
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL / INTERFACE DE FICHE ÉTUDIANT DÉTAILLÉE AVEC BOUTON DE RAPPEL */}
        {selectedStudent && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[90vh]">
              {/* Header de la Fiche */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Fiche Étudiant
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenu de la fiche étudiante identique à la maquette */}
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Bloc Avatar et Identité */}
                <div className="flex flex-col items-center justify-center text-center pb-2">
                  <div className="w-18 h-18 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center mb-2 shadow-2xs">
                    {selectedStudent.prenom.charAt(0)}{selectedStudent.nom.charAt(0)}
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedStudent.prenom} {selectedStudent.nom}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedStudent.code_massar || selectedStudent.matricule} · {selectedStudent.etablissement || 'EST Fès'}
                  </p>
                </div>

                {/* Tableau récapitulatif des coordonnées */}
                <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 divide-y divide-slate-200/60 text-xs">
                  <div className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Nom complet</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {selectedStudent.nom} {selectedStudent.prenom}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Email académique</span>
                    <span className="font-mono font-medium text-slate-800 text-right truncate">
                      {selectedStudent.email}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">CNE / Code Massar</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">
                      {selectedStudent.code_massar || selectedStudent.matricule}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Numéro de téléphone</span>
                    <span className="font-mono font-bold text-blue-700 text-right text-xs">
                      {selectedStudent.telephone || '+212 601 786299'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Filière</span>
                    <span className="font-medium text-slate-900 text-right truncate max-w-[65%]">
                      {selectedStudent.filiere || 'Informatique'}
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Établissement</span>
                    <span className="font-medium text-slate-900 text-right">
                      {selectedStudent.etablissement || 'EST Fès'}
                    </span>
                  </div>
                </div>

                {/* Section des prêts en cours de cet étudiant */}
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Emprunts en cours ({selectedStudentLoans.length})</span>
                  </h5>

                  {selectedStudentLoans.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
                      Aucun livre actuellement en cours d’emprunt.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedStudentLoans.map((loan) => {
                        const retardInfo = calculerRetard(loan);
                        return (
                          <div
                            key={loan.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">
                                {loan.ouvrage_titre}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Date limite : {loan.date_retour_prevue}
                              </p>
                            </div>

                            {retardInfo.estEnRetard ? (
                              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                                Retard (+{retardInfo.joursRetard} j)
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                                En cours
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Pied de page de la fiche avec le bouton d'envoi de rappel par SMS et app */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSendSingleStudentReminder(selectedStudent)}
                  className="w-full min-h-[46px] bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs md:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer un rappel (SMS au {selectedStudent.telephone || '+212 601 786299'} & App)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmation envoi direct */}
        {rappelResultModal?.isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {rappelResultModal.titre}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRappelResultModal(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {rappelResultModal.message}
              </p>

              <div className="pt-2 flex flex-col gap-2">
                {rappelResultModal.smsUrl && (
                  <a
                    href={rappelResultModal.smsUrl}
                    className="w-full min-h-[42px] px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ouvrir l'application SMS</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setRappelResultModal(null)}
                  className="w-full min-h-[38px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ONGLET PAR DÉFAUT : TABLEAU DE BORD ÉPURÉ ---
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeLoansCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">En cours</div>
        </div>

        <button
          type="button"
          onClick={() => onChangeTab('retards')}
          className="bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl p-4 text-left transition-colors cursor-pointer shadow-2xs"
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

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {availableCopiesCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Disponibles</div>
        </div>
      </div>

      {/* Répartition directe vers les niveaux de retard */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => {
            handleSwitchRetardLevel('eleve');
            onChangeTab('retards');
          }}
          className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
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
            handleSwitchRetardLevel('moyen');
            onChangeTab('retards');
          }}
          className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
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
            handleSwitchRetardLevel('faible');
            onChangeTab('retards');
          }}
          className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
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
