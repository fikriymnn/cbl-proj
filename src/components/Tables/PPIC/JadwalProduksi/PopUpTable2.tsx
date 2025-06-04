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
  const [semuaTahap, setSemuaTahap] = useState<any>(false);
  const [allJobsData, setAllJobsData] = useState<any[]>([]); // State for all jobs data
  const [joColors, setJoColors] = useState<Map<string, ColorSet>>(new Map()); // State for JO colors

  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(dataMap?.tanggal));
  const [daysList, setDaysList] = useState(generateDays(startDate, 7));

  // Predefined color palette for JOs
  const colorPalette = [
    {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800',
      textSecondary: 'text-red-600',
    },
    {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      textSecondary: 'text-blue-600',
    },
    {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      textSecondary: 'text-green-600',
    },
    {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
      textSecondary: 'text-purple-600',
    },
    {
      bg: 'bg-pink-100',
      border: 'border-pink-300',
      text: 'text-pink-800',
      textSecondary: 'text-pink-600',
    },
    {
      bg: 'bg-indigo-100',
      border: 'border-indigo-300',
      text: 'text-indigo-800',
      textSecondary: 'text-indigo-600',
    },
    {
      bg: 'bg-teal-100',
      border: 'border-teal-300',
      text: 'text-teal-800',
      textSecondary: 'text-teal-600',
    },
    {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
      textSecondary: 'text-orange-600',
    },
    {
      bg: 'bg-cyan-100',
      border: 'border-cyan-300',
      text: 'text-cyan-800',
      textSecondary: 'text-cyan-600',
    },
    {
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      textSecondary: 'text-emerald-600',
    },
    {
      bg: 'bg-violet-100',
      border: 'border-violet-300',
      text: 'text-violet-800',
      textSecondary: 'text-violet-600',
    },
    {
      bg: 'bg-rose-100',
      border: 'border-rose-300',
      text: 'text-rose-800',
      textSecondary: 'text-rose-600',
    },
    {
      bg: 'bg-sky-100',
      border: 'border-sky-300',
      text: 'text-sky-800',
      textSecondary: 'text-sky-600',
    },
    {
      bg: 'bg-lime-100',
      border: 'border-lime-300',
      text: 'text-lime-800',
      textSecondary: 'text-lime-600',
    },
    {
      bg: 'bg-amber-100',
      border: 'border-amber-300',
      text: 'text-amber-800',
      textSecondary: 'text-amber-600',
    },
  ];

  type ColorSet = {
    bg: string;
    border: string;
    text: string;
    textSecondary: string;
  };

  // Function to generate or get color for a JO/booking
  const getJoColor = (joKey: string): ColorSet => {
    if (joColors.has(joKey)) {
      const color = joColors.get(joKey);
      if (color && typeof color === 'object') {
        return color as ColorSet;
      }
    }

    // Generate new color for this JO
    const colorIndex = joColors.size % colorPalette.length;
    const colorSet = colorPalette[colorIndex];

    setJoColors((prev) => new Map(prev.set(joKey, colorSet)));
    return colorSet;
  };

  function generateDays(startDate: Date, daysCount: number) {
    let days = [];
    for (let i = 0; i < daysCount; i++) {
      let day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }

  // Function to fetch jobs based on date range
  const fetchJobsForDateRange = async (startDate: Date, endDate: Date) => {
    const url = `${import.meta.env.VITE_API_LINK}/ppic/jadwalProduksiView`;
    try {
      setIsLoading(true);
      const response = await axios.get(url, {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
        withCredentials: true,
      });

      // Filter jobs to only show same machine
      const filteredJobs = (response.data.data || []).filter((job: any) => {
        return job.mesin === data.mesin;
      });

      setAllJobsData(filteredJobs);

      // Generate colors for all unique JOs
      const uniqueJos = new Set<string>();
      filteredJobs.forEach((job: any) => {
        const joKey = job.no_jo || job.no_booking || 'unknown';
        if (joKey !== 'unknown') {
          uniqueJos.add(joKey);
        }
      });

      // Pre-generate colors for all JOs
      const newColorMap = new Map(joColors);
      Array.from(uniqueJos).forEach((joKey, index) => {
        if (!newColorMap.has(joKey)) {
          const colorIndex = newColorMap.size % colorPalette.length;
          newColorMap.set(joKey, colorPalette[colorIndex]);
        }
      });
      setJoColors(newColorMap);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching jobs data:', error);
      setIsLoading(false);
    }
  };

  // Fetch initial data when component mounts or date range changes
  useEffect(() => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 7 days total
    fetchJobsForDateRange(startDate, endDate);
  }, [startDate, data.mesin]); // Removed data.jam dependency

  // Function to get jobs for a specific day and hour with deduplication
  const getJobsForSlot = (day: Date, hour: string) => {
    const jobsInSlot = allJobsData.filter((job: any) => {
      const jobDate = new Date(job.tanggal);
      return (
        jobDate.toLocaleDateString() === day.toLocaleDateString() &&
        job.jam === hour
      );
    });

    // Group jobs by no_jo and keep only one representative per JO
    const jobsByJO = new Map();

    jobsInSlot.forEach((job: any) => {
      const joKey = job.no_jo || job.no_booking || 'unknown';
      if (!jobsByJO.has(joKey)) {
        jobsByJO.set(joKey, job);
      }
    });

    // Convert map back to array
    return Array.from(jobsByJO.values());
  };

  // Check if current editing job is in this slot
  const isCurrentJobInSlot = (day: Date, hour: string) => {
    return (
      data.jam === hour &&
      new Date(data.tanggal).toLocaleDateString() === day.toLocaleDateString()
    );
  };

  // Handle Next & Prev Date Range
  const handleChangeDateRange = (direction: 'next' | 'prev') => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() + (direction === 'next' ? 7 : -7));

    setStartDate(newStartDate);
    setDaysList(generateDays(newStartDate, 7));
  };

  const handleChangeDate1Day = (direction: 'next' | 'prev') => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(startDate.getDate() + (direction === 'next' ? 1 : -1));

    setStartDate(newStartDate);
    setDaysList(generateDays(newStartDate, 7));
  };

  // Keep all 24 hours for drag and drop functionality
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
          isSemuaTahap: semuaTahap,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      onClose();
      onFinish();
      console.log(response);
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

  return (
    <div className="max-w-full mx-auto p-4">
      {isLoading && <Loading />}
      <h2 className="text-2xl font-bold mb-4">Jadwal Mesin: {data.mesin}</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleChangeDateRange('prev')}
            className="bg-gray-200 text-black px-3 py-2 rounded-md text-sm"
          >
            ⬅️ Prev 7 Days
          </button>
          <button
            onClick={() => handleChangeDate1Day('prev')}
            className="bg-gray-200 text-black px-3 py-2 rounded-md text-sm"
          >
            ⬅️ Prev 1 Day
          </button>
        </div>
        <span className="text-lg font-semibold text-blue-600">
          {convertTimeStampToDate(startDate.toISOString())} -{' '}
          {convertTimeStampToDate(daysList[6].toISOString())}
        </span>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleChangeDateRange('next')}
            className="bg-gray-200 text-black px-3 py-2 rounded-md text-sm"
          >
            Next 7 Days ➡️
          </button>
          <button
            onClick={() => handleChangeDate1Day('next')}
            className="bg-gray-200 text-black px-3 py-2 rounded-md text-sm"
          >
            Next 1 Day ➡️
          </button>
        </div>
      </div>

      {/* Current Job Info */}
      <div className="flex flex-col w-full mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">
          Job Being Edited (Machine: {data.mesin}, Hour:{' '}
          {data.jam?.substring(0, 5)}):
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-black text-xs font-bold">Nomor JO</label>
          <label className="text-[#016ae6] uppercase text-xl font-normal">
            : {data.no_jo}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-black text-xs font-bold">Item</label>
          <label className="text-[#016ae6] uppercase text-xl font-normal">
            : {data.item}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-black text-xs font-bold">Tahapan</label>
          <label className="text-[#016ae6] uppercase text-xl font-normal">
            : {data.tahapan}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-black text-xs font-bold">Qty Druk</label>
          <label className="text-[#016ae6] uppercase text-xl font-normal">
            : {formatInteger(data.qty_druk)}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-black text-xs font-bold">Qty Pcs</label>
          <label className="text-[#016ae6] uppercase text-xl font-normal">
            : {formatInteger(data.qty_pcs)}
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left border border-gray-300">
                Jam
              </th>
              {daysList.map((day, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left border border-gray-300"
                >
                  {day.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hoursList.map((hour) => (
              <tr key={hour} className="border-b">
                <td className="px-4 py-2 font-semibold border border-gray-300 bg-gray-50">
                  {hour.substring(0, 5)}
                </td>
                {daysList.map((day, index) => {
                  const jobsInSlot = getJobsForSlot(day, hour);
                  const isCurrentJob = isCurrentJobInSlot(day, hour);

                  return (
                    <td
                      key={index}
                      className={`px-1 py-1 cursor-pointer min-h-[50px] border border-gray-300 ${
                        isCurrentJob
                          ? 'bg-yellow-200 border-2 border-yellow-400'
                          : ''
                      }`}
                      onDrop={(e) => handleDrop(e, day, hour)}
                      onDragOver={handleDragOver}
                      draggable={isCurrentJob}
                      onDragStart={isCurrentJob ? handleDragStart : undefined}
                    >
                      <div className="space-y-1 min-h-[40px]">
                        {/* Show current job being edited */}
                        {isCurrentJob && (
                          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-center">
                            <div className="font-bold text-yellow-800">
                              ✏️{' '}
                              {data.no_jo || data.no_booking || 'No JO/Booking'}
                            </div>
                            <div className="text-xs text-yellow-600">
                              {data.tahapan} - {data.mesin}
                            </div>
                          </div>
                        )}

                        {/* Show other jobs in this slot (same machine, same hour, unique JO) */}
                        {jobsInSlot
                          .filter((job: any) => job.id !== data.id) // Exclude the job being edited
                          .map((job: any, jobIndex: number) => {
                            const joKey =
                              job.no_jo || job.no_booking || 'unknown';
                            const colorSet = getJoColor(joKey);

                            return (
                              <div
                                key={jobIndex}
                                className={`p-2 ${
                                  colorSet?.bg || 'bg-gray-100'
                                } border ${
                                  colorSet?.border || 'border-gray-300'
                                } rounded text-xs text-center`}
                              >
                                <div
                                  className={`font-semibold ${
                                    colorSet?.text || 'text-gray-800'
                                  }`}
                                >
                                  {job.no_jo ||
                                    job.no_booking ||
                                    'No JO/Booking'}
                                </div>
                                <div
                                  className={`text-xs ${
                                    colorSet?.textSecondary || 'text-gray-600'
                                  }`}
                                >
                                  {job.tahapan} - {job.mesin}
                                </div>
                              </div>
                            );
                          })}

                        {/* Show empty slot */}
                        {jobsInSlot.length === 0 && !isCurrentJob && (
                          <div className="p-2 text-center h-full flex items-center justify-center">
                            <span className="text-xs text-gray-400">-</span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-4 items-center">
        <button
          onClick={() => putJadwalView()}
          className="bg-primary text-white px-5 py-2 rounded-md"
        >
          Simpan
        </button>
        <div className="flex gap-1 items-center">
          <label className="text-sm">Tahap lain ikut berubah?</label>
          <input
            type="checkbox"
            id="checkboxLabelTwo"
            checked={semuaTahap}
            onChange={() => {
              setSemuaTahap(!semuaTahap);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default popUpTable2;
