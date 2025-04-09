import React, { useEffect, useState } from 'react';
import ModalXL from './ModalXL';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';
import PopUpTable from './DragAndDropPopUp';
import ModalFull from './ModalFull';
import PopUpTable2 from './PopUpTable2';

function TampilanDailyJO() {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [mapData, setMapData] = useState<any>([]);

  const today = new Date();
  const [todayDate, setTodayDate] = useState<string>('');
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  useEffect(() => {
    getJadwalView(formattedDate, formattedDate);
    const today = new Date();
    setTodayDate(today.toISOString().split('T')[0]);
    getmasterKategori();
  }, []);
  const [listJO1, setJo1] = useState<any>();
  async function get1Tiket(id: any, i: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setJo1(res.data);
      openCalculate(i);
      setIsLoading(false);
      console.log('listJO 1', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  const [showCalculate, setShowCalculate] = useState<any>([]);
  const openCalculate = (i: any) => {
    const onchangeVal: any = [...showCalculate];
    onchangeVal[i] = true;

    setShowCalculate(onchangeVal);
  };
  const closeCalculate = (i: any) => {
    const onchangeVal: any = [...showCalculate];
    onchangeVal[i] = false;

    setShowCalculate(onchangeVal);
  };
  const getJadwalView = async (tglAwal: any, tglAkhir: any) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params: {
          start_date: tglAwal,
          end_date: tglAkhir,
        },
        withCredentials: true,
      });
      console.log('jadwal view', response.data.data);
      setMapData(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const [listJO, setJo] = useState<any>();
  async function getmasterKategori() {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          status_tiket: 'history',
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setJo(res.data);
      console.log('listJO', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const putMasukJadwal = async (id: any) => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksi/submit/${id}`;
    try {
      setIsLoading(true);
      const response = await axios.put(url, {
        withCredentials: true,
      });
      alert('berhasil');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, '0')}:00:00`,
  );

  const [showModal3, setShowModal3] = useState<any>([]);
  const openModal3 = (i: any) => {
    const onchangeVal: any = [...showModal3];

    onchangeVal[i] = true;

    setShowModal3(onchangeVal);
  };
  const closeModal3 = (i: any) => {
    const onchangeVal: any = [...showModal3];
    onchangeVal[i] = false;

    setShowModal3(onchangeVal);
  };
  const handleNextPrev = (direction: string) => {
    const currentDate = startDate ? new Date(startDate) : new Date(todayDate); // Use selected date or today
    currentDate.setDate(
      currentDate.getDate() + (direction === 'next' ? 1 : -1),
    ); // Increment or decrement by 1 day

    const newDate = currentDate.toISOString().split('T')[0]; // Format the new date to YYYY-MM-DD
    setStartDate(newDate);
    setEndDate(newDate);
    getJadwalView(newDate, newDate);
  };
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const machineList = [
    'R700',
    'SM',
    'GTO',
    'HOCK',
    'WB MANUAL',
    'BAODER',
    'KSB',
    'M1',
    'M2',
    'M3',
    'JK650',
    'JK1000',
    'POLAR',
    'ITOH',
    'LIPAT 1',
    'LIPAT 2',
    'OUTSORCE',
  ];
  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(listJO1 != null && listJO1.length).fill(false),
  );
  const formatCustomDate = (dateString: string) => {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];

    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');

    return `${parseInt(day)} / ${
      months[parseInt(month) - 1]
    } / ${year} - ${timePart.replace(/\./g, ':')}`;
  };
  const [selectedJO, setSelectedJO] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredJobOrder, setHoveredJobOrder] = useState<any>(null);
  return (
    <main className="overflow-x-scroll ' ">
      {isLoading && <Loading />}
      <div className="min-w-[700px]  bg-white rounded-xl flex gap-1  px-4 py-4">
        <>
          <div className="flex w-full flex-col ">
            <div className="flex flex-col gap-3 w-full py-3 border-b-4 border-stroke">
              <div className="flex w-full justify-end">
                <button
                  onClick={() => setIsDetailVisible(!isDetailVisible)}
                  className=" bg-primary text-white font-semibold text-md flex justify-center w-[10%] rounded-md"
                >
                  {isDetailVisible ? 'Hide JO Terjadwal ' : 'Show JO Terjadwal'}
                </button>
              </div>
              <div className="flex flex-col gap-2  w-[30%]">
                <p className="text-sm text-primary font-semibold">Tanggal:</p>
                <input
                  className="rounded-md bg-[#D8EAFF] px-2 h-8"
                  type="date"
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                  }}
                ></input>
              </div>

              <div className="flex ">
                <button
                  onClick={() => {
                    getJadwalView(startDate, endDate);
                  }}
                  className="bg-primary text-white  rounded-md my-auto py-1 px-2"
                >
                  Tampilkan
                </button>
              </div>
              <div className="flex w-full justify-between">
                <button
                  onClick={() => handleNextPrev('prev')}
                  className="bg-primary text-white rounded-md my-auto py-1 px-2"
                >
                  Prev
                </button>

                <button
                  onClick={() => handleNextPrev('next')}
                  className="bg-primary text-white rounded-md my-auto py-1 px-2"
                >
                  Next
                </button>
              </div>
              <label className="text-xl text-blue-400 font-semibold w-full flex justify-center">
                {convertTimeStampToDate(startDate)}
              </label>
            </div>

            <div className="flex w-full flex-col">
              {/* Header Row (Ensures All Machines Are Always Visible) */}
              <div className="flex bg-white border-b-8 border-[#D8EAFF]">
                <p className="text-center text-[#0065de] text-[11px] w-[6%] font-semibold py-[1%]">
                  TIME
                </p>
                {machineList.map((machine, i1) => (
                  <div
                    key={i1}
                    className={`flex w-[6%] justify-center items-center ${
                      i1 % 2 === 1 ? 'bg-white' : 'bg-[#eaf4ff]'
                    }`}
                  >
                    <p className="text-center text-[#0065de] text-[11px] font-semibold">
                      {machine}
                    </p>
                  </div>
                ))}
              </div>

              {/* Rows for Hours and Data */}
              <div className="flex w-full bg-white border-b-8 border-[#D8EAFF] flex-col">
                {hours.map((hour, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex border-b-8 border-[#D8EAFF]"
                  >
                    {/* Hour Column */}
                    <div className="flex w-[6%] py-[1%] justify-center items-center">
                      <p className="text-center text-[#0065de] text-[11px] font-semibold">
                        {hour}
                      </p>
                    </div>

                    {/* Machine Columns (Ensures Data Matches Mesin & Hour) */}
                    {machineList.map((machine, colIndex) => {
                      // Normalize mesin name for flexible matching
                      const normalizeMesin = (mesin: string) => {
                        const lowerMesin = mesin
                          .toLowerCase()
                          .replace(/\s|-/g, ''); // Remove spaces & dashes

                        if (
                          lowerMesin.includes('manual1') ||
                          lowerMesin === 'manual'
                        )
                          return 'M1';
                        if (lowerMesin.includes('manual2')) return 'M2';
                        if (lowerMesin.includes('manual3')) return 'M3';

                        return lowerMesin.toUpperCase(); // Ensure it's in uppercase for consistency
                      };

                      // Find matching data
                      const matchingData = mapData.find(
                        (d: any) =>
                          d.jam === hour && normalizeMesin(d.mesin) === machine, // Direct comparison
                      );

                      return (
                        <div
                          key={colIndex}
                          className={`flex w-[6%] justify-center items-center ${
                            colIndex % 2 === 1 ? 'bg-white' : 'bg-[#eaf4ff]'
                          }`}
                        >
                          {matchingData ? (
                            <button
                              onClick={() => openModal3(matchingData?.id)}
                              onMouseEnter={() =>
                                setHoveredJobOrder(matchingData)
                              }
                              onMouseLeave={() => setHoveredJobOrder(null)}
                              className="text-center text-[#0065de] text-[11px] font-semibold"
                            >
                              {matchingData.no_jo}
                            </button>
                          ) : (
                            <p className="text-[#bbb] text-[11px]">-</p> // Placeholder for empty slot
                          )}

                          {matchingData && showModal3[matchingData?.id] && (
                            <ModalKosongan
                              isOpen={showModal3[matchingData?.id]}
                              onClose={() => closeModal3(matchingData?.id)}
                              judul={'Drag And Drop Edit'}
                            >
                              <PopUpTable2
                                dataMap={mapData.find(
                                  (data: any) => data.id === matchingData?.id,
                                )}
                                onClose={() => closeModal3(matchingData?.id)}
                                onFinish={() =>
                                  getJadwalView(startDate, endDate)
                                }
                                tgl={startDate}
                              />
                            </ModalKosongan>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {isDetailVisible && (
              <div className="fixed right-0 top-7 h-full w-[70%] bg-white shadow-lg p-4 overflow-y-auto rounded-xl ">
                <h2 className="text-lg font-bold mb-4">Job Order List</h2>

                <button
                  onClick={() => setIsDetailVisible(false)}
                  className="text-white font-semibold px-4 py-2 text-sm mt-3 rounded-md bg-red-600"
                >
                  Close
                </button>

                <div className="overflow-x-auto py-2">
                  <table className="w-full border-collapse shadow-lg rounded-md overflow-hidden ">
                    {/* Table Header */}
                    <thead className="bg-blue-500 text-white font-semibold">
                      <tr>
                        <th className="border border-blue-600 px-4 py-2">No</th>
                        <th className="border border-blue-600 px-4 py-2">
                          No JO
                        </th>
                        <th className="border border-blue-600 px-4 py-2">
                          Item
                        </th>
                        <th className="border border-blue-600 px-4 py-2">
                          Qty Druk
                        </th>
                        <th className="border border-blue-600 px-4 py-2">
                          Qty PCS
                        </th>
                        <th className="border border-blue-600 px-4 py-2">
                          Tanggal Kirim
                        </th>
                        <th className="border border-blue-600 px-4 py-2">
                          Action
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {listJO?.data?.length > 0 ? (
                        listJO.data.map((jo: any, index: number) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                            } hover:bg-blue-100 transition duration-200`}
                          >
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              {index + 1}
                            </td>
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              {jo.no_jo}
                            </td>
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              {jo.item}
                            </td>
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              {jo.qty_druk}
                            </td>
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              {jo.qty_pcs}
                            </td>
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              {jo.tgl_kirim}
                            </td>
                            <td className="border border-blue-200 px-4 py-2 text-center">
                              <button
                                onClick={() => {
                                  get1Tiket(jo.id, index); // Call function
                                  setSelectedJO(jo); // Store selected JO
                                  setSelectedIndex(index); // Store index
                                  setIsModalOpen(true); // Open modal
                                }}
                                className="text-[#0065de] text-sm  font-bold"
                              >
                                DETAIL
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-4 text-gray-600"
                          >
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {hoveredJobOrder && (
              <div className="fixed bottom-4 right-4 bg-white s p-4 rounded-md border-2 border-black">
                <h3 className="font-bold text-sm mb-2">Job Order Details</h3>
                <p>Job Order: {hoveredJobOrder.no_jo}</p>
                <p>Item: {hoveredJobOrder.item}</p>
                {/* Add more details as needed */}
              </div>
            )}
          </div>
          {isModalOpen && selectedJO && (
            <ModalXL
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              judul={'Rumus Kalkulasi'}
            >
              <>
                <div className="grid grid-cols-2 gap-2 px-4 py-4  border-b-8 border-[#D8EAFF]">
                  <div className="flex flex-col ">
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Nomor JO
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {selectedJO?.no_jo}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Item
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {selectedJO?.item}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Tanggal Kirim
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {convertTimeStampToDate(selectedJO?.tgl_kirim)}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col ">
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Qty Druk
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {formatInteger(selectedJO?.qty_druk)}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        htmlFor=""
                        className="text-black text-xs font-bold"
                      >
                        Qty Pcs
                      </label>
                      <label
                        htmlFor=""
                        className="text-[#016ae6] uppercase text-xl font-normal"
                      >
                        : {formatInteger(selectedJO?.qty_pcs)}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex overflow-x-scroll max-w-screen border-b-8 border-[#D8EAFF] gap-2 px-4 py-4">
                  <div className="w-[150px] flex flex-col ">
                    <label
                      htmlFor=""
                      className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                    >
                      TAHAPAN
                    </label>
                    <label
                      htmlFor=""
                      className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                    >
                      TANGGAL
                    </label>
                    {showDetail[selectedIndex] && (
                      <>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          KATEGORI
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          DRYING TIME
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          MESIN
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          KAPASITAS/JAM
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          DRYING TIME (JAM)
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          SETTING (JAM)
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          KAPASITAS (JAM)
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          TOLERANSI
                        </label>
                        <label
                          htmlFor=""
                          className="text-black text-xs font-bold border-b-2 border-stroke flex items-center h-[50px]"
                        >
                          TOTAL WAKTU
                        </label>
                      </>
                    )}
                  </div>

                  <div className="flex overflow-x-scroll max-w-screen">
                    {listJO1?.data?.tahap?.map((data2: any, ii: number) => (
                      <>
                        <div
                          key={ii}
                          className="min-w-[150px] flex flex-col justify-center"
                        >
                          <label
                            htmlFor=""
                            className="text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]"
                          >
                            {data2.tahapan}
                          </label>
                          <div className=" justify-center border-2 border-stroke flex items-center h-[50px]">
                            {data2?.jadwal_per_jam?.length == 0 ? (
                              <>
                                <label
                                  htmlFor=""
                                  className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center"
                                >
                                  {formatCustomDate(data2.tgl_from)}
                                </label>
                              </>
                            ) : (
                              <>
                                <button className="text-blue-400 text-xs border-2 px-2 py-1 rounded-md border-blue-400 text-center">
                                  {data2.jadwal_per_jam?.length == 0
                                    ? '-'
                                    : convertTimeStampToDate(
                                        data2.jadwal_per_jam[0]?.tanggal,
                                      )}{' '}
                                  - {data2.jadwal_per_jam[0]?.jam}
                                </button>
                              </>
                            )}
                          </div>
                          {showDetail[selectedIndex] && (
                            <>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center  border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kategory}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kategory_drying_time}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.mesin}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kapasitas_per_jam}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.drying_time}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.setting}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.kapasitas}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.toleransi}
                              </label>
                              <label
                                htmlFor=""
                                className="text-black text-xs justify-center border-2 border-stroke flex items-center h-[50px]"
                              >
                                {data2.total_waktu}
                              </label>
                            </>
                          )}
                        </div>
                      </>
                    ))}
                  </div>
                  <div className="">
                    <button
                      title="button"
                      onClick={() => handleClickDetail(selectedIndex)}
                      className="text-xs w-full flex  font-bold text-white px-1 bg-blue-700 py-2 border-blue-700 border rounded-md"
                    >
                      DETAIL
                    </button>
                  </div>
                </div>
              </>
            </ModalXL>
          )}
        </>
      </div>
    </main>
  );
}

export default TampilanDailyJO;
