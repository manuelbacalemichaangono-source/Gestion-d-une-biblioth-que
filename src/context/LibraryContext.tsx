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
} from '../types/library';
import {
  EMAIL_GESTIONNAIRE,
  INITIAL_ETUDIANTS,
  INITIAL_GESTIONNAIRES,
  INITIAL_OUVRAGES,
  INITIAL_EXEMPLAIRES,
  INITIAL_EMPRUNTS,
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

  rechercheAutomatique: (terme: string) => Ouvrage[];
  rechercheAvancee: (criteres: CriteresAvances) => Ouvrage[];
  getExemplairesOuvrage: (ouvrageId: string) => Exemplaire[];
  getOuvrageById: (ouvrageId: string) => Ouvrage | undefined;
  getActiveLoanForExemplaire: (exemplaireId: string) => Emprunt | undefined;
  getEmpruntsEtudiant: (etudiantId: string, email?: string) => Emprunt[];

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
      rechercheAutomatique,
      rechercheAvancee,
      getExemplairesOuvrage,
      getOuvrageById,
      getActiveLoanForExemplaire,
      getEmpruntsEtudiant,
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
      rechercheAutomatique,
      rechercheAvancee,
      getExemplairesOuvrage,
      getOuvrageById,
      getActiveLoanForExemplaire,
      getEmpruntsEtudiant,
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
