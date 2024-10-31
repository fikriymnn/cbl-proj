import React, { useEffect, useState } from 'react';

import axios from 'axios';
import StaffCalendar from './StaffCalendar';


function StaffKalenderKerja() {

    const tukarHari = [
        {
            nik: 123,
            jadwal: '1 Agustus 2024',
            permintaan: '2 Agustus 2024',
            mark: 'Produksi 1',

        },
        {
            nik: 124,
            jadwal: '3 Agustus 2024',
            permintaan: '4 Agustus 2024',
            mark: 'Produksi 2',

        },
        {
            nik: 125,
            jadwal: '6 Agustus 2024',
            permintaan: '7 Agustus 2024',
            mark: 'Produksi 2',

        }
    ]

    const [nationalHolidays, setNationalHolidays] = useState<any[]>([])
    useEffect(() => {
        getFinalInspection();

    }, []);

    const [libur, setLibur] = useState<any>([]);

    async function getFinalInspection() {
        const url = `https://api-harilibur.vercel.app/api`;
        try {
            const res = await axios.get(url, {

            });
            const filteredHolidays = res.data.filter(
                (holiday: any) => holiday.is_national_holiday === true
            );
            setNationalHolidays(filteredHolidays);
            setLibur(res.data)
            console.log(res.data);
        } catch (error: any) {
            console.log(error);
        }
    }
    return (
        <>
            <main>
                <div className="bg-white w-full mb-5 rounded-md p-3 flex flex-col justify-center items-center gap-3">
                    <label className="text-blue-500 text-xl font-semibold">
                        KALENDER STAFF
                    </label>
                    <StaffCalendar data={nationalHolidays} />

                </div>
                <div className=' w-full bg-white rounded-md flex flex-col border-b-8 border-[#D8EAFF]   '>
                    <div className="grid grid-cols-12 items-center px-3 py-4  gap-2 w-full border-b-8 border-[#D8EAFF]">
                        <label className="text-neutral-500 text-sm font-semibold">
                            No
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-3">
                            Jadwal Awal
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-3">
                            Permintaan
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Mark
                        </label>
                    </div>

                    {tukarHari != null &&
                        tukarHari.map((data: any, i: any) => (
                            <>
                                <div className="grid grid-cols-12 items-center px-3 py-2  gap-2 w-full border-b-8 border-[#D8EAFF]">
                                    <label className="text-neutral-500 text-sm font-semibold">
                                        {i + 1}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                        {data.jadwal}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                        {data.permintaan}
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold col-span-3">
                                        {data.mark}
                                    </label>
                                    <button className='px-6 py-2 bg-blue-600 text-white text-md rounded-md font-semibold col-span-2'>
                                        Action
                                    </button>
                                </div>
                            </>
                        )
                        )}

                </div>
            </main >
        </>
    );
}

export default StaffKalenderKerja;
