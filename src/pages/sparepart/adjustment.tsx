import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
  }, []);

  async function getOpname() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/mtc/stokOpname/AdjusmentSparepart`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log('opname 1', res.data);
      setIsLoading(false);
      setOpname(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // Group items by id_stok_sparepart
  const groupedItems: Record<string, SparepartItem[]> = opname?.reduce(
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
  Object.keys(groupedItems).forEach((key: string) => {
    groupedItems[key].sort(
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

  return (
    <>
      <DefaultLayout>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Maintenance &gt; Adjustment
        </p>
        {/* <div className="w-full py-2 rounded-md bg-white p-3 flex gap-5">
          <div className="flex gap-3">
            <p className="text-sm text-primary my-auto">Pilih Bulan:</p>
            <div className="w-44 bg-[#D8EAFF]">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <input
            type="text"
            placeholder="Cari Barang"
            className="w-4/12 bg-[#D8EAFF] rounded-sm px-2"
          />
          <button className="w-2/12 bg-green-600 text-white font-semibold text-xs rounded-md">
            SAVE
          </button>
          <button className="w-2/12 bg-blue-600 text-white font-semibold text-xs rounded-md">
            SUBMIT
          </button>
        </div> */}
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
              {Object.entries(groupedItems).map(
                (
                  [id_stok_sparepart, items]: [string, SparepartItem[]],
                  groupIndex: number,
                ) => {
                  const mainItem = items[0]; // First item in the group (most recent)
                  const id_stok_sparepart_num = parseInt(id_stok_sparepart);

                  return (
                    <div key={groupIndex} className="flex flex-col w-full">
                      {/* Main row */}
                      <div className="flex w-full gap-2 bg-white my-1 rounded-md p-1">
                        <p className="text-xs font-medium w-10 p-2">
                          {groupIndex + 1}
                        </p>
                        <div className="w-full grid grid-cols-12 gap-2">
                          <p className="col-span-2 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.sparepart?.kode}
                          </p>
                          <p className="col-span-2 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.sparepart?.nama_sparepart}
                          </p>
                          <p className="col-span-2 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.sparepart?.lokasi}
                          </p>
                          <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.sparepart?.grade}
                          </p>
                          <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.sparepart?.stok}
                          </p>
                          <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.qty}
                          </p>
                          <p className="col-span-1 text-xs font-medium bg-gray-100 p-2">
                            {mainItem?.note}
                          </p>
                          <div className="col-span-2 flex items-center gap-2">
                            <button
                              onClick={() => toggleDetails(id_stok_sparepart)}
                              className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                            >
                              {expandedItems[id_stok_sparepart] ? (
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
                              onClick={() =>
                                openAdjustModal(id_stok_sparepart_num)
                              }
                              className="uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold py-2 hover:bg-blue-400 border bg-blue-600 border-blue-600 justify-center"
                            >
                              ADJUST
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Adjustment Modal */}
                      {showAdjustModal[id_stok_sparepart] && (
                        <ModalKosongan
                          isOpen={showAdjustModal[id_stok_sparepart]}
                          onClose={() =>
                            closeAdjustModal(id_stok_sparepart_num)
                          }
                          judul="Adjust Stock"
                        >
                          <div className="space-y-4">
                            <div>
                              <p className="font-medium mb-2">Item Details:</p>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm">
                                  <span className="font-medium">Code:</span>{' '}
                                  {mainItem?.sparepart?.kode}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Name:</span>{' '}
                                  {mainItem?.sparepart?.nama_sparepart}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Current Stock:
                                  </span>{' '}
                                  {mainItem?.sparepart?.stok}
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
                                placeholder="Enter quantity (positive for addition, negative for reduction)"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Gunakan angka positif untuk penambahan dan angka
                                negatif untuk pengurangan.
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
                                onClick={() =>
                                  closeAdjustModal(id_stok_sparepart_num)
                                }
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={submitAdjustment}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isLoading
                                  ? 'Processing...'
                                  : 'Save Adjustment'}
                              </button>
                            </div>
                          </div>
                        </ModalKosongan>
                      )}

                      {/* Detail rows */}
                      {expandedItems[id_stok_sparepart] && (
                        <div className="ml-10 bg-gray-50 rounded-md p-2 mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold">
                              Adjustment History
                            </h4>
                          </div>
                          {items.map((item: SparepartItem, index: number) => (
                            <div
                              key={index}
                              className="mb-2 p-2 bg-white rounded-md shadow-sm"
                            >
                              <div className="grid grid-cols-2 gap-2 mb-1">
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600">User:</p>
                                  <p className="text-xs font-medium">
                                    {item.user?.nama} ({item.user?.role})
                                  </p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600">
                                    Tanggal Adjustment:
                                  </p>
                                  <p className="text-xs font-medium">
                                    {formatDate(item.tgl_adjusment)}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-2 mt-2">
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600">
                                    Stok Terakhir:
                                  </p>
                                  <p className="text-xs font-medium">
                                    {item.stok_terakhir}
                                  </p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600">
                                    Adjustment:
                                  </p>
                                  <p className="text-xs font-medium">
                                    {item.pengurangan_penambahan}{' '}
                                    {Math.abs(item.qty)}
                                  </p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600">
                                    Status:
                                  </p>
                                  <p className="text-xs font-medium">
                                    {item.status}
                                  </p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-xs text-gray-600">
                                    Keterangan:
                                  </p>
                                  <p className="text-xs font-medium">
                                    {item.note || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </>
          )}
        </div>
      </DefaultLayout>
    </>
  );
}

export default Adjustment;
