import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  EtudiantInscrit,
  Gestionnaire,
  Ouvrage,
  Exemplaire,
  Emprunt,
  UtilisateurConnecte,
  RoleUtilisateur,
  InfoRetard,
  SEUILS_RETARD,
} from '../types/library';
import {
  INITIAL_ETUDIANTS,
  INITIAL_GESTIONNAIRES,
  INITIAL_OUVRAGES,
  INITIAL_EXEMPLAIRES,
  INITIAL_EMPRUNTS,
  getDateOffset,
} from '../data/seedData';

const STORAGE_PREFIX = 'bibliotech_univ_';

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

interface LibraryContextType {
  // Collections internes Firestore
  etudiants: EtudiantInscrit[];
  gestionnaires: Gestionnaire[];
  ouvrages: Ouvrage[];
  exemplaires: Exemplaire[];
  emprunts: Emprunt[];

  // Authentification Étudiant
  currentUser: UtilisateurConnecte | null;
  loginWithGoogleAccount: (email: string) => {
    registered: boolean;
    etudiant?: EtudiantInscrit;
  };
  inscrireEtudiant: (data: InscriptionData) => {
    success: boolean;
    error?: string;
  };
  logout: () => void;

  // Interface Étudiant
  rechercherOuvrages: (terme: string) => Ouvrage[];
  getExemplairesOuvrage: (ouvrageId: string) => Exemplaire[];
  getOuvrageById: (ouvrageId: string) => Ouvrage | undefined;
  getActiveLoanForExemplaire: (exemplaireId: string) => Emprunt | undefined;

  // Interface Gestionnaire : Retards
  calculerRetard: (emprunt: Emprunt) => InfoRetard;
  envoyerRappels: (empruntIds: string[]) => {
    success: boolean;
    countEmprunts: number;
    countEtudiants: number;
    etudiantsTouches: string[];
  };

  // Interface Gestionnaire : Scanner QR & Fichiers
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

  // Notifications temporaires légères
  notification: NotificationState | null;
  afficherNotification: (
    message: string,
    action?: { label: string; onAction: () => void },
    dureeMs?: number
  ) => void;
  fermerNotification: () => void;

  // Réinitialisation
  reinitialiserDonnees: () => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Collections Firestore avec persistance locale
  const [etudiants, setEtudiants] = useState<EtudiantInscrit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}etudiants`);
    return saved ? JSON.parse(saved) : INITIAL_ETUDIANTS;
  });

  const [gestionnaires] = useState<Gestionnaire[]>(INITIAL_GESTIONNAIRES);

  const [ouvrages, setOuvrages] = useState<Ouvrage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}ouvrages`);
    return saved ? JSON.parse(saved) : INITIAL_OUVRAGES;
  });

  const [exemplaires, setExemplaires] = useState<Exemplaire[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}exemplaires`);
    return saved ? JSON.parse(saved) : INITIAL_EXEMPLAIRES;
  });

  const [emprunts, setEmprunts] = useState<Emprunt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}emprunts`);
    return saved ? JSON.parse(saved) : INITIAL_EMPRUNTS;
  });

  // Sauvegarde pour fonction « Annuler »
  const [lastEmpruntsBackup, setLastEmpruntsBackup] = useState<Emprunt[] | null>(null);

  // 2. Authentification : par défaut null pour l'étudiant
  const [currentUser, setCurrentUser] = useState<UtilisateurConnecte | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}user`);
    return saved ? JSON.parse(saved) : null;
  });

  // 3. Notification temporaire
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Synchronisation localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}etudiants`, JSON.stringify(etudiants));
  }, [etudiants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}ouvrages`, JSON.stringify(ouvrages));
  }, [ouvrages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}exemplaires`, JSON.stringify(exemplaires));
  }, [exemplaires]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}emprunts`, JSON.stringify(emprunts));
  }, [emprunts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
    }
  }, [currentUser]);

  // Notifications temporaires (auto-disparition au bout de 4-5 secondes)
  const afficherNotification = (
    message: string,
    action?: { label: string; onAction: () => void },
    dureeMs: number = 4500
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
  };

  const fermerNotification = () => {
    setNotification(null);
  };

  // Connexion Google
  const loginWithGoogleAccount = (
    emailInput: string
  ): { registered: boolean; etudiant?: EtudiantInscrit } => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const etudiant = etudiants.find((e) => e.email.toLowerCase() === cleanEmail);

    if (etudiant) {
      const user: UtilisateurConnecte = {
        id: etudiant.id,
        email: etudiant.email,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        matricule: etudiant.matricule,
        filiere: etudiant.filiere,
        role: 'etudiant',
      };
      setCurrentUser(user);
      return { registered: true, etudiant };
    }

    return { registered: false };
  };

  // Inscription étudiant à la bibliothèque
  const inscrireEtudiant = (
    data: InscriptionData
  ): { success: boolean; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Adresse e-mail invalide.' };
    }
    if (!data.nom.trim() || !data.prenom.trim() || !data.matricule.trim() || !data.filiere.trim()) {
      return { success: false, error: 'Tous les champs sont requis.' };
    }

    // Vérifier si déjà inscrit
    const existant = etudiants.find((e) => e.email.toLowerCase() === cleanEmail);
    if (existant) {
      // Déjà inscrit, connecter directement
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

    // Connexion immédiate dans l'espace étudiant
    setCurrentUser({
      id: nouvelEtudiant.id,
      email: nouvelEtudiant.email,
      nom: nouvelEtudiant.nom,
      prenom: nouvelEtudiant.prenom,
      matricule: nouvelEtudiant.matricule,
      filiere: nouvelEtudiant.filiere,
      role: 'etudiant',
    });

    afficherNotification(`Bienvenue ${nouvelEtudiant.prenom} ! Inscription validée.`);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_PREFIX}user`);
  };

  // Recherche en temps réel pour l'étudiant
  const rechercherOuvrages = (terme: string): Ouvrage[] => {
    const q = terme.trim().toLowerCase();
    if (!q) {
      return ouvrages;
    }
    return ouvrages.filter((ouv) => {
      return (
        ouv.titre.toLowerCase().includes(q) ||
        ouv.auteur.toLowerCase().includes(q) ||
        ouv.thematique.toLowerCase().includes(q)
      );
    });
  };

  const getExemplairesOuvrage = (ouvrageId: string): Exemplaire[] => {
    return exemplaires
      .filter((ex) => ex.ouvrage_id === ouvrageId)
      .sort((a, b) => a.numero - b.numero);
  };

  const getOuvrageById = (ouvrageId: string): Ouvrage | undefined => {
    return ouvrages.find((o) => o.id === ouvrageId);
  };

  // Trouver l'emprunt actif d'un exemplaire pour afficher la date de retour prévue
  const getActiveLoanForExemplaire = (exemplaireId: string): Emprunt | undefined => {
    return emprunts.find(
      (emp) => emp.exemplaire_id === exemplaireId && !emp.date_retour_effective
    );
  };

  // Calcul du retard pour un emprunt
  const calculerRetard = (emprunt: Emprunt): InfoRetard => {
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
  };

  // Envoi de rappels groupés
  const envoyerRappels = (
    empruntIds: string[]
  ): {
    success: boolean;
    countEmprunts: number;
    countEtudiants: number;
    etudiantsTouches: string[];
  } => {
    if (empruntIds.length === 0) {
      return { success: false, countEmprunts: 0, countEtudiants: 0, etudiantsTouches: [] };
    }

    // Sauvegarde pour l'action Annuler
    setLastEmpruntsBackup([...emprunts]);

    const targetLoans = emprunts.filter((l) => empruntIds.includes(l.id));

    // Regrouper par étudiant (1 seul e-mail par étudiant même si plusieurs emprunts)
    const etudiantsMap = new Map<string, { nom: string; email: string; emprunts: Emprunt[] }>();

    targetLoans.forEach((loan) => {
      const key = loan.etudiant_email || loan.etudiant_id;
      if (!etudiantsMap.has(key)) {
        etudiantsMap.set(key, {
          nom: loan.etudiant_nom,
          email: loan.etudiant_email,
          emprunts: [],
        });
      }
      etudiantsMap.get(key)!.emprunts.push(loan);
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Mise à jour de la base de données
    setEmprunts((prev) =>
      prev.map((loan) => {
        if (empruntIds.includes(loan.id)) {
          return {
            ...loan,
            rappel_envoye: true,
            date_dernier_rappel: todayStr,
          };
        }
        return loan;
      })
    );

    const countEtudiants = etudiantsMap.size;
    const countEmprunts = targetLoans.length;
    const etudiantsNoms = Array.from(etudiantsMap.values()).map((e) => e.nom);

    // Message temporaire avec option Annuler
    const msg =
      countEmprunts === 1
        ? '1 rappel envoyé'
        : `${countEmprunts} rappels envoyés (${countEtudiants} étudiant${countEtudiants > 1 ? 's' : ''})`;

    afficherNotification(msg, {
      label: 'Annuler',
      onAction: () => {
        if (lastEmpruntsBackup) {
          setEmprunts(lastEmpruntsBackup);
          afficherNotification('Envoi de rappel annulé');
        }
      },
    });

    return {
      success: true,
      countEmprunts,
      countEtudiants,
      etudiantsTouches: etudiantsNoms,
    };
  };

  // Scanner : enregistrer un emprunt
  const enregistrerEmprunt = (
    exemplaireCodeOuId: string,
    etudiantMatriculeOuId: string
  ): { success: boolean; message: string } => {
    const cleanCode = exemplaireCodeOuId.trim().toUpperCase();
    const cleanMatricule = etudiantMatriculeOuId.trim().toUpperCase();

    // Trouver l'exemplaire
    const exemplaire = exemplaires.find(
      (e) =>
        e.code_barres.toUpperCase() === cleanCode ||
        e.id.toUpperCase() === cleanCode
    );

    if (!exemplaire) {
      return { success: false, message: 'Exemplaire introuvable dans le catalogue.' };
    }

    if (exemplaire.statut === 'non disponible') {
      return {
        success: false,
        message: `L'exemplaire n°${exemplaire.numero} est déjà emprunté.`,
      };
    }

    // Trouver l'étudiant
    const etudiant = etudiants.find(
      (e) =>
        e.matricule.toUpperCase() === cleanMatricule ||
        e.id.toUpperCase() === cleanMatricule ||
        e.email.toUpperCase() === cleanMatricule
    );

    if (!etudiant) {
      return {
        success: false,
        message: "Étudiant non inscrit. Seuls les étudiants inscrits peuvent emprunter.",
      };
    }

    const ouvrage = ouvrages.find((o) => o.id === exemplaire.ouvrage_id);
    const todayStr = new Date().toISOString().split('T')[0];
    const dueDateStr = getDateOffset(14); // 14 jours de prêt standard

    // 1. Mettre à jour l'exemplaire : statut = 'non disponible'
    setExemplaires((prev) =>
      prev.map((ex) => (ex.id === exemplaire.id ? { ...ex, statut: 'non disponible' } : ex))
    );

    // 2. Créer l'emprunt
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
      message: `Emprunt enregistré : « ${ouvrage?.titre || 'Livre'} » (Exemplaire ${exemplaire.numero}) pour ${etudiant.prenom} ${etudiant.nom}.`,
    };
  };

  // Scanner : enregistrer un retour
  const enregistrerRetour = (
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

    // Trouver l'emprunt en cours pour cet exemplaire
    const empruntActif = emprunts.find(
      (emp) => emp.exemplaire_id === exemplaire.id && !emp.date_retour_effective
    );

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Mettre à jour l'exemplaire : statut = 'disponible'
    setExemplaires((prev) =>
      prev.map((ex) => (ex.id === exemplaire.id ? { ...ex, statut: 'disponible' } : ex))
    );

    // 2. Mettre à jour l'emprunt si trouvé
    if (empruntActif) {
      setEmprunts((prev) =>
        prev.map((emp) =>
          emp.id === empruntActif.id ? { ...emp, date_retour_effective: todayStr } : emp
        )
      );
    }

    const ouvrage = ouvrages.find((o) => o.id === exemplaire.ouvrage_id);

    return {
      success: true,
      message: `Retour validé : « ${ouvrage?.titre || 'Livre'} » (Exemplaire n°${exemplaire.numero}) est de nouveau disponible.`,
      emprunt: empruntActif,
    };
  };

  // Réinitialiser les données aux valeurs de base
  const reinitialiserDonnees = () => {
    setEtudiants(INITIAL_ETUDIANTS);
    setOuvrages(INITIAL_OUVRAGES);
    setExemplaires(INITIAL_EXEMPLAIRES);
    setEmprunts(INITIAL_EMPRUNTS);
    localStorage.removeItem(`${STORAGE_PREFIX}etudiants`);
    localStorage.removeItem(`${STORAGE_PREFIX}ouvrages`);
    localStorage.removeItem(`${STORAGE_PREFIX}exemplaires`);
    localStorage.removeItem(`${STORAGE_PREFIX}emprunts`);
    afficherNotification('Données réinitialisées');
  };

  const contextValue = useMemo(
    () => ({
      etudiants,
      gestionnaires,
      ouvrages,
      exemplaires,
      emprunts,
      currentUser,
      loginWithGoogleAccount,
      inscrireEtudiant,
      logout,
      rechercherOuvrages,
      getExemplairesOuvrage,
      getOuvrageById,
      getActiveLoanForExemplaire,
      calculerRetard,
      envoyerRappels,
      enregistrerEmprunt,
      enregistrerRetour,
      notification,
      afficherNotification,
      fermerNotification,
      reinitialiserDonnees,
    }),
    [
      etudiants,
      gestionnaires,
      ouvrages,
      exemplaires,
      emprunts,
      currentUser,
      notification,
    ]
  );

  return <LibraryContext.Provider value={contextValue}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
