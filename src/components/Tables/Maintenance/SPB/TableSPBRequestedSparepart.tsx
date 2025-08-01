import React, { useEffect, useState, useRef } from 'react';
import Filter from '../../../../images/icon/filter.svg';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import ModalSPBService from '../../../Modals/ModalNewSPBService';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import MonitoringSPB from '../../../Modals/MonitoringSPB';
import ModalEditSparepartSPB from '../../../Modals/ModalEditSparepartSPB';
import ModalNoteSPBSparepart from '../../../Modals/ModalNoteSPBSparepart';
import { Pagination, Stack } from '@mui/material';

function TableSPBRequestedSparepart() {
  // State variables
  const [page, setPage] = useState(1);
  const [showModalSPBBaru, setShowModalSPBBaru] = useState(false);
  const [openButton, setOpenButton] = useState(null);
  const [showModalMonitoring, setShowModalMonitoring] = useState(null);
  const [showModalEdit, setShowModalEdit] = useState(null);
  const [showModalCatatan, setShowModalCatatan] = useState(null);
  const [showModalTolak, setShowModalTolak] = useState(null);
  const [spbSparepart, setSpbSparepart] = useState<any>();
  const [updateQty, setUpdateQty] = useState<number>(0);
  const [showUpdateQtyModal, setShowUpdateQtyModal] = useState(null);
  const [userRole, setUserRole] = useState<string>('');

  // Ref for detecting clicks outside the dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal handlers
  const openModalSPBBaru = () => setShowModalSPBBaru(true);
  const closeModalSPBBaru = () => setShowModalSPBBaru(false);

  const closeModalMonitoring = () => {
    setShowModalMonitoring(null);
    // Ensure edit modal is also closed when monitoring is closed
    setShowModalEdit(null);
  };

  const closeModalEdit = () => setShowModalEdit(null);

  const closeModalCatatan = () => {
    setShowModalCatatan(null);
    // Close dropdown menu after action
    setOpenButton(null);
  };

  const closeModalTolak = () => {
    setShowModalTolak(null);
    // Close dropdown menu after action
    setOpenButton(null);
  };

  const closeUpdateQtyModal = () => {
    setShowUpdateQtyModal(null);
    // Close dropdown menu after action
    setOpenButton(null);
  };

  // Button click handlers
  const handleClick = (index: any) => {
    setOpenButton((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickMonitoring = (index: any) => {
    // Close any open dropdown menu
    setOpenButton(null);
    setShowModalMonitoring((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickCatatan = (index: any) => {
    setShowModalCatatan((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickTolak = (index: any) => {
    setShowModalTolak((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickEdit = (index: any) => {
    setShowModalEdit((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleClickUpdateQty = (index: any, qty: number) => {
    setUpdateQty(qty);
    setShowUpdateQtyModal((prevState: any) => {
      return prevState === index ? null : index;
    });
  };

  const handleUpdateQty = async (id: string) => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/spbStokSparepartMonitoringMtc/${id}`;
    try {
      const response = await axios.put(
        url,
        { qty_update: updateQty },
        { withCredentials: true },
      );

      closeUpdateQtyModal();
      getSpbSeparepart();
    } catch (error: any) {
      console.error('Error updating qty:', error.response || error);
    }
  };

  // Handle clicks outside of dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenButton(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getSpbSeparepart();
    getMe();
  }, []);

  // API functions
  async function getSpbSeparepart() {
    const url = `${import.meta.env.VITE_API_LINK}/spbStokSparepart`;
    try {
      const res = await axios.get(url, {
        params: {
          page: page,
          limit: 10,
          status_spb: 'progres',
        },
        withCredentials: true,
      });

      setSpbSparepart(res.data);
      console.log('SPB Sparepart data:', res.data);
    } catch (error: any) {
      console.error('Error fetching sparepart data:', error.response || error);
    }
  }

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      // Set user role from API response
      setUserRole(res.data.role);
    } catch (error: any) {
      console.error('Error fetching user data:', error.response || error);
    }
  }

  // Check if user is authorized to see action buttons
  const isAuthorizedUser = () => {
    return userRole === 'super admin' || userRole === 'section head';
  };

  return (
    <main className="p-4">
      <>
        <div className="bg-gray-50 rounded-lg shadow-sm">
          {/* Header section */}
          <div className="flex flex-row items-center bg-white p-4 rounded-t-lg">
            <div className="flex w-6/12"></div>
            <div className="flex flex-row w-6/12 justify-end">
              <input
                type="search"
                placeholder="Search..."
                className="md:w-[330px] w-40 mx-3 px-4 py-2 bg-[#E9F3FF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={openModalSPBBaru}
                className="bg-green-600 hover:bg-green-700 transition-colors rounded-md text-white font-semibold px-6 py-2"
              >
                SPB BARU
              </button>
              {showModalSPBBaru && (
                <ModalSPBService
                  isOpen={showModalSPBBaru}
                  onClose={closeModalSPBBaru}
                  noSPB={'MT-0001'}
                  tglSpb={'20 MEI 2024'}
                  sumber={'kebutuhan'}
                  data={undefined}
                  onFinish={getSpbSeparepart}
                  idProses={undefined}
                >
                  <p></p>
                </ModalSPBService>
              )}
            </div>
          </div>

          {/* Table header */}
          <div className="flex bg-gray-100 py-3 px-2 border-b border-gray-200 items-center">
            <p className="w-10 px-3 text-gray-600 text-xs font-bold">No</p>
            <div className="grid grid-cols-9 w-full">
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">No. SPB</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Tanggal SPB</p>
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
              <div className="flex gap-2 col-span-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Status</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">Tanggal</p>
                <img className="w-2" src={Polygon6} alt="" />
              </div>
              <div className="flex gap-2 items-center">
                <p className="text-gray-600 text-xs font-bold">
                  Qty Request / Update Qty
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
            <div className="min-w-[700px]">
              {spbSparepart?.data.map((data: any, index: number) => {
                const tglSpb = convertTimeStampToDate(data.tgl_spb);
                const tglPermintaanKedatangan = convertTimeStampToDate(
                  data.tgl_permintaan_kedatangan,
                );

                // Determine status color
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'section head approval':
                      return 'bg-yellow-500';
                    case 'section head verifikasi':
                      return 'bg-blue-500';
                    case 'verifikasi qty mtc':
                      return 'bg-purple-500';
                    default:
                      return 'bg-green-600';
                  }
                };

                return (
                  <div key={`spb-row-${index}`} className="my-1">
                    <section className="flex bg-white hover:bg-gray-50 transition-colors rounded-md px-2 py-3 border-b border-gray-100">
                      <p className="w-10 px-3 text-gray-600 text-xs font-bold py-2">
                        {index + 1}
                      </p>
                      <div className="grid grid-cols-9 w-full items-center">
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
                            {data.stok_sparepart.nama_sparepart}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm line-clamp-1">
                            {data.stok_sparepart.kode}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p
                            className={`text-white ${getStatusColor(
                              data.status_pengajuan,
                            )} px-3 py-1 rounded-full text-xs font-medium inline-block`}
                          >
                            {data.status_pengajuan}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm line-clamp-1">
                            {tglPermintaanKedatangan}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm line-clamp-1">
                            {data.qty}/{data.qty_update || '-'}
                          </p>
                        </div>

                        <div className="flex gap-2 justify-end pr-8 relative">
                          {/* Action buttons */}
                          {isAuthorizedUser() &&
                            (data.status_pengajuan ===
                              'section head approval' ||
                              data.status_pengajuan ===
                                'section head verifikasi' ||
                              data.status_pengajuan ===
                                'verifikasi qty mtc') && (
                              <button
                                onClick={() => handleClick(index)}
                                className="px-4 py-2 bg-[#0065DE] hover:bg-blue-700 transition-colors rounded-md"
                              >
                                <svg
                                  width="4"
                                  height="11"
                                  viewBox="0 0 4 11"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect
                                    width="4"
                                    height="1.90909"
                                    fill="white"
                                  />
                                  <rect
                                    y="4.45312"
                                    width="4"
                                    height="1.90909"
                                    fill="white"
                                  />
                                  <rect
                                    y="8.9082"
                                    width="4"
                                    height="1.90909"
                                    fill="white"
                                  />
                                </svg>
                              </button>
                            )}

                          <button
                            onClick={() => handleClickMonitoring(index)}
                            className="px-3 py-3 bg-[#0065DE] hover:bg-blue-700 transition-colors rounded-md ml-1"
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

                          {/* Popup menu for actions */}
                          {openButton === index && (
                            <div
                              ref={dropdownRef}
                              className="absolute bg-white mt-10 -translate-x-10 p-2 shadow-lg rounded-md z-20 w-32"
                            >
                              <div className="flex flex-col gap-2">
                                {data.status_pengajuan ===
                                  'section head approval' && (
                                  <>
                                    <button
                                      onClick={() => handleClickCatatan(index)}
                                      className="w-full text-sm font-bold bg-green-600 hover:bg-green-700 py-2 text-white rounded-md transition-colors"
                                    >
                                      Terima
                                    </button>
                                    <button
                                      onClick={() => handleClickTolak(index)}
                                      className="w-full text-sm font-bold bg-red-600 hover:bg-red-700 py-2 text-white rounded-md transition-colors"
                                    >
                                      Tolak
                                    </button>
                                  </>
                                )}

                                {data.status_pengajuan ===
                                  'verifikasi qty mtc' && (
                                  <button
                                    onClick={() =>
                                      handleClickUpdateQty(index, data.qty)
                                    }
                                    className="w-full text-sm font-bold bg-blue-600 hover:bg-blue-700 py-2 text-white rounded-md transition-colors"
                                  >
                                    Update Qty
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modals Section - Moved outside the mapping to ensure proper z-index layering */}
          {spbSparepart?.data.map((data: any, index: number) => {
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
                    mesin={data.stok_sparepart.mesin.nama_mesin}
                    qty={data.qty}
                    tanggal_estimasi={tglPermintaanKedatangan}
                    catatan={data.note}
                  >
                    <button
                      onClick={() => handleClickEdit(index)}
                      className="w-full justify-center text-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition-colors"
                    >
                      Edit SPB
                    </button>
                  </MonitoringSPB>
                )}

                {/* Edit Modal */}
                {showModalEdit === index && (
                  <ModalEditSparepartSPB
                    isOpen={showModalEdit !== null}
                    onClose={closeModalEdit}
                    onFinish={getSpbSeparepart}
                    data={data}
                  >
                    <p></p>
                  </ModalEditSparepartSPB>
                )}

                {/* Catatan Modal */}
                {showModalCatatan === index && (
                  <ModalNoteSPBSparepart
                    isOpen={showModalCatatan !== null}
                    onClose={closeModalCatatan}
                    onFinish={getSpbSeparepart}
                    isApprove={true}
                    isValidate={
                      data.status_pengajuan === 'section head approval'
                    }
                    data={data}
                  ></ModalNoteSPBSparepart>
                )}

                {/* Tolak Modal */}
                {showModalTolak === index && (
                  <ModalNoteSPBSparepart
                    isOpen={showModalTolak !== null}
                    onClose={closeModalTolak}
                    onFinish={getSpbSeparepart}
                    isApprove={false}
                    isValidate={
                      data.status_pengajuan === 'section head approval'
                    }
                    data={data}
                  ></ModalNoteSPBSparepart>
                )}

                {/* Update Qty Modal */}
                {showUpdateQtyModal === index && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                      <h3 className="text-lg font-semibold mb-4">
                        Update Quantity
                      </h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Qty: {data.qty}
                        </label>
                        <input
                          type="number"
                          value={updateQty}
                          onChange={(e) => setUpdateQty(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={closeUpdateQtyModal}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateQty(data.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Empty state message */}
          {spbSparepart?.data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data available
            </div>
          )}

          <div className="flex items-center gap-2">
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
        </div>
      </>
    </main>
  );
}

export default TableSPBRequestedSparepart;
