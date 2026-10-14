import {
  EtudiantInscrit,
  Gestionnaire,
  Ouvrage,
  Exemplaire,
  Emprunt,
} from '../types/library';

// Helper pour calculer des dates relatives (YYYY-MM-DD)
export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// 1. Étudiants inscrits (seuls ceux-ci peuvent accéder à l'interface Étudiant)
export const INITIAL_ETUDIANTS: EtudiantInscrit[] = [
  {
    id: 'etu-001',
    matricule: 'ETU-2024-001',
    nom: 'Martin',
    prenom: 'Thomas',
    email: 'thomas.martin@sorbonne.fr',
    filiere: 'Informatique',
  },
  {
    id: 'etu-002',
    matricule: 'ETU-2024-002',
    nom: 'Laurent',
    prenom: 'Camille',
    email: 'camille.laurent@sorbonne.fr',
    filiere: 'Lettres Modernes',
  },
  {
    id: 'etu-003',
    matricule: 'ETU-2024-003',
    nom: 'Moreau',
    prenom: 'Lucas',
    email: 'lucas.moreau@univ-paris.fr',
    filiere: 'Histoire',
  },
  {
    id: 'etu-004',
    matricule: 'ETU-2024-004',
    nom: 'Bernard',
    prenom: 'Sophie',
    email: 'sophie.bernard@polytechnique.edu',
    filiere: 'Physique',
  },
  {
    id: 'etu-005',
    matricule: 'ETU-2024-005',
    nom: 'Dubois',
    prenom: 'Éléonore',
    email: 'e.dubois@ens.fr',
    filiere: 'Philosophie',
  },
  {
    id: 'etu-006',
    matricule: 'ETU-2024-006',
    nom: 'Rousseau',
    prenom: 'Julien',
    email: 'julien.rousseau@dauphine.eu',
    filiere: 'Mathématiques',
  },
];

// Gestionnaires autorisés
export const INITIAL_GESTIONNAIRES: Gestionnaire[] = [
  {
    id: 'ges-001',
    nom: 'Dupont',
    prenom: 'Claire',
    email: 'admin@bibliotech.fr',
    role: 'gestionnaire',
  },
  {
    id: 'ges-002',
    nom: 'Lambert',
    prenom: 'Marc',
    email: 'gestionnaire@univ.fr',
    role: 'gestionnaire',
  },
];

// 2. Ouvrages
export const INITIAL_OUVRAGES: Ouvrage[] = [
  {
    id: 'ouv-001',
    titre: 'L’Étranger',
    auteur: 'Albert Camus',
    thematique: 'Littérature classique',
    description: 'Récit philosophique sur l’absurdité de l’existence humaine à travers le personnage de Meursault.',
    isbn: '978-2070400812',
  },
  {
    id: 'ouv-002',
    titre: 'Les Misérables',
    auteur: 'Victor Hugo',
    thematique: 'Littérature classique',
    description: 'Grande fresque sociale et humaniste du XIXe siècle suivant le destin de Jean Valjean.',
    isbn: '978-2253006329',
  },
  {
    id: 'ouv-003',
    titre: '1984',
    auteur: 'George Orwell',
    thematique: 'Science-Fiction',
    description: 'Roman d’anticipation dépeignant une société totalitaire sous la surveillance de Big Brother.',
    isbn: '978-2070368228',
  },
  {
    id: 'ouv-004',
    titre: 'Dune',
    auteur: 'Frank Herbert',
    thematique: 'Science-Fiction',
    description: 'Sur la planète désertique Arrakis, le jeune Paul Atréides affronte des complots interstellaires.',
    isbn: '978-2266320481',
  },
  {
    id: 'ouv-005',
    titre: 'Sapiens : Une brève histoire de l’humanité',
    auteur: 'Yuval Noah Harari',
    thematique: 'Histoire & Sciences',
    description: 'Une fresque audacieuse retraçant 70 000 ans d’histoire de l’humanité.',
    isbn: '978-2226257017',
  },
  {
    id: 'ouv-006',
    titre: 'Peter Pan',
    auteur: 'J.M. Barrie',
    thematique: 'Jeunesse & Aventure',
    description: 'L’enfant qui refusait de grandir entraîne Wendy et ses frères vers le Pays Imaginaire.',
    isbn: '978-2253004851',
  },
  {
    id: 'ouv-007',
    titre: 'Introduction aux bases de données relationnelles',
    auteur: 'Laurent Audibert',
    thematique: 'Informatique & Sciences',
    description: 'Manuel complet sur la conception de bases de données, le langage SQL et la normalisation.',
    isbn: '978-2100825387',
  },
  {
    id: 'ouv-008',
    titre: 'Blacksad : Quelque part entre les ombres',
    auteur: 'Juan Díaz Canales & Juanjo Guarnido',
    thematique: 'Bande Dessinée',
    description: 'Enquête sombre et magistrale d’un détective privé dans le New York des années 1950.',
    isbn: '978-2205044317',
  },
];

// 3. Exemplaires (numérotés : Exemplaire 1, 2, 3...)
export const INITIAL_EXEMPLAIRES: Exemplaire[] = [
  // L'Étranger (3 exemplaires : 1 non disponible / emprunté, 2 et 3 disponibles)
  {
    id: 'ex-001-1',
    ouvrage_id: 'ouv-001',
    numero: 1,
    code_barres: 'EX-CAMUS-01',
    statut: 'non disponible',
  },
  {
    id: 'ex-001-2',
    ouvrage_id: 'ouv-001',
    numero: 2,
    code_barres: 'EX-CAMUS-02',
    statut: 'disponible',
  },
  {
    id: 'ex-001-3',
    ouvrage_id: 'ouv-001',
    numero: 3,
    code_barres: 'EX-CAMUS-03',
    statut: 'disponible',
  },

  // Les Misérables (2 exemplaires : 1 non disponible, 2 disponible)
  {
    id: 'ex-002-1',
    ouvrage_id: 'ouv-002',
    numero: 1,
    code_barres: 'EX-HUGO-01',
    statut: 'non disponible',
  },
  {
    id: 'ex-002-2',
    ouvrage_id: 'ouv-002',
    numero: 2,
    code_barres: 'EX-HUGO-02',
    statut: 'disponible',
  },

  // 1984 (4 exemplaires : 1 non disponible, 2, 3 et 4 disponibles)
  {
    id: 'ex-003-1',
    ouvrage_id: 'ouv-003',
    numero: 1,
    code_barres: 'EX-ORWELL-01',
    statut: 'non disponible',
  },
  {
    id: 'ex-003-2',
    ouvrage_id: 'ouv-003',
    numero: 2,
    code_barres: 'EX-ORWELL-02',
    statut: 'disponible',
  },
  {
    id: 'ex-003-3',
    ouvrage_id: 'ouv-003',
    numero: 3,
    code_barres: 'EX-ORWELL-03',
    statut: 'disponible',
  },
  {
    id: 'ex-003-4',
    ouvrage_id: 'ouv-003',
    numero: 4,
    code_barres: 'EX-ORWELL-04',
    statut: 'disponible',
  },

  // Dune (3 exemplaires : tous disponibles)
  {
    id: 'ex-004-1',
    ouvrage_id: 'ouv-004',
    numero: 1,
    code_barres: 'EX-DUNE-01',
    statut: 'disponible',
  },
  {
    id: 'ex-004-2',
    ouvrage_id: 'ouv-004',
    numero: 2,
    code_barres: 'EX-DUNE-02',
    statut: 'disponible',
  },
  {
    id: 'ex-004-3',
    ouvrage_id: 'ouv-004',
    numero: 3,
    code_barres: 'EX-DUNE-03',
    statut: 'disponible',
  },

  // Sapiens (2 exemplaires : 1 non disponible, 2 disponible)
  {
    id: 'ex-005-1',
    ouvrage_id: 'ouv-005',
    numero: 1,
    code_barres: 'EX-SAPIENS-01',
    statut: 'non disponible',
  },
  {
    id: 'ex-005-2',
    ouvrage_id: 'ouv-005',
    numero: 2,
    code_barres: 'EX-SAPIENS-02',
    statut: 'disponible',
  },

  // Peter Pan (3 exemplaires : 1 non disponible, 2 et 3 disponibles)
  {
    id: 'ex-006-1',
    ouvrage_id: 'ouv-006',
    numero: 1,
    code_barres: 'EX-PAN-01',
    statut: 'non disponible',
  },
  {
    id: 'ex-006-2',
    ouvrage_id: 'ouv-006',
    numero: 2,
    code_barres: 'EX-PAN-02',
    statut: 'disponible',
  },
  {
    id: 'ex-006-3',
    ouvrage_id: 'ouv-006',
    numero: 3,
    code_barres: 'EX-PAN-03',
    statut: 'disponible',
  },

  // Introduction aux bases de données (4 exemplaires : 1 non disponible, 2, 3, 4 disponibles)
  {
    id: 'ex-007-1',
    ouvrage_id: 'ouv-007',
    numero: 1,
    code_barres: 'EX-BDD-01',
    statut: 'non disponible',
  },
  {
    id: 'ex-007-2',
    ouvrage_id: 'ouv-007',
    numero: 2,
    code_barres: 'EX-BDD-02',
    statut: 'disponible',
  },
  {
    id: 'ex-007-3',
    ouvrage_id: 'ouv-007',
    numero: 3,
    code_barres: 'EX-BDD-03',
    statut: 'disponible',
  },
  {
    id: 'ex-007-4',
    ouvrage_id: 'ouv-007',
    numero: 4,
    code_barres: 'EX-BDD-04',
    statut: 'disponible',
  },

  // Blacksad (2 exemplaires : tous disponibles)
  {
    id: 'ex-008-1',
    ouvrage_id: 'ouv-008',
    numero: 1,
    code_barres: 'EX-BLACKSAD-01',
    statut: 'disponible',
  },
  {
    id: 'ex-008-2',
    ouvrage_id: 'ouv-008',
    numero: 2,
    code_barres: 'EX-BLACKSAD-02',
    statut: 'disponible',
  },
];

// 4. Emprunts initiaux avec retards réalistes calibrés pour alimenter les 3 niveaux de retard :
// - Retard faible : 1 à 7 jours (ex: -3j, -5j)
// - Retard moyen : 8 à 14 jours (ex: -10j, -12j)
// - Retard élevé : 15+ jours (ex: -18j, -25j)
// Noter : Sophie Bernard a 2 emprunts en retard (pour tester l'e-mail unique groupé !)
export const INITIAL_EMPRUNTS: Emprunt[] = [
  // 1. Retard faible (3 jours de retard)
  {
    id: 'emp-001',
    etudiant_id: 'etu-003',
    etudiant_nom: 'Lucas Moreau',
    etudiant_email: 'lucas.moreau@univ-paris.fr',
    etudiant_matricule: 'ETU-2024-003',
    ouvrage_id: 'ouv-006',
    ouvrage_titre: 'Peter Pan',
    ouvrage_auteur: 'J.M. Barrie',
    exemplaire_id: 'ex-006-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-PAN-01',
    date_emprunt: getDateOffset(-17),
    date_retour_prevue: getDateOffset(-3), // Échu il y a 3 jours -> Retard faible
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },

  // 2. Retard faible (6 jours de retard)
  {
    id: 'emp-002',
    etudiant_id: 'etu-001',
    etudiant_nom: 'Thomas Martin',
    etudiant_email: 'thomas.martin@sorbonne.fr',
    etudiant_matricule: 'ETU-2024-001',
    ouvrage_id: 'ouv-005',
    ouvrage_titre: 'Sapiens : Une brève histoire de l’humanité',
    ouvrage_auteur: 'Yuval Noah Harari',
    exemplaire_id: 'ex-005-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-SAPIENS-01',
    date_emprunt: getDateOffset(-20),
    date_retour_prevue: getDateOffset(-6), // Échu il y a 6 jours -> Retard faible
    date_retour_effective: null,
    rappel_envoye: true, // Pour afficher l'indicateur discret
    date_dernier_rappel: getDateOffset(-2),
  },

  // 3. Retard moyen (10 jours de retard)
  {
    id: 'emp-003',
    etudiant_id: 'etu-002',
    etudiant_nom: 'Camille Laurent',
    etudiant_email: 'camille.laurent@sorbonne.fr',
    etudiant_matricule: 'ETU-2024-002',
    ouvrage_id: 'ouv-001',
    ouvrage_titre: 'L’Étranger',
    ouvrage_auteur: 'Albert Camus',
    exemplaire_id: 'ex-001-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-CAMUS-01',
    date_emprunt: getDateOffset(-24),
    date_retour_prevue: getDateOffset(-10), // Échu il y a 10 jours -> Retard moyen
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },

  // 4. Retard moyen (12 jours de retard) - Sophie Bernard
  {
    id: 'emp-004',
    etudiant_id: 'etu-004',
    etudiant_nom: 'Sophie Bernard',
    etudiant_email: 'sophie.bernard@polytechnique.edu',
    etudiant_matricule: 'ETU-2024-004',
    ouvrage_id: 'ouv-007',
    ouvrage_titre: 'Introduction aux bases de données relationnelles',
    ouvrage_auteur: 'Laurent Audibert',
    exemplaire_id: 'ex-007-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-BDD-01',
    date_emprunt: getDateOffset(-26),
    date_retour_prevue: getDateOffset(-12), // Échu il y a 12 jours -> Retard moyen
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },

  // 5. Retard élevé (18 jours de retard) - Sophie Bernard (Deuxième emprunt en retard)
  {
    id: 'emp-005',
    etudiant_id: 'etu-004',
    etudiant_nom: 'Sophie Bernard',
    etudiant_email: 'sophie.bernard@polytechnique.edu',
    etudiant_matricule: 'ETU-2024-004',
    ouvrage_id: 'ouv-003',
    ouvrage_titre: '1984',
    ouvrage_auteur: 'George Orwell',
    exemplaire_id: 'ex-003-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-ORWELL-01',
    date_emprunt: getDateOffset(-32),
    date_retour_prevue: getDateOffset(-18), // Échu il y a 18 jours -> Retard élevé
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },

  // 6. Retard élevé (22 jours de retard) - Éléonore Dubois
  {
    id: 'emp-006',
    etudiant_id: 'etu-005',
    etudiant_nom: 'Éléonore Dubois',
    etudiant_email: 'e.dubois@ens.fr',
    etudiant_matricule: 'ETU-2024-005',
    ouvrage_id: 'ouv-002',
    ouvrage_titre: 'Les Misérables',
    ouvrage_auteur: 'Victor Hugo',
    exemplaire_id: 'ex-002-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-HUGO-01',
    date_emprunt: getDateOffset(-36),
    date_retour_prevue: getDateOffset(-22), // Échu il y a 22 jours -> Retard élevé
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },
];
