import React, { useEffect, useState } from 'react';
import Loading from '../../../Loading';
import axios from 'axios';
import convertTimeStampToDate from '../../../../utils/convertDate';
import formatInteger from '../../../../utils/formaterInteger';

const popUpTable2 = ({
  dataMap,
  onClose,
  onFinish,
  tgl,
}: {
  dataMap: any;
  onClose: any;
  onFinish: any;
  tgl: any;
}) => {
  // Initialize data with dataMap
  const [data, setData] = useState<any>(dataMap);
  const startDate = new Date(data.tanggal);

  const [isLoading, setIsLoading] = useState(false);
  // Generate a list of 7 days from startDate
  const generateDays = (startDate: any, daysCount: any) => {
    let days = [];
    for (let i = 0; i < daysCount; i++) {
      let day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const [daysList, setDaysList] = useState(generateDays(startDate, 7)); // Initial 7 days
  const hoursList = Array.from(
    { length: 24 },
    (_, index) => `${index.toString().padStart(2, '0')}:00:00`,
  );

  // Handle the drop event to update the data (day and hour)
  const handleDrop = (event: any, newDay: any, newJam: any) => {
    event.preventDefault();
    if (
      data.jam !== newJam ||
      newDay.toISOString() !== new Date(data.tanggal).toISOString()
    ) {
      setData((prevData: any) => ({
        ...prevData,
        tanggal: newDay.toISOString(),
        jam: newJam,
      }));
    }
  };

  // Handle the drag start event to store the dragged item data
  const handleDragStart = (e: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data));
  };

  // Allow the drop by preventing the default event action
  const handleDragOver = (event: any) => {
    event.preventDefault();
  };
  const putJadwalView = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView/${
      data.id
    }`;
    try {
      setIsLoading(true);
      const response = await axios.put(
        url,
        {
          data_jadwal: data,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      onClose();
      onFinish();
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const lemburOneDay = async () => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/ppic/jadwalProduksiView/lembur/${data.id}`;
    try {
      setIsLoading(true);
      const response = await axios.put(
        url,
        {
          data_jadwal: data,
          tgl_lembur: tgl,
        },
        {
          withCredentials: true,
        },
      );
      onClose();
      onFinish();
      alert('berhasil');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Whenever data changes (due to drag and drop), we can call any function here if needed (e.g., to update the API).
  }, []);

  return (
    <div className="max-w-full mx-auto p-4">
      {isLoading && <Loading />}
      <h2 className="text-2xl font-bold mb-4">Jadwal Mesin: {data.mesin}</h2>
      <div className="flex flex-col w-[50%]">
        <div className="grid grid-cols-2 gap-2">
          <label htmlFor="" className="text-black text-xs font-bold">
            Nomor JO
          </label>
          <label
            htmlFor=""
            className="text-[#016ae6] uppercase text-xl font-normal"
          >
            : {data.no_jo}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label htmlFor="" className="text-black text-xs font-bold">
            Item
          </label>
          <label
            htmlFor=""
            className="text-[#016ae6] uppercase text-xl font-normal"
          >
            : {data.item}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label htmlFor="" className="text-black text-xs font-bold">
            Qty Druk
          </label>
          <label
            htmlFor=""
            className="text-[#016ae6] uppercase text-xl font-normal"
          >
            : {formatInteger(data.qty_druk)}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label htmlFor="" className="text-black text-xs font-bold">
            Qty Pcs
          </label>
          <label
            htmlFor=""
            className="text-[#016ae6] uppercase text-xl font-normal"
          >
            : {formatInteger(data.qty_pcs)}
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Jam</th>
              {daysList.map((day, index) => (
                <th key={index} className="px-4 py-2 text-left">
                  {day.toLocaleDateString()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hoursList.map((hour) => (
              <tr key={hour} className="border-b">
                <td className="px-4 py-2">{hour}</td>
                {daysList.map((day, index) => (
                  <td
                    key={index}
                    className={`px-4 py-2 cursor-pointer ${
                      data.jam === hour &&
                      new Date(data.tanggal).toLocaleDateString() ===
                        day.toLocaleDateString()
                        ? 'bg-green-200'
                        : ''
                    }`}
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onDragOver={handleDragOver}
                    draggable
                    onDragStart={handleDragStart}
                  >
                    {data.jam === hour &&
                    new Date(data.tanggal).toLocaleDateString() ===
                      day.toLocaleDateString() ? (
                      <div className="p-2 bg-blue-100 border border-blue-300 rounded-md">
                        <h4 className="text-xs">No Jo: {data.no_jo}</h4>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            lemburOneDay();
          }}
          className="bg-primary text-white px-5 py-2 rounded-md my-auto mt-4"
        >
          Lembur
        </button>
        <button
          onClick={() => putJadwalView()}
          className="bg-primary text-white px-5 py-2 rounded-md my-auto mt-4"
        >
          Simpan
        </button>
      </div>
    </div>
  );
};

export default popUpTable2;
