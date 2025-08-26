import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'ukuran-jadi', label: 'Ukuran Jadi Produk', icon: '📏' },
    { id: 'warna', label: 'Warna', icon: '🎨' },
    { id: 'prepress', label: 'Prepress', icon: '📋' },
    { id: 'press', label: 'Press', icon: '🖨️' },
    { id: 'post-press', label: 'Post Press', icon: '✂️' },
    { id: 'postpress', label: 'Postpress', icon: '📦' },
    { id: 'lain-lain', label: 'Lain - lain', icon: '⚙️' },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-wrap px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-4 py-4 border-b-2 font-medium text-xs transition-all ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
