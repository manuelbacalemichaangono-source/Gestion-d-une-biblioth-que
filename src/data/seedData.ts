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
    code_massar: 'R130123456',
    nom: 'Martin',
    prenom: 'Thomas',
    email: 'thomas.martin@sorbonne.fr',
    filiere: 'Informatique',
  },
  {
    id: 'etu-002',
    matricule: 'ETU-2024-002',
    code_massar: 'G140987654',
    nom: 'Laurent',
    prenom: 'Camille',
    email: 'camille.laurent@sorbonne.fr',
    filiere: 'Lettres Modernes',
  },
  {
    id: 'etu-003',
    matricule: 'ETU-2024-003',
    code_massar: 'K139874512',
    nom: 'Moreau',
    prenom: 'Lucas',
    email: 'lucas.moreau@univ-paris.fr',
    filiere: 'Histoire',
  },
  {
    id: 'etu-004',
    matricule: 'ETU-2024-004',
    code_massar: 'J120456789',
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
    annee: 1942,
    isbn: '978-2070360024',
    couvertureCouleur: 'from-amber-500 to-orange-600',
    description:
      'Chef-d’œuvre de la littérature existentialiste, ce roman retrace l’histoire de Meursault, un employé de bureau à Alger qui vit au jour le jour avec une indifférence désarmante face aux conventions sociales et aux drames de l’existence.',
  },
  {
    id: 'ouv-002',
    titre: 'Les Misérables',
    auteur: 'Victor Hugo',
    thematique: 'Littérature classique',
    annee: 1862,
    isbn: '978-2253096337',
    couvertureCouleur: 'from-blue-600 to-indigo-800',
    description:
      'Fresque monumentale de la société française du XIXe siècle, suivant le destin exceptionnel de Jean Valjean, ancien forçat en quête de rédemption, poursuivi sans relâche par l’inflexible inspecteur Javert.',
  },
  {
    id: 'ouv-003',
    titre: '1984',
    auteur: 'George Orwell',
    thematique: 'Science-Fiction',
    annee: 1949,
    isbn: '978-2070368228',
    couvertureCouleur: 'from-slate-700 to-slate-900',
    description:
      'Dystopie visionnaire décrivant une société totalitaire sous la surveillance absolue de Big Brother et de la police de la Pensée, où toute forme de liberté individuelle et de libre arbitre est éradiquée.',
  },
  {
    id: 'ouv-004',
    titre: 'Dune',
    auteur: 'Frank Herbert',
    thematique: 'Science-Fiction',
    annee: 1965,
    isbn: '978-2266320481',
    couvertureCouleur: 'from-amber-600 to-yellow-700',
    description:
      'Épopée spatiale mythique sur la planète désertique d’Arrakis, unique source de l’Épice dans l’univers. Le jeune Paul Atréides s’y prépare à accomplir une formidable destinée prophétique au cœur des intrigues politiques.',
  },
  {
    id: 'ouv-005',
    titre: 'Sapiens',
    auteur: 'Yuval Noah Harari',
    thematique: 'Histoire & Sciences',
    annee: 2011,
    isbn: '978-2226257017',
    couvertureCouleur: 'from-emerald-600 to-teal-800',
    description:
      'Une brève histoire de l’humanité qui explore comment une espèce de singe insignifiante est devenue le maître absolu de la Terre grâce à sa capacité unique à créer des fictions collectives partagées.',
  },
  {
    id: 'ouv-006',
    titre: 'Peter Pan',
    auteur: 'J.M. Barrie',
    thematique: 'Jeunesse & Aventure',
    annee: 1911,
    isbn: '978-2253006244',
    couvertureCouleur: 'from-emerald-500 to-teal-600',
    description:
      'Le conte féerique inoubliable du garçon qui refusait de grandir, emmenant Wendy et ses frères au Pays imaginaire pour affronter le redoutable Capitaine Crochet et ses pirates.',
  },
  {
    id: 'ouv-007',
    titre: 'Tom Sawyer',
    auteur: 'Mark Twain',
    thematique: 'Jeunesse & Aventure',
    annee: 1876,
    isbn: '978-2070513901',
    couvertureCouleur: 'from-amber-500 to-yellow-600',
    description:
      'Les aventures espiègles et pleines d’insouciance du jeune Tom Sawyer et de son compère Huckleberry Finn le long des rives tumultueuses du fleuve Mississippi.',
  },
  {
    id: 'ouv-008',
    titre: 'Introduction aux bases de données',
    auteur: 'Laurent Audibert',
    thematique: 'Informatique',
    annee: 2020,
    isbn: '978-2100812905',
    couvertureCouleur: 'from-cyan-600 to-blue-700',
    description:
      'Manuel de référence complet couvrant la modélisation relationnelle, l’algèbre relationnelle, la normalisation, le langage SQL et la conception d’architectures de données modernes.',
  },
  {
    id: 'ouv-009',
    titre: 'Le Petit Prince',
    auteur: 'Antoine de Saint-Exupéry',
    thematique: 'Littérature classique',
    annee: 1943,
    isbn: '978-2070612758',
    couvertureCouleur: 'from-indigo-500 to-purple-600',
    description:
      'Conte poétique et philosophique universel célébrant l’amitié, l’amour et la poésie du regard d’enfant : « On ne voit bien qu’avec le cœur. L’essentiel est invisible pour les yeux. »',
  },
  {
    id: 'ouv-010',
    titre: 'Candide',
    auteur: 'Voltaire',
    thematique: 'Philosophie',
    annee: 1759,
    isbn: '978-2070360406',
    couvertureCouleur: 'from-purple-600 to-pink-700',
    description:
      'Conte satirique étincelant où Candide, disciple du précepteur Pangloss affirmant que « tout va pour le mieux dans le meilleur des mondes possibles », découvre les dures réalités du monde avant de cultiver son jardin.',
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

export const INITIAL_NOTIFICATIONS: import('../types/library').NotificationEtudiant[] = [
  {
    id: 'notif-seed-001',
    etudiant_id: 'etu-001',
    titre: 'Exemplaire à retirer au guichet',
    message:
      'Votre demande d’emprunt pour « Sapiens » a été enregistrée. Veuillez passer retirer votre exemplaire à la bibliothèque centrale (Guichet central) sous 48h.',
    date: getDateOffset(-20),
    type: 'emprunt',
    lu: true,
    ouvrage_id: 'ouv-005',
    ouvrage_titre: 'Sapiens',
  },
  {
    id: 'notif-seed-002',
    etudiant_id: 'etu-001',
    titre: 'Avis de retard de restitution',
    message:
      'La date limite pour « Sapiens » était fixée au ' +
      getDateOffset(-6) +
      '. Merci de restituer l’exemplaire au plus vite afin d’éviter des pénalités.',
    date: getDateOffset(-1),
    type: 'retard',
    lu: false,
    ouvrage_id: 'ouv-005',
    ouvrage_titre: 'Sapiens',
  },
  {
    id: 'notif-seed-003',
    etudiant_id: 'etu-002',
    titre: 'Rappel de retour d’ouvrage',
    message:
      'L’échéance pour « L’Étranger » est dépassée. Merci de le déposer à l’accueil de la bibliothèque.',
    date: getDateOffset(-5),
    type: 'retard',
    lu: false,
    ouvrage_id: 'ouv-001',
    ouvrage_titre: 'L’Étranger',
  },
];
