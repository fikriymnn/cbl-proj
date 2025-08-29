import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KalkulasiFormData } from '../KalkulasiModal';

interface PostPressTabProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

interface PonsOption {
  id: number;
  nama_barang: string;
  harga: number;
}

interface OngkosPonsOption {
  id: number;
  nama_barang: string;
  harga: number;
}

interface TahapanResponse {
  id: number;
  nama_tahapan: string;
}

interface MesinTahapanResponse {
  id_mesin_tahapan: number;
  mesin: {
    nama_mesin: string;
  };
}

interface Option {
  value: number;
  label: string;
}

const PostPressTab: React.FC<PostPressTabProps> = ({
  formData,
  onInputChange,
}) => {
  const [ponsOptions, setPonsOptions] = useState<PonsOption[]>([]);
  const [mesinPonsOptions, setMesinPonsOptions] = useState<Option[]>([]);
  const [ongkosPonsOptions, setOngkosPonsOptions] = useState<
    OngkosPonsOption[]
  >([]);
  const [loadingPons, setLoadingPons] = useState(false);
  const [loadingMesinPons, setLoadingMesinPons] = useState(false);
  const [loadingOngkosPons, setLoadingOngkosPons] = useState(false);

  // Extended form data for PostPress specific fields
  const [postPressData, setPostPressData] = useState({
    pons_insheet: formData.pons_insheet || '',
    jenis_pons: '',
    mesin_pons: '',
    harga_pisau: '',
    ongkos_pons: 'No',
    ongkos_pons_qty: '1',
    harga_satuan_ongkos_pons: '0.00',
    total_harga_ongkos_pons: '0.00',
    qty_lipat: '0',
    harga_lipat: '0',
    potong_jadi_qty: '0',
    harga_potong_jadi: '0.00',
  });

  // Fetch functions remain the same...
  const fetchPonsOptions = async () => {
    setLoadingPons(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'POND',
          },
        },
      );

      if (response.data && response.data.data) {
        const ponsData = response.data.data || [];
        setPonsOptions(ponsData);
      }
    } catch (error) {
      console.error('Error fetching pons options:', error);
    } finally {
      setLoadingPons(false);
    }
  };

  const fetchOngkosPonsOptions = async () => {
    setLoadingOngkosPons(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/barang`,
        {
          params: {
            kategori: 'Ongkos Pons',
          },
        },
      );

      if (response.data && response.data.data) {
        const ongkosPonsData = response.data.data || [];
        setOngkosPonsOptions(ongkosPonsData);
      }
    } catch (error) {
      console.error('Error fetching ongkos pons options:', error);
    } finally {
      setLoadingOngkosPons(false);
    }
  };

  const fetchMesinPons = async () => {
    setLoadingMesinPons(true);
    try {
      const tahapanResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/tahapan`,
      );

      const pondTahapan = tahapanResponse.data.data.find(
        (tahapan: TahapanResponse) =>
          tahapan.nama_tahapan.toLowerCase().includes('pond'),
      );

      if (pondTahapan) {
        const mesinResponse = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
          {
            params: {
              id_tahapan: pondTahapan.id,
            },
          },
        );

        const options: Option[] = mesinResponse.data.data.map(
          (item: MesinTahapanResponse) => ({
            value: item.id_mesin_tahapan,
            label: item.mesin.nama_mesin,
          }),
        );

        setMesinPonsOptions(options);
      }
    } catch (error) {
      console.error('Error fetching mesin pons:', error);
    } finally {
      setLoadingMesinPons(false);
    }
  };

  useEffect(() => {
    fetchPonsOptions();
    fetchMesinPons();
    fetchOngkosPonsOptions();
  }, []);

  // Calculate everything when dependencies change
  useEffect(() => {
    if (postPressData.ongkos_pons === 'Yes' && ongkosPonsOptions.length > 0) {
      const totalKertasString = formData.totalKertas?.toString() || '0';
      const totalKertas = parseFloat(totalKertasString.replace(/\./g, ''));

      const ukuranCetakBagian1 = parseFloat(
        formData.ukuran_cetak_bagian_1 || '0',
      );
      const ukuranCetakBagian2 = parseFloat(
        formData.ukuran_cetak_bagian_2 || '0',
      );

      const ongkosPonsHarga = ongkosPonsOptions[0]?.harga || 0;

      const hargaSatuan =
        totalKertas *
        (ukuranCetakBagian1 + ukuranCetakBagian2) *
        ongkosPonsHarga;

      const qty = parseFloat(postPressData.ongkos_pons_qty || '1');
      const total = hargaSatuan * qty;

      setPostPressData((prev) => ({
        ...prev,
        harga_satuan_ongkos_pons: hargaSatuan.toLocaleString('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        total_harga_ongkos_pons: total.toLocaleString('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }));
    } else {
      setPostPressData((prev) => ({
        ...prev,
        harga_satuan_ongkos_pons: '0.00',
        total_harga_ongkos_pons: '0.00',
      }));
    }
  }, [
    postPressData.ongkos_pons,
    postPressData.ongkos_pons_qty,
    formData.totalKertas,
    formData.ukuran_cetak_bagian_1,
    formData.ukuran_cetak_bagian_2,
    ongkosPonsOptions,
  ]);

  const handlePostPressInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setPostPressData((prev) => ({
      ...prev,
      [name]: value,
    }));

    onInputChange(e);
  };

  // Get current formula values for display
  const getFormulaDisplay = () => {
    const totalKertasString = formData.totalKertas?.toString() || '0';
    const totalKertas = parseFloat(totalKertasString.replace(/\./g, ''));

    const ukuranCetakBagian1 = parseFloat(
      formData.ukuran_cetak_bagian_1 || '0',
    );
    const ukuranCetakBagian2 = parseFloat(
      formData.ukuran_cetak_bagian_2 || '0',
    );
    const ongkosPonsHarga = ongkosPonsOptions[0]?.harga || 0;
    const qty = parseFloat(postPressData.ongkos_pons_qty || '1');

    return {
      totalKertas,
      ukuranCetakBagian1,
      ukuranCetakBagian2,
      ongkosPonsHarga,
      qty,
    };
  };

  const formulaValues = getFormulaDisplay();

  return (
    <div className="space-y-8">
      {/* Pons Information Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pons Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Pons Insheet
            </label>
            <input
              type="text"
              name="pons_insheet"
              value={postPressData.pons_insheet}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter insheet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Jenis Pons
            </label>
            <select
              name="jenis_pons"
              value={postPressData.jenis_pons}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingPons}
            >
              <option value="">
                {loadingPons ? 'Loading...' : 'Select Pons Type'}
              </option>
              {ponsOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.nama_barang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Pons
            </label>
            <select
              name="mesin_pons"
              value={postPressData.mesin_pons}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loadingMesinPons}
            >
              <option value="">
                {loadingMesinPons ? 'Loading...' : 'Select Machine'}
              </option>
              {mesinPonsOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Pisau
            </label>
            <input
              type="number"
              name="harga_pisau"
              value={postPressData.harga_pisau}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Pons Cost Calculation Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pons Cost Calculation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Ongkos Pons
            </label>
            <select
              name="ongkos_pons"
              value={postPressData.ongkos_pons}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty Ongkos Pons
            </label>
            <input
              type="number"
              name="ongkos_pons_qty"
              value={postPressData.ongkos_pons_qty}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="1"
              step="1"
              min="1"
              disabled={postPressData.ongkos_pons === 'No'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Satuan
            </label>
            <input
              type="text"
              value={postPressData.harga_satuan_ongkos_pons}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Total Harga
            </label>
            <input
              type="text"
              value={postPressData.total_harga_ongkos_pons}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
              readOnly
            />
          </div>
        </div>

        {/* Formula Display */}
        {postPressData.ongkos_pons === 'Yes' && (
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-4">
              Formula Calculation:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-white p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-800">Unit Price =</strong> Total
                Paper × (Print Size Part 1 + Print Size Part 2) × Pons Cost
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-800">Unit Price =</strong>{' '}
                {formulaValues.totalKertas.toLocaleString('id-ID')} × (
                {formulaValues.ukuranCetakBagian1} +{' '}
                {formulaValues.ukuranCetakBagian2}) ×{' '}
                {formulaValues.ongkosPonsHarga.toLocaleString('id-ID')}
              </div>
              <div className="font-mono bg-white p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-800">Total =</strong> Unit Price ×
                Qty = {postPressData.harga_satuan_ongkos_pons} ×{' '}
                {formulaValues.qty}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lipat Information Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Lipat Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mesin Lipat
            </label>
            <select
              name="mesin_lipat"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select Folding Machine</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty Lipat
            </label>
            <input
              type="number"
              name="qty_lipat"
              value={postPressData.qty_lipat}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Lipat
            </label>
            <input
              type="number"
              name="harga_lipat"
              value={postPressData.harga_lipat}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Potong Jadi Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6.4-6.4l.707-.707a1 1 0 011.414 0l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Potong Jadi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Qty Potong Jadi
            </label>
            <input
              type="number"
              name="potong_jadi_qty"
              value={postPressData.potong_jadi_qty}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Harga Potong Jadi
            </label>
            <input
              type="number"
              name="harga_potong_jadi"
              value={postPressData.harga_potong_jadi}
              onChange={handlePostPressInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPressTab;
