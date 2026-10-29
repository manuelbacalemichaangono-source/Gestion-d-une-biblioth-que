export type RoleUtilisateur = 'etudiant' | 'gestionnaire';

export interface UtilisateurConnecte {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: RoleUtilisateur;
  matricule?: string;
  filiere?: string;
}

export interface EtudiantInscrit {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere?: string;
}

export interface Gestionnaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'gestionnaire';
}

export interface Ouvrage {
  id: string;
  titre: string;
  auteur: string;
  thematique: string;
}

export type StatutExemplaire = 'disponible' | 'non disponible';

export interface Exemplaire {
  id: string;
  ouvrage_id: string;
  numero: number;
  code_barres: string;
  statut: StatutExemplaire;
}

export interface Emprunt {
  id: string;
  etudiant_id: string;
  etudiant_nom: string;
  etudiant_email: string;
  etudiant_matricule?: string;
  ouvrage_id: string;
  ouvrage_titre: string;
  ouvrage_auteur?: string;
  exemplaire_id: string;
  exemplaire_numero: number;
  exemplaire_code?: string;
  date_emprunt: string;
  date_retour_prevue: string;
  date_retour_effective?: string | null;
  rappel_envoye: boolean;
  date_dernier_rappel?: string | null;
}

export const SEUILS_RETARD = {
  FAIBLE_MAX_JOURS: 7,
  MOYEN_MAX_JOURS: 14,
};

export type NiveauRetard = 'faible' | 'moyen' | 'eleve';

export interface InfoRetard {
  estEnRetard: boolean;
  joursRetard: number;
  niveau?: NiveauRetard;
}

export type StudentTab = 'accueil' | 'recherche' | 'emprunts' | 'profil';
export type ManagerTab = 'tableau' | 'retards' | 'guichet' | 'catalogue';
