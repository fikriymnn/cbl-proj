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
import BOMLainLainTab from './Tabs/BOMLainLainTab';
interface BOMManagementModalProps {
  soId: number;
  onClose: () => void;
  onSuccess: () => void;
  ioID: number;
}

type TabType =
  | 'kertas'
  | 'tinta'
  | 'corrugated'
  | 'poliban'
  | 'coating'
  | 'lem'
  | 'lain-lain';
const BOMManagementModal: React.FC<BOMManagementModalProps> = ({
  soId,
  ioID,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('kertas');
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [soData, setSOData] = useState<SOData | null>(null);
  const [selectedMounting, setSelectedMounting] = useState<any>(null);
  const [ioMountings, setIoMountings] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bomFetched, setBomFetched] = useState(false);

  const [bomData, setBOMData] = useState<BOMData>({
    id_io: 0,
    id_so: 0,
    id_io_mounting: 1,
    nama_mounting: 'A',
    no_bom: '',
    no_io: '',
    no_so: '',
    customer: '',
    produk: '',
    status: 'draft',
    status_bom: 'baru',
    status_proses: 'draft',
    is_active: true,
    bom_kertas: [],
    bom_tinta: [],
    bom_corrugated: [],
    bom_poliban: [],
    bom_coating: [],
    bom_lem: [],
    lain_lain: [],
  });

  // Fetch both SO and IO data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchSOData(), fetchExistingio()]);
    };
    fetchInitialData();
  }, [soId]);

  // Check for existing BOM after both soData and ioMountings are loaded
  useEffect(() => {
    if (soData && ioMountings.length > 0 && !bomFetched) {
      // Check if BOM exists from SO data
      if (soData?.bom?.id) {
        setIsEditMode(true);
        setBomFetched(true);
        fetchExistingBOMById(soData.bom.id);
      } else {
        // Set first mounting as default for new BOM
        if (ioMountings.length > 0) {
          setSelectedMounting(ioMountings[0]);
          setBOMData((prev) => ({
            ...prev,
            id_io_mounting: ioMountings[0].id,
            nama_mounting: ioMountings[0].nama_mounting,
          }));
        }
      }
    }
  }, [soData, ioMountings, bomFetched]);

  // Prevent page refresh/close when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Fetch SO data by ID
  const fetchSOData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/so/${soId}`,
        {
          withCredentials: true,
        },
      );
      if (response.data?.data) {
        const fetchedSOData = response.data.data;
        setSOData(fetchedSOData);

        // Initialize BOM data with SO information
        setBOMData((prev) => ({
          ...prev,
          id_io: fetchedSOData.id_io || 0,
          id_so: fetchedSOData.id || 0,
          no_io: fetchedSOData.no_io || '',
          no_so: fetchedSOData.no_so || '',
          customer: fetchedSOData.customer || '',
          produk: fetchedSOData.produk || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching SO data:', error);
      alert('Failed to fetch SO data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing BOM by ID (when editing)
  const fetchExistingBOMById = async (bomId: number) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/bom/${bomId}`,
        {
          withCredentials: true,
        },
      );

      console.log('Existing BOM Data Response:', response.data);

      if (response.data?.data) {
        const existingBOM = response.data.data;

        setBOMData({
          id: existingBOM.id,
          id_io: Number(existingBOM.id_io),
          id_so: Number(existingBOM.id_so),
          id_io_mounting: Number(existingBOM.id_io_mounting),
          id_create_bom: existingBOM.id_create_bom,
          id_approve_bom: existingBOM.id_approve_bom,
          nama_mounting: String(existingBOM.nama_mounting || 'A'),
          no_bom: String(existingBOM.no_bom || ''),
          no_io: String(existingBOM.no_io || ''),
          no_so: String(existingBOM.no_so || ''),
          customer: String(existingBOM.customer || ''),
          produk: String(existingBOM.produk || ''),
          status: existingBOM.status || 'draft',
          status_bom: existingBOM.status_bom || 'baru',
          status_proses: existingBOM.status_proses || 'draft',
          is_active:
            existingBOM.is_active !== undefined ? existingBOM.is_active : true,
          note_reject: existingBOM.note_reject || null,
          tgl_pembuatan_bom: existingBOM.tgl_pembuatan_bom,
          tgl_approve_bom: existingBOM.tgl_approve_bom,
          bom_kertas: Array.isArray(existingBOM.bom_kertas)
            ? existingBOM.bom_kertas
            : [],
          bom_tinta: Array.isArray(existingBOM.bom_tinta)
            ? existingBOM.bom_tinta
            : [],
          bom_corrugated: Array.isArray(existingBOM.bom_corrugated)
            ? existingBOM.bom_corrugated
            : [],
          bom_poliban: Array.isArray(existingBOM.bom_poliban)
            ? existingBOM.bom_poliban
            : [],
          bom_coating: Array.isArray(existingBOM.bom_coating)
            ? existingBOM.bom_coating
            : [],
          bom_lem: Array.isArray(existingBOM.bom_lem)
            ? existingBOM.bom_lem
            : [],
          lain_lain: Array.isArray(existingBOM.lain_lain)
            ? existingBOM.lain_lain
            : [],
        });

        // Set the mounting if available
        if (existingBOM.id_io_mounting && ioMountings.length > 0) {
          const mounting = ioMountings.find(
            (m) => m.id === existingBOM.id_io_mounting,
          );

          if (mounting) {
            setSelectedMounting(mounting);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching existing BOM:', error);
      // Don't show alert for 404 - it means BOM doesn't exist yet
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        alert('Failed to fetch existing BOM data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingio = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/io/${ioID}`,
        {
          withCredentials: true,
        },
      );
      console.log('IO Data Response:', response.data);
      if (response.data?.data) {
        const ioData = response.data.data;
        const mountings = ioData.io_mounting || [];

        setIoMountings(mountings);
      }
    } catch (error) {
      console.error('Error fetching IO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBOMDataChange = (newData: Partial<BOMData>) => {
    setBOMData((prev) => {
      const updated = { ...prev, ...newData };

      // Explicitly ensure scalar fields remain scalar
      if (typeof updated.id_io !== 'number') updated.id_io = prev.id_io;
      if (typeof updated.id_so !== 'number') updated.id_so = prev.id_so;
      if (typeof updated.id_io_mounting !== 'number')
        updated.id_io_mounting = prev.id_io_mounting;
      if (typeof updated.nama_mounting !== 'string')
        updated.nama_mounting = prev.nama_mounting;
      if (typeof updated.no_bom !== 'string') updated.no_bom = prev.no_bom;
      if (typeof updated.no_io !== 'string') updated.no_io = prev.no_io;
      if (typeof updated.no_so !== 'string') updated.no_so = prev.no_so;
      if (typeof updated.customer !== 'string')
        updated.customer = prev.customer;
      if (typeof updated.produk !== 'string') updated.produk = prev.produk;

      // Ensure status fields are strings
      if (typeof updated.status !== 'string') updated.status = prev.status;
      if (typeof updated.status_bom !== 'string')
        updated.status_bom = prev.status_bom;
      if (typeof updated.status_proses !== 'string')
        updated.status_proses = prev.status_proses;
      if (typeof updated.is_active !== 'boolean')
        updated.is_active = prev.is_active;

      // Ensure all arrays are valid
      updated.bom_kertas = Array.isArray(updated.bom_kertas)
        ? updated.bom_kertas
        : [];
      updated.bom_tinta = Array.isArray(updated.bom_tinta)
        ? updated.bom_tinta
        : [];
      updated.bom_corrugated = Array.isArray(updated.bom_corrugated)
        ? updated.bom_corrugated
        : [];
      updated.bom_poliban = Array.isArray(updated.bom_poliban)
        ? updated.bom_poliban
        : [];
      updated.bom_coating = Array.isArray(updated.bom_coating)
        ? updated.bom_coating
        : [];
      updated.bom_lem = Array.isArray(updated.bom_lem) ? updated.bom_lem : [];
      updated.lain_lain = Array.isArray(updated.lain_lain)
        ? updated.lain_lain
        : [];

      return updated;
    });

    setHasUnsavedChanges(true);
  };

  const handleMountingChange = (mountingId: string) => {
    const selected = ioMountings.find((m) => m.id.toString() === mountingId);

    if (selected) {
      setSelectedMounting(selected);
      setBOMData((prev) => ({
        ...prev,
        id_io_mounting: selected.id,
        nama_mounting: selected.nama_mounting,
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveBOM = async () => {
    try {
      setLoading(true);
      console.log('Saving BOM Data:', bomData);
      // Validate data before saving
      const dataToSave = {
        ...(bomData.id && { id: bomData.id }),
        id_io: Number(bomData.id_io),
        id_so: Number(bomData.id_so),
        id_io_mounting: Number(bomData.id_io_mounting),
        nama_mounting: String(bomData.nama_mounting),
        no_bom: String(bomData.no_bom),
        no_io: String(bomData.no_io),
        no_so: String(bomData.no_so),
        customer: String(bomData.customer),
        produk: String(bomData.produk),
        status: String(bomData.status || 'draft'),
        status_bom: String(bomData.status_bom || 'baru'),
        status_proses: String(bomData.status_proses || 'draft'),
        is_active: Boolean(bomData.is_active),
        ...(bomData.note_reject && { note_reject: bomData.note_reject }),
        bom_kertas: Array.isArray(bomData.bom_kertas) ? bomData.bom_kertas : [],
        bom_tinta: Array.isArray(bomData.bom_tinta) ? bomData.bom_tinta : [],
        bom_corrugated: Array.isArray(bomData.bom_corrugated)
          ? bomData.bom_corrugated
          : [],
        bom_poliban: Array.isArray(bomData.bom_poliban)
          ? bomData.bom_poliban
          : [],
        bom_coating: Array.isArray(bomData.bom_coating)
          ? bomData.bom_coating
          : [],
        bom_lem: Array.isArray(bomData.bom_lem) ? bomData.bom_lem : [],
        lain_lain: Array.isArray(bomData.lain_lain) ? bomData.lain_lain : [],
      };

      const baseUrl = `${import.meta.env.VITE_API_LINK}/ppic/bom`;
      const url = bomData.id ? `${baseUrl}/${bomData.id}` : baseUrl;
      const method = bomData.id ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: dataToSave,
        withCredentials: true,
      });

      // Update bomData with the saved ID if it was a new record
      if (!bomData.id && response.data?.data?.id) {
        setBOMData((prev) => ({
          ...prev,
          id: response.data.data.id,
        }));
        setIsEditMode(true);
      }

      alert(
        isEditMode ? 'BOM updated successfully!' : 'BOM created successfully!',
      );
      setHasUnsavedChanges(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error saving BOM:', error);
      console.error('Error response:', error.response?.data);
      alert(
        `Failed to save BOM: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to close?',
      );
      if (confirm) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const tabs = [
    { id: 'kertas', label: 'Komponen Pokok Kertas', icon: '📄' },
    { id: 'tinta', label: 'Komponen Tinta', icon: '🎨' },
    { id: 'corrugated', label: 'Komponen Corrugated', icon: '📦' },
    { id: 'poliban', label: 'Komponen Poliban', icon: '🔗' },
    { id: 'coating', label: 'Komponen Coating', icon: '✨' },
    { id: 'lem', label: 'Komponen Lem', icon: '🧴' },
    { id: 'lain-lain', label: 'Komponen Lain-lain', icon: '📦' },
  ];

  // Show loading while fetching SO data
  if (!soData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700">Loading SO data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full  max-h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {isEditMode ? 'Edit BOM' : 'Create BOM'}
            </h2>
            {isEditMode && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                Editing Mode
              </span>
            )}
            {bomData.status && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  bomData.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : bomData.status === 'approved'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {bomData.status.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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

        {/* Info Section - Scrollable on small screens */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0 overflow-y-auto max-h-48">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
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
              <span className="ml-2 font-medium break-words">
                {soData.customer}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Produk:</span>
              <span className="ml-2 font-medium break-words">
                {soData.produk}
              </span>
            </div>
            {bomData.no_bom && (
              <div className="col-span-1 sm:col-span-2">
                <span className="text-gray-500">NO BOM:</span>
                <span className="ml-2 font-medium">{bomData.no_bom}</span>
              </div>
            )}
          </div>

          {/* Mounting Selector */}
          {ioMountings.length > 0 && (
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Pilih Mounting:
              </label>
              <select
                value={selectedMounting?.id || ''}
                onChange={(e) => handleMountingChange(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Pilih Mounting</option>
                {ioMountings.map((mounting) => (
                  <option key={mounting.id} value={mounting.id}>
                    {mounting.nama_mounting}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tabs - Horizontally scrollable */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 border-b border-gray-200 flex-shrink-0">
          <div className="overflow-x-auto overflow-y-hidden -mb-px">
            <div className="flex space-x-1 min-w-max pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">
                    {tab.label.replace('Komponen ', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content - Main scrollable area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                <span className="mt-3 text-sm text-gray-600">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'kertas' && (
                <BOMKertasTab
                  data={bomData.bom_kertas}
                  onChange={(data) => handleBOMDataChange({ bom_kertas: data })}
                  po_qty={soData.po_qty}
                  selectedMounting={selectedMounting}
                />
              )}
              {activeTab === 'tinta' && (
                <BOMTintaTab
                  data={bomData.bom_tinta}
                  onChange={(data) => handleBOMDataChange({ bom_tinta: data })}
                  selectedMounting={selectedMounting}
                />
              )}
              {activeTab === 'corrugated' && (
                <BOMCorrugatedTab
                  data={bomData.bom_corrugated}
                  onChange={(data) =>
                    handleBOMDataChange({ bom_corrugated: data })
                  }
                  po_qty={soData.po_qty}
                />
              )}
              {activeTab === 'poliban' && (
                <BOMPolibanTab
                  data={bomData.bom_poliban}
                  onChange={(data) =>
                    handleBOMDataChange({ bom_poliban: data })
                  }
                  po_qty={soData.po_qty}
                />
              )}
              {activeTab === 'coating' && (
                <BOMCoatingTab
                  data={bomData.bom_coating}
                  onChange={(data) =>
                    handleBOMDataChange({ bom_coating: data })
                  }
                  po_qty={soData.po_qty}
                  id_kalkulasi={soData.id_kalkulasi}
                />
              )}
              {activeTab === 'lem' && (
                <BOMLemTab
                  data={bomData.bom_lem}
                  onChange={(data) => handleBOMDataChange({ bom_lem: data })}
                  po_qty={soData.po_qty}
                  tinggi_io={selectedMounting?.ukuran_jadi_tinggi || 0}
                />
              )}
              {activeTab === 'lain-lain' && ( // ✅ Add this
                <BOMLainLainTab
                  data={bomData.lain_lain}
                  onChange={(data) => handleBOMDataChange({ lain_lain: data })}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end space-x-2 sm:space-x-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBOM}
            className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update BOM' : 'Save BOM'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOMManagementModal;
