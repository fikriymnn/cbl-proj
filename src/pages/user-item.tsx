import React, { useEffect, useState } from 'react';

const popUpTable = ({ dataMap }: { dataMap: any }) => {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const startDate = new Date(formattedDate);

    // Initialize data with dataMap
    const [data, setData] = useState<any>(dataMap);

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
    const hoursList = Array.from({ length: 24 }, (_, index) => `${index.toString().padStart(2, '0')}:00:00`);

    // Handle the drop event to update the data (day and hour)
    const handleDrop = (event: any, newDay: any, newJam: any) => {
        event.preventDefault();
        if (data.jam !== newJam || newDay.toISOString() !== new Date(data.tanggal).toISOString()) {
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

    useEffect(() => {
        // Whenever data changes (due to drag and drop), we can call any function here if needed (e.g., to update the API).
        console.log('Data updated: ', data);
    }, [data]);

    return (
        <div className="max-w-full mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Jadwal Mesin: {data.mesin}</h2>
            <p className="text-lg mb-4">Tanggal: {new Date(data.tanggal).toLocaleDateString()}</p>

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
                                        className={`px-4 py-2 cursor-pointer ${data.jam === hour &&
                                            new Date(data.tanggal).toLocaleDateString() === day.toLocaleDateString()
                                            ? 'bg-green-200'
                                            : ''
                                            }`}
                                        onDrop={(e) => handleDrop(e, day, hour)}
                                        onDragOver={handleDragOver}
                                        draggable
                                        onDragStart={handleDragStart}
                                    >
                                        {data.jam === hour && new Date(data.tanggal).toLocaleDateString() === day.toLocaleDateString() ? (
                                            <div className="p-2 bg-blue-100 border border-blue-300 rounded-md">
                                                <h4 className="text-sm">Mesin: {data.mesin}</h4>
                                                <p className="text-xs">Tanggal: {new Date(data.tanggal).toLocaleDateString()}</p>
                                                <p className="text-xs">Jam: {data.jam}</p>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">Kosong</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default popUpTable;


