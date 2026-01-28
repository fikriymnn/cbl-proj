// BOMTemplateSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BOMData } from './Types/bom.types';

interface BOMTemplate {
  id: number;
  no_bom: string;
  customer: string;
  produk: string;
  no_io: string;
  no_so: string;
  tgl_pembuatan_bom: string;
  // Include all BOM arrays
  bom_kertas: any[];
  bom_tinta: any[];
  bom_corrugated: any[];
  bom_poliban: any[];
  bom_coating: any[];
  bom_lem: any[];
  lain_lain: any[];
}

interface BOMTemplateSelectorProps {
  onTemplateSelect: (templateData: Partial<BOMData>) => void;
  disabled?: boolean;
}

const BOMTemplateSelector: React.FC<BOMTemplateSelectorProps> = ({
  onTemplateSelect,
  disabled = false,
}) => {
  const [templates, setTemplates] = useState<BOMTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<BOMTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BOMTemplate | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter((template) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          template.no_bom.toLowerCase().includes(searchLower) ||
          template.customer.toLowerCase().includes(searchLower) ||
          template.produk.toLowerCase().includes(searchLower) ||
          template.no_io.toLowerCase().includes(searchLower) ||
          template.no_so.toLowerCase().includes(searchLower)
        );
      });
      setFilteredTemplates(filtered);
    }
  }, [searchTerm, templates]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/bom`,
        {
          params: { status: 'history' },
          withCredentials: true,
        },
      );

      if (response.data?.data) {
        setTemplates(response.data.data);
        setFilteredTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching BOM templates:', error);
      alert('Failed to fetch BOM templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: BOMTemplate) => {
    setSelectedTemplate(template);
    setSearchTerm(
      `${template.no_bom} - ${template.customer} - ${template.produk}`,
    );
    setIsOpen(false);

    try {
      setLoading(true);

      // Fetch full BOM data by ID to get complete details
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/bom/${template.id}`,
        { withCredentials: true },
      );

      if (response.data?.data) {
        const fullBOMData = response.data.data;

        // ✅ Prepare template data - ONLY copy item references, NOT quantities
        const templateData: Partial<BOMData> = {
          // BOM Kertas - only copy item IDs and names, quantities will be recalculated
          bom_kertas: (fullBOMData.bom_kertas || []).map((item: any) => ({
            id_kertas: item.id_kertas,
            nama_kertas: item.nama_kertas,
            tipe: item.tipe,
            is_selected: item.is_selected,
            qty_lembar_plano: 0, // ✅ Will be recalculated based on new mounting
          })),

          // BOM Tinta - copy configuration but reset quantities
          bom_tinta: (fullBOMData.bom_tinta || []).map((item: any) => ({
            warna_tinta: item.warna_tinta,
            id_jenis_tinta: item.id_jenis_tinta,
            id_jenis_kertas: item.id_jenis_kertas,
            id_jenis_warna_tinta: item.id_jenis_warna_tinta,
            jenis_mesin_cetak: item.jenis_mesin_cetak,
            area_cetak: item.area_cetak,
            qty_tinta: 0, // ✅ Will be recalculated
            tinta_detail: (item.tinta_detail || []).map((detail: any) => ({
              id_item_tinta: detail.id_item_tinta,
              nama_item_tinta: detail.nama_item_tinta,
              persentase_tinta: detail.persentase_tinta,
              qty_tinta_detail: 0, // ✅ Will be recalculated
            })),
          })),

          // BOM Corrugated - copy item and configuration
          bom_corrugated: (fullBOMData.bom_corrugated || []).map(
            (item: any) => ({
              id_corrugated: item.id_corrugated,
              nama_corrugated: item.nama_corrugated,
              isi_per_pack: item.isi_per_pack,
              tipe: item.tipe,
              is_selected: item.is_selected,
              qty_corrugated: 0, // ✅ Will be recalculated
            }),
          ),

          // BOM Poliban - copy configuration
          bom_poliban: (fullBOMData.bom_poliban || []).map((item: any) => ({
            item_poliban: item.item_poliban,
            isi_satu_ikat: item.isi_satu_ikat,
            lembar_poliban: item.lembar_poliban,
            tipe: item.tipe,
            is_selected: item.is_selected,
            qty_poliban: 0, // ✅ Will be recalculated
          })),

          // BOM Coating - copy configuration
          bom_coating: (fullBOMData.bom_coating || []).map((item: any) => ({
            id_coating: item.id_coating,
            nama_coating: item.nama_coating,
            tipe_coating: item.tipe_coating,
            rumus_coating: item.rumus_coating,
            tipe: item.tipe,
            is_selected: item.is_selected,
            qty_coating: 0, // ✅ Will be recalculated
            uv_wb: 0, // ✅ Will be recalculated
            varnish_doff: 0, // ✅ Will be recalculated
          })),

          // BOM Lem - copy configuration
          bom_lem: (fullBOMData.bom_lem || []).map((item: any) => ({
            id_lem: item.id_lem,
            nama_lem: item.nama_lem,
            rumus_lem: item.rumus_lem,
            tipe: item.tipe,
            is_selected: item.is_selected,
            qty_konstanta: 0, // ✅ Will be recalculated
            qty_lem: 0, // ✅ Will be recalculated
          })),

          // Lain-lain - copy item names only
          lain_lain: (fullBOMData.lain_lain || []).map((item: any) => ({
            nama_item: item.nama_item,
            qty: 0, // ✅ User needs to input quantity manually
          })),
        };

        onTemplateSelect(templateData);
      }
    } catch (error) {
      console.error('Error fetching template details:', error);
      alert('Failed to load template details. Please try again.');
      setSelectedTemplate(null);
      setSearchTerm('');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedTemplate(null);
    setSearchTerm('');
    setFilteredTemplates(templates);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        📋 Copy from Template (Optional)
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by BOM No, Customer, or Product..."
          className="w-full px-3 py-1.5 pr-9 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={disabled || loading}
        />

        {selectedTemplate ? (
          <button
            onClick={handleClearSelection}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            title="Clear selection"
          >
            <svg
              className="w-4 h-4"
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
        ) : (
          <svg
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      {/* Dropdown - Using fixed positioning to break out of overflow */}
      {isOpen && !disabled && (
        <div
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl max-h-64 overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-xs text-gray-600">
                Loading templates...
              </span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="px-3 py-6 text-center text-gray-500 text-xs">
              {searchTerm
                ? 'No templates found matching your search'
                : 'No templates available'}
            </div>
          ) : (
            <div className="overflow-y-auto max-h-64">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-gray-900 text-xs">
                          {template.no_bom}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {formatDate(template.tgl_pembuatan_bom)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 font-medium truncate">
                        {template.customer}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {template.produk}
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {template.no_io && (
                          <span className="text-[10px] text-gray-400">
                            IO: {template.no_io}
                          </span>
                        )}
                        {template.no_so && (
                          <span className="text-[10px] text-gray-400">
                            SO: {template.no_so}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Component count badges */}
                    <div className="flex flex-wrap gap-0.5 items-start justify-end">
                      {template.bom_kertas?.length > 0 && (
                        <span
                          className="text-[10px] px-1 py-0.5 rounded bg-orange-100 text-orange-700"
                          title="Kertas"
                        >
                          📄 {template.bom_kertas.length}
                        </span>
                      )}
                      {template.bom_tinta?.length > 0 && (
                        <span
                          className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-700"
                          title="Tinta"
                        >
                          🎨 {template.bom_tinta.length}
                        </span>
                      )}
                      {template.bom_corrugated?.length > 0 && (
                        <span
                          className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700"
                          title="Corrugated"
                        >
                          📦 {template.bom_corrugated.length}
                        </span>
                      )}
                      {template.bom_coating?.length > 0 && (
                        <span
                          className="text-[10px] px-1 py-0.5 rounded bg-cyan-100 text-cyan-700"
                          title="Coating"
                        >
                          ✨ {template.bom_coating.length}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTemplate && (
        <div className="mt-1.5 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-[10px] font-medium text-green-800 mb-0.5">
                ✓ Template Applied
              </div>
              <div className="text-[10px] text-green-700">
                Item configurations copied. Quantities will be automatically
                calculated based on your current mounting and PO qty.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMTemplateSelector;
