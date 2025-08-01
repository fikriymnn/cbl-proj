import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import { ChevronDown, ChevronUp, X, Search, ArrowUpDown } from 'lucide-react';
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
  const [filteredSparepart, setFilteredSparepart] = useState<
    StokSparepartItem[]
  >([]);
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

  // Search and sort states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'kode' | 'tanggal_adjustment'>('kode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    getOpname();
    getStokSparepart();
  }, []);

  useEffect(() => {
    // Filter and sort data whenever search term, sort criteria, or data changes
    filterAndSortData();
  }, [searchTerm, sortBy, sortOrder, stokSparepart, opname]);

  const filterAndSortData = () => {
    let filtered = [...stokSparepart];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.kode.toLowerCase().includes(search) ||
          item.nama_sparepart.toLowerCase().includes(search) ||
          item.lokasi.toLowerCase().includes(search),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'kode') {
        // Sort by kode (existing logic)
        const numA = a.kode.split('-')[1];
        const numB = b.kode.split('-')[1];
        const numericA = parseInt(numA, 10);
        const numericB = parseInt(numB, 10);

        let comparison = 0;
        if (!isNaN(numericA) && !isNaN(numericB)) {
          comparison = numericA - numericB;
        } else {
          comparison = a.kode.localeCompare(b.kode);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      } else if (sortBy === 'tanggal_adjustment') {
        // Sort by latest adjustment date
        const latestAdjustmentA = getLatestAdjustment(a.id);
        const latestAdjustmentB = getLatestAdjustment(b.id);

        const dateA = latestAdjustmentA
          ? new Date(latestAdjustmentA.tgl_adjusment).getTime()
          : 0;
        const dateB = latestAdjustmentB
          ? new Date(latestAdjustmentB.tgl_adjusment).getTime()
          : 0;

        const comparison = dateA - dateB;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      return 0;
    });

    setFilteredSparepart(filtered);
  };

  async function getStokSparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/stokSparepart`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setStokSparepart(res.data);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (newSortBy: 'kode' | 'tanggal_adjustment'): void => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const clearSearch = (): void => {
    setSearchTerm('');
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
              {/* Search and Sort Controls */}
              <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by kode, nama, or lokasi..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      </button>
                    )}
                  </div>

                  {/* Sort Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSortChange('kode')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        sortBy === 'kode'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Sort by Kode
                      <ArrowUpDown className="h-4 w-4" />
                      {sortBy === 'kode' && (
                        <span className="text-xs">
                          ({sortOrder === 'asc' ? '↑' : '↓'})
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSortChange('tanggal_adjustment')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        sortBy === 'tanggal_adjustment'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Sort by Last Adjustment
                      <ArrowUpDown className="h-4 w-4" />
                      {sortBy === 'tanggal_adjustment' && (
                        <span className="text-xs">
                          ({sortOrder === 'asc' ? '↑' : '↓'})
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Results Info */}
                <div className="mt-3 text-sm text-gray-600">
                  Showing {filteredSparepart.length} of {stokSparepart.length}{' '}
                  items
                  {searchTerm && (
                    <span className="ml-2">for "{searchTerm}"</span>
                  )}
                </div>
              </div>

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
              {filteredSparepart.length === 0 ? (
                <div className="bg-white p-8 text-center text-gray-500 rounded-md">
                  {searchTerm
                    ? 'No items found matching your search.'
                    : 'No items available.'}
                </div>
              ) : (
                filteredSparepart.map(
                  (item: StokSparepartItem, index: number) => {
                    const latestAdjustment = getLatestAdjustment(item.id);

                    return (
                      <div key={item.id} className="flex flex-col w-full">
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
                                <p className="font-medium mb-2">
                                  Item Details:
                                </p>
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
                                  <strong>Note:</strong> Gunakan angka positif
                                  untuk penambahan dan angka negatif untuk
                                  pengurangan.
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
                                  {isLoading
                                    ? 'Processing...'
                                    : 'Save Adjustment'}
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
                  },
                )
              )}
            </>
          )}
        </div>
      </DefaultLayout>
    </>
  );
}

export default Adjustment;
