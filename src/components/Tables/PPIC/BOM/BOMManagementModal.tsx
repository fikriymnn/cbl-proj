// BOMManagementModal.tsx (Updated with Template Selector)
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
import BOMTemplateSelector from './BOMTemplateSelector';

interface BOMManagementModalProps {
  soId?: number;
  ioId?: number;
  onClose: () => void;
  onSuccess: () => void;
  ioID?: number;
  dataSource?: 'SO' | 'IO';
  qtyOverride?: number;
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
  ioId,
  onClose,
  onSuccess,
  ioID,
  dataSource,
  qtyOverride,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('kertas');
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [soData, setSOData] = useState<SOData | null>(null);
  const [ioData, setIOData] = useState<any>(null);
  const [selectedMounting, setSelectedMounting] = useState<any>(null);
  const [ioMountings, setIoMountings] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bomFetched, setBomFetched] = useState(false);

  const [bomData, setBOMData] = useState<BOMData>({
    id_io: 0,
    id_so: null,
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

  const effectiveIOId = ioId || ioID;

  useEffect(() => {
    const fetchInitialData = async () => {
      if (dataSource === 'SO' && soId) {
        await Promise.all([fetchSOData(), fetchIODataFromSO()]);
      } else if (dataSource === 'IO' && effectiveIOId) {
        await fetchIOData();
      }
    };
    fetchInitialData();
  }, [soId, effectiveIOId, dataSource]);

  useEffect(() => {
    if (!bomFetched) {
      if (dataSource === 'SO' && soData && ioMountings.length > 0) {
        checkExistingBOMFromSO();
      } else if (dataSource === 'IO' && ioData && ioMountings.length > 0) {
        checkExistingBOMFromIO();
      }
    }
  }, [soData, ioData, ioMountings, bomFetched, dataSource]);

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

  const fetchSOData = async () => {
    if (!soId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/so/${soId}`,
        { withCredentials: true },
      );

      if (response.data?.data) {
        const fetchedSOData = response.data.data;
        setSOData(fetchedSOData);

        setBOMData((prev) => ({
          ...prev,
          id_io: fetchedSOData.id_io || 0,
          id_so: fetchedSOData.id || null,
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

  const fetchIODataFromSO = async () => {
    if (!soData?.id_io && !effectiveIOId) return;

    const ioIdToFetch = soData?.id_io || effectiveIOId;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/io/${ioIdToFetch}`,
        { withCredentials: true },
      );

      if (response.data?.data) {
        const fetchedIOData = response.data.data;
        const mountings = fetchedIOData.io_mounting || [];
        setIoMountings(mountings);
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIOData = async () => {
    if (!effectiveIOId) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/io/${effectiveIOId}`,
        { withCredentials: true },
      );
      console.log('IO Data Response:', response.data);
      if (response.data?.data) {
        const fetchedIOData = response.data.data;
        setIOData(fetchedIOData);

        const mountings = fetchedIOData.io_mounting || [];
        setIoMountings(mountings);

        setBOMData((prev) => ({
          ...prev,
          id_io: fetchedIOData.id || 0,
          id_so: null,
          no_io: fetchedIOData.no_io || '',
          no_so: '',
          customer: fetchedIOData.customer || '',
          produk: fetchedIOData.produk || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching IO data:', error);
      alert('Failed to fetch IO data');
    } finally {
      setLoading(false);
    }
  };

  const getEffectiveQty = (): number => {
    if (qtyOverride !== undefined && qtyOverride !== null) {
      if (dataSource === 'IO' && selectedMounting?.ukuran_cetak_isi_1) {
        const calculatedQty = qtyOverride * selectedMounting.ukuran_cetak_isi_1;
        return Math.max(0, calculatedQty);
      }
      return qtyOverride;
    }

    if (dataSource === 'SO') {
      return soData?.po_qty || 0;
    } else {
      return ioData?.po_qty || 0;
    }
  };

  const checkExistingBOMFromSO = () => {
    if (soData?.bom?.id) {
      setIsEditMode(true);
      setBomFetched(true);
      fetchExistingBOMById(soData.bom.id);
    } else {
      setDefaultMounting();
    }
  };

  const checkExistingBOMFromIO = () => {
    if (ioData?.bom && Array.isArray(ioData.bom) && ioData.bom.length > 0) {
      setIsEditMode(true);
      setBomFetched(true);
      fetchExistingBOMById(ioData.bom[0].id);
    } else {
      setDefaultMounting();
    }
  };

  const setDefaultMounting = () => {
    if (ioMountings.length > 0) {
      setSelectedMounting(ioMountings[0]);
      setBOMData((prev) => ({
        ...prev,
        id_io_mounting: ioMountings[0].id,
        nama_mounting: ioMountings[0].nama_mounting,
      }));
    }
  };

  const fetchExistingBOMById = async (bomId: number) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/bom/${bomId}`,
        { withCredentials: true },
      );

      console.log('Existing BOM Data Response:', response.data);

      if (response.data?.data) {
        const existingBOM = response.data.data;

        setBOMData({
          id: existingBOM.id,
          id_io: Number(existingBOM.id_io),
          id_so: Number(existingBOM.id_so || null),
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
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        alert('Failed to fetch existing BOM data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBOMDataChange = (newData: Partial<BOMData>) => {
    setBOMData((prev) => {
      const updated = { ...prev, ...newData };

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
      if (typeof updated.status !== 'string') updated.status = prev.status;
      if (typeof updated.status_bom !== 'string')
        updated.status_bom = prev.status_bom;
      if (typeof updated.status_proses !== 'string')
        updated.status_proses = prev.status_proses;
      if (typeof updated.is_active !== 'boolean')
        updated.is_active = prev.is_active;

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
  // ✅ Helper function to recalculate all quantities based on current mounting and po_qty
  const recalculateAllQuantities = (bomData: BOMData): BOMData => {
    const poQty = getEffectiveQty();

    if (!selectedMounting || !poQty) {
      return bomData;
    }

    const updated = { ...bomData };

    // Recalculate BOM Kertas
    if (updated.bom_kertas && updated.bom_kertas.length > 0) {
      const ukuran_cetak_bagian_1 = selectedMounting.ukuran_cetak_bagian_1 || 0;
      const ukuran_cetak_isi_1 = selectedMounting.ukuran_cetak_isi_1 || 0;

      if (ukuran_cetak_bagian_1 > 0 && ukuran_cetak_isi_1 > 0) {
        const calculatedQty = Math.ceil(
          poQty / ukuran_cetak_bagian_1 / ukuran_cetak_isi_1,
        );
        updated.bom_kertas = updated.bom_kertas.map((item) => ({
          ...item,
          qty_lembar_plano: calculatedQty,
        }));
      }
    }

    // Recalculate BOM Corrugated
    if (updated.bom_corrugated && updated.bom_corrugated.length > 0) {
      updated.bom_corrugated = updated.bom_corrugated.map((item) => {
        if (item.isi_per_pack > 0) {
          return {
            ...item,
            qty_corrugated: Math.ceil(poQty / item.isi_per_pack),
          };
        }
        return item;
      });
    }

    // Recalculate BOM Poliban
    if (updated.bom_poliban && updated.bom_poliban.length > 0) {
      updated.bom_poliban = updated.bom_poliban.map((item) => {
        if (item.isi_satu_ikat > 0 && item.lembar_poliban > 0) {
          const calculatedQty =
            poQty / item.isi_satu_ikat / item.lembar_poliban;
          return {
            ...item,
            qty_poliban: Number(calculatedQty.toFixed(2)),
          };
        }
        return item;
      });
    }

    if (updated.bom_coating && updated.bom_coating.length > 0) {
      const panjangCetak = selectedMounting.ukuran_cetak_panjang_1 || 0;
      const lebarCetak = selectedMounting.ukuran_cetak_lebar_1 || 0;
      const ukuranCetakIsi = selectedMounting.ukuran_cetak_isi_1 || 1;

      console.log('🎨 Coating Recalculation - Mounting Data:', {
        panjangCetak,
        lebarCetak,
        ukuranCetakIsi,
        poQty,
      });

      if (panjangCetak > 0 && lebarCetak > 0 && ukuranCetakIsi > 0) {
        const qtyDruk = poQty / ukuranCetakIsi;

        updated.bom_coating = updated.bom_coating.map((item, index) => {
          let qty = 0;
          let uvWb = 0;
          let varnishDoff = 0;

          console.log(`🎨 Coating Item #${index}:`, {
            nama: item.nama_coating,
            rumus: item.rumus_coating,
            tipe: item.tipe_coating,
          });

          if (item.rumus_coating === 'UV_WB') {
            // Formula: (((panjang × lebar) / 1.000.000) × qty_druk) / 1.000
            qty = (((panjangCetak * lebarCetak) / 1000000) * qtyDruk) / 1000;
            uvWb = qty;

            console.log(`  ✓ UV_WB calculated:`, {
              formula: `(((${panjangCetak} × ${lebarCetak}) / 1000000) × ${qtyDruk.toFixed(
                2,
              )}) / 1000`,
              qty: qty.toFixed(4),
            });
          } else if (item.rumus_coating === 'VARNISH_DOFF') {
            // Formula: qty_druk / 3.500
            qty = qtyDruk / 3500;
            varnishDoff = qty;

            console.log(`  ✓ VARNISH_DOFF calculated:`, {
              formula: `${qtyDruk.toFixed(2)} / 3500`,
              qty: qty.toFixed(4),
            });
          } else {
            console.log(`  ⚠ Unknown rumus_coating: "${item.rumus_coating}"`);
          }

          return {
            ...item,
            qty_coating: qty,
            uv_wb: uvWb,
            varnish_doff: varnishDoff,
          };
        });

        console.log('🎨 Coating Recalculation Complete:', updated.bom_coating);
      } else {
        console.warn('⚠ Coating: Missing mounting dimensions', {
          panjangCetak,
          lebarCetak,
          ukuranCetakIsi,
        });
      }
    }

    // Recalculate BOM Lem
    if (updated.bom_lem && updated.bom_lem.length > 0) {
      const tinggi_io = selectedMounting.ukuran_jadi_tinggi || 0;

      if (tinggi_io > 0) {
        updated.bom_lem = updated.bom_lem.map((item) => {
          const konstanta = tinggi_io / 100;
          let qty_lem = 0;

          switch (item.rumus_lem) {
            case 'LOCK_BOTTOM':
              qty_lem = (konstanta + 2) * 0.0001 * poQty;
              break;
            case 'LEM_SAMPING':
              qty_lem = konstanta * 0.0001 * poQty;
              break;
            case 'FOUR_CORNER':
              qty_lem = konstanta * 4 * 0.0001 * poQty;
              break;
            case 'SAMPING_LOCK_BOTTOM':
              qty_lem = (konstanta + 2) * 0.0001 * poQty;
              break;
            case 'SIX_CORNER':
              qty_lem = konstanta * 6 * 0.0001 * poQty;
              break;
            case 'UJUNG_LOCK_BOTTOM':
              qty_lem = (konstanta + 2) * 0.0001 * poQty;
              break;
            default:
              qty_lem = 0;
          }

          return {
            ...item,
            qty_konstanta: konstanta,
            qty_lem: qty_lem,
          };
        });
      }
    }

    // Note: BOM Tinta recalculation is handled by BOMTintaTab's useEffect
    // which will trigger automatically when the data changes

    return updated;
  };
  const handleTemplateSelect = (templateData: Partial<BOMData>) => {
    // First, apply the template data
    setBOMData((prev) => {
      const updated = {
        ...prev,
        ...templateData,
      };

      // ✅ Immediately recalculate quantities for all components
      return recalculateAllQuantities(updated);
    });

    setHasUnsavedChanges(true);
    alert(
      'Template configurations copied! Quantities have been automatically calculated based on your current mounting and PO qty.',
    );
  };
  const handleSaveBOM = async () => {
    try {
      setLoading(true);
      console.log('Saving BOM Data:', bomData);

      const dataToSave = {
        ...(bomData.id && { id: bomData.id }),
        id_io: Number(bomData.id_io),
        id_so: bomData.id_so ? Number(bomData.id_so) : null,
        id_io_mounting: Number(bomData.id_io_mounting),
        nama_mounting: String(bomData.nama_mounting),
        no_bom: String(bomData.no_bom),
        no_io: String(bomData.no_io),
        no_so: String(bomData.no_so || ''),
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
      console.log('Data to be sent to API:', dataToSave);
      const baseUrl = `${import.meta.env.VITE_API_LINK}/ppic/bom`;
      const url = bomData.id ? `${baseUrl}/${bomData.id}` : baseUrl;
      const method = bomData.id ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: dataToSave,
        withCredentials: true,
      });

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

  const currentData = dataSource === 'SO' ? soData : ioData;
  const poQty = getEffectiveQty();

  if (!currentData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700">
              Loading {dataSource} data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {isEditMode ? 'Edit BOM' : 'Create BOM'}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-medium">
              Source: {dataSource}
            </span>
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

        {/* Info Section - Compact */}
        <div className="px-4 sm:px-6 py-2 border-b border-gray-200 flex-shrink-0 relative max-h-[300px] overflow-y-auto">
          {/* Basic Info Grid - More Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs mb-3">
            <div className="flex flex-col">
              <span className="text-gray-500">NO IO:</span>
              <span className=" font-medium text-black">
                {currentData.no_io}
              </span>
            </div>
            {dataSource === 'SO' && currentData.no_so && (
              <div className="flex flex-col">
                <span className="text-gray-500">NO SO:</span>
                <span className=" font-medium text-black">
                  {currentData.no_so}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-gray-500">Customer:</span>
              <span className=" font-medium truncate block text-black">
                {currentData.customer}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Produk:</span>
              <span className=" font-medium truncate block text-black">
                {currentData.produk}
              </span>
            </div>
            {bomData.no_bom && (
              <div className="col-span-2">
                <span className="text-gray-500">NO BOM:</span>
                <span className=" font-medium">{bomData.no_bom}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Template Selector - Only show in create mode - More Compact */}
            {!isEditMode && (
              <div className="mb-2 relative z-50">
                <BOMTemplateSelector
                  onTemplateSelect={handleTemplateSelect}
                  disabled={loading}
                />
              </div>
            )}

            {/* Mounting Selector - More Compact */}
            {ioMountings.length > 0 && (
              <div className="mb-2 relative z-10">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Pilih Mounting:
                </label>
                <select
                  value={selectedMounting?.id || ''}
                  onChange={(e) => handleMountingChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-2 border-b border-gray-200 flex-shrink-0 relative">
          <div className="overflow-x-auto overflow-y-hidden -mb-px">
            <div className="flex space-x-1 min-w-max pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">
                    {tab.label.replace('Komponen ', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
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
                  po_qty={poQty}
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
                  po_qty={poQty}
                />
              )}
              {activeTab === 'poliban' && (
                <BOMPolibanTab
                  data={bomData.bom_poliban}
                  onChange={(data) =>
                    handleBOMDataChange({ bom_poliban: data })
                  }
                  po_qty={poQty}
                />
              )}
              {activeTab === 'coating' && (
                <BOMCoatingTab
                  data={bomData.bom_coating}
                  onChange={(data) =>
                    handleBOMDataChange({ bom_coating: data })
                  }
                  po_qty={poQty}
                  selectedMounting={selectedMounting}
                />
              )}
              {activeTab === 'lem' && (
                <BOMLemTab
                  data={bomData.bom_lem}
                  onChange={(data) => handleBOMDataChange({ bom_lem: data })}
                  po_qty={poQty}
                  tinggi_io={selectedMounting?.ukuran_jadi_tinggi || 0}
                />
              )}
              {activeTab === 'lain-lain' && (
                <BOMLainLainTab
                  data={bomData.lain_lain}
                  onChange={(data) => handleBOMDataChange({ lain_lain: data })}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-end space-x-2 sm:space-x-3 flex-shrink-0">
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
