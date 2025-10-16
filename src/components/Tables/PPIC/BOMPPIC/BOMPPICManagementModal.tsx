import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BOMData,
  BOMPPICKertas,
  BOMPPICTinta,
  BOMPPICCorrugated,
  BOMPPICPoliban,
  BOMPPICCoating,
  BOMPPICLem,
  BOMPPICCreatePayload,
} from './Types/bompiic.types';
import {
  initializeCreateMode,
  LainLainItem,
} from '../BOMPPIC/utils/dataFilter';
import BOMPPICInfoSection from './sections/BOMPPICInfoSection';
import BOMPPICSummaryCards from './sections/BOMPPICSummaryCards';
import KertasSection from './sections/materials/KertasSection';
import TintaSection from './sections/materials/TintaSection';
import CorrugatedSection from './sections/materials/CorrugatedSection';
import PolibanSection from './sections/materials/PolibanSection';
import CoatingSection from './sections/materials/CoatingSection';
import LemSection from './sections/materials/LemSection';
import LainLainSection from './sections/materials/LainLainSection';

interface BOMPPICManagementModalProps {
  bomId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BOMPPICManagementModal: React.FC<BOMPPICManagementModalProps> = ({
  bomId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [bomDetails, setBomDetails] = useState<BOMData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [kertasItems, setKertasItems] = useState<BOMPPICKertas[]>([]);
  const [tintaItems, setTintaItems] = useState<BOMPPICTinta[]>([]);
  const [corrugatedItems, setCorrugatedItems] = useState<BOMPPICCorrugated[]>(
    [],
  );
  const [polibanItems, setPolibanItems] = useState<BOMPPICPoliban[]>([]);
  const [coatingItems, setCoatingItems] = useState<BOMPPICCoating[]>([]);
  const [lemItems, setLemItems] = useState<BOMPPICLem[]>([]);
  const [lainLainItems, setLainLainItems] = useState<LainLainItem[]>([]);

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

  useEffect(() => {
    fetchBOMData();
  }, [bomId]);

  const fetchBOMData = async () => {
    try {
      setLoading(true);

      try {
        const bomPPICResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/ppic/bomppic/${bomId}`,
          { withCredentials: true },
        );

        const ppicData = bomPPICResponse.data?.data || bomPPICResponse.data;

        if (ppicData && hasBOMPPICData(ppicData)) {
          console.log('BOM PPIC exists, entering edit mode');
          setIsEditMode(true);
          setBomDetails(ppicData);
          initializeEditMode(ppicData);
        } else {
          await fetchBOMAndInitialize();
        }
      } catch (ppicError: any) {
        console.log('BOM PPIC not found, fetching from BOM endpoint');
        await fetchBOMAndInitialize();
      }
    } catch (error: any) {
      console.error('Error fetching BOM data:', error);
      alert(
        `Failed to fetch BOM data: ${
          error.response?.data?.message || error.message
        }`,
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchBOMAndInitialize = async () => {
    const bomResponse = await axios.get(
      `${import.meta.env.VITE_API_LINK}/ppic/bom/${bomId}`,
      { withCredentials: true },
    );

    const bomData = bomResponse.data?.data || bomResponse.data;

    if (bomData) {
      console.log('Fetched BOM data, entering create mode', bomData);
      setIsEditMode(false);
      setBomDetails(bomData);

      const initializedData = initializeCreateMode(bomData);
      setKertasItems(initializedData.kertasItems);
      setTintaItems(initializedData.tintaItems);
      setCorrugatedItems(initializedData.corrugatedItems);
      setPolibanItems(initializedData.polibanItems);
      setCoatingItems(initializedData.coatingItems);
      setLemItems(initializedData.lemItems);
      setLainLainItems(initializedData.lainLainItems);
    } else {
      throw new Error('Invalid BOM response structure');
    }
  };

  const hasBOMPPICData = (bomData: BOMData): boolean => {
    return !!(
      (bomData.bom_ppic_kertas && bomData.bom_ppic_kertas.length > 0) ||
      (bomData.bom_ppic_tinta && bomData.bom_ppic_tinta.length > 0) ||
      (bomData.bom_ppic_corrugated && bomData.bom_ppic_corrugated.length > 0) ||
      (bomData.bom_ppic_poliban && bomData.bom_ppic_poliban.length > 0) ||
      (bomData.bom_ppic_coating && bomData.bom_ppic_coating.length > 0) ||
      (bomData.bom_ppic_lem && bomData.bom_ppic_lem.length > 0)
    );
  };

  const initializeEditMode = (bomData: BOMData) => {
    setKertasItems(bomData.bom_ppic_kertas || []);
    setTintaItems(bomData.bom_ppic_tinta || []);
    setCorrugatedItems(bomData.bom_ppic_corrugated || []);
    setPolibanItems(bomData.bom_ppic_poliban || []);
    setCoatingItems(bomData.bom_ppic_coating || []);
    setLemItems(bomData.bom_ppic_lem || []);
    setLainLainItems(
      (bomData.lain_lain || []).map((item) => ({
        nama_item: item.nama_item || '',
        harga: item.harga || 0,
        is_active: item.is_active || true,
      })),
    );
  };

  const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const parseFormattedNumber = (value: string): number => {
    const cleaned = value.replace(/\./g, '').replace(/,/g, '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleLainLainChange = (
    index: number,
    field: keyof LainLainItem,
    value: string | number | boolean,
  ) => {
    const updatedItems = [...lainLainItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setLainLainItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleAddLainLainItem = () => {
    const newItem: LainLainItem = {
      nama_item: '',
      harga: 0,
      is_active: true,
    };
    setLainLainItems([...lainLainItems, newItem]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveLainLainItem = (index: number) => {
    const updatedItems = lainLainItems.filter((_, i) => i !== index);
    setLainLainItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleSaveBOMPPIC = async () => {
    if (!bomDetails) return;

    try {
      setLoading(true);

      const payload: any = {
        id_io: bomDetails.id_io,
        id_so: bomDetails.id_so,
        id_bom: bomId,
        no_io: bomDetails.no_io,
        no_so: bomDetails.no_so,
        no_bom: bomDetails.no_bom,
        customer: bomDetails.customer,
        produk: bomDetails.produk,
        tgl_kirim_customer: bomDetails.tgl_kirim_customer || '',
        bom_ppic_kertas: kertasItems.length > 0 ? kertasItems : undefined,
        bom_ppic_tinta: tintaItems.length > 0 ? tintaItems : undefined,
        bom_ppic_corrugated:
          corrugatedItems.length > 0 ? corrugatedItems : undefined,
        bom_ppic_poliban: polibanItems.length > 0 ? polibanItems : undefined,
        bom_ppic_coating: coatingItems.length > 0 ? coatingItems : undefined,
        bom_ppic_lem: lemItems.length > 0 ? lemItems : undefined,
        lain_lain: lainLainItems.length > 0 ? lainLainItems : undefined,
      };

      const baseUrl = `${import.meta.env.VITE_API_LINK}/ppic/bomppic`;
      const url = isEditMode ? `${baseUrl}/${bomId}` : baseUrl;
      const method = isEditMode ? 'put' : 'post';

      await axios({
        method,
        url,
        data: payload,
        withCredentials: true,
      });

      alert(
        isEditMode
          ? 'BOM PPIC updated successfully!'
          : 'BOM PPIC created successfully!',
      );
      setHasUnsavedChanges(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error saving BOM PPIC:', error);
      alert(
        `Failed to save BOM PPIC: ${
          error.response?.data?.message || error.message
        }`,
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

  const handleKertasChange = (
    index: number,
    field: keyof BOMPPICKertas,
    value: string | number,
  ) => {
    const updatedItems = [...kertasItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === 'string' ? parseFormattedNumber(value) : value,
    };
    setKertasItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleCorrugatedChange = (
    index: number,
    field: keyof BOMPPICCorrugated,
    value: string | number,
  ) => {
    const updatedItems = [...corrugatedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === 'string' ? parseFormattedNumber(value) : value,
    };
    setCorrugatedItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handlePolibanChange = (
    index: number,
    field: keyof BOMPPICPoliban,
    value: string | number,
  ) => {
    const updatedItems = [...polibanItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === 'string' ? parseFormattedNumber(value) : value,
    };
    setPolibanItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleCoatingChange = (
    index: number,
    field: keyof BOMPPICCoating,
    value: string | number,
  ) => {
    const updatedItems = [...coatingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === 'string' ? parseFormattedNumber(value) : value,
    };
    setCoatingItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleLemChange = (
    index: number,
    field: keyof BOMPPICLem,
    value: string | number,
  ) => {
    const updatedItems = [...lemItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === 'string' ? parseFormattedNumber(value) : value,
    };
    setLemItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleTintaDetailChange = (
    tintaIndex: number,
    detailIndex: number,
    field: 'qty_beli' | 'qty_stok',
    value: string,
  ) => {
    const updatedItems = [...tintaItems];
    updatedItems[tintaIndex].tinta_detail[detailIndex] = {
      ...updatedItems[tintaIndex].tinta_detail[detailIndex],
      [field]: parseFormattedNumber(value),
    };
    setTintaItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  if (!bomDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700">Loading BOM data...</span>
          </div>
        </div>
      </div>
    );
  }

  const totalItems =
    kertasItems.length +
    tintaItems.length +
    corrugatedItems.length +
    polibanItems.length +
    coatingItems.length +
    lemItems.length +
    lainLainItems.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-screen flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditMode ? 'Edit BOM PPIC' : 'Create BOM PPIC'}
            </h2>
            {isEditMode && (
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-medium">
                📝 Editing Mode
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
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

        {/* Info and Summary Section */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <BOMPPICInfoSection bomDetails={bomDetails} />
          <BOMPPICSummaryCards
            kertasItems={kertasItems}
            tintaItems={tintaItems}
            corrugatedItems={corrugatedItems}
            polibanItems={polibanItems}
            coatingItems={coatingItems}
            lemItems={lemItems}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-medium">No materials found</p>
              <p className="text-sm">Please check the BOM data</p>
            </div>
          ) : (
            <div className="space-y-6">
              <KertasSection
                items={kertasItems}
                onItemChange={handleKertasChange}
                formatNumber={formatNumber}
              />

              <TintaSection
                items={tintaItems}
                onDetailChange={handleTintaDetailChange}
                formatNumber={formatNumber}
              />

              <CorrugatedSection
                items={corrugatedItems}
                onItemChange={handleCorrugatedChange}
                formatNumber={formatNumber}
              />

              <PolibanSection
                items={polibanItems}
                onItemChange={handlePolibanChange}
                formatNumber={formatNumber}
              />

              <CoatingSection
                items={coatingItems}
                onItemChange={handleCoatingChange}
                formatNumber={formatNumber}
              />

              <LemSection
                items={lemItems}
                onItemChange={handleLemChange}
                formatNumber={formatNumber}
              />

              <LainLainSection
                items={lainLainItems}
                onItemChange={handleLainLainChange}
                onAddItem={handleAddLainLainItem}
                onRemoveItem={handleRemoveLainLainItem}
                formatNumber={formatNumber}
                parseFormattedNumber={parseFormattedNumber}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0 bg-gray-50">
          <div className="text-xs text-gray-500">
            {hasUnsavedChanges && (
              <span className="flex items-center text-orange-600">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBOMPPIC}
              className="px-6 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isEditMode ? 'Update BOM PPIC' : 'Save BOM PPIC'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMPPICManagementModal;
