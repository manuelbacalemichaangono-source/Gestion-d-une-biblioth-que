import {
  EtudiantInscrit,
  Gestionnaire,
  Ouvrage,
  Exemplaire,
  Emprunt,
} from '../types/library';

export function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// Adresse e-mail unique du gestionnaire (administrateur)
export const EMAIL_GESTIONNAIRE = 'gestionnaire@bibliotech.fr';

export const INITIAL_GESTIONNAIRES: Gestionnaire[] = [
  {
    id: 'ges-001',
    nom: 'Dupont',
    prenom: 'Claire',
    email: EMAIL_GESTIONNAIRE,
    role: 'gestionnaire',
  },
];

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
];

export const INITIAL_OUVRAGES: Ouvrage[] = [
  {
    id: 'ouv-001',
    titre: 'L’Étranger',
    auteur: 'Albert Camus',
    thematique: 'Littérature classique',
  },
  {
    id: 'ouv-002',
    titre: 'Les Misérables',
    auteur: 'Victor Hugo',
    thematique: 'Littérature classique',
  },
  {
    id: 'ouv-003',
    titre: '1984',
    auteur: 'George Orwell',
    thematique: 'Science-Fiction',
  },
  {
    id: 'ouv-004',
    titre: 'Dune',
    auteur: 'Frank Herbert',
    thematique: 'Science-Fiction',
  },
  {
    id: 'ouv-005',
    titre: 'Sapiens',
    auteur: 'Yuval Noah Harari',
    thematique: 'Histoire & Sciences',
  },
  {
    id: 'ouv-006',
    titre: 'Peter Pan',
    auteur: 'J.M. Barrie',
    thematique: 'Jeunesse & Aventure',
  },
  {
    id: 'ouv-007',
    titre: 'Tom Sawyer',
    auteur: 'Mark Twain',
    thematique: 'Jeunesse & Aventure',
  },
  {
    id: 'ouv-008',
    titre: 'Introduction aux bases de données',
    auteur: 'Laurent Audibert',
    thematique: 'Informatique',
  },
  {
    id: 'ouv-009',
    titre: 'Le Petit Prince',
    auteur: 'Antoine de Saint-Exupéry',
    thematique: 'Littérature classique',
  },
  {
    id: 'ouv-010',
    titre: 'Candide',
    auteur: 'Voltaire',
    thematique: 'Philosophie',
  },
];

export const INITIAL_EXEMPLAIRES: Exemplaire[] = [
  { id: 'ex-001-1', ouvrage_id: 'ouv-001', numero: 1, code_barres: 'EX-CAMUS-01', statut: 'non disponible' },
  { id: 'ex-001-2', ouvrage_id: 'ouv-001', numero: 2, code_barres: 'EX-CAMUS-02', statut: 'disponible' },
  { id: 'ex-002-1', ouvrage_id: 'ouv-002', numero: 1, code_barres: 'EX-HUGO-01', statut: 'disponible' },
  { id: 'ex-002-2', ouvrage_id: 'ouv-002', numero: 2, code_barres: 'EX-HUGO-02', statut: 'disponible' },
  { id: 'ex-003-1', ouvrage_id: 'ouv-003', numero: 1, code_barres: 'EX-ORWELL-01', statut: 'non disponible' },
  { id: 'ex-003-2', ouvrage_id: 'ouv-003', numero: 2, code_barres: 'EX-ORWELL-02', statut: 'disponible' },
  { id: 'ex-004-1', ouvrage_id: 'ouv-004', numero: 1, code_barres: 'EX-DUNE-01', statut: 'disponible' },
  { id: 'ex-004-2', ouvrage_id: 'ouv-004', numero: 2, code_barres: 'EX-DUNE-02', statut: 'disponible' },
  { id: 'ex-005-1', ouvrage_id: 'ouv-005', numero: 1, code_barres: 'EX-SAPIENS-01', statut: 'non disponible' },
  { id: 'ex-005-2', ouvrage_id: 'ouv-005', numero: 2, code_barres: 'EX-SAPIENS-02', statut: 'disponible' },
  { id: 'ex-006-1', ouvrage_id: 'ouv-006', numero: 1, code_barres: 'EX-PAN-01', statut: 'non disponible' },
  { id: 'ex-006-2', ouvrage_id: 'ouv-006', numero: 2, code_barres: 'EX-PAN-02', statut: 'disponible' },
  { id: 'ex-007-1', ouvrage_id: 'ouv-007', numero: 1, code_barres: 'EX-TOM-01', statut: 'disponible' },
  { id: 'ex-007-2', ouvrage_id: 'ouv-007', numero: 2, code_barres: 'EX-TOM-02', statut: 'disponible' },
  { id: 'ex-008-1', ouvrage_id: 'ouv-008', numero: 1, code_barres: 'EX-BDD-01', statut: 'disponible' },
  { id: 'ex-008-2', ouvrage_id: 'ouv-008', numero: 2, code_barres: 'EX-BDD-02', statut: 'disponible' },
  { id: 'ex-009-1', ouvrage_id: 'ouv-009', numero: 1, code_barres: 'EX-PRINCE-01', statut: 'disponible' },
  { id: 'ex-010-1', ouvrage_id: 'ouv-010', numero: 1, code_barres: 'EX-CANDIDE-01', statut: 'disponible' },
];

export const INITIAL_EMPRUNTS: Emprunt[] = [
  {
    id: 'emp-001',
    etudiant_id: 'etu-001',
    etudiant_nom: 'Thomas Martin',
    etudiant_email: 'thomas.martin@sorbonne.fr',
    etudiant_matricule: 'ETU-2024-001',
    ouvrage_id: 'ouv-005',
    ouvrage_titre: 'Sapiens',
    ouvrage_auteur: 'Yuval Noah Harari',
    exemplaire_id: 'ex-005-1',
    exemplaire_numero: 1,
    exemplaire_code: 'EX-SAPIENS-01',
    date_emprunt: getDateOffset(-20),
    date_retour_prevue: getDateOffset(-6),
    date_retour_effective: null,
    rappel_envoye: true,
    date_dernier_rappel: getDateOffset(-1),
  },
  {
    id: 'emp-002',
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
    date_retour_prevue: getDateOffset(-3),
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },
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
    date_retour_prevue: getDateOffset(-10),
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },
  {
    id: 'emp-004',
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
    date_retour_prevue: getDateOffset(-18),
    date_retour_effective: null,
    rappel_envoye: false,
    date_dernier_rappel: null,
  },
];
