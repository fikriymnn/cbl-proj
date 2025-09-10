// components/Tabs/TahapanTab.tsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MountingFormData, TahapanData } from '../Mounting';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

interface TahapanMesin {
  id: number;
  id_tahapan: number;
  id_mesin_tahapan: number;
  shift: string;
  mesin: {
    id: number;
    nama_mesin: string;
    kode_mesin: string;
  };
  tahapan: {
    id: number;
    nama_tahapan: string;
    kode_tahapan: string;
  };
}

interface SettingKapasitas {
  id: any;
  id_mesin: any;
  nama_kategori: any;
  nama_mesin: any;
  kapasitas_a: any;
  kapasitas_b: any;
  kapasitas_c: any;
  setting_a: any;
  setting_b: any;
  setting_c: any;
}

interface DryingTime {
  id: number;
  nama: string;
  jam: number;
}

interface TahapanTabProps {
  formData: MountingFormData;
  onInputChange: (field: string, value: any) => void;
  isEditMode: boolean;
}

type LocalTahapan = TahapanData & { _clientId?: string };

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  draggedElement: HTMLElement | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  placeholder: HTMLElement | null;
  lastValidDropIndex: number | null;
}

const TahapanTab: React.FC<TahapanTabProps> = ({ formData, onInputChange }) => {
  const [tahapanList, setTahapanList] = useState<LocalTahapan[]>([]);
  const [tahapanMesinList, setTahapanMesinList] = useState<TahapanMesin[]>([]);
  const [settingKapasitasList, setSettingKapasitasList] = useState<
    SettingKapasitas[]
  >([]);
  const [dryingTimeList, setDryingTimeList] = useState<DryingTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // New state for mode management
  const [mode, setMode] = useState<'view' | 'edit' | 'drag'>('view');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Drag and drop state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    draggedElement: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    placeholder: null,
    lastValidDropIndex: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const newTempIdRef = useRef(0);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (formData.tahapan && formData.tahapan.length > 0) {
      const normalized: LocalTahapan[] = formData.tahapan.map((item) => {
        if ((item as any)._clientId) {
          return { ...(item as LocalTahapan) };
        }
        if (item.id) {
          return { ...(item as LocalTahapan), _clientId: `item-${item.id}` };
        }
        const newId = `new-${newTempIdRef.current++}`;
        return { ...(item as LocalTahapan), _clientId: newId };
      });

      const sorted = normalized.sort((a, b) => (a.index || 0) - (b.index || 0));
      setTahapanList(sorted);
    } else {
      setTahapanList([]);
    }
  }, [formData.tahapan]);

  useEffect(() => {
    fetchTahapanMesin();
    fetchSettingKapasitas();
    fetchDryingTime();
  }, []);

  // Mode management functions
  const enterDragMode = () => {
    setMode('drag');
    setEditingIndex(null);
  };

  const exitDragMode = () => {
    setMode('view');
    // Reset any ongoing drag state
  };

  const startEditing = (index: number) => {
    if (mode !== 'drag') {
      setMode('edit');
      setEditingIndex(index);
    }
  };

  const stopEditing = () => {
    setMode('view');
    setEditingIndex(null);
  };

  // Drag and drop event handlers (only active in drag mode)
  useEffect(() => {
    if (mode !== 'drag') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !dragState.draggedElement) return;

      e.preventDefault();
      const currentX = e.clientX;
      const currentY = e.clientY;

      dragState.draggedElement.style.transform = `translate(${
        currentX - dragState.startX
      }px, ${currentY - dragState.startY}px)`;

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      dragTimeoutRef.current = setTimeout(() => {
        const container = containerRef.current;
        if (!container || !dragState.placeholder) return;

        const cards = Array.from(container.children).filter(
          (child) =>
            child !== dragState.draggedElement &&
            child !== dragState.placeholder &&
            child.classList.contains('tahapan-card'),
        ) as HTMLElement[];

        let insertIndex = cards.length;

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;

          if (currentY < cardCenter) {
            insertIndex = i;
            break;
          }
        }

        if (insertIndex < cards.length) {
          container.insertBefore(dragState.placeholder, cards[insertIndex]);
        } else {
          container.appendChild(dragState.placeholder);
        }

        setDragState((prev) => ({
          ...prev,
          currentX,
          currentY,
        }));
      }, 50);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      e.preventDefault();

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }

      const container = containerRef.current;
      if (
        !container ||
        !dragState.placeholder ||
        dragState.draggedIndex === null
      ) {
        resetDrag();
        return;
      }

      const allChildren = Array.from(container.children);
      const placeholderIndex = allChildren.indexOf(dragState.placeholder);

      let newIndex = 0;
      for (let i = 0; i < placeholderIndex; i++) {
        const child = allChildren[i];
        if (
          child !== dragState.draggedElement &&
          child !== dragState.placeholder &&
          child.classList.contains('tahapan-card')
        ) {
          newIndex++;
        }
      }

      if (newIndex !== dragState.draggedIndex) {
        const reorderedItems = [...tahapanList];
        const [movedItem] = reorderedItems.splice(dragState.draggedIndex, 1);
        reorderedItems.splice(newIndex, 0, movedItem);

        const updatedItems = reorderedItems.map((item, index) => ({
          ...item,
          index: index + 1,
        }));

        setTahapanList(updatedItems);
        onInputChange('tahapan', updatedItems);
      }

      resetDrag();
    };

    const resetDrag = () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }

      if (dragState.draggedElement) {
        dragState.draggedElement.style.transform = '';
        dragState.draggedElement.style.zIndex = '';
        dragState.draggedElement.style.opacity = '';
        dragState.draggedElement.classList.remove('dragging');
      }

      if (dragState.placeholder && dragState.placeholder.parentNode) {
        dragState.placeholder.parentNode.removeChild(dragState.placeholder);
      }

      setDragState({
        isDragging: false,
        draggedIndex: null,
        draggedElement: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        placeholder: null,
        lastValidDropIndex: null,
      });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [
    mode,
    dragState.isDragging,
    dragState.draggedIndex,
    tahapanList,
    dragState.lastValidDropIndex,
  ]);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (mode !== 'drag') return;

    e.preventDefault();

    const target = e.currentTarget.closest('.tahapan-card') as HTMLElement;
    if (!target) return;

    const placeholder = document.createElement('div');
    placeholder.className =
      'tahapan-placeholder bg-blue-100 border-2 border-blue-300 border-dashed rounded-md';
    placeholder.style.height = `${target.offsetHeight}px`;
    placeholder.style.width = `${target.offsetWidth}px`;
    placeholder.style.margin = getComputedStyle(target).margin;

    target.parentNode?.insertBefore(placeholder, target.nextSibling);

    target.style.zIndex = '1000';
    target.style.opacity = '0.9';
    target.classList.add('dragging');

    setDragState({
      isDragging: true,
      draggedIndex: index,
      draggedElement: target,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      placeholder,
      lastValidDropIndex: index,
    });
  };

  // Keep all the existing fetch functions unchanged
  const fetchTahapanMesin = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
        { withCredentials: true },
      );
      setTahapanMesinList(response.data.data);
    } catch (error) {
      console.error('Error fetching tahapan mesin:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettingKapasitas = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas`,
        { withCredentials: true },
      );
      setSettingKapasitasList(response.data.data);
    } catch (error) {
      console.error('Error fetching setting kapasitas:', error);
    }
  };

  const fetchDryingTime = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/ppic/dryingTime`,
        { withCredentials: true },
      );
      setDryingTimeList(response.data.data);
    } catch (error) {
      console.error('Error fetching drying time:', error);
    }
  };

  // Keep all the existing utility functions unchanged
  const addNewTahapan = () => {
    if (mode === 'drag') return; // Prevent adding while in drag mode

    const clientId = `new-${newTempIdRef.current++}`;
    const newTahapan: LocalTahapan = {
      id_tahapan_mesin: 0,
      index: tahapanList.length + 1,
      setting_type: undefined,
      _clientId: clientId,
    } as LocalTahapan;

    const updatedList = [...tahapanList, newTahapan];
    setTahapanList(updatedList);
    onInputChange('tahapan', updatedList);
  };

  const removeTahapan = (index: number) => {
    if (mode === 'drag') return; // Prevent removing while in drag mode

    const updatedList = tahapanList
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, index: i + 1 }));
    setTahapanList(updatedList);
    onInputChange('tahapan', updatedList);

    // If we're editing this item, stop editing
    if (editingIndex === index) {
      stopEditing();
    }
  };

  const updateTahapan = (index: number, field: string, value: any) => {
    const updatedList = tahapanList.map((item, i) => {
      if (i === index) {
        const updatedItem: LocalTahapan = { ...item, [field]: value };

        if (field === 'id_tahapan_mesin') {
          const selectedTahapanMesin = tahapanMesinList.find(
            (tm) => tm.id === value,
          );
          if (selectedTahapanMesin) {
            updatedItem.nama_mesin = selectedTahapanMesin.mesin.nama_mesin;
            updatedItem.nama_proses = selectedTahapanMesin.tahapan.nama_tahapan;
          }
        }

        if (field === 'id_setting_kapasitas') {
          const selectedSetting = settingKapasitasList.find(
            (s) => s.id === value,
          );
          if (selectedSetting) {
            updatedItem.nama_setting_kapasitas = selectedSetting.nama_kategori;
            updatedItem.value_setting_kapasitas = selectedSetting.setting_a;
          }
        }

        if (field === 'id_drying_time') {
          const selectedDrying = dryingTimeList.find((d) => d.id === value);
          if (selectedDrying) {
            updatedItem.nama_drying_time = selectedDrying.nama;
            updatedItem.value_drying_time = selectedDrying.jam;
          }
        }

        return updatedItem;
      }
      return item;
    });

    setTahapanList(updatedList);
    onInputChange('tahapan', updatedList);
  };

  const getFilteredSettingKapasitas = (tahapanIndex: number) => {
    const currentTahapan = tahapanList[tahapanIndex];
    if (!currentTahapan?.nama_mesin) return [];

    return settingKapasitasList.filter(
      (setting) =>
        setting.nama_mesin.toLowerCase() ===
        currentTahapan.nama_mesin.toLowerCase(),
    );
  };

  const getTahapanMesinOptions = () => {
    return tahapanMesinList.map((tm) => ({
      value: tm.id,
      label: `${tm.tahapan.nama_tahapan} - ${tm.mesin.nama_mesin}`,
    }));
  };

  const getSettingKapasitasOptions = (tahapanIndex: number) => {
    const filteredSettings = getFilteredSettingKapasitas(tahapanIndex);
    return [
      ...filteredSettings.flatMap((s) => [
        {
          value: `${s.id}_a`,
          label: `${s.nama_kategori} - Kapasitas A (${s.kapasitas_a}) - Setting: ${s.setting_a}`,
          settingData: {
            ...s,
            type: 'a',
            kapasitas: s.kapasitas_a,
            setting: s.setting_a,
          },
        },
        {
          value: `${s.id}_b`,
          label: `${s.nama_kategori} - Kapasitas B (${s.kapasitas_b}) - Setting: ${s.setting_b}`,
          settingData: {
            ...s,
            type: 'b',
            kapasitas: s.kapasitas_b,
            setting: s.setting_b,
          },
        },
        {
          value: `${s.id}_c`,
          label: `${s.nama_kategori} - Kapasitas C (${s.kapasitas_c}) - Setting: ${s.setting_c}`,
          settingData: {
            ...s,
            type: 'c',
            kapasitas: s.kapasitas_c,
            setting: s.setting_c,
          },
        },
      ]),
    ];
  };

  const getDryingTimeOptions = () => {
    return dryingTimeList.map((d) => ({
      value: d.id,
      label: `${d.nama} - ${d.jam} jam`,
    }));
  };

  const handleSettingKapasitasChange = (index: any, value: any) => {
    const [settingId, type] = value.split('_');
    const selectedSetting = settingKapasitasList.find(
      (s) => s.id === parseInt(settingId, 10),
    );

    if (selectedSetting) {
      const updatedList = tahapanList.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            id_setting_kapasitas: selectedSetting.id,
            nama_setting_kapasitas: `${
              selectedSetting.nama_kategori
            } - ${type.toUpperCase()}`,
            value_setting_kapasitas: selectedSetting[
              `setting_${type}` as keyof SettingKapasitas
            ] as number,
            kapasitas_value: selectedSetting[
              `kapasitas_${type}` as keyof SettingKapasitas
            ] as number,
            setting_type: type,
          } as LocalTahapan;
        }
        return item;
      });

      setTahapanList(updatedList);
      onInputChange('tahapan', updatedList);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Tahapan Proses
          </h3>
          <button
            type="button"
            onClick={addNewTahapan}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1 text-sm"
          >
            <span>+</span>
            Tambah Proses
          </button>
        </div>
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Tahapan Proses</h3>
        <div className="flex items-center gap-2">
          {/* Mode Toggle Buttons */}
          {mode !== 'drag' && (
            <>
              <button
                type="button"
                onClick={addNewTahapan}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1 text-sm"
              >
                <span>+</span>
                Tambah Proses
              </button>
              {tahapanList.length > 1 && (
                <button
                  type="button"
                  onClick={enterDragMode}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                  Ubah Urutan
                </button>
              )}
            </>
          )}

          {mode === 'drag' && (
            <button
              type="button"
              onClick={exitDragMode}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Selesai Ubah Urutan
            </button>
          )}
        </div>
      </div>

      {/* Mode Indicator */}
      {mode === 'drag' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Mode Ubah Urutan Aktif</span>
            <span className="text-green-600">
              - Drag card untuk mengubah urutan
            </span>
          </div>
        </div>
      )}

      {tahapanList.length > 0 ? (
        <div ref={containerRef} className="space-y-2 min-h-[50px]">
          {tahapanList.map((tahapan, index) => (
            <div
              key={tahapan._clientId}
              className={`tahapan-card bg-white border rounded-md p-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                dragState.isDragging && dragState.draggedIndex === index
                  ? 'shadow-lg ring-2 ring-blue-200'
                  : ''
              } ${mode === 'drag' ? 'cursor-move hover:bg-gray-50' : ''}`}
            >
              {/* Header with mode-specific controls */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`flex items-center gap-2 ${
                    mode === 'drag' ? 'cursor-move hover:text-blue-600' : ''
                  }`}
                  onMouseDown={
                    mode === 'drag'
                      ? (e) => handleMouseDown(e, index)
                      : undefined
                  }
                >
                  {mode === 'drag' && (
                    <div className="text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                    </div>
                  )}
                  <h4 className="font-medium text-gray-800 text-sm">
                    Proses {tahapan.index}
                  </h4>
                </div>

                <div className="flex items-center gap-1">
                  {mode !== 'drag' && (
                    <>
                      {editingIndex === index ? (
                        <button
                          type="button"
                          onClick={stopEditing}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors text-xs"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(index)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors text-xs"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeTahapan(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content - Show differently based on mode */}
              {mode === 'drag' ? (
                // Read-only view for drag mode
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Tahapan:</span>{' '}
                    {tahapan.nama_proses || 'Belum dipilih'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Kapasitas:</span>{' '}
                    {tahapan.nama_setting_kapasitas || 'Belum dipilih'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Drying:</span>{' '}
                    {tahapan.nama_drying_time || 'Belum dipilih'}
                  </div>
                </div>
              ) : editingIndex === index ? (
                // Edit mode - show form inputs
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tahapan Mesin
                    </label>
                    <SearchableSelect
                      options={getTahapanMesinOptions()}
                      value={tahapan.id_tahapan_mesin || 0}
                      onChange={(value) =>
                        updateTahapan(index, 'id_tahapan_mesin', value)
                      }
                      placeholder={loading ? 'Loading...' : 'Pilih Tahapan'}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Setting Kapasitas
                    </label>
                    <SearchableSelect
                      options={getSettingKapasitasOptions(index)}
                      value={
                        tahapan.id_setting_kapasitas && tahapan.setting_type
                          ? `${tahapan.id_setting_kapasitas}_${tahapan.setting_type}`
                          : ''
                      }
                      onChange={(value) =>
                        handleSettingKapasitasChange(index, value)
                      }
                      placeholder="Pilih Kapasitas"
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Drying Time
                    </label>
                    <SearchableSelect
                      options={getDryingTimeOptions()}
                      value={tahapan.id_drying_time || 0}
                      onChange={(value) =>
                        updateTahapan(index, 'id_drying_time', value)
                      }
                      placeholder="Pilih Drying Time"
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              ) : (
                // View mode - show read-only data with edit button
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="text-xs">
                    <span className="text-gray-500">Tahapan Mesin:</span>
                    <div className="font-medium text-gray-800 mt-1">
                      {tahapan.nama_proses
                        ? `${tahapan.nama_proses} - ${tahapan.nama_mesin}`
                        : 'Belum dipilih'}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Setting Kapasitas:</span>
                    <div className="font-medium text-gray-800 mt-1">
                      {tahapan.nama_setting_kapasitas || 'Belum dipilih'}
                      {tahapan.value_setting_kapasitas && (
                        <span className="text-gray-600">
                          {' '}
                          - {tahapan.value_setting_kapasitas}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Drying Time:</span>
                    <div className="font-medium text-gray-800 mt-1">
                      {tahapan.nama_drying_time || 'Belum dipilih'}
                      {tahapan.value_drying_time && (
                        <span className="text-gray-600">
                          {' '}
                          - {tahapan.value_drying_time} jam
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          Belum ada tahapan. Klik tombol <strong>Tambah Proses</strong> untuk
          menambahkan.
        </div>
      )}

      <style>{`
       .dragging {
         pointer-events: none;
         transform-origin: center;
         transition: none !important;
         position: relative;
         z-index: 1000 !important;
       }

       .tahapan-placeholder {
         transition: all 0.15s ease;
         opacity: 0.7;
       }

       .tahapan-card {
         position: relative;
         transition: all 0.2s ease;
         isolation: isolate;
       }

       .tahapan-card.dragging {
         z-index: 1000;
         opacity: 0.9;
         transform: rotate(1deg);
         box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
       }

       .tahapan-card:not(.dragging) {
         transition: transform 0.2s ease, box-shadow 0.2s ease;
       }

       .tahapan-card:hover:not(.dragging) {
         transform: translateY(-1px);
       }

       /* Mode-specific styles */
       .tahapan-card[data-mode="drag"] {
         cursor: move;
       }

       .tahapan-card[data-mode="drag"]:hover {
         background-color: #f9fafb;
         border-color: #3b82f6;
       }

       /* Prevent text selection during drag */
       .tahapan-card[data-mode="drag"] * {
         user-select: none;
         -webkit-user-select: none;
         -moz-user-select: none;
         -ms-user-select: none;
       }

       /* Edit mode highlight */
       .tahapan-card[data-editing="true"] {
         border-color: #3b82f6;
         box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
       }

       /* Fix dropdown stacking for edit mode only */
       .tahapan-card[data-editing="true"] .relative {
         z-index: 999;
       }

       .tahapan-card[data-editing="true"] .relative:focus-within {
         z-index: 9999;
       }

       /* Hide dropdowns during drag mode */
       .tahapan-card[data-mode="drag"] .relative > div[class*="absolute"] {
         display: none !important;
       }
     `}</style>
    </div>
  );
};

export default TahapanTab;
