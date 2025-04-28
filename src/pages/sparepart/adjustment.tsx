import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import Loading from '../../components/Loading';

interface SparepartItem {
  id: number;
  id_stok_sparepart: number;
  id_user: number;
  is_active: boolean;
  note: string;
  pengurangan_penambahan: string;
  qty: number;
  status: string;
  stok_terakhir: number;
  tgl_adjusment: string;
  updatedAt: string;
  createdAt: string;
  sparepart: {
    id: number;
    kode: string;
    nama_sparepart: string;
    lokasi: string;
    grade: string;
    stok: number;
    [key: string]: any;
  };
  user: {
    id: number;
    nama: string;
    role: string;
    [key: string]: any;
  };
}

interface StokSparepartItem {
  id: number;
  kode: string;
  nama_sparepart: string;
  lokasi: string;
  grade: string;
  stok: number;
  [key: string]: any;
}

interface AdjustModalState {
  [key: string]: boolean;
}

// Modal component for adjustment
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  judul: string;
  children: React.ReactNode;
}

const ModalKosongan = ({ isOpen, onClose, judul, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{judul}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

function Adjustment() {
  const [opname, setOpname] = useState<SparepartItem[]>([]);
  const [stokSparepart, setStokSparepart] = useState<StokSparepartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [showAdjustModal, setShowAdjustModal] = useState<AdjustModalState>({});
  const [adjustmentData, setAdjustmentData] = useState<{
    id_stok_sparepart: number;
    qty: number;
    note: string;
  }>({
    id_stok_sparepart: 0,
    qty: 0,
    note: '',
  });

  useEffect(() => {
    getOpname();
    getStokSparepart();
  }, []);

  async function getStokSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });

      // Sort the sparepart items by kode in ascending order
      const sortedData = [...res.data].sort((a, b) => {
        // Extract the numeric part from the kode (assuming format is SPRT-XXXX)
        const numA = a.kode.split('-')[1];
        const numB = b.kode.split('-')[1];

        // Compare as numbers if possible
        const numericA = parseInt(numA, 10);
        const numericB = parseInt(numB, 10);

        if (!isNaN(numericA) && !isNaN(numericB)) {
          return numericA - numericB;
        }

        // Fallback to string compare
        return a.kode.localeCompare(b.kode);
      });

      setStokSparepart(sortedData);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.response);
    }
  }

  async function getOpname() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/mtc/stokOpname/AdjusmentSparepart`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setOpname(res.data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Group opname items by id_stok_sparepart
  const groupedAdjustments: Record<string, SparepartItem[]> = opname.reduce(
    (acc: Record<string, SparepartItem[]>, item: SparepartItem) => {
      const id = item.id_stok_sparepart.toString();
      if (!acc[id]) {
        acc[id] = [];
      }
      acc[id].push(item);
      return acc;
    },
    {},
  );

  // Sort items within each group by date (newest first)
  Object.keys(groupedAdjustments).forEach((key: string) => {
    groupedAdjustments[key].sort(
      (a: SparepartItem, b: SparepartItem) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  });

  const toggleDetails = (id: string | number): void => {
    setExpandedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [id.toString()]: !prev[id.toString()],
    }));
  };

  const openAdjustModal = (id_stok_sparepart: number): void => {
    setAdjustmentData({
      id_stok_sparepart,
      qty: 0,
      note: '',
    });
    setShowAdjustModal((prev) => ({
      ...prev,
      [id_stok_sparepart]: true,
    }));
  };

  const closeAdjustModal = (id_stok_sparepart: number): void => {
    setShowAdjustModal((prev) => ({
      ...prev,
      [id_stok_sparepart]: false,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setAdjustmentData((prev) => ({
      ...prev,
      [name]: name === 'qty' ? Number(value) : value,
    }));
  };

  const submitAdjustment = async (): Promise<void> => {
    if (!adjustmentData.id_stok_sparepart || adjustmentData.qty === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const url = `${
        import.meta.env.VITE_API_LINK
      }/mtc/stokOpname/AdjusmentSparepart`;

      const response = await axios.post(url, adjustmentData, {
        withCredentials: true,
      });

      setIsLoading(false);
      closeAdjustModal(adjustmentData.id_stok_sparepart);

      // Refresh data after successful adjustment
      getOpname();
      getStokSparepart();

      alert('Adjustment successful!');
    } catch (error: any) {
      setIsLoading(false);
      console.error('Adjustment error:', error);
      alert(
        `Error: ${error.response?.data?.message || 'Something went wrong'}`,
      );
    }
  };

  // Format date function with TypeScript annotation
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get the latest adjustment for a sparepart if exists
  const getLatestAdjustment = (sparepartId: number): SparepartItem | null => {
    const adjustments = groupedAdjustments[sparepartId.toString()];
    return adjustments && adjustments.length > 0 ? adjustments[0] : null;
  };

  return (
    <>
      <DefaultLayout>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Adjustment
        </p>
        <div className="flex flex-col w-full">
          {isLoading && <Loading />}

          {!isLoading && (
            <>
              {/* Header */}
              <div className="flex w-full gap-2 bg-white p-1 my-2">
                <p className="text-xs font-semibold w-10 p-2">No</p>
                <div className="w-full grid grid-cols-12 gap-2">
                  <p className="col-span-2 text-xs font-semibold p-2">
                    Kode Barang
                  </p>
                  <p className="col-span-2 text-xs font-semibold p-2">
                    Nama Barang
                  </p>
                  <p className="col-span-2 text-xs font-semibold p-2">
                    Lokasi/Area
                  </p>
                  <p className="col-span-1 text-xs font-semibold p-2">Grade</p>
                  <p className="col-span-1 text-xs font-semibold p-2">Aktual</p>
                  <p className="col-span-1 text-xs font-semibold p-2">
                    Pengurangan / Penambahan
                  </p>
                  <p className="col-span-1 text-xs font-semibold p-2">
                    Keterangan
                  </p>
                  <p className="col-span-2 text-xs font-semibold p-2">Detail</p>
                </div>
              </div>

              {/* Items */}
              {stokSparepart.map((item: StokSparepartItem, index: number) => {
                const latestAdjustment = getLatestAdjustment(item.id);

                return (
                  <div key={index} className="flex flex-col w-full">
                    {/* Main row */}
                    <div className="flex w-full gap-2 bg-white my-1 rounded-md p-1">
                      <p className="text-xs font-medium w-10 p-2">
                        {index + 1}
                      </p>
                      <div className="w-full grid grid-cols-12 gap-2">
                        <p className="col-span-2 text-xs font-medium bg-gray-100 p-2">
                          {item.kode}
                        </p>
                        <p className="col-span-2 text-xs font-medium bg-gray-100 p-2">
                          {item.nama_sparepart}
                        </p>
                        <p className="col-span-2 text-xs font-medium bg-gray-100 p-2">
                          {item.lokasi}
                        </p>
                        <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                          {item.grade}
                        </p>
                        <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                          {item.stok}
                        </p>
                        <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                          {latestAdjustment ? latestAdjustment.qty : '-'}
                        </p>
                        <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                          {latestAdjustment ? latestAdjustment.note : '-'}
                        </p>
                        <div className="col-span-2 flex items-center gap-2">
                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                          >
                            {expandedItems[item.id] ? (
                              <>
                                <span>Hide</span>
                                <ChevronUp size={14} className="ml-1" />
                              </>
                            ) : (
                              <>
                                <span>Details</span>
                                <ChevronDown size={14} className="ml-1" />
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => openAdjustModal(item.id)}
                            className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                          >
                            ADJUST
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Adjustment Modal */}
                    {showAdjustModal[item.id] && (
                      <ModalKosongan
                        isOpen={showAdjustModal[item.id]}
                        onClose={() => closeAdjustModal(item.id)}
                        judul="Adjust Stock"
                      >
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-2">Item Details:</p>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Code:</span>{' '}
                                {item.kode}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Name:</span>{' '}
                                {item.nama_sparepart}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">
                                  Current Stock:
                                </span>{' '}
                                {item.stok}
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Quantity Adjustment
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="qty"
                              value={adjustmentData.qty}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                              placeholder="Enter positive or negative number"
                              step="any"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              <strong>Note:</strong> Gunakan angka positif untuk
                              penambahan dan angka negatif untuk pengurangan.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Note
                            </label>
                            <textarea
                              name="note"
                              value={adjustmentData.note}
                              onChange={handleInputChange}
                              className="w-full p-2 border rounded"
                              rows={3}
                              placeholder="Enter a note for this adjustment"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => closeAdjustModal(item.id)}
                              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={submitAdjustment}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {isLoading ? 'Processing...' : 'Save Adjustment'}
                            </button>
                          </div>
                        </div>
                      </ModalKosongan>
                    )}

                    {/* Detail rows */}
                    {expandedItems[item.id] && (
                      <div className="ml-10 bg-gray-50 rounded-md p-2 mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold">
                            Adjustment History
                          </h4>
                        </div>
                        {groupedAdjustments[item.id]?.length > 0 ? (
                          groupedAdjustments[item.id].map(
                            (adjustment: SparepartItem, idx: number) => (
                              <div
                                key={idx}
                                className="mb-2 p-2 bg-white rounded-md shadow-sm"
                              >
                                <div className="grid grid-cols-2 gap-2 mb-1">
                                  <div className="col-span-1">
                                    <p className="text-xs text-gray-600">
                                      User:
                                    </p>
                                    <p className="text-xs font-medium">
                                      {adjustment.user?.nama} (
                                      {adjustment.user?.role})
                                    </p>
                                  </div>
                                  <div className="col-span-1">
                                    <p className="text-xs text-gray-600">
                                      Tanggal Adjustment:
                                    </p>
                                    <p className="text-xs font-medium">
                                      {formatDate(adjustment.tgl_adjusment)}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mt-2">
                                  <div className="col-span-1">
                                    <p className="text-xs text-gray-600">
                                      Stok Terakhir:
                                    </p>
                                    <p className="text-xs font-medium">
                                      {adjustment.stok_terakhir}
                                    </p>
                                  </div>
                                  <div className="col-span-1">
                                    <p className="text-xs text-gray-600">
                                      Adjustment:
                                    </p>
                                    <p className="text-xs font-medium">
                                      {adjustment.pengurangan_penambahan}{' '}
                                      {Math.abs(adjustment.qty)}
                                    </p>
                                  </div>
                                  <div className="col-span-1">
                                    <p className="text-xs text-gray-600">
                                      Status:
                                    </p>
                                    <p className="text-xs font-medium">
                                      {adjustment.status}
                                    </p>
                                  </div>
                                  <div className="col-span-1">
                                    <p className="text-xs text-gray-600">
                                      Keterangan:
                                    </p>
                                    <p className="text-xs font-medium">
                                      {adjustment.note || '-'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No adjustment history found for this item
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </DefaultLayout>
    </>
  );
}

export default Adjustment;
