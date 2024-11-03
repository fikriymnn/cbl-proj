import React, { useEffect, useState } from 'react';

import axios from 'axios';
import StaffCalendar from './StaffCalendar';


function StaffKalenderKerja() {


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
                <div className="bg-white w-full mb-5 rounded-md p-3">
                    <StaffCalendar data={nationalHolidays} />

                </div>
                <div className=' w-full bg-white rounded-md flex border-b-8 border-[#D8EAFF] py-4 px-9 '>
                    <label className='text-[#0065de] text-[13px] font-bold'>PERMINTAAN RENCANA KERJA</label>
                </div>
            </main>
        </>
    );
}

export default StaffKalenderKerja;
