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

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return '';
  // Handles ISO datetime strings like "2026-07-16T00:00:00.000Z"
  // <input type="date"> only accepts "YYYY-MM-DD"
  return value.split('T')[0];
};
interface BOMPPICManagementModalProps {
  bomId: number;
  bomPPICId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BOMPPICManagementModal: React.FC<BOMPPICManagementModalProps> = ({
  bomId,
  bomPPICId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [bomDetails, setBomDetails] = useState<BOMData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [qtyPo, setQtyPo] = useState<number>(0);
  const [qtyFg, setQtyFg] = useState<number>(0);
  const [tglRencanaCetak, setTglRencanaCetak] = useState<string>('');
  const [kertasItems, setKertasItems] = useState<BOMPPICKertas[]>([]);
  const [tintaItems, setTintaItems] = useState<BOMPPICTinta[]>([]);
  const [corrugatedItems, setCorrugatedItems] = useState<BOMPPICCorrugated[]>(
    [],
  );
  const [polibanItems, setPolibanItems] = useState<BOMPPICPoliban[]>([]);
  const [coatingItems, setCoatingItems] = useState<BOMPPICCoating[]>([]);
  const [lemItems, setLemItems] = useState<BOMPPICLem[]>([]);
  const [lainLainItems, setLainLainItems] = useState<LainLainItem[]>([]);

  const [inputDisplayValues, setInputDisplayValues] = useState<{
    [key: string]: string;
  }>({});

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

      const bomResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/bom/${bomId}`,
        { withCredentials: true },
      );

      const latestBomData = bomResponse.data?.data || bomResponse.data;

      if (!latestBomData) {
        throw new Error('BOM data not found');
      }

      console.log('Fetched latest BOM data:', latestBomData, bomId);
      setBomDetails(latestBomData);
      setQtyPo(latestBomData?.so?.po_qty || 0);
      try {
        const bomPPICResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/ppic/bomppic/${
            latestBomData.bom_ppic.id
          }`,
          { withCredentials: true },
        );
        console.log(
          'Fetched BOM PPIC data:',
          bomPPICResponse.data,
          latestBomData.bom_ppic.id,
        );
        const ppicData = bomPPICResponse.data?.data || bomPPICResponse.data;

        if (ppicData && hasBOMPPICData(ppicData)) {
          setIsEditMode(true);
          setQtyFg(ppicData.qty_fg || 0);
          setTglRencanaCetak(toDateInputValue(ppicData.tgl_rencana_cetak));
          initializeEditModeWithLatestBOM(latestBomData, ppicData);
        } else {
          setIsEditMode(false);
          setQtyFg(0);
          setTglRencanaCetak('');
          initializeCreateModeWithBOM(latestBomData);
        }
      } catch (ppicError: any) {
        setIsEditMode(false);

        setQtyFg(0);
        setTglRencanaCetak('');
        initializeCreateModeWithBOM(latestBomData);
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

  const initializeCreateModeWithBOM = (bomData: BOMData) => {
    const initializedData = initializeCreateMode(bomData);

    const initializedKertas = initializedData.kertasItems.map((item) => ({
      ...item,
      qty_beli: item.qty_beli || item.qty_lembar_plano || 0,
      qty_stok: item.qty_stok || 0,
    }));

    const initializedTinta = initializedData.tintaItems.map((tinta) => ({
      ...tinta,
      tinta_detail: tinta.tinta_detail.map((detail) => ({
        ...detail,
        qty_beli: detail.qty_beli || detail.qty_tinta || 0,
        qty_stok: detail.qty_stok || 0,
      })),
    }));

    const initializedCorrugated = initializedData.corrugatedItems.map(
      (item) => ({
        ...item,
        qty_beli: item.qty_beli || item.qty_corrugated || 0,
        qty_stok: item.qty_stok || 0,
      }),
    );

    const initializedPoliban = initializedData.polibanItems.map((item) => ({
      ...item,
      qty_beli: item.qty_beli || item.qty_poliban || 0,
      qty_stok: item.qty_stok || 0,
    }));

    // Coating is already merged into one row per id_coating by
    // initializeCreateMode — just default qty_beli to qty_coating.
    const initializedCoating = initializedData.coatingItems.map((item) => ({
      ...item,
      qty_beli: item.qty_beli || item.qty_coating || 0,
      qty_stok: item.qty_stok || 0,
    }));

    const initializedLem = initializedData.lemItems.map((item) => ({
      ...item,
      qty_beli: item.qty_beli || item.qty_lem || 0,
      qty_stok: item.qty_stok || 0,
    }));

    setKertasItems(initializedKertas);
    setTintaItems(initializedTinta);
    setCorrugatedItems(initializedCorrugated);
    setPolibanItems(initializedPoliban);
    setCoatingItems(initializedCoating);
    setLemItems(initializedLem);
    setLainLainItems(initializedData.lainLainItems);
  };

  const initializeEditModeWithLatestBOM = (
    latestBomData: BOMData,
    ppicData: any,
  ) => {
    const latestBomStructure = initializeCreateMode(latestBomData);

    const mergeWithPPICData = <T extends { [key: string]: any }>(
      latestItems: T[],
      ppicItems: any[],
      matchFields: string[],
      qtyFields: string[],
    ): T[] => {
      return latestItems.map((latestItem) => {
        const matchingPPIC = ppicItems?.find((ppicItem) => {
          return matchFields.every((field) => {
            if (field.includes('.')) {
              const [parent, child] = field.split('.');
              return latestItem[parent]?.[child] === ppicItem[parent]?.[child];
            }
            return latestItem[field] === ppicItem[field];
          });
        });

        if (matchingPPIC) {
          const preservedValues: any = {};
          qtyFields.forEach((field) => {
            if (
              matchingPPIC[field] !== undefined &&
              matchingPPIC[field] !== null
            ) {
              preservedValues[field] = matchingPPIC[field];
            }
          });
          return { ...latestItem, ...preservedValues };
        }

        const defaultValues: any = {};
        qtyFields.forEach((field) => {
          if (field.includes('beli')) {
            const baseQtyField = field
              .replace('qty_beli_', 'qty_')
              .replace('qty_beli', 'qty_');

            if (latestItem[baseQtyField] !== undefined) {
              defaultValues[field] = latestItem[baseQtyField] || 0;
            } else if (latestItem['qty_lembar_plano'] !== undefined) {
              defaultValues[field] = latestItem['qty_lembar_plano'] || 0;
            } else if (latestItem['qty_corrugated'] !== undefined) {
              defaultValues[field] = latestItem['qty_corrugated'] || 0;
            } else if (latestItem['qty_poliban'] !== undefined) {
              defaultValues[field] = latestItem['qty_poliban'] || 0;
            } else if (latestItem['qty_lem'] !== undefined) {
              defaultValues[field] = latestItem['qty_lem'] || 0;
            } else if (latestItem['qty_coating'] !== undefined) {
              // Coating items flow through this same generic merge helper,
              // so give them a default beli value too.
              defaultValues[field] = latestItem['qty_coating'] || 0;
            } else {
              defaultValues[field] = 0;
            }
          } else if (field.includes('stok')) {
            defaultValues[field] = 0;
          }
        });
        return { ...latestItem, ...defaultValues };
      });
    };

    const initializedKertas = mergeWithPPICData(
      latestBomStructure.kertasItems,
      ppicData.bom_ppic_kertas || [],
      ['id_kertas', 'id_jenis_kertas'],
      ['qty_beli', 'qty_stok'],
    );

    // Tinta matching includes warna_tinta and id_jenis_warna_tinta.
    // A single BOM can have several tinta rows (one per color) that all
    // share id_jenis_tinta + id_jenis_kertas — differing only by
    // warna_tinta / id_jenis_warna_tinta. Without those extra fields
    // .find() always resolves to the first PPIC tinta record, so every
    // color ends up reusing the same qty_beli/qty_stok/tinta_detail.
    const initializedTinta = latestBomStructure.tintaItems.map(
      (latestTinta) => {
        const matchingPPICTinta = ppicData.bom_ppic_tinta?.find(
          (ppicTinta: any) =>
            ppicTinta.warna_tinta === latestTinta.warna_tinta &&
            ppicTinta.id_jenis_warna_tinta ===
              latestTinta.id_jenis_warna_tinta &&
            ppicTinta.id_jenis_tinta === latestTinta.id_jenis_tinta &&
            ppicTinta.id_jenis_kertas === latestTinta.id_jenis_kertas,
        );

        return {
          ...latestTinta,
          tinta_detail: latestTinta.tinta_detail.map((latestDetail) => {
            const matchingPPICDetail = matchingPPICTinta?.tinta_detail?.find(
              (ppicDetail: any) =>
                ppicDetail.id_item_tinta === latestDetail.id_item_tinta,
            );

            if (matchingPPICDetail) {
              return {
                ...latestDetail,
                qty_beli: matchingPPICDetail.qty_beli || 0,
                qty_stok: matchingPPICDetail.qty_stok || 0,
              };
            }

            return {
              ...latestDetail,
              qty_beli: latestDetail.qty_tinta || 0,
              qty_stok: 0,
            };
          }),
        };
      },
    );

    const initializedCorrugated = mergeWithPPICData(
      latestBomStructure.corrugatedItems,
      ppicData.bom_ppic_corrugated || [],
      ['id_corrugated'],
      ['qty_beli', 'qty_stok'],
    );

    // Poliban now matches on id_item_poliban (the master-selected item)
    // instead of the old id_poliban / ya-tidak flag.
    const initializedPoliban = mergeWithPPICData(
      latestBomStructure.polibanItems,
      ppicData.bom_ppic_poliban || [],
      ['id_item_poliban'],
      ['qty_beli', 'qty_stok'],
    );

    // Coating: both latestBomStructure.coatingItems (via initializeCreateMode)
    // and ppicData.bom_ppic_coating (from the backend) are already ONE flat
    // row per id_coating. Match on id_coating + id_brand so a brand change
    // on the BOM side doesn't wrongly reuse a stale PPIC qty from a
    // different brand of the same coating item.
    const initializedCoating = mergeWithPPICData(
      latestBomStructure.coatingItems,
      ppicData.bom_ppic_coating || [],
      ['id_coating', 'id_brand'],
      ['qty_beli', 'qty_stok'],
    );

    const initializedLem = mergeWithPPICData(
      latestBomStructure.lemItems,
      ppicData.bom_ppic_lem || [],
      ['id_lem'],
      ['qty_beli', 'qty_stok'],
    );

    const initializedLainLain =
      ppicData.lain_lain || latestBomStructure.lainLainItems;

    setKertasItems(initializedKertas);
    setTintaItems(initializedTinta);
    setCorrugatedItems(initializedCorrugated);
    setPolibanItems(initializedPoliban);
    setCoatingItems(initializedCoating);
    setLemItems(initializedLem);
    setLainLainItems(initializedLainLain);
  };

  const qtyRatio = qtyPo > 0 ? Math.max((qtyPo - qtyFg) / qtyPo, 0) : 1;

  const getAdjustedQty = (rawQty: number): number => rawQty * qtyRatio;

  useEffect(() => {
    setKertasItems((prev) =>
      prev.map((item) => ({
        ...item,
        qty_beli: Math.max(
          getAdjustedQty(item.qty_lembar_plano) - item.qty_stok,
          0,
        ),
      })),
    );

    setCorrugatedItems((prev) =>
      prev.map((item) => ({
        ...item,
        qty_beli: Math.max(
          getAdjustedQty(item.qty_corrugated) - item.qty_stok,
          0,
        ),
      })),
    );

    setPolibanItems((prev) =>
      prev.map((item) => ({
        ...item,
        qty_beli: Math.max(getAdjustedQty(item.qty_poliban) - item.qty_stok, 0),
      })),
    );

    setLemItems((prev) =>
      prev.map((item) => ({
        ...item,
        qty_beli: Math.max(getAdjustedQty(item.qty_lem) - item.qty_stok, 0),
      })),
    );

    // Coating: single qty_beli/qty_stok pair now, same pattern as the others.
    setCoatingItems((prev) =>
      prev.map((item) => ({
        ...item,
        qty_beli: Math.max(getAdjustedQty(item.qty_coating) - item.qty_stok, 0),
      })),
    );

    setTintaItems((prev) =>
      prev.map((tinta) => ({
        ...tinta,
        tinta_detail: tinta.tinta_detail.map((detail) => ({
          ...detail,
          qty_beli: Math.max(
            getAdjustedQty(detail.qty_tinta) - detail.qty_stok,
            0,
          ),
        })),
      })),
    );

    setInputDisplayValues((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.endsWith('qty_beli')) {
          delete next[key];
        }
      });
      return next;
    });
  }, [qtyPo, qtyFg]);

  const formatNumber = (value: number | string): string => {
    if (value === '' || value === null || value === undefined) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 9,
    }).format(num);
  };

  const parseFormattedNumber = (value: string): number => {
    if (!value || value === '') return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const handleNumberInputFormat = (value: string): string => {
    if (value === '') return '';

    let cleaned = value.replace(/[^\d,.]/g, '');

    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      const firstCommaIndex = cleaned.indexOf(',');
      cleaned =
        cleaned.substring(0, firstCommaIndex + 1) +
        cleaned.substring(firstCommaIndex + 1).replace(/,/g, '');
    }

    const parts = cleaned.split(',');

    if (parts.length > 1) {
      const integerPart = parts[0].replace(/\./g, '');
      const decimalPart = parts[1].substring(0, 9);

      const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        '.',
      );

      return `${formattedInteger},${decimalPart}`;
    } else {
      const integerPart = cleaned.replace(/\./g, '');
      return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  };

  const getInputDisplayValue = (
    section: string,
    index: number,
    field: string,
    actualValue: number,
  ): string => {
    const key = `${section}-${index}-${field}`;
    return inputDisplayValues[key] !== undefined
      ? inputDisplayValues[key]
      : formatNumber(actualValue);
  };

  const handleInputBlur = (section: string, index: number, field: string) => {
    const key = `${section}-${index}-${field}`;
    setInputDisplayValues((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const handleKertasChange = (
    index: number,
    field: keyof BOMPPICKertas,
    value: string | number,
  ) => {
    const updatedItems = [...kertasItems];

    if (typeof value === 'string') {
      const key = `kertas-${index}-${field}`;
      const formattedValue = handleNumberInputFormat(value);
      setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));

      const numericValue = parseFormattedNumber(formattedValue);
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };

      if (field === 'qty_stok') {
        const adjusted = getAdjustedQty(updatedItems[index].qty_lembar_plano);
        updatedItems[index].qty_beli = Math.max(adjusted - numericValue, 0);

        setInputDisplayValues((prev) => {
          const next = { ...prev };
          delete next[`kertas-${index}-qty_beli`];
          return next;
        });
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    setKertasItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleCorrugatedChange = (
    index: number,
    field: keyof BOMPPICCorrugated,
    value: string | number,
  ) => {
    const updatedItems = [...corrugatedItems];

    if (typeof value === 'string') {
      const key = `corrugated-${index}-${field}`;
      const formattedValue = handleNumberInputFormat(value);
      setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));

      const numericValue = parseFormattedNumber(formattedValue);
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };

      if (field === 'qty_stok') {
        const adjusted = getAdjustedQty(updatedItems[index].qty_corrugated);
        updatedItems[index].qty_beli = Math.max(adjusted - numericValue, 0);

        setInputDisplayValues((prev) => {
          const next = { ...prev };
          delete next[`corrugated-${index}-qty_beli`];
          return next;
        });
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    setCorrugatedItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handlePolibanChange = (
    index: number,
    field: keyof BOMPPICPoliban,
    value: string | number,
  ) => {
    const updatedItems = [...polibanItems];

    if (typeof value === 'string') {
      const key = `poliban-${index}-${field}`;
      const formattedValue = handleNumberInputFormat(value);
      setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));

      const numericValue = parseFormattedNumber(formattedValue);
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };

      if (field === 'qty_stok') {
        const adjusted = getAdjustedQty(updatedItems[index].qty_poliban);
        updatedItems[index].qty_beli = Math.max(adjusted - numericValue, 0);

        setInputDisplayValues((prev) => {
          const next = { ...prev };
          delete next[`poliban-${index}-qty_beli`];
          return next;
        });
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    setPolibanItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  // Coating handler is now a plain single-qty field like the others —
  // qty_stok drives qty_beli, using item.qty_coating as the total.
  const handleCoatingChange = (
    index: number,
    field: keyof BOMPPICCoating,
    value: string | number,
  ) => {
    const updatedItems = [...coatingItems];

    if (typeof value === 'string') {
      const key = `coating-${index}-${field}`;
      const formattedValue = handleNumberInputFormat(value);
      setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));

      const numericValue = parseFormattedNumber(formattedValue);
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };

      if (field === 'qty_stok') {
        const adjusted = getAdjustedQty(updatedItems[index].qty_coating);
        updatedItems[index].qty_beli = Math.max(adjusted - numericValue, 0);

        setInputDisplayValues((prev) => {
          const next = { ...prev };
          delete next[`coating-${index}-qty_beli`];
          return next;
        });
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

    setCoatingItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleLemChange = (
    index: number,
    field: keyof BOMPPICLem,
    value: string | number,
  ) => {
    const updatedItems = [...lemItems];

    if (typeof value === 'string') {
      const key = `lem-${index}-${field}`;
      const formattedValue = handleNumberInputFormat(value);
      setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));

      const numericValue = parseFormattedNumber(formattedValue);
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue };

      if (field === 'qty_stok') {
        const adjusted = getAdjustedQty(updatedItems[index].qty_lem);
        updatedItems[index].qty_beli = Math.max(adjusted - numericValue, 0);

        setInputDisplayValues((prev) => {
          const next = { ...prev };
          delete next[`lem-${index}-qty_beli`];
          return next;
        });
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }

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
    const key = `tinta-${tintaIndex}-${detailIndex}-${field}`;
    const formattedValue = handleNumberInputFormat(value);
    setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));

    const numericValue = parseFormattedNumber(formattedValue);
    const detail = updatedItems[tintaIndex].tinta_detail[detailIndex];
    updatedItems[tintaIndex].tinta_detail[detailIndex] = {
      ...detail,
      [field]: numericValue,
    };

    if (field === 'qty_stok') {
      const adjusted = getAdjustedQty(detail.qty_tinta);
      updatedItems[tintaIndex].tinta_detail[detailIndex].qty_beli = Math.max(
        adjusted - numericValue,
        0,
      );

      setInputDisplayValues((prev) => {
        const next = { ...prev };
        delete next[`tinta-${tintaIndex}-${detailIndex}-qty_beli`];
        return next;
      });
    }

    setTintaItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleLainLainChange = (
    index: number,
    field: keyof LainLainItem,
    value: string | number | boolean,
  ) => {
    const updatedItems = [...lainLainItems];
    const numericFields: (keyof LainLainItem)[] = [
      'harga',
      'qty_beli',
      'qty_stok',
    ];

    if (numericFields.includes(field) && typeof value === 'string') {
      const key = `lainlain-${index}-${field}`;
      const formattedValue = handleNumberInputFormat(value);

      setInputDisplayValues((prev) => ({
        ...prev,
        [key]: formattedValue,
      }));

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: parseFormattedNumber(formattedValue),
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
    }

    setLainLainItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const handleAddLainLainItem = () => {
    const newItem: LainLainItem = {
      nama_item: '',
      harga: 0,
      qty_beli: 0,
      qty_stok: 0,
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

  const handleQtyFgChange = (value: string) => {
    const key = `summary-0-qty_fg`;
    const formattedValue = handleNumberInputFormat(value);
    setInputDisplayValues((prev) => ({ ...prev, [key]: formattedValue }));
    setQtyFg(parseFormattedNumber(formattedValue));
    setHasUnsavedChanges(true);
  };

  const handleTglRencanaCetakChange = (value: string) => {
    setTglRencanaCetak(value);
    setHasUnsavedChanges(true);
  };

  const handleSaveBOMPPIC = async () => {
    if (!bomDetails) return;

    try {
      setLoading(true);

      const cleanKertasItems = kertasItems.map((item) => ({
        id_kertas: item.id_kertas,
        nama_kertas: item.nama_kertas,
        qty_lembar_plano: item.qty_lembar_plano || 0,
        qty_beli: item.qty_beli || 0,
        qty_stok: item.qty_stok || 0,
      }));

      const cleanTintaItems = tintaItems.map((tinta) => ({
        warna_tinta: tinta.warna_tinta,
        id_jenis_tinta: tinta.id_jenis_tinta,
        id_jenis_kertas: tinta.id_jenis_kertas,
        id_jenis_warna_tinta: tinta.id_jenis_warna_tinta,
        jenis_mesin_cetak: tinta.jenis_mesin_cetak,
        area_cetak: tinta.area_cetak,
        qty_tinta: tinta.qty_tinta,
        tinta_detail: tinta.tinta_detail.map((detail) => ({
          id_item_tinta: detail.id_item_tinta,
          nama_item_tinta: detail.nama_item_tinta,
          persentase_tinta: detail.persentase_tinta,
          qty_tinta: detail.qty_tinta,
          qty_beli: detail.qty_beli || 0,
          qty_stok: detail.qty_stok || 0,
        })),
      }));

      const cleanCorrugatedItems = corrugatedItems.map((item) => ({
        id_corrugated: item.id_corrugated,
        nama_corrugated: item.nama_corrugated,
        isi_per_pack: item.isi_per_pack,
        qty_corrugated: item.qty_corrugated,
        qty_beli: item.qty_beli || 0,
        qty_stok: item.qty_stok || 0,
      }));

      // Poliban now sends id_item_poliban / nama_item_poliban (master item)
      // instead of the old item_poliban ya/tidak flag.
      const cleanPolibanItems = polibanItems.map((item) => ({
        id_item_poliban: item.id_item_poliban,
        nama_item_poliban: item.nama_item_poliban,
        isi_satu_ikat: item.isi_satu_ikat,
        lembar_poliban: item.lembar_poliban,
        qty_poliban: item.qty_poliban,
        qty_beli: item.qty_beli || 0,
        qty_stok: item.qty_stok || 0,
      }));

      // Coating: coatingItems is already one flat row per id_coating, so this
      // is now a direct map — no grouping/merging needed at save time.
      // id_brand / nama_brand carried through from the BOM selection.
      const cleanCoatingItems = coatingItems.map((item) => ({
        id_coating: item.id_coating,
        nama_coating: item.nama_coating,
        id_brand: item.id_brand,
        nama_brand: item.nama_brand,
        qty_coating: item.qty_coating || 0,
        uv_wb: item.uv_wb || 0,
        varnish_doff: item.varnish_doff || 0,
        qty_beli: item.qty_beli || 0,
        qty_stok: item.qty_stok || 0,
      }));

      const cleanLemItems = lemItems.map((item) => ({
        id_lem: item.id_lem,
        nama_lem: item.nama_lem,
        rumus_lem: item.rumus_lem,
        qty_konstanta: item.qty_konstanta,
        qty_lem: item.qty_lem,
        qty_beli: item.qty_beli || 0,
        qty_stok: item.qty_stok || 0,
      }));

      const cleanLainLainItems = lainLainItems.map((item) => ({
        nama_item: item.nama_item,
        harga: item.harga || 0,
        qty_beli: item.qty_beli || 0,
        qty_stok: item.qty_stok || 0,
      }));

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
        tgl_rencana_cetak: tglRencanaCetak || '',
        qty_po: qtyPo,
        qty_fg: qtyFg,
        bom_ppic_kertas:
          cleanKertasItems.length > 0 ? cleanKertasItems : undefined,
        bom_ppic_tinta:
          cleanTintaItems.length > 0 ? cleanTintaItems : undefined,
        bom_ppic_corrugated:
          cleanCorrugatedItems.length > 0 ? cleanCorrugatedItems : undefined,
        bom_ppic_poliban:
          cleanPolibanItems.length > 0 ? cleanPolibanItems : undefined,
        bom_ppic_coating:
          cleanCoatingItems.length > 0 ? cleanCoatingItems : undefined,
        bom_ppic_lem: cleanLemItems.length > 0 ? cleanLemItems : undefined,
        lain_lain:
          cleanLainLainItems.length > 0 ? cleanLainLainItems : undefined,
      };

      console.log('Clean Payload to be sent:', payload);

      const baseUrl = `${import.meta.env.VITE_API_LINK}/ppic/bomppic`;
      const url = isEditMode ? `${baseUrl}/${bomPPICId}` : baseUrl;
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

        <div className="px-6 py-2 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <BOMPPICInfoSection bomDetails={bomDetails} />
          <BOMPPICSummaryCards
            kertasItems={kertasItems}
            tintaItems={tintaItems}
            corrugatedItems={corrugatedItems}
            polibanItems={polibanItems}
            coatingItems={coatingItems}
            lemItems={lemItems}
            qtyPo={qtyPo}
            qtyFgDisplayValue={getInputDisplayValue(
              'summary',
              0,
              'qty_fg',
              qtyFg,
            )}
            onQtyFgChange={handleQtyFgChange}
            onQtyFgBlur={() => handleInputBlur('summary', 0, 'qty_fg')}
            tglRencanaCetak={tglRencanaCetak}
            onTglRencanaCetakChange={handleTglRencanaCetakChange}
          />
        </div>

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
                qtyRatio={qtyRatio}
                onItemChange={handleKertasChange}
                formatNumber={formatNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />

              <TintaSection
                items={tintaItems}
                qtyRatio={qtyRatio}
                onDetailChange={handleTintaDetailChange}
                formatNumber={formatNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />

              <CorrugatedSection
                items={corrugatedItems}
                qtyRatio={qtyRatio}
                onItemChange={handleCorrugatedChange}
                formatNumber={formatNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />

              <PolibanSection
                items={polibanItems}
                qtyRatio={qtyRatio}
                onItemChange={handlePolibanChange}
                formatNumber={formatNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />

              <CoatingSection
                items={coatingItems}
                qtyRatio={qtyRatio}
                onItemChange={handleCoatingChange}
                formatNumber={formatNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />

              <LemSection
                items={lemItems}
                qtyRatio={qtyRatio}
                onItemChange={handleLemChange}
                formatNumber={formatNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />

              <LainLainSection
                items={lainLainItems}
                onItemChange={handleLainLainChange}
                onAddItem={handleAddLainLainItem}
                onRemoveItem={handleRemoveLainLainItem}
                formatNumber={formatNumber}
                parseFormattedNumber={parseFormattedNumber}
                getInputDisplayValue={getInputDisplayValue}
                handleInputBlur={handleInputBlur}
              />
            </div>
          )}
        </div>

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
