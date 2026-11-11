import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import {
  EtudiantInscrit,
  Gestionnaire,
  Ouvrage,
  Exemplaire,
  Emprunt,
  UtilisateurConnecte,
  InfoRetard,
  SEUILS_RETARD,
  NotificationEtudiant,
  NotificationType,
  ModeEnsembliste,
} from '../types/library';
import {
  EMAIL_GESTIONNAIRE,
  INITIAL_ETUDIANTS,
  INITIAL_GESTIONNAIRES,
  INITIAL_OUVRAGES,
  INITIAL_EXEMPLAIRES,
  INITIAL_EMPRUNTS,
  INITIAL_NOTIFICATIONS,
  getDateOffset,
} from '../data/seedData';

const STORAGE_PREFIX = 'bibliotech_v3_';

export interface NotificationState {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface InscriptionData {
  email: string;
  nom: string;
  prenom: string;
  matricule: string;
  filiere: string;
}

export interface CriteresAvances {
  titre: string;
  auteur: string;
  thematique: string;
  disponibleUniquement: boolean;
}

export interface LivreStatistique {
  ouvrage: Ouvrage;
  totalEmprunts: number;
  disponiblesCount: number;
  totalExemplaires: number;
  estDisponible: boolean;
}

export type AuthVerificationResult =
  | { status: 'gestionnaire'; user: UtilisateurConnecte }
  | { status: 'etudiant'; user: UtilisateurConnecte; etudiant: EtudiantInscrit }
  | { status: 'non_inscrit' };

interface LibraryContextType {
  etudiants: EtudiantInscrit[];
  gestionnaires: Gestionnaire[];
  emailGestionnaire: string;
  ouvrages: Ouvrage[];
  exemplaires: Exemplaire[];
  emprunts: Emprunt[];

  currentUser: UtilisateurConnecte | null;
  verifierEtConnecterEmail: (email: string) => AuthVerificationResult;
  inscrireEtudiant: (data: InscriptionData) => {
    success: boolean;
    error?: string;
  };
  logout: () => void;

  authModal: { isOpen: boolean; mode: 'login' | 'register' };
  ouvrirAuthModal: (mode: 'login' | 'register') => void;
  fermerAuthModal: () => void;

  rechercheAutomatique: (terme: string) => Ouvrage[];
  rechercheAvancee: (criteres: CriteresAvances) => Ouvrage[];
  rechercheEnsembliste: (
    criteres: CriteresAvances,
    mode?: ModeEnsembliste,
    options?: { exclureEmpruntes?: boolean; etudiantId?: string }
  ) => Ouvrage[];
  ensembleIntersection: (a: Ouvrage[], b: Ouvrage[]) => Ouvrage[];
  ensembleUnion: (a: Ouvrage[], b: Ouvrage[]) => Ouvrage[];
  ensembleDifference: (a: Ouvrage[], b: Ouvrage[]) => Ouvrage[];

  getLivresPlusEmpruntes: () => LivreStatistique[];
  getExemplairesOuvrage: (ouvrageId: string) => Exemplaire[];
  getOuvrageById: (ouvrageId: string) => Ouvrage | undefined;
  getActiveLoanForExemplaire: (exemplaireId: string) => Emprunt | undefined;
  getEmpruntsEtudiant: (etudiantId: string, email?: string) => Emprunt[];

  emprunterOuvrageEtudiant: (ouvrageId: string) => {
    success: boolean;
    message: string;
    exemplaire?: Exemplaire;
  };

  notificationsEtudiant: NotificationEtudiant[];
  getNotificationsEtudiant: (etudiantId: string) => NotificationEtudiant[];
  marquerNotificationLue: (notifId: string) => void;
  marquerToutesNotificationsLues: (etudiantId: string) => void;
  ajouterNotificationEtudiant: (notif: {
    etudiant_id: string;
    titre: string;
    message: string;
    type: NotificationType;
    ouvrage_id?: string;
    ouvrage_titre?: string;
  }) => void;

  calculerRetard: (emprunt: Emprunt) => InfoRetard;
  envoyerRappels: (empruntIds: string[]) => {
    success: boolean;
    countEmprunts: number;
    countEtudiants: number;
    etudiantsTouches: string[];
  };
  enregistrerEmprunt: (
    exemplaireCodeOuId: string,
    etudiantMatriculeOuId: string
  ) => {
    success: boolean;
    message: string;
  };
  enregistrerRetour: (exemplaireCodeOuId: string) => {
    success: boolean;
    message: string;
    emprunt?: Emprunt;
  };

  notification: NotificationState | null;
  afficherNotification: (
    message: string,
    action?: { label: string; onAction: () => void },
    dureeMs?: number
  ) => void;
  fermerNotification: () => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [etudiants, setEtudiants] = useState<EtudiantInscrit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}etudiants`);
    return saved ? JSON.parse(saved) : INITIAL_ETUDIANTS;
  });

  const [gestionnaires] = useState<Gestionnaire[]>(INITIAL_GESTIONNAIRES);

  const [ouvrages] = useState<Ouvrage[]>(INITIAL_OUVRAGES);

  const [exemplaires, setExemplaires] = useState<Exemplaire[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}exemplaires`);
    return saved ? JSON.parse(saved) : INITIAL_EXEMPLAIRES;
  });

  const [emprunts, setEmprunts] = useState<Emprunt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}emprunts`);
    return saved ? JSON.parse(saved) : INITIAL_EMPRUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UtilisateurConnecte | null>(
    () => {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}user`);
      return saved ? JSON.parse(saved) : null;
    }
  );

  const [notificationsEtudiant, setNotificationsEtudiant] = useState<
    NotificationEtudiant[]
  >(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
  }>({
    isOpen: false,
    mode: 'login',
  });

  const [notification, setNotification] = useState<NotificationState | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_PREFIX}etudiants`,
      JSON.stringify(etudiants)
    );
  }, [etudiants]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_PREFIX}exemplaires`,
      JSON.stringify(exemplaires)
    );
  }, [exemplaires]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}emprunts`, JSON.stringify(emprunts));
  }, [emprunts]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_PREFIX}notifications`,
      JSON.stringify(notificationsEtudiant)
    );
  }, [notificationsEtudiant]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `${STORAGE_PREFIX}user`,
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  }, [currentUser]);

  const afficherNotification = useCallback(
    (
      message: string,
      action?: { label: string; onAction: () => void },
      dureeMs: number = 5000
    ) => {
      const notifId = `notif-${Date.now()}`;
      setNotification({
        id: notifId,
        message,
        actionLabel: action?.label,
        onAction: action?.onAction,
      });

      setTimeout(() => {
        setNotification((curr) => (curr?.id === notifId ? null : curr));
      }, dureeMs);
    },
    []
  );

  const fermerNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const calculerRetard = useCallback((emprunt: Emprunt): InfoRetard => {
    if (emprunt.date_retour_effective) {
      return { estEnRetard: false, joursRetard: 0 };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const datePrevue = new Date(emprunt.date_retour_prevue);
    const dateAujourdhui = new Date(todayStr);

    const diffMs = dateAujourdhui.getTime() - datePrevue.getTime();
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffJours > 0) {
      let niveau: 'faible' | 'moyen' | 'eleve';
      if (diffJours <= SEUILS_RETARD.FAIBLE_MAX_JOURS) {
        niveau = 'faible';
      } else if (diffJours <= SEUILS_RETARD.MOYEN_MAX_JOURS) {
        niveau = 'moyen';
      } else {
        niveau = 'eleve';
      }
      return { estEnRetard: true, joursRetard: diffJours, niveau };
    }

    return { estEnRetard: false, joursRetard: 0 };
  }, []);

  const verifierEtConnecterEmail = useCallback(
    (emailInput: string): AuthVerificationResult => {
      const cleanEmail = emailInput.trim().toLowerCase();

      // 1. Compte Gestionnaire (Administrateur)
      const gestionnaire = gestionnaires.find(
        (g) => g.email.toLowerCase() === cleanEmail
      );
      if (gestionnaire) {
        const managerUser: UtilisateurConnecte = {
          id: gestionnaire.id,
          email: gestionnaire.email,
          nom: gestionnaire.nom,
          prenom: gestionnaire.prenom,
          role: 'gestionnaire',
        };
        setCurrentUser(managerUser);
        return { status: 'gestionnaire', user: managerUser };
      }

      // 2. Compte Étudiant inscrit
      const etudiant = etudiants.find(
        (e) => e.email.toLowerCase() === cleanEmail
      );
      if (etudiant) {
        const studentUser: UtilisateurConnecte = {
          id: etudiant.id,
          email: etudiant.email,
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          matricule: etudiant.matricule,
          filiere: etudiant.filiere,
          role: 'etudiant',
        };
        setCurrentUser(studentUser);

        // Notification automatique si l'étudiant a un prêt en retard
        const pretsEnRetard = emprunts.filter(
          (emp) =>
            !emp.date_retour_effective &&
            (emp.etudiant_id === etudiant.id ||
              emp.etudiant_email.toLowerCase() === cleanEmail) &&
            calculerRetard(emp).estEnRetard
        );

        if (pretsEnRetard.length > 0) {
          afficherNotification(
            pretsEnRetard.length === 1
              ? `Avis de retard : veuillez restituer « ${pretsEnRetard[0].ouvrage_titre} ».`
              : `Avis de retard : ${pretsEnRetard.length} ouvrages doivent être restitués.`
          );
        }

        return { status: 'etudiant', user: studentUser, etudiant };
      }

      return { status: 'non_inscrit' };
    },
    [gestionnaires, etudiants, emprunts, calculerRetard, afficherNotification]
  );

  const inscrireEtudiant = useCallback(
    (data: InscriptionData): { success: boolean; error?: string } => {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Adresse e-mail invalide.' };
      }
      if (cleanEmail === EMAIL_GESTIONNAIRE.toLowerCase()) {
        return {
          success: false,
          error: 'Cette adresse est réservée à l’administration.',
        };
      }
      if (
        !data.nom.trim() ||
        !data.prenom.trim() ||
        !data.matricule.trim() ||
        !data.filiere.trim()
      ) {
        return { success: false, error: 'Tous les champs sont requis.' };
      }

      const existant = etudiants.find(
        (e) => e.email.toLowerCase() === cleanEmail
      );
      if (existant) {
        setCurrentUser({
          id: existant.id,
          email: existant.email,
          nom: existant.nom,
          prenom: existant.prenom,
          matricule: existant.matricule,
          filiere: existant.filiere,
          role: 'etudiant',
        });
        return { success: true };
      }

      const nouvelEtudiant: EtudiantInscrit = {
        id: `etu-${Date.now()}`,
        email: cleanEmail,
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        matricule: data.matricule.trim().toUpperCase(),
        filiere: data.filiere.trim(),
      };

      setEtudiants((prev) => [nouvelEtudiant, ...prev]);
      setCurrentUser({
        id: nouvelEtudiant.id,
        email: nouvelEtudiant.email,
        nom: nouvelEtudiant.nom,
        prenom: nouvelEtudiant.prenom,
        matricule: nouvelEtudiant.matricule,
        filiere: nouvelEtudiant.filiere,
        role: 'etudiant',
      });

      afficherNotification('Inscription enregistrée.');
      return { success: true };
    },
    [etudiants, afficherNotification]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_PREFIX}user`);
  }, []);

  // Recherche automatique type Google : vide par défaut, priorité aux titres qui commencent par la saisie
  const rechercheAutomatique = useCallback(
    (terme: string): Ouvrage[] => {
      const q = terme.trim().toLowerCase();
      if (!q) return [];

      const scored: { ouvrage: Ouvrage; rank: number }[] = [];

      ouvrages.forEach((ouv) => {
        const titreLow = ouv.titre.toLowerCase();
        const auteurLow = ouv.auteur.toLowerCase();
        const motsTitre = titreLow.split(/[\s’'-]+/);

        if (titreLow.startsWith(q)) {
          scored.push({ ouvrage: ouv, rank: 1 });
        } else if (motsTitre.some((mot) => mot.startsWith(q))) {
          scored.push({ ouvrage: ouv, rank: 2 });
        } else if (titreLow.includes(q)) {
          scored.push({ ouvrage: ouv, rank: 3 });
        } else if (auteurLow.includes(q)) {
          scored.push({ ouvrage: ouv, rank: 4 });
        }
      });

      return scored
        .sort(
          (a, b) =>
            a.rank - b.rank || a.ouvrage.titre.localeCompare(b.ouvrage.titre)
        )
        .map((s) => s.ouvrage);
    },
    [ouvrages]
  );

  const rechercheAvancee = useCallback(
    (criteres: CriteresAvances): Ouvrage[] => {
      const qTitre = criteres.titre.trim().toLowerCase();
      const qAuteur = criteres.auteur.trim().toLowerCase();
      const qTheme = criteres.thematique.trim();

      const hasAnyCriteria =
        Boolean(qTitre) ||
        Boolean(qAuteur) ||
        Boolean(qTheme) ||
        criteres.disponibleUniquement;

      if (!hasAnyCriteria) return [];

      return ouvrages.filter((ouv) => {
        if (qTitre && !ouv.titre.toLowerCase().includes(qTitre)) return false;
        if (qAuteur && !ouv.auteur.toLowerCase().includes(qAuteur)) return false;
        if (qTheme && ouv.thematique !== qTheme) return false;
        if (criteres.disponibleUniquement) {
          const hasFree = exemplaires.some(
            (ex) => ex.ouvrage_id === ouv.id && ex.statut === 'disponible'
          );
          if (!hasFree) return false;
        }
        return true;
      });
    },
    [ouvrages, exemplaires]
  );

  const getExemplairesOuvrage = useCallback(
    (ouvrageId: string): Exemplaire[] => {
      return exemplaires
        .filter((ex) => ex.ouvrage_id === ouvrageId)
        .sort((a, b) => a.numero - b.numero);
    },
    [exemplaires]
  );

  const getOuvrageById = useCallback(
    (ouvrageId: string): Ouvrage | undefined => {
      return ouvrages.find((o) => o.id === ouvrageId);
    },
    [ouvrages]
  );

  const getActiveLoanForExemplaire = useCallback(
    (exemplaireId: string): Emprunt | undefined => {
      return emprunts.find(
        (emp) => emp.exemplaire_id === exemplaireId && !emp.date_retour_effective
      );
    },
    [emprunts]
  );

  const getEmpruntsEtudiant = useCallback(
    (etudiantId: string, email?: string): Emprunt[] => {
      const cleanEmail = email?.trim().toLowerCase();
      return emprunts
        .filter(
          (emp) =>
            emp.etudiant_id === etudiantId ||
            (cleanEmail && emp.etudiant_email.toLowerCase() === cleanEmail)
        )
        .sort((a, b) => b.date_emprunt.localeCompare(a.date_emprunt));
    },
    [emprunts]
  );

  const envoyerRappels = useCallback(
    (
      empruntIds: string[]
    ): {
      success: boolean;
      countEmprunts: number;
      countEtudiants: number;
      etudiantsTouches: string[];
    } => {
      if (empruntIds.length === 0) {
        return {
          success: false,
          countEmprunts: 0,
          countEtudiants: 0,
          etudiantsTouches: [],
        };
      }

      const backupSnapshot = [...emprunts];
      const targetLoans = emprunts.filter((l) => empruntIds.includes(l.id));
      const etudiantsMap = new Map<string, string>();

      targetLoans.forEach((loan) => {
        const key = loan.etudiant_email || loan.etudiant_id;
        if (!etudiantsMap.has(key)) {
          etudiantsMap.set(key, loan.etudiant_nom);
        }
      });

      const todayStr = new Date().toISOString().split('T')[0];

      setEmprunts((prev) =>
        prev.map((loan) =>
          empruntIds.includes(loan.id)
            ? {
                ...loan,
                rappel_envoye: true,
                date_dernier_rappel: todayStr,
              }
            : loan
        )
      );

      targetLoans.forEach((loan) => {
        const notifId = `notif-rappel-${Date.now()}-${loan.id}`;
        setNotificationsEtudiant((prev) => [
          {
            id: notifId,
            etudiant_id: loan.etudiant_id,
            titre: 'Avis de rappel de la bibliothèque',
            message: `Rappel de restitution pour « ${loan.ouvrage_titre} » (Exemplaire n°${loan.exemplaire_numero}). Merci de rapporter l’ouvrage au guichet.`,
            date: todayStr,
            type: 'rappel',
            lu: false,
            ouvrage_id: loan.ouvrage_id,
            ouvrage_titre: loan.ouvrage_titre,
          },
          ...prev,
        ]);
      });

      const countEtudiants = etudiantsMap.size;
      const countEmprunts = targetLoans.length;
      const etudiantsNoms = Array.from(etudiantsMap.values());

      afficherNotification(
        countEmprunts === 1
          ? `Rappel envoyé à ${etudiantsNoms[0]}`
          : `${countEmprunts} rappels envoyés`,
        {
          label: 'Annuler',
          onAction: () => {
            setEmprunts(backupSnapshot);
            afficherNotification('Envoi annulé');
          },
        }
      );

      return {
        success: true,
        countEmprunts,
        countEtudiants,
        etudiantsTouches: etudiantsNoms,
      };
    },
    [emprunts, afficherNotification]
  );

  const enregistrerEmprunt = useCallback(
    (
      exemplaireCodeOuId: string,
      etudiantMatriculeOuId: string
    ): { success: boolean; message: string } => {
      const cleanCode = exemplaireCodeOuId.trim().toUpperCase();
      const cleanMatricule = etudiantMatriculeOuId.trim().toUpperCase();

      const exemplaire = exemplaires.find(
        (e) =>
          e.code_barres.toUpperCase() === cleanCode ||
          e.id.toUpperCase() === cleanCode
      );

      if (!exemplaire) {
        return { success: false, message: 'Exemplaire introuvable.' };
      }

      if (exemplaire.statut === 'non disponible') {
        return {
          success: false,
          message: `L’exemplaire ${exemplaire.numero} est déjà emprunté.`,
        };
      }

      const etudiant = etudiants.find(
        (e) =>
          e.matricule.toUpperCase() === cleanMatricule ||
          e.id.toUpperCase() === cleanMatricule ||
          e.email.toUpperCase() === cleanMatricule
      );

      if (!etudiant) {
        return { success: false, message: 'Étudiant non inscrit.' };
      }

      const ouvrage = ouvrages.find((o) => o.id === exemplaire.ouvrage_id);
      const todayStr = new Date().toISOString().split('T')[0];
      const dueDateStr = getDateOffset(14);

      setExemplaires((prev) =>
        prev.map((ex) =>
          ex.id === exemplaire.id ? { ...ex, statut: 'non disponible' } : ex
        )
      );

      const nouvelEmprunt: Emprunt = {
        id: `emp-${Date.now()}`,
        etudiant_id: etudiant.id,
        etudiant_nom: `${etudiant.prenom} ${etudiant.nom}`,
        etudiant_email: etudiant.email,
        etudiant_matricule: etudiant.matricule,
        ouvrage_id: exemplaire.ouvrage_id,
        ouvrage_titre: ouvrage?.titre || 'Ouvrage',
        ouvrage_auteur: ouvrage?.auteur,
        exemplaire_id: exemplaire.id,
        exemplaire_numero: exemplaire.numero,
        exemplaire_code: exemplaire.code_barres,
        date_emprunt: todayStr,
        date_retour_prevue: dueDateStr,
        date_retour_effective: null,
        rappel_envoye: false,
        date_dernier_rappel: null,
      };

      setEmprunts((prev) => [nouvelEmprunt, ...prev]);

      const notifId = `notif-emp-${Date.now()}`;
      setNotificationsEtudiant((prev) => [
        {
          id: notifId,
          etudiant_id: etudiant.id,
          titre: 'Prêt accordé au guichet',
          message: `L’exemplaire n°${exemplaire.numero} de « ${ouvrage?.titre || 'Ouvrage'} » vous a été attribué. Date de retour limite : ${dueDateStr}.`,
          date: todayStr,
          type: 'emprunt',
          lu: false,
          ouvrage_id: exemplaire.ouvrage_id,
          ouvrage_titre: ouvrage?.titre,
        },
        ...prev,
      ]);

      return {
        success: true,
        message: `Prêt enregistré pour ${etudiant.prenom} ${etudiant.nom}.`,
      };
    },
    [exemplaires, etudiants, ouvrages]
  );

  const enregistrerRetour = useCallback(
    (
      exemplaireCodeOuId: string
    ): { success: boolean; message: string; emprunt?: Emprunt } => {
      const cleanCode = exemplaireCodeOuId.trim().toUpperCase();

      const exemplaire = exemplaires.find(
        (e) =>
          e.code_barres.toUpperCase() === cleanCode ||
          e.id.toUpperCase() === cleanCode
      );

      if (!exemplaire) {
        return { success: false, message: 'Exemplaire introuvable.' };
      }

      const empruntActif = emprunts.find(
        (emp) => emp.exemplaire_id === exemplaire.id && !emp.date_retour_effective
      );

      const todayStr = new Date().toISOString().split('T')[0];

      setExemplaires((prev) =>
        prev.map((ex) =>
          ex.id === exemplaire.id ? { ...ex, statut: 'disponible' } : ex
        )
      );

      if (empruntActif) {
        setEmprunts((prev) =>
          prev.map((emp) =>
            emp.id === empruntActif.id
              ? { ...emp, date_retour_effective: todayStr }
              : emp
          )
        );

        const notifId = `notif-ret-${Date.now()}`;
        setNotificationsEtudiant((prev) => [
          {
            id: notifId,
            etudiant_id: empruntActif.etudiant_id,
            titre: 'Retour d’exemplaire validé',
            message: `Le retour de votre exemplaire pour « ${empruntActif.ouvrage_titre} » a été validé au guichet. Merci de votre restitution.`,
            date: todayStr,
            type: 'info',
            lu: false,
            ouvrage_id: empruntActif.ouvrage_id,
            ouvrage_titre: empruntActif.ouvrage_titre,
          },
          ...prev,
        ]);
      }

      const ouvrage = ouvrages.find((o) => o.id === exemplaire.ouvrage_id);

      return {
        success: true,
        message: `Retour validé : « ${ouvrage?.titre || 'Ouvrage'} ».`,
        emprunt: empruntActif,
      };
    },
    [exemplaires, emprunts, ouvrages]
  );

  const ouvrirAuthModal = useCallback((mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode });
  }, []);

  const fermerAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const getLivresPlusEmpruntes = useCallback((): LivreStatistique[] => {
    const baseCounts: Record<string, number> = {
      'ouv-001': 24,
      'ouv-005': 21,
      'ouv-003': 19,
      'ouv-009': 17,
      'ouv-004': 15,
      'ouv-002': 14,
      'ouv-008': 11,
      'ouv-006': 9,
      'ouv-010': 8,
      'ouv-007': 7,
    };

    return ouvrages
      .map((ouv) => {
        const directLoansCount = emprunts.filter(
          (e) => e.ouvrage_id === ouv.id
        ).length;
        const totalEmprunts = (baseCounts[ouv.id] || 5) + directLoansCount;
        const copies = exemplaires.filter((ex) => ex.ouvrage_id === ouv.id);
        const disponibles = copies.filter(
          (ex) => ex.statut === 'disponible'
        ).length;

        return {
          ouvrage: ouv,
          totalEmprunts,
          disponiblesCount: disponibles,
          totalExemplaires: copies.length,
          estDisponible: disponibles > 0,
        };
      })
      .sort((a, b) => b.totalEmprunts - a.totalEmprunts);
  }, [ouvrages, emprunts, exemplaires]);

  const getNotificationsEtudiant = useCallback(
    (etudiantId: string): NotificationEtudiant[] => {
      return notificationsEtudiant
        .filter((n) => n.etudiant_id === etudiantId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    [notificationsEtudiant]
  );

  const marquerNotificationLue = useCallback((notifId: string) => {
    setNotificationsEtudiant((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, lu: true } : n))
    );
  }, []);

  const marquerToutesNotificationsLues = useCallback((etudiantId: string) => {
    setNotificationsEtudiant((prev) =>
      prev.map((n) => (n.etudiant_id === etudiantId ? { ...n, lu: true } : n))
    );
  }, []);

  const ajouterNotificationEtudiant = useCallback(
    (notif: {
      etudiant_id: string;
      titre: string;
      message: string;
      type: NotificationType;
      ouvrage_id?: string;
      ouvrage_titre?: string;
    }) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const nouvelleNotif: NotificationEtudiant = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: todayStr,
        lu: false,
        ...notif,
      };
      setNotificationsEtudiant((prev) => [nouvelleNotif, ...prev]);
    },
    []
  );

  const ensembleIntersection = useCallback(
    (a: Ouvrage[], b: Ouvrage[]): Ouvrage[] => {
      const idsB = new Set(b.map((o) => o.id));
      return a.filter((o) => idsB.has(o.id));
    },
    []
  );

  const ensembleUnion = useCallback(
    (a: Ouvrage[], b: Ouvrage[]): Ouvrage[] => {
      const map = new Map<string, Ouvrage>();
      a.forEach((o) => map.set(o.id, o));
      b.forEach((o) => map.set(o.id, o));
      return Array.from(map.values());
    },
    []
  );

  const ensembleDifference = useCallback(
    (a: Ouvrage[], b: Ouvrage[]): Ouvrage[] => {
      const idsB = new Set(b.map((o) => o.id));
      return a.filter((o) => !idsB.has(o.id));
    },
    []
  );

  const rechercheEnsembliste = useCallback(
    (
      criteres: CriteresAvances,
      mode: ModeEnsembliste = 'intersection',
      options?: { exclureEmpruntes?: boolean; etudiantId?: string }
    ): Ouvrage[] => {
      const qTitre = criteres.titre.trim().toLowerCase();
      const qAuteur = criteres.auteur.trim().toLowerCase();
      const qTheme = criteres.thematique.trim();

      const hasCritere =
        Boolean(qTitre) ||
        Boolean(qAuteur) ||
        Boolean(qTheme) ||
        criteres.disponibleUniquement;

      if (!hasCritere && !options?.exclureEmpruntes) return [];

      const ensembleTitre = qTitre
        ? ouvrages.filter((o) => o.titre.toLowerCase().includes(qTitre))
        : null;
      const ensembleAuteur = qAuteur
        ? ouvrages.filter((o) => o.auteur.toLowerCase().includes(qAuteur))
        : null;
      const ensembleTheme = qTheme
        ? ouvrages.filter((o) => o.thematique === qTheme)
        : null;
      const ensembleDispo = criteres.disponibleUniquement
        ? ouvrages.filter((o) =>
            exemplaires.some(
              (ex) => ex.ouvrage_id === o.id && ex.statut === 'disponible'
            )
          )
        : null;

      const activeSets = [
        ensembleTitre,
        ensembleAuteur,
        ensembleTheme,
        ensembleDispo,
      ].filter((s): s is Ouvrage[] => s !== null);

      let result: Ouvrage[] = [];

      if (activeSets.length === 0) {
        result = [...ouvrages];
      } else if (mode === 'intersection') {
        result = activeSets.reduce((acc, current) =>
          ensembleIntersection(acc, current)
        );
      } else if (mode === 'union') {
        result = activeSets.reduce((acc, current) =>
          ensembleUnion(acc, current)
        );
      } else if (mode === 'difference') {
        const base = activeSets[0] || ouvrages;
        const rest = activeSets.slice(1);
        result = rest.reduce(
          (acc, current) => ensembleDifference(acc, current),
          base
        );
      }

      if (options?.exclureEmpruntes && options.etudiantId) {
        const empruntesIds = new Set(
          emprunts
            .filter((e) => e.etudiant_id === options.etudiantId)
            .map((e) => e.ouvrage_id)
        );
        result = result.filter((o) => !empruntesIds.has(o.id));
      }

      return result;
    },
    [
      ouvrages,
      exemplaires,
      emprunts,
      ensembleIntersection,
      ensembleUnion,
      ensembleDifference,
    ]
  );

  const emprunterOuvrageEtudiant = useCallback(
    (
      ouvrageId: string
    ): { success: boolean; message: string; exemplaire?: Exemplaire } => {
      if (!currentUser) {
        return {
          success: false,
          message: 'Veuillez vous connecter pour emprunter cet ouvrage.',
        };
      }
      if (currentUser.role !== 'etudiant') {
        return {
          success: false,
          message:
            'Seuls les étudiants peuvent emprunter des ouvrages depuis cette vue.',
        };
      }

      const ouvrage = ouvrages.find((o) => o.id === ouvrageId);
      if (!ouvrage) {
        return { success: false, message: 'Ouvrage introuvable.' };
      }

      const dispoExemplaire = exemplaires.find(
        (ex) => ex.ouvrage_id === ouvrageId && ex.statut === 'disponible'
      );

      if (!dispoExemplaire) {
        return {
          success: false,
          message: `Aucun exemplaire disponible pour « ${ouvrage.titre} ». Tous les exemplaires sont actuellement en prêt.`,
        };
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const dueDateStr = getDateOffset(14);

      setExemplaires((prev) =>
        prev.map((ex) =>
          ex.id === dispoExemplaire.id ? { ...ex, statut: 'non disponible' } : ex
        )
      );

      const nouvelEmprunt: Emprunt = {
        id: `emp-${Date.now()}`,
        etudiant_id: currentUser.id,
        etudiant_nom: `${currentUser.prenom} ${currentUser.nom}`,
        etudiant_email: currentUser.email,
        etudiant_matricule: currentUser.matricule,
        ouvrage_id: ouvrage.id,
        ouvrage_titre: ouvrage.titre,
        ouvrage_auteur: ouvrage.auteur,
        exemplaire_id: dispoExemplaire.id,
        exemplaire_numero: dispoExemplaire.numero,
        exemplaire_code: dispoExemplaire.code_barres,
        date_emprunt: todayStr,
        date_retour_prevue: dueDateStr,
        date_retour_effective: null,
        rappel_envoye: false,
        date_dernier_rappel: null,
      };

      setEmprunts((prev) => [nouvelEmprunt, ...prev]);

      const notifId = `notif-${Date.now()}`;
      const autoNotif: NotificationEtudiant = {
        id: notifId,
        etudiant_id: currentUser.id,
        titre: 'Exemplaire à retirer à la bibliothèque',
        message: `Votre demande d’emprunt pour « ${ouvrage.titre} » (Exemplaire n°${dispoExemplaire.numero}) a été enregistrée. Veuillez passer retirer votre exemplaire à la bibliothèque (Guichet central) sous 48h muni de votre carte étudiante.`,
        date: todayStr,
        type: 'emprunt',
        lu: false,
        ouvrage_id: ouvrage.id,
        ouvrage_titre: ouvrage.titre,
      };

      setNotificationsEtudiant((prev) => [autoNotif, ...prev]);

      afficherNotification(
        `Prêt enregistré pour « ${ouvrage.titre} ». Passez retirer votre exemplaire au guichet.`
      );

      return {
        success: true,
        message: `Prêt validé ! Passez récupérer l'exemplaire au guichet de la bibliothèque.`,
        exemplaire: dispoExemplaire,
      };
    },
    [currentUser, ouvrages, exemplaires, afficherNotification]
  );

  const contextValue = useMemo(
    () => ({
      etudiants,
      gestionnaires,
      emailGestionnaire: EMAIL_GESTIONNAIRE,
      ouvrages,
      exemplaires,
      emprunts,
      currentUser,
      verifierEtConnecterEmail,
      inscrireEtudiant,
      logout,
      authModal,
      ouvrirAuthModal,
      fermerAuthModal,
      rechercheAutomatique,
      rechercheAvancee,
      rechercheEnsembliste,
      ensembleIntersection,
      ensembleUnion,
      ensembleDifference,
      getLivresPlusEmpruntes,
      getExemplairesOuvrage,
      getOuvrageById,
      getActiveLoanForExemplaire,
      getEmpruntsEtudiant,
      emprunterOuvrageEtudiant,
      notificationsEtudiant,
      getNotificationsEtudiant,
      marquerNotificationLue,
      marquerToutesNotificationsLues,
      ajouterNotificationEtudiant,
      calculerRetard,
      envoyerRappels,
      enregistrerEmprunt,
      enregistrerRetour,
      notification,
      afficherNotification,
      fermerNotification,
    }),
    [
      etudiants,
      gestionnaires,
      ouvrages,
      exemplaires,
      emprunts,
      currentUser,
      verifierEtConnecterEmail,
      inscrireEtudiant,
      logout,
      authModal,
      ouvrirAuthModal,
      fermerAuthModal,
      rechercheAutomatique,
      rechercheAvancee,
      rechercheEnsembliste,
      ensembleIntersection,
      ensembleUnion,
      ensembleDifference,
      getLivresPlusEmpruntes,
      getExemplairesOuvrage,
      getOuvrageById,
      getActiveLoanForExemplaire,
      getEmpruntsEtudiant,
      emprunterOuvrageEtudiant,
      notificationsEtudiant,
      getNotificationsEtudiant,
      marquerNotificationLue,
      marquerToutesNotificationsLues,
      ajouterNotificationEtudiant,
      calculerRetard,
      envoyerRappels,
      enregistrerEmprunt,
      enregistrerRetour,
      notification,
      afficherNotification,
      fermerNotification,
    ]
  );


  return (
    <LibraryContext.Provider value={contextValue}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
