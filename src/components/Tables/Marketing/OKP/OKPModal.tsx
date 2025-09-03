import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import SearchableSelect from '../../../../pages/MasterData/Marketing/SearchableSelect';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

interface KalkulasiItem {
  id: number;
  status: string;
  status_kalkulasi: string;
  status_proses: string;
  id_customer: number;
  nama_customer: string;
  kode_kalkulasi: string | null;
  kode_marketing: string;
  nama_marketing: string;
  id_marketing: number;
  id_produk: number;
  nama_produk: string;
  qty_kalkulasi: number;
  spesifikasi: string;
  keterangan_kerja: string;
  keterangan_harga: string;
  harga_satuan: number;
  harga_ppn: string;
  harga_diskon: string;
  harga_produksi: string;
  jumlah_harga_jual: string;
  total_harga: string;
  total_harga_satuan_customer: string;
  profit: number;
  profit_harga: string;
  ppn: number;
  diskon: number;

  // kertas
  id_kertas: number;
  jenis_kertas: string;
  brand_kertas: string;
  gramature_kertas: number;
  panjang_kertas: number;
  lebar_kertas: number;
  persentase_kertas: number;
  persentase_apki_kertas: number;
  total_harga_kertas: number;
  total_kertas: number;

  // mesin cetak
  id_jenis_mesin_cetak: number;
  jenis_mesin_cetak: string;
  jumlah_warna: number;
  plate_cetak: string | null;
  harga_plate: number;
  jumlah_harga_cetak: number;

  // coating
  id_coating_depan: number;
  nama_coating_depan: string;
  id_mesin_coating_depan: number;
  nama_mesin_coating_depan: string;
  id_coating_belakang: number;
  nama_coating_belakang: string;
  id_mesin_coating_belakang: number;
  nama_mesin_coating_belakang: string;
  jumlah_harga_coating_depan: number;
  jumlah_harga_coating_belakang: number;
  total_harga_coating: number;

  // finishing
  id_lem: number;
  nama_lem: string;
  jumlah_harga_lem: number;
  id_mesin_finishing: number;
  nama_mesin_finishing: string;
  finishing_insheet: number;

  // pons
  id_jenis_pons: number;
  nama_jenis_pons: string;
  ongkos_pons: string | null;
  ongkos_pons_qty: number;
  harga_satuan_ongkos_pons: number;
  total_harga_ongkos_pons: number;
  pons_insheet: number;
  id_mesin_pons: number;
  nama_mesin_pons: string;

  // potong
  id_mesin_potong: number;
  nama_mesin_potong: string;
  qty_potong: number;
  potong_jadi: string | null;
  harga_potong_jadi: number;

  // lipat
  id_mesin_lipat: number;
  nama_mesin_lipat: string;
  qty_lipat: number | null;
  lipat: string | null;
  harga_lipat: number;

  // foil & spot
  foil: string | null;
  spot_foil: string | null;
  harga_foil_manual: number;
  harga_polimer_manual: number;
  harga_spot_foil_manual: number;

  // packaging & pengiriman
  id_area_pengiriman: number;
  nama_area_pengiriman: string;
  harga_area_pengiriman: number;
  harga_pengiriman: number | null;
  jumlah_kirim: number | null;
  id_packing: number | null;
  nama_packing: string | null;
  jenis_packing: string | null;
  qty_packing: number | null;
  harga_packaging: number | null;
  harga_packing: number | null;
  no_packaging: string | null;
  panjang_packaging: number | null;
  lebar_packaging: number | null;

  // ukuran cetak
  ukuran_cetak_depan: number | undefined;
  ukuran_cetak_belakang: number | undefined;
  ukuran_cetak_isi_1: number;
  ukuran_cetak_isi_2: number;
  ukuran_cetak_bagian_1: number;
  ukuran_cetak_bagian_2: number;
  ukuran_cetak_lebar_1: number;
  ukuran_cetak_panjang_1: number;
  ukuran_cetak_lebar_2: number;
  ukuran_cetak_panjang_2: number;
  ukuran_cetak_bbs_1: string;
  ukuran_cetak_bbs_2: string;

  // ukuran jadi
  ukuran_jadi_panjang: number;
  ukuran_jadi_lebar: number;
  ukuran_jadi_terb_panjang: number;
  ukuran_jadi_terb_lebar: number;
  ukuran_jadi_tinggi: number;

  // audit fields
  createdAt: string;
  updatedAt: string;
  id_user_create: number | null;
  id_user_approve: number;
  is_active: boolean;

  // extras
  note_kabag: string | null;
  tgl_kalkulasi: string;
}
interface OKPModalProps {
  onClose: () => void;
}

interface OKPFormData {
  no_okp: string;
  status_okp: string;
  tgl_target_marketing: string;
  jenis_pekerjaan: string[];
  id_pisau: string;
  file_spek_customer: string;
  rencana_qty_po: number;
  rencana_tgl_kirim: string;
  status_po: string;
  keterangan_cetak: string;
  tahapan: string[];
  id_kalkulasi: number;
}

const OKPModal: React.FC<OKPModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<OKPFormData>({
    no_okp: '',
    status_okp: 'Baru',
    tgl_target_marketing: '',
    jenis_pekerjaan: [],
    id_pisau: '',
    file_spek_customer: '',
    rencana_qty_po: 0,
    rencana_tgl_kirim: '',
    status_po: 'tidak',
    keterangan_cetak: '',
    tahapan: [],
    id_kalkulasi: 0,
  });
  const jenisPekerjaanOptions = [
    'Print Artwork',
    'Dummy Polos',
    'Dummy Artwork',
    'Print Digital',
  ];

  const tahapanOptions = [
    'Cetak', // Added as requested
    'Water Base',
    'UV',
    '1/2 Putus',
    'Foil Perak',
    'Lock Bottom',
    'Mika',
    'Bor...mm',
    'Spot OPV',
    'Lami. Kilap',
    'Potong Jadi',
    'V.Kaca',
    'Lipat',
    'Spiral',
    'Jahit Kawat',
    'OPV',
    'Laim. doff',
    'Perforasi',
    'Blok Lem',
    'Numerator',
    'Jepit Kalung',
    'Jahit Benang',
    'Varnish Doff',
    'Pons',
    'Emboss',
    'Lem Atas',
    'Komplit',
    'Mata Itik',
    'Spot UV',
    'Ril',
    'Foil Emas',
    'Lem Samping',
    'Pasang Cover',
    'Pasang Tali',
  ];
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kalkulasiList, setKalkulasiList] = useState<KalkulasiItem[]>([]);
  const [loadingKalkulasi, setLoadingKalkulasi] = useState(false);
  // File handling states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // PDF handling states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Cropping states
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCropTool, setShowCropTool] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const fetchKalkulasiData = async (): Promise<void> => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/marketing/kalkulasi?status=history`;
    try {
      setLoadingKalkulasi(true);
      const res: AxiosResponse<{ data: KalkulasiItem[] }> = await axios.get(
        url,
      );
      if (res.data && res.data.data) {
        setKalkulasiList(res.data.data);
      } else {
        setKalkulasiList([]);
      }
      console.log('Kalkulasi data fetched:', res.data.data);
    } catch (error) {
      console.error('Error fetching kalkulasi data:', error);
      setKalkulasiList([]);
    } finally {
      setLoadingKalkulasi(false);
    }
  };

  useEffect(() => {
    fetchKalkulasiData();
  }, []);
  // Prevent closing/refreshing with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | void => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent): void => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?',
        );
        if (!confirmLeave) {
          window.history.pushState('', '', window.location.pathname);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState('', '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleInputChange = (field: keyof OKPFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCancelClick = (): void => {
    if (!isSubmitting) {
      const confirmCancel = window.confirm(
        'Data akan hilang. Apakah Anda yakin ingin membatalkan?',
      );
      if (confirmCancel) {
        setHasUnsavedChanges(false);
        onClose();
      }
    }
  };

  // File upload functions
  async function handleFileUpload(file: File): Promise<string> {
    setUploading(true);
    setUploadError('');

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formDataUpload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const fileName =
        response.data.fileName || response.data.filename || response.data.file;
      return fileName;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file');
      throw error;
    } finally {
      setUploading(false);
    }
  }

  // PDF handling functions
  const handlePdfSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      await processPdfFile(file);
      setShowPdfPreview(true);
    } else {
      setUploadError('Please select a PDF file');
    }
  };

  const processPdfFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas }).promise;
        pages.push(canvas.toDataURL());
      }

      setPdfPages(pages);
      if (pages.length > 0) {
        setSelectedPage(pages[0]);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      setUploadError('Error processing PDF file');
    }
  };

  // Cropping functions
  const handleCropStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showCropTool) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleCropMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !showCropTool) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropArea({
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y),
    });
  };

  const handleCropEnd = () => {
    setIsDragging(false);
  };

  const handleCropAndSave = async () => {
    if (!selectedPage) return;

    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Get the actual image dimensions
        const imageElement = imageRef.current;
        if (!imageElement) return;

        const imageRect = imageElement.getBoundingClientRect();
        const scaleX = img.naturalWidth / imageRect.width;
        const scaleY = img.naturalHeight / imageRect.height;

        // If no crop area selected, use full image
        let crop = {
          x: 0,
          y: 0,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

        if (cropArea.width > 0 && cropArea.height > 0) {
          crop = {
            x: cropArea.x * scaleX,
            y: cropArea.y * scaleY,
            width: cropArea.width * scaleX,
            height: cropArea.height * scaleY,
          };
        }

        canvas.width = crop.width;
        canvas.height = crop.height;

        // Draw cropped portion
        ctx.drawImage(
          img,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height,
        );

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const file = new File([blob], 'cropped-image.png', {
            type: 'image/png',
          });
          const fileName = await handleFileUpload(file);
          handleInputChange('file_spek_customer', fileName);

          setFilePreview(canvas.toDataURL());
          setShowPdfPreview(false);
          setSelectedFile(file);
          setCropArea({ x: 0, y: 0, width: 0, height: 0 });
          setShowCropTool(false);
        }, 'image/png');
      };

      img.src = selectedPage;
    } catch (error) {
      console.error('Error saving cropped image:', error);
      setUploadError('Error saving cropped image');
    }
  };

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setUploadError('');

      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  }

  function clearFileSelection(): void {
    setSelectedFile(null);
    setFilePreview('');
    setUploadError('');
    setPdfFile(null);
    setPdfPages([]);
    setSelectedPage('');
    setShowPdfPreview(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setShowCropTool(false);

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload file if selected
      if (selectedFile && !formData.file_spek_customer) {
        const fileName = await handleFileUpload(selectedFile);
        formData.file_spek_customer = fileName;
      }

      // Submit form data
      const response = await axios.post(
        `${import.meta.env.VITE_API_LINK}/marketing/okp`,
        formData,
        { withCredentials: true },
      );

      console.log('OKP created successfully:', response.data);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Error creating OKP:', error);
      alert('Error creating OKP');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChangeKalkulasi = (field: keyof OKPFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (
    field: 'jenis_pekerjaan' | 'tahapan',
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field];
      let newArray: string[];

      if (checked) {
        // Add the value if it's not already in the array
        newArray = currentArray.includes(value)
          ? currentArray
          : [...currentArray, value];
      } else {
        // Remove the value from the array
        newArray = currentArray.filter((item) => item !== value);
      }

      return { ...prev, [field]: newArray };
    });
    setHasUnsavedChanges(true);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Buat OKP Baru</h2>
          <button
            onClick={handleCancelClick}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Kalkulasi
              </label>
              <SearchableSelect
                options={[
                  { value: 0, label: 'Select Kalkulasi' },
                  ...kalkulasiList.map((k) => ({
                    value: k.id,
                    label: `${k.kode_kalkulasi} - ${k.nama_customer} - ${k.nama_produk}`,
                  })),
                ]}
                value={formData.id_kalkulasi}
                onChange={(value) =>
                  handleInputChangeKalkulasi('id_kalkulasi', Number(value))
                }
                placeholder="Select Kalkulasi"
                required
              />
              {loadingKalkulasi && (
                <p className="text-xs text-gray-500">Loading...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor OKP
              </label>
              <input
                type="text"
                value={formData.no_okp}
                onChange={(e) => handleInputChange('no_okp', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="OK-00001/09/25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status OKP
              </label>
              <select
                value={formData.status_okp}
                onChange={(e) =>
                  handleInputChange('status_okp', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Baru">Baru</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Target Marketing
              </label>
              <input
                type="date"
                value={formData.tgl_target_marketing}
                onChange={(e) =>
                  handleInputChange('tgl_target_marketing', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Pisau
              </label>
              <input
                type="text"
                value={formData.id_pisau}
                onChange={(e) => handleInputChange('id_pisau', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="PS-001"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Spek Customer
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {!filePreview ? (
                <div className="text-center">
                  <div className="mb-4">
                    <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer mr-4">
                      Upload PDF
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfSelect}
                        className="hidden"
                      />
                    </label>
                    <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-gray-500">
                    Upload PDF to crop or select image directly
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 mx-auto mb-4"
                  />
                  <button
                    onClick={clearFileSelection}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Remove File
                  </button>
                </div>
              )}
              {uploadError && (
                <p className="text-red-500 text-sm mt-2">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Other form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Jenis Pekerjaan
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {jenisPekerjaanOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.jenis_pekerjaan.includes(option)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            'jenis_pekerjaan',
                            option,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.jenis_pekerjaan.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">
                    Selected: {formData.jenis_pekerjaan.join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tahapan
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {tahapanOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tahapan.includes(option)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            'tahapan',
                            option,
                            e.target.checked,
                          )
                        }
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.tahapan.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">
                    Selected: {formData.tahapan.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rencana Qty PO
              </label>
              <input
                type="number"
                value={formData.rencana_qty_po}
                onChange={(e) =>
                  handleInputChange(
                    'rencana_qty_po',
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rencana Tanggal Kirim
              </label>
              <input
                type="date"
                value={formData.rencana_tgl_kirim}
                onChange={(e) =>
                  handleInputChange('rencana_tgl_kirim', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status PO
              </label>
              <select
                value={formData.status_po}
                onChange={(e) => handleInputChange('status_po', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="tidak">Tidak</option>
                <option value="ada">Ada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan Cetak
              </label>

              <select
                value={formData.keterangan_cetak}
                onChange={(e) =>
                  handleInputChange('keterangan_cetak', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="in house">In House</option>
                <option value="outsource">Outsource</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end gap-4">
          <button
            onClick={handleCancelClick}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || uploading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save OKP'}
          </button>
        </div>
      </div>

      {/* Enhanced PDF Preview Modal with Cropping */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-screen overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">
                Select and Crop PDF Page
              </h3>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShowCropTool(!showCropTool)}
                  className={`px-3 py-1 rounded text-sm ${
                    showCropTool
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {showCropTool ? 'Disable Crop' : 'Enable Crop'}
                </button>
                {showCropTool && (
                  <button
                    onClick={() =>
                      setCropArea({ x: 0, y: 0, width: 0, height: 0 })
                    }
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 flex">
              {/* Page thumbnails */}
              <div className="w-1/4 pr-4 border-r">
                <h4 className="font-semibold mb-2">Pages</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pdfPages.map((page, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded p-2 ${
                        selectedPage === page
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedPage(page);
                        setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                      }}
                    >
                      <img
                        src={page}
                        alt={`Page ${index + 1}`}
                        className="w-full h-20 object-contain"
                      />
                      <p className="text-center text-xs mt-1">
                        Page {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main preview with crop area */}
              <div className="w-3/4 pl-4">
                {selectedPage && (
                  <div className="relative inline-block">
                    <div
                      className="relative"
                      onMouseDown={handleCropStart}
                      onMouseMove={handleCropMove}
                      onMouseUp={handleCropEnd}
                      onMouseLeave={handleCropEnd}
                      style={{ cursor: showCropTool ? 'crosshair' : 'default' }}
                    >
                      <img
                        ref={imageRef}
                        src={selectedPage}
                        alt="Selected page"
                        className="max-w-full max-h-96 border"
                        draggable={false}
                        style={{ userSelect: 'none' }}
                      />

                      {/* Crop overlay */}
                      {showCropTool &&
                        cropArea.width > 0 &&
                        cropArea.height > 0 && (
                          <>
                            {/* Dark overlay on non-selected areas */}
                            <div
                              className="absolute inset-0 bg-black bg-opacity-30 pointer-events-none"
                              style={{
                                clipPath: `polygon(
                                0% 0%, 
                                0% 100%, 
                                ${cropArea.x}px 100%, 
                                ${cropArea.x}px ${cropArea.y}px, 
                                ${cropArea.x + cropArea.width}px ${
                                  cropArea.y
                                }px, 
                                ${cropArea.x + cropArea.width}px ${
                                  cropArea.y + cropArea.height
                                }px, 
                                ${cropArea.x}px ${
                                  cropArea.y + cropArea.height
                                }px, 
                                ${cropArea.x}px 100%, 
                                100% 100%, 
                                100% 0%
                              )`,
                              }}
                            />
                            {/* Selection border */}
                            <div
                              className="absolute border-2 border-red-500 bg-red-500 bg-opacity-10 pointer-events-none"
                              style={{
                                left: cropArea.x,
                                top: cropArea.y,
                                width: cropArea.width,
                                height: cropArea.height,
                              }}
                            >
                              <div className="absolute -top-6 left-0 bg-red-500 text-white px-1 text-xs rounded">
                                {Math.round(cropArea.width)} ×{' '}
                                {Math.round(cropArea.height)}
                              </div>
                            </div>
                          </>
                        )}
                    </div>

                    {showCropTool && (
                      <p className="text-sm text-gray-600 mt-2">
                        Click and drag to select the area you want to crop
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setCropArea({ x: 0, y: 0, width: 0, height: 0 });
                  setShowCropTool(false);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCropAndSave}
                disabled={!selectedPage || uploading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {uploading
                  ? 'Uploading...'
                  : cropArea.width > 0
                  ? 'Save Cropped Area'
                  : 'Save Full Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OKPModal;
