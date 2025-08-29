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
    // Remove this line: selected_ongkos_pons: '',
    ongkos_pons_qty: '1',
    harga_satuan_ongkos_pons: '0.00',
    total_harga_ongkos_pons: '0.00',
    qty_lipat: '0',
    harga_lipat: '0',
    potong_jadi_qty: '0',
    harga_potong_jadi: '0.00',
  });
  // Fetch Pons options (POND category)
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

  // Fetch Ongkos Pons options
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

  // Fetch Mesin Pons options
  const fetchMesinPons = async () => {
    setLoadingMesinPons(true);
    try {
      // First, get all tahapan
      const tahapanResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/tahapan`,
      );

      // Find tahapan with nama_tahapan containing "pond" (case insensitive)
      const pondTahapan = tahapanResponse.data.data.find(
        (tahapan: TahapanResponse) =>
          tahapan.nama_tahapan.toLowerCase().includes('pond'),
      );

      if (pondTahapan) {
        // Get mesin for this tahapan
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
      // Convert totalKertas string to number properly (remove dots and convert)
      const totalKertasString = formData.totalKertas?.toString() || '0';
      const totalKertas = parseFloat(totalKertasString.replace(/\./g, ''));

      const ukuranCetakBagian1 = parseFloat(
        formData.ukuran_cetak_bagian_1 || '0',
      );
      const ukuranCetakBagian2 = parseFloat(
        formData.ukuran_cetak_bagian_2 || '0',
      );

      // Use the first ongkos pons option (index 0)
      const ongkosPonsHarga = ongkosPonsOptions[0]?.harga || 0;

      // Formula: totalKertas * (ukuran_cetak_bagian_1 + ukuran_cetak_bagian_2) * ongkos_pons.harga
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
      // Reset values when "No" is selected
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

    // Also trigger the parent's onInputChange for form data sync
    onInputChange(e);
  };

  return (
    <div className="space-y-6">
      {/* Pons Insheet Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pons Insheet</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pons Insheet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pons Insheet
              </label>
              <input
                type="text"
                name="pons_insheet"
                value={postPressData.pons_insheet}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan pons insheet"
              />
            </div>

            {/* Jenis Pons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Pons
              </label>
              <select
                name="jenis_pons"
                value={postPressData.jenis_pons}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingPons}
              >
                <option value="">
                  {loadingPons ? 'Loading...' : 'Pilih Jenis Pons'}
                </option>
                {ponsOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nama_barang}
                  </option>
                ))}
              </select>
            </div>

            {/* Mesin Pons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesin Pons
              </label>
              <select
                name="mesin_pons"
                value={postPressData.mesin_pons}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingMesinPons}
              >
                <option value="">
                  {loadingMesinPons ? 'Loading...' : 'Pilih Mesin Pons'}
                </option>
                {mesinPonsOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Harga Pisau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Pisau
              </label>
              <input
                type="number"
                name="harga_pisau"
                value={postPressData.harga_pisau}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ongkos Pons</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Ongkos Pons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ongkos Pons
              </label>
              <select
                name="ongkos_pons"
                value={postPressData.ongkos_pons}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Remove this entire div - Jenis Ongkos Pons field */}

            {/* Qty Ongkos Pons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qty Ongkos Pons
              </label>
              <input
                type="number"
                name="ongkos_pons_qty"
                value={postPressData.ongkos_pons_qty}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
                step="1"
                min="1"
                disabled={postPressData.ongkos_pons === 'No'}
              />
            </div>

            {/* Harga Satuan Ongkos Pons (calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Satuan Ongkos Pons
              </label>
              <input
                type="text"
                value={postPressData.harga_satuan_ongkos_pons}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Total Harga Ongkos Pons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Harga Ongkos Pons
              </label>
              <input
                type="text"
                value={postPressData.total_harga_ongkos_pons}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lipat Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lipat</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mesin Lipat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesin Lipat
              </label>
              <select
                name="mesin_lipat"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Mesin Lipat</option>
              </select>
            </div>

            {/* Qty Lipat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qty Lipat
              </label>
              <input
                type="number"
                name="qty_lipat"
                value={postPressData.qty_lipat}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                step="1"
              />
            </div>

            {/* Harga Lipat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Lipat
              </label>
              <input
                type="number"
                name="harga_lipat"
                value={postPressData.harga_lipat}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Potong Jadi Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Potong Jadi</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Qty Potong Jadi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qty Potong Jadi
              </label>
              <input
                type="number"
                name="potong_jadi_qty"
                value={postPressData.potong_jadi_qty}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                step="1"
              />
            </div>

            {/* Harga Potong Jadi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Potong Jadi
              </label>
              <input
                type="number"
                name="harga_potong_jadi"
                value={postPressData.harga_potong_jadi}
                onChange={handlePostPressInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPressTab;
