// components/BOM/BOMManagementModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { BOMData, SOData } from './Types/bom.types';
import BOMKertasTab from './Tabs/BOMTabKertas';
import BOMTintaTab from './Tabs/BOMTintaTab';
import BOMCorrugatedTab from './Tabs/BOMCorrugatedTab';
import BOMPolibanTab from './Tabs/BOMPolibatTab';
import BOMCoatingTab from './Tabs/BOMCoatingTab';
import BOMLemTab from './Tabs/BOMLemTab';

interface BOMManagementModalProps {
  soData: SOData;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType =
  | 'kertas'
  | 'tinta'
  | 'corrugated'
  | 'poliban'
  | 'coating'
  | 'lem';

const BOMManagementModal: React.FC<BOMManagementModalProps> = ({
  soData,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('kertas');
  const [loading, setLoading] = useState(false);
  const [bomData, setBOMData] = useState<BOMData>({
    id_io: soData.id_io || 0,
    id_so: soData.id || 0,
    id_io_mounting: 1,
    nama_mounting: 'A',
    no_bom: '',
    no_io: soData.no_io || '',
    no_so: soData.no_so || '',
    customer: soData.customer || '',
    produk: soData.produk || '',
    bom_kertas: [],
    bom_tinta: [],
    bom_corrugated: [],
    bom_poliban: [],
    bom_coating: [],
    bom_lem: [],
  });

  useEffect(() => {
    fetchExistingBOM();
  }, [soData.id]);

  const fetchExistingBOM = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/bom`,
        {
          params: { id_so: soData.id },
          withCredentials: true,
        },
      );

      if (response.data?.data) {
        setBOMData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching BOM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBOM = async () => {
    try {
      setLoading(true);

      const url = `${import.meta.env.VITE_API_LINK}/ppic/bom`;
      const method = bomData.id ? 'put' : 'post';

      await axios({
        method,
        url,
        data: bomData,
        withCredentials: true,
      });

      alert('BOM saved successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error saving BOM:', error);
      alert('Failed to save BOM');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'kertas', label: 'Komponen Pokok Kertas', icon: '📄' },
    { id: 'tinta', label: 'Komponen Tinta', icon: '🎨' },
    { id: 'corrugated', label: 'Komponen Corrugated', icon: '📦' },
    { id: 'poliban', label: 'Komponen Poliban', icon: '🔗' },
    { id: 'coating', label: 'Komponen Coating', icon: '✨' },
    { id: 'lem', label: 'Komponen Lem', icon: '🧴' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Manage BOM</h2>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">NO IO:</span>
                <span className="ml-2 font-medium">{soData.no_io}</span>
              </div>
              <div>
                <span className="text-gray-500">NO SO:</span>
                <span className="ml-2 font-medium">{soData.no_so}</span>
              </div>
              <div>
                <span className="text-gray-500">Customer:</span>
                <span className="ml-2 font-medium">{soData.customer}</span>
              </div>
              <div>
                <span className="text-gray-500">Produk:</span>
                <span className="ml-2 font-medium">{soData.produk}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'kertas' && (
                <BOMKertasTab
                  data={bomData.bom_kertas}
                  onChange={(data) =>
                    setBOMData({ ...bomData, bom_kertas: data })
                  }
                />
              )}
              {activeTab === 'tinta' && (
                <BOMTintaTab
                  data={bomData.bom_tinta}
                  onChange={(data) =>
                    setBOMData({ ...bomData, bom_tinta: data })
                  }
                />
              )}
              {activeTab === 'corrugated' && (
                <BOMCorrugatedTab
                  data={bomData.bom_corrugated}
                  onChange={(data) =>
                    setBOMData({ ...bomData, bom_corrugated: data })
                  }
                />
              )}
              {activeTab === 'poliban' && (
                <BOMPolibanTab
                  data={bomData.bom_poliban}
                  onChange={(data) =>
                    setBOMData({ ...bomData, bom_poliban: data })
                  }
                />
              )}
              {activeTab === 'coating' && (
                <BOMCoatingTab
                  data={bomData.bom_coating}
                  onChange={(data) =>
                    setBOMData({ ...bomData, bom_coating: data })
                  }
                />
              )}
              {activeTab === 'lem' && (
                <BOMLemTab
                  data={bomData.bom_lem}
                  onChange={(data) => setBOMData({ ...bomData, bom_lem: data })}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBOM}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save BOM'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOMManagementModal;
