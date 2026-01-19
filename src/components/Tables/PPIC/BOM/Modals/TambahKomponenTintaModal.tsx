// components/BOM/Modals/TambahKomponenTintaModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
import { BOMTinta } from '../Types/bom.types';

interface TambahKomponenTintaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BOMTinta) => void;
  editData?: BOMTinta;
  currentTotalAreaCetak: number; // ✅ Added
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

// ✅ CMYK color options
const CMYK_COLORS = [
  { name: 'Cyan', hex: '#00FFFF', cmyk: 'C:100 M:0 Y:0 K:0' },
  { name: 'Magenta', hex: '#FF00FF', cmyk: 'C:0 M:100 Y:0 K:0' },
  { name: 'Yellow', hex: '#FFFF00', cmyk: 'C:0 M:0 Y:100 K:0' },
  { name: 'Black (Key)', hex: '#000000', cmyk: 'C:0 M:0 Y:0 K:100' },
];

const TambahKomponenTintaModal: React.FC<TambahKomponenTintaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  currentTotalAreaCetak, // ✅ Added
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

  // ✅ Add state for color input method
  const [colorInputMethod, setColorInputMethod] = useState<'picker' | 'text'>(
    'picker',
  );
  const [colorTextInput, setColorTextInput] = useState('');

  // Color picker state
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [lightness, setLightness] = useState(0);
  const [isDraggingColor, setIsDraggingColor] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const colorBoxRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  // ✅ Check if selected jenis is Separasi
  const isSeparasi =
    jenisWarnaTintaOptions.find(
      (opt) => opt.id === formData.id_jenis_warna_tinta,
    )?.jenis === 'Separasi';

  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        warna_tinta: editData.warna_tinta,
        id_jenis_tinta: editData.id_jenis_tinta,
        id_jenis_kertas: editData.id_jenis_kertas,
        id_jenis_warna_tinta: editData.id_jenis_warna_tinta,
        jenis_mesin_cetak: editData.jenis_mesin_cetak,
        area_cetak: editData.area_cetak,
      });

      // Convert hex to HSL for color picker
      const { h, s, l } = hexToHSL(editData.warna_tinta);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [isOpen, editData]);

  // Fetch Jenis Warna Tinta
  useEffect(() => {
    const fetchJenisWarnaTinta = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisWarnaTinta`,
          { withCredentials: true },
        );
        setJenisWarnaTintaOptions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching Jenis Warna Tinta:', error);
      }
    };

    if (isOpen) {
      fetchJenisWarnaTinta();
    }
  }, [isOpen]);

  // Fetch Jenis Tinta
  useEffect(() => {
    const fetchJenisTinta = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/jenisTinta`,
          { withCredentials: true },
        );
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
        setJenisKertasOptions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching Jenis Kertas:', error);
      }
    };

    if (isOpen) {
      fetchJenisKertas();
    }
  }, [isOpen]);

  // ✅ Hex to HSL conversion
  const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Update color when HSL values change
  useEffect(() => {
    if (colorInputMethod === 'picker') {
      const rgb = hslToRgb(hue, saturation, lightness);
      const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);
      setFormData((prev) => ({
        ...prev,
        warna_tinta: hexColor,
      }));
    }
  }, [hue, saturation, lightness, colorInputMethod]);

  // ✅ Handle text color input
  useEffect(() => {
    if (colorInputMethod === 'text' && colorTextInput) {
      // Try to parse color name or hex
      const testDiv = document.createElement('div');
      testDiv.style.color = colorTextInput;
      document.body.appendChild(testDiv);
      const computedColor = window.getComputedStyle(testDiv).color;
      document.body.removeChild(testDiv);

      // Convert rgb() to hex
      const rgbMatch = computedColor.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const hex = rgbToHex(
          parseInt(rgbMatch[0]),
          parseInt(rgbMatch[1]),
          parseInt(rgbMatch[2]),
        );
        setFormData((prev) => ({
          ...prev,
          warna_tinta: hex,
        }));

        // Update HSL for preview
        const { h, s, l } = hexToHSL(hex);
        setHue(h);
        setSaturation(s);
        setLightness(l);
      }
    }
  }, [colorTextInput, colorInputMethod]);

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

  // ✅ Handle CMYK color selection
  const handleCMYKSelection = (colorHex: string) => {
    setFormData((prev) => ({
      ...prev,
      warna_tinta: colorHex,
    }));
  };

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

    // ✅ Only validate that area cetak is positive
    if (formData.area_cetak <= 0) {
      alert('Area cetak harus lebih dari 0%');
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
      qty_tinta: 0,
      tinta_detail: [],
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
    setColorInputMethod('picker');
    setColorTextInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {editData ? 'Edit Data Tinta' : 'Tambah Data Tinta'}
            </h2>
            {/* ✅ UPDATED: Show info without limits */}
            <p className="text-sm text-gray-600 mt-1">
              Total area cetak saat ini:{' '}
              <span
                className={`font-semibold ${
                  currentTotalAreaCetak > 100
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`}
              >
                {currentTotalAreaCetak}%
              </span>
              {currentTotalAreaCetak > 100 && (
                <span className="text-orange-600 ml-2">(⚠️ Melebihi 100%)</span>
              )}
            </p>
          </div>
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

        {/* Body - Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* ✅ MOVED TO TOP: Jenis Tinta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Tinta <span className="text-red-500">*</span>
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

          {/* ✅ Conditional Warna Tinta based on Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warna Tinta <span className="text-red-500">*</span>
            </label>

            {isSeparasi ? (
              // ✅ CMYK Radio Button Selection for Separasi
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {CMYK_COLORS.map((color) => (
                    <label
                      key={color.hex}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.warna_tinta === color.hex
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cmyk-color"
                        value={color.hex}
                        checked={formData.warna_tinta === color.hex}
                        onChange={() => handleCMYKSelection(color.hex)}
                        className="mr-3"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {color.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {color.hex}
                          </div>
                          <div className="text-xs text-gray-500">
                            {color.cmyk}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Preview Selected Color */}
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Warna Terpilih:
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded border-2 border-gray-300"
                      style={{ backgroundColor: formData.warna_tinta }}
                    />
                    <div>
                      <div className="text-sm font-medium">
                        {CMYK_COLORS.find((c) => c.hex === formData.warna_tinta)
                          ?.name || 'Custom'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.warna_tinta}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ✅ Color Picker + Text Input for Non-Separasi
              <div className="space-y-3">
                {/* Toggle between picker and text input */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setColorInputMethod('picker')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      colorInputMethod === 'picker'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Color Picker
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorInputMethod('text')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      colorInputMethod === 'text'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Text Input
                  </button>
                </div>

                {colorInputMethod === 'text' ? (
                  // ✅ Text Input Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Masukkan nama warna atau kode hex:
                      </label>
                      <input
                        type="text"
                        value={colorTextInput}
                        onChange={(e) => setColorTextInput(e.target.value)}
                        placeholder="e.g., red, blue, #FF5733"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Contoh: red, blue, green, #FF5733, rgb(255,87,51)
                      </p>
                    </div>

                    {/* Preview Color */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div
                        className="h-20 flex items-center justify-center"
                        style={{ backgroundColor: formData.warna_tinta }}
                      >
                        <span className="text-sm font-medium px-3 py-1 bg-white bg-opacity-90 rounded">
                          {formData.warna_tinta}
                        </span>
                      </div>
                    </div>

                    {/* RGB Color Box Preview (read-only) */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <div className="p-3 text-center text-sm text-gray-600">
                        Preview RGB Color Box
                      </div>
                      <div className="flex h-48">
                        <div
                          className="flex-1 relative"
                          style={{
                            background: `
                              linear-gradient(to bottom, transparent, black),
                              linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
                            `,
                          }}
                        >
                          <div
                            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg"
                            style={{
                              left: `${saturation}%`,
                              top: `${100 - lightness}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        </div>
                        <div
                          className="w-8"
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
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // ✅ Color Picker Mode (Original)
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
                )}
              </div>
            )}
          </div>

          {/* Area Cetak (%) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Cetak (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.area_cetak}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0) {
                  // ✅ Only check if positive
                  handleInputChange('area_cetak', value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Masukkan persentase area cetak (dapat melebihi 100%)
            </p>
          </div>

          {/* Jenis Kertas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kertas <span className="text-red-500">*</span>
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
              Warna <span className="text-red-500">*</span>
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
              Jenis Mesin Cetak <span className="text-red-500">*</span>
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
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
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
