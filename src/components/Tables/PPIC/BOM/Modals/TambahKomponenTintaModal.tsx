// components/BOM/Modals/TambahKomponenTintaModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
import { BOMTinta } from '../Types/bom.types';

interface TambahKomponenTintaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BOMTinta) => void; // Changed to BOMTinta
}

interface KomponenTintaData {
  warna_tinta: string;
  id_jenis_tinta: number;
  id_jenis_kertas: number;
  id_jenis_warna_tinta: number;
  jenis_mesin_cetak: string;
  area_cetak: number;
}

interface JenisWarnaTintaOption {
  id: number;
  jenis: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JenisTintaOption {
  id: number;
  jenis: string;
  bobot: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JenisKertasOption {
  id: number;
  jenis: string;
  bobot: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

const TambahKomponenTintaModal: React.FC<TambahKomponenTintaModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<KomponenTintaData>({
    warna_tinta: '#000000',
    id_jenis_tinta: 0,
    id_jenis_kertas: 0,
    id_jenis_warna_tinta: 0,
    jenis_mesin_cetak: 'offset',
    area_cetak: 0,
  });

  const [jenisWarnaTintaOptions, setJenisWarnaTintaOptions] = useState<
    JenisWarnaTintaOption[]
  >([]);
  const [jenisTintaOptions, setJenisTintaOptions] = useState<
    JenisTintaOption[]
  >([]);
  const [jenisKertasOptions, setJenisKertasOptions] = useState<
    JenisKertasOption[]
  >([]);

  // Color picker state
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
  const [isDraggingColor, setIsDraggingColor] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const colorBoxRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  // Fetch Jenis Warna Tinta
  useEffect(() => {
    const fetchJenisWarnaTinta = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisWarnaTinta`,
          { withCredentials: true },
        );
        console.log('Jenis Warna Tinta Response:', response.data);
        setJenisWarnaTintaOptions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching Jenis Warna Tinta:', error);
      }
    };

    if (isOpen) {
      fetchJenisWarnaTinta();
    }
  }, [isOpen]);

  // Fetch Jenis Tinta (Warna)
  useEffect(() => {
    const fetchJenisTinta = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisTinta`,
          { withCredentials: true },
        );
        console.log('Jenis Tinta Response:', response.data);
        setJenisTintaOptions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching Jenis Tinta:', error);
      }
    };

    if (isOpen) {
      fetchJenisTinta();
    }
  }, [isOpen]);

  // Fetch Jenis Kertas
  useEffect(() => {
    const fetchJenisKertas = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisKertas`,
          { withCredentials: true },
        );
        console.log('Jenis Kertas Response:', response.data);
        setJenisKertasOptions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching Jenis Kertas:', error);
      }
    };

    if (isOpen) {
      fetchJenisKertas();
    }
  }, [isOpen]);

  // Update color when HSL values change
  useEffect(() => {
    const rgb = hslToRgb(hue, saturation, lightness);
    const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    setFormData((prev) => ({
      ...prev,
      warna_tinta: hexColor,
    }));
  }, [hue, saturation, lightness]);

  // HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  // RGB to Hex conversion
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
  };

  // Handle color box interaction
  const updateColorBox = (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    if (!colorBoxRef.current) return;

    const rect = colorBoxRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const newSaturation = (x / rect.width) * 100;
    const newLightness = 100 - (y / rect.height) * 100;

    setSaturation(Math.max(0, Math.min(100, newSaturation)));
    setLightness(Math.max(0, Math.min(100, newLightness)));
  };

  const handleColorBoxMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingColor(true);
    updateColorBox(e);
  };

  // Handle hue slider interaction
  const updateHueSlider = (
    e: MouseEvent | React.MouseEvent<HTMLDivElement>,
  ) => {
    if (!hueSliderRef.current) return;

    const rect = hueSliderRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const newHue = (y / rect.height) * 360;

    setHue(Math.max(0, Math.min(360, newHue)));
  };

  const handleHueSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingHue(true);
    updateHueSlider(e);
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingColor) {
        updateColorBox(e);
      }
      if (isDraggingHue) {
        updateHueSlider(e);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingColor(false);
      setIsDraggingHue(false);
    };

    if (isDraggingColor || isDraggingHue) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingColor, isDraggingHue]);

  const handleInputChange = (
    field: keyof KomponenTintaData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // components/BOM/Modals/TambahKomponenTintaModal.tsx

  const handleSubmit = () => {
    // Validation
    if (
      !formData.warna_tinta ||
      formData.id_jenis_tinta === 0 ||
      formData.id_jenis_kertas === 0 ||
      formData.id_jenis_warna_tinta === 0
    ) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    // Create complete BOMTinta object
    const bomTintaData: BOMTinta = {
      warna_tinta: formData.warna_tinta,
      id_jenis_tinta: formData.id_jenis_tinta,
      id_jenis_kertas: formData.id_jenis_kertas,
      id_jenis_warna_tinta: formData.id_jenis_warna_tinta,
      jenis_mesin_cetak: formData.jenis_mesin_cetak,
      area_cetak: formData.area_cetak,
      qty_tinta: 0, // Initialize with 0
      tinta_detail: [], // Initialize with empty array
    };

    onSave(bomTintaData);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      warna_tinta: '#000000',
      id_jenis_tinta: 0,
      id_jenis_kertas: 0,
      id_jenis_warna_tinta: 0,
      jenis_mesin_cetak: 'offset',
      area_cetak: 0,
    });
    setHue(0);
    setSaturation(0);
    setLightness(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Tambah Data Tinta
          </h2>
          <button
            onClick={handleClose}
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

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Warna Tinta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warna Tinta
            </label>

            {/* Color Picker Container */}
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="flex h-64">
                {/* Main Color Box */}
                <div
                  ref={colorBoxRef}
                  className="flex-1 relative cursor-crosshair select-none"
                  style={{
                    background: `
                      linear-gradient(to bottom, transparent, black),
                      linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
                    `,
                  }}
                  onMouseDown={handleColorBoxMouseDown}
                >
                  {/* Color Selector Circle */}
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
                    style={{
                      left: `${saturation}%`,
                      top: `${100 - lightness}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>

                {/* Hue Slider */}
                <div
                  ref={hueSliderRef}
                  className="w-8 relative cursor-pointer select-none"
                  style={{
                    background: `linear-gradient(to bottom, 
                      #ff0000 0%, 
                      #ff00ff 17%, 
                      #0000ff 33%, 
                      #00ffff 50%, 
                      #00ff00 67%, 
                      #ffff00 83%, 
                      #ff0000 100%)`,
                  }}
                  onMouseDown={handleHueSliderMouseDown}
                >
                  {/* Hue Slider Indicator */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-white border border-gray-400 pointer-events-none"
                    style={{
                      top: `${(hue / 360) * 100}%`,
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
              </div>

              {/* Color Display Bar */}
              <div
                className="py-3 text-center font-medium text-white"
                style={{ backgroundColor: formData.warna_tinta }}
              >
                {formData.warna_tinta}
              </div>
            </div>
          </div>

          {/* Jenis Tinta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Tinta
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Pilih Data' },
                ...jenisWarnaTintaOptions.map((item) => ({
                  value: item.id.toString(),
                  label: item.jenis,
                })),
              ]}
              value={formData.id_jenis_warna_tinta.toString()}
              onChange={(value) =>
                handleInputChange('id_jenis_warna_tinta', Number(value))
              }
              placeholder="Pilih Data"
              required
            />
          </div>

          {/* Area Cetak (%) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Cetak (%)
            </label>
            <input
              type="number"
              value={formData.area_cetak}
              onChange={(e) =>
                handleInputChange('area_cetak', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>

          {/* Jenis Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kertas
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Pilih Data' },
                ...jenisKertasOptions.map((item) => ({
                  value: item.id.toString(),
                  label: item.jenis,
                })),
              ]}
              value={formData.id_jenis_kertas.toString()}
              onChange={(value) =>
                handleInputChange('id_jenis_kertas', Number(value))
              }
              placeholder="Pilih Data"
              required
            />
          </div>

          {/* Warna */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warna
            </label>
            <SearchableSelect
              options={[
                { value: '', label: 'Pilih Data' },
                ...jenisTintaOptions.map((item) => ({
                  value: item.id.toString(),
                  label: item.jenis,
                })),
              ]}
              value={formData.id_jenis_tinta.toString()}
              onChange={(value) =>
                handleInputChange('id_jenis_tinta', Number(value))
              }
              placeholder="Pilih Data"
              required
            />
          </div>

          {/* Jenis Mesin Cetak */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Mesin Cetak
            </label>
            <SearchableSelect
              options={[
                { value: 'offset', label: 'Offset' },
                { value: 'digital', label: 'Digital' },
                { value: 'flexo', label: 'Flexo' },
              ]}
              value={formData.jenis_mesin_cetak}
              onChange={(value) =>
                handleInputChange('jenis_mesin_cetak', value)
              }
              placeholder="Pilih Data"
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default TambahKomponenTintaModal;
