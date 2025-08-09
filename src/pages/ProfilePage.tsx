import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileDataForm } from '@/components/profile/forms/ProfileDataForm';
import { PreferencesForm } from '@/components/profile/forms/PreferencesForm';
import { SecurityForm } from '@/components/profile/forms/SecurityForm';
import { useUsers } from '@/data/usersStore';
import { toast } from 'sonner';

type TabValue = 'dados' | 'preferencias' | 'seguranca';

const STORAGE_KEY = 'profile:lastTab';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabValue>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as TabValue) || 'dados';
  });

  const { getCurrentUser, updateCurrentUser } = useUsers();

  const handleTabChange = useCallback((tab: TabValue) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY, tab);
  }, []);

  const handleSaveProfile = useCallback(async (data: any) => {
    try {
      updateCurrentUser(data);
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error('Error updating profile:', error);
    }
  }, [updateCurrentUser]);

  const handleSavePreferences = useCallback(async (preferences: any) => {
    try {
      updateCurrentUser({ preferences });
      toast.success('Preferências atualizadas com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar preferências');
      console.error('Error updating preferences:', error);
    }
  }, [updateCurrentUser]);

  const handleSaveSecurity = useCallback(async (security: any) => {
    try {
      updateCurrentUser({ security });
      toast.success('Configurações de segurança atualizadas');
    } catch (error) {
      toast.error('Erro ao atualizar segurança');
      console.error('Error updating security:', error);
    }
  }, [updateCurrentUser]);

  const currentUser = getCurrentUser();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dados':
        return (
          <ProfileDataForm
            user={currentUser}
            onSave={handleSaveProfile}
          />
        );
      case 'preferencias':
        return (
          <PreferencesForm
            preferences={currentUser.preferences}
            onSave={handleSavePreferences}
          />
        );
      case 'seguranca':
        return (
          <SecurityForm
            security={currentUser.security}
            onSave={handleSaveSecurity}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        subtitle="Gerencie suas informações pessoais, preferências e configurações de segurança"
      />

      <div className="bg-card rounded-lg border shadow-sm">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}