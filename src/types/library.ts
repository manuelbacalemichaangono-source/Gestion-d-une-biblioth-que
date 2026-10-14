// Types pour l'application de gestion de bibliothèque
// Conformes aux exigences : structure légère, deux interfaces (Étudiant et Gestionnaire),
// collections Firestore : etudiants_inscrits, gestionnaires, ouvrages, exemplaires, emprunts.

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

// 1. Collection Firestore : etudiants_inscrits
export interface EtudiantInscrit {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere?: string;
}

// Collection Firestore : gestionnaires
export interface Gestionnaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'gestionnaire';
}

// 2. Collection Firestore : ouvrages
export interface Ouvrage {
  id: string;
  titre: string;
  auteur: string;
  thematique: string;
  description?: string;
  isbn?: string;
}

// 3. Collection Firestore : exemplaires
export type StatutExemplaire = 'disponible' | 'non disponible';

export interface Exemplaire {
  id: string;
  ouvrage_id: string;
  numero: number; // Exemplaire 1, 2, 3...
  code_barres: string; // Ex: EX-CAMUS-01
  statut: StatutExemplaire; // 'disponible' | 'non disponible'
}

// 4. Collection Firestore : emprunts
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
  date_emprunt: string; // YYYY-MM-DD
  date_retour_prevue: string; // YYYY-MM-DD
  date_retour_effective?: string | null; // YYYY-MM-DD
  rappel_envoye: boolean; // oui / non
  date_dernier_rappel?: string | null;
}

// Seuils de retard faciles à modifier
export const SEUILS_RETARD = {
  FAIBLE_MAX_JOURS: 7, // 1 à 7 jours de retard
  MOYEN_MAX_JOURS: 14, // 8 à 14 jours de retard
  // 15 jours et plus = Retard élevé
};

export type NiveauRetard = 'faible' | 'moyen' | 'eleve';

export interface InfoRetard {
  estEnRetard: boolean;
  joursRetard: number;
  niveau?: NiveauRetard;
}
