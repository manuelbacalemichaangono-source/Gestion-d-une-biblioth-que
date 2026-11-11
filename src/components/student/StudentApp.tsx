import React from 'react';
import { Ouvrage, StudentTab } from '../../types/library';
import { StudentHome } from './StudentHome';
import { StudentLoans } from './StudentLoans';
import { StudentNotifications } from './StudentNotifications';
import { StudentProfile } from './StudentProfile';
import { BookDetail } from './BookDetail';

interface StudentAppProps {
  activeTab: StudentTab;
  onChangeTab: (tab: StudentTab) => void;
  selectedOuvrage: Ouvrage | null;
  onSelectOuvrage: (ouvrage: Ouvrage | null) => void;
}

export const StudentApp: React.FC<StudentAppProps> = ({
  activeTab,
  selectedOuvrage,
  onSelectOuvrage,
}) => {
  if (selectedOuvrage) {
    return (
      <BookDetail
        ouvrage={selectedOuvrage}
        onBack={() => onSelectOuvrage(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {activeTab === 'home' && (
        <StudentHome onSelectOuvrage={(ouv) => onSelectOuvrage(ouv)} />
      )}

      {activeTab === 'emprunts' && <StudentLoans />}

      {activeTab === 'notifications' && <StudentNotifications />}

      {activeTab === 'profil' && <StudentProfile />}
    </div>
  );
};
