import React, { useState, useEffect } from 'react';
import { Ouvrage, StudentTab } from '../../types/library';
import { StudentDashboard } from './StudentDashboard';
import { StudentHome } from './StudentHome';
import { StudentLoans } from './StudentLoans';
import { StudentProfile } from './StudentProfile';
import { BookDetail } from './BookDetail';

interface StudentAppProps {
  activeTab: StudentTab;
  onChangeTab: (tab: StudentTab) => void;
}

export const StudentApp: React.FC<StudentAppProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const [selectedOuvrage, setSelectedOuvrage] = useState<Ouvrage | null>(null);

  useEffect(() => {
    setSelectedOuvrage(null);
  }, [activeTab]);

  if (selectedOuvrage) {
    return (
      <BookDetail
        ouvrage={selectedOuvrage}
        onBack={() => setSelectedOuvrage(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {activeTab === 'accueil' && (
        <StudentDashboard onNavigateTab={onChangeTab} />
      )}

      {activeTab === 'recherche' && (
        <StudentHome onSelectOuvrage={(ouv) => setSelectedOuvrage(ouv)} />
      )}

      {activeTab === 'emprunts' && <StudentLoans />}

      {activeTab === 'profil' && <StudentProfile />}
    </div>
  );
};
