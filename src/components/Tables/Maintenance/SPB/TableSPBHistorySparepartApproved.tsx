import React, { useEffect, useState } from 'react';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import MonitoringSPB from '../../../Modals/MonitoringSPB';
import { Pagination, Stack } from '@mui/material';

interface SPBSparepartData {
  total_page: number;
  data: Array<any>;
}

function TableHistorySparepartApproved() {
  // State variables
  const [page, setPage] = useState(1);
  const [showModalMonitoring, setShowModalMonitoring] = useState(null);
  const [spbSparepart, setSpbSparepart] = useState<SPBSparepartData | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal handlers
  const closeModalMonitoring = () => {
    setShowModalMonitoring(null);
  };

  // Button click handlers
  const handleClickMonitoring = (index: any) => {
    setShowModalMonitoring((prevState) => {
      return prevState === index ? null : index;
    });
  };

  useEffect(() => {
    getSpbSeparepart();
  }, [page]);

  // API functions
  async function getSpbSeparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/spbStokSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          status_spb: 'done',
        },
        withCredentials: true,
      });

      setSpbSparepart(res.data);
      console.log('SPB Sparepart history data:', res.data);
    } catch (error) {
      console.error('Error fetching sparepart history data:', error || error);
    }
  }

  // Handle search input change
  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: any) => {
    setStatusFilter(e.target.value);
  };

  // Filter data based on search query and status filter
  const filteredData = spbSparepart?.data?.filter((item) => {
    // First apply text search filter
    const matchesSearch =
      !searchQuery ||
      item.no_spb?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stok_sparepart?.nama_sparepart
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.stok_sparepart?.kode
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.status_pengajuan
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      String(item.qty).includes(searchQuery.toLowerCase());

    // Then apply status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'rejected' &&
        item.status_pengajuan === 'spb rejected') ||
      (statusFilter === 'done' && item.status_pengajuan === 'done');

    return matchesSearch && matchesStatus;
  });

  // Determine status color
  const getStatusColor = (status: any) => {
    switch (status) {
      case 'section head approval':
        return 'bg-yellow-500';
      case 'section head verifikasi':
        return 'bg-blue-500';
      case 'verifikasi qty mtc':
        return 'bg-purple-500';
      case 'done':
        return 'bg-green-600';
      case 'completed':
        return 'bg-green-600';
      case 'rejected':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Determine status_pengajuan color
  const getPengajuanStatusColor = (status: any) => {
    switch (status) {
      case 'done':
        return 'bg-green-600';
      case 'spb rejected':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <main className="p-4">
      <>
        <div className="bg-gray-50 rounded-lg shadow-sm">
          {/* Header section */}
          <div className="flex flex-col md:flex-row items-center bg-white p-4 rounded-t-lg">
            <div className="flex flex-row w-full justify-between gap-3 md:justify-end items-center">
              <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                >
                  <option value="all">All Statuses</option>
                  <option value="done">Done</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="md:w-[330px] w-full px-4 py-2 bg-[#E9F3FF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table header - Desktop */}
          <div className="hidden md:flex bg-gray-100 py-3 px-2 items-center">
            <p className="w-10 px-3 text-gray-600 text-xs font-bold">No</p>
            <div className="grid grid-cols-10 w-full">
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">No. SPB</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Tanggal SPB</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Tanggal+PO</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">
                  Tanggal Estimasi
                </p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Nama Barang</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Kode Part</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Qty</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Status SPB</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">
                  Status Pengajuan
                </p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 pr-8 items-center justify-end">
                <p className="text-gray-600 text-xs font-bold">Action</p>
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            {filteredData?.map((data, index) => {
              const tglSpb = convertTimeStampToDate(data.tgl_spb);
              const tglPO = data.tgl_po
                ? convertTimeStampToDate(data.tgl_po)
                : '-';
              const tglEstimasi = convertTimeStampToDate(
                data.tgl_permintaan_kedatangan,
              );

              return (
                <div key={`spb-row-${index}`} className="my-1">
                  {/* Desktop view */}
                  <section className="hidden md:flex bg-white hover:bg-gray-50 transition-colors rounded-md px-2 py-3">
                    <p className="w-10 px-3 text-gray-600 text-xs font-bold py-2">
                      {index + 1}
                    </p>
                    <div className="grid grid-cols-10 w-full items-center">
                      <div>
                        <p className="text-gray-700 text-sm font-medium line-clamp-1">
                          {data.no_spb}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {tglSpb}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {tglPO}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {tglEstimasi}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {data.stok_sparepart.nama_sparepart}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {data.stok_sparepart.kode}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {data.qty}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-white ${getStatusColor(
                            data.status_spb,
                          )} px-3 py-1 rounded-full text-xs font-medium inline-block`}
                        >
                          {data.status_spb}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-white ${getPengajuanStatusColor(
                            data.status_pengajuan,
                          )} px-3 py-1 rounded-full text-xs font-medium inline-block`}
                        >
                          {data.status_pengajuan}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end pr-8">
                        <button
                          onClick={() => handleClickMonitoring(index)}
                          className="px-3 py-3 bg-[#0065DE] hover:bg-blue-700 transition-colors rounded-md"
                          title="View Monitoring SPB"
                        >
                          <svg
                            width="15"
                            height="10"
                            viewBox="0 0 15 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14 9L7.64444 2L1 9"
                              stroke="white"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Mobile view - Card layout */}
                  <section className="md:hidden bg-white rounded-lg shadow-sm mb-4 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-sm">{data.no_spb}</h3>
                        <p className="text-xs text-gray-500">{tglSpb}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p
                          className={`text-white ${getStatusColor(
                            data.status_spb,
                          )} px-2 py-1 rounded-full text-xs font-medium`}
                        >
                          {data.status_spb}
                        </p>
                        <p
                          className={`text-white ${getPengajuanStatusColor(
                            data.status_pengajuan,
                          )} px-2 py-1 rounded-full text-xs font-medium`}
                        >
                          {data.status_pengajuan}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Nama Barang</p>
                        <p className="text-sm font-medium line-clamp-1">
                          {data.stok_sparepart.nama_sparepart}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kode Part</p>
                        <p className="text-sm font-medium line-clamp-1">
                          {data.stok_sparepart.kode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Qty</p>
                        <p className="text-sm font-medium">{data.qty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Estimasi</p>
                        <p className="text-sm font-medium line-clamp-1">
                          {tglEstimasi}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleClickMonitoring(index)}
                        className="px-3 py-2 bg-[#0065DE] hover:bg-blue-700 transition-colors rounded-md text-white text-xs font-medium flex items-center gap-1"
                      >
                        <span>Monitoring</span>
                        <svg
                          width="12"
                          height="8"
                          viewBox="0 0 15 10"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 9L7.64444 2L1 9"
                            stroke="white"
                            strokeWidth="2.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </section>
                </div>
              );
            })}
          </div>

          {/* Modals Section */}
          {spbSparepart?.data.map((data, index) => {
            const tglSpb = convertTimeStampToDate(data.tgl_spb);
            const tglPermintaanKedatangan = convertTimeStampToDate(
              data.tgl_permintaan_kedatangan,
            );

            return (
              <React.Fragment key={`modal-container-${index}`}>
                {/* Monitoring Modal */}
                {showModalMonitoring === index && (
                  <MonitoringSPB
                    isOpen={showModalMonitoring !== null}
                    onClose={closeModalMonitoring}
                    status={data.status_pengajuan}
                    waktu_tiket_masuk={tglSpb}
                    pelapor={data.pelapor.nama}
                    kode_part={data.stok_sparepart.kode}
                    nama_barang={data.stok_sparepart.nama_sparepart}
                    mesin={data.stok_sparepart.mesin?.nama_mesin || '-'}
                    qty={data.qty}
                    tanggal_estimasi={tglPermintaanKedatangan}
                    catatan={data.note}
                  >
                    <p></p>
                  </MonitoringSPB>
                )}
              </React.Fragment>
            );
          })}

          {/* Empty state message */}
          {(!filteredData || filteredData.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No history data available
            </div>
          )}

          {/* Pagination */}
          {spbSparepart && spbSparepart.total_page > 0 && (
            <div className="flex items-center justify-center py-4 ">
              <Stack spacing={2}>
                <Pagination
                  count={spbSparepart?.total_page}
                  color="primary"
                  page={page}
                  onChange={(e, i) => {
                    setPage(i);
                  }}
                />
              </Stack>
            </div>
          )}
        </div>
      </>
    </main>
  );
}

export default TableHistorySparepartApproved;
