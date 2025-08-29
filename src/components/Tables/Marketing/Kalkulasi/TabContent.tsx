import React from 'react';
import { KalkulasiFormData } from './KalkulasiModal';
import UkuranJadiTab from './tabs/UkuranJadiTab';
import WarnaTab from './tabs/WarnaTab';
import PrepressTab from './tabs/PrepressTab';
import PressTab from './tabs/PressTab';
import PostPressTab from './tabs/PostPressTab';

interface TabContentProps {
  activeTab: string;
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  formData,
  onInputChange,
}) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'ukuran-jadi':
        return (
          <UkuranJadiTab formData={formData} onInputChange={onInputChange} />
        );
      case 'warna':
        return <WarnaTab formData={formData} onInputChange={onInputChange} />;
      case 'prepress':
        return (
          <PrepressTab formData={formData} onInputChange={onInputChange} />
        );
      case 'press':
        return <PressTab formData={formData} onInputChange={onInputChange} />;
      case 'post-press':
        return (
          <PostPressTab formData={formData} onInputChange={onInputChange} />
        );
      default:
        return (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Konten {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
              <p className="text-gray-500">Akan segera ditambahkan</p>
            </div>
          </div>
        );
    }
  };

  return <div className="p-6">{renderTabContent()}</div>;
};

export default TabContent;
