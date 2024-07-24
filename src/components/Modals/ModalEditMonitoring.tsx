import axios from 'axios';
import React, { useState } from 'react'

const ModalEditMonitoring = ({ children, isOpen, onClose, idMonitoring, data, onFinish }:
    {
        children: any, isOpen: any, onClose: any, idMonitoring: any, data: any, onFinish: any

    }) => {

    if (!isOpen) return null;

    const [waktu, setWaktu] = useState(data.waktu);
    const [jenis, setJenis] = useState(data.jenis)
    const [skor, setSkor] = useState(data.minimal_skor);

    async function submitEDitMonitoring(id: number) {
        const url = `${import.meta.env.VITE_API_LINK}/master/waktuMonitoring/${id}`;

        try {
            const res = await axios.put(
                url,
                {
                    waktu: waktu,
                    jenis: jenis,
                    minimal_skor: skor

                },
                {
                    withCredentials: true,
                },
            );

            alert("Data Berhasil Di-Update");
            onFinish();
            onClose()
        } catch (error: any) {
            console.log(error);
            //alert(error.data.msg);
        }
    }

    return (
        <div className="fixed z-50 inset-0 h-full backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-md max-h-screen ">
                <div className="flex w-full items-center pt-4 px-3">

                    <svg
                        className='flex w-12'
                        width="20"
                        height="19"
                        viewBox="0 0 20 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z" stroke="#0065DE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <label className='flex w-11/12 text-blue-700 text-sm font-bold '>Form Edit Monitoring</label>
                    <button type="button" onClick={onClose} className="text-gray-400 focus:outline-none">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="11" fill="#0065DE" />
                            <rect x="6.03955" y="4.23242" width="17" height="3" rx="1.5" transform="rotate(42.8321 6.03955 4.23242)" fill="white" />
                            <rect x="4.18213" y="16.0609" width="17" height="3" rx="1.5" transform="rotate(-45 4.18213 16.0609)" fill="white" />
                        </svg>
                    </button>
                </div>
                <div className='flex flex-row '>
                    <div className='flex flex-col w-full justify-start dark:border-strokedark  px-4 py-2 gap-2'>
                        <p className="text-neutral-500  text-sm font-semibold text-start dark:text-white">Waktu :</p>
                        <input type='text'
                            defaultValue={waktu}
                            onChange={(e) => setWaktu(e.target.value)}
                            className='border-2 h-8 border-stroke rounded-md ' />
                        <div>
                            <p className="text-neutral-500  text-sm font-semibold text-start dark:text-white">Jenis :</p>
                            <select
                                className='`text-neutral-500  text-sm font-semibold relative z-20 w-full h-8  appearance-none rounded-md border-2 border-stroke  bg-transparent py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'
                                defaultValue={jenis}
                                onChange={(e) => setJenis(e.target.value)}>
                                <option value="" disabled className='text-neutral-500  text-sm font-semibold'>Pilih Jenis</option>
                                <option value="weeks" className='text-neutral-500  text-sm font-semibold'>Weeks</option>
                                <option value="months" className='text-neutral-500  text-sm font-semibold'>Months</option>

                            </select>
                            {/* <span className="absolute left-1/2 top-30 z-50 ">
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill="#637381"
                                        ></path>
                                    </g>
                                </svg>
                            </span> */}
                        </div>

                        {/* <input type='text'
                            defaultValue={jenis.jenis}
                            onChange={(e) => handleChangejenis(e)}
                            className='border-2 h-8 border-stroke rounded-md ' /> */}

                        <p className="text-neutral-500  text-sm font-semibold text-start">Minimal Skor :</p>
                        <input type='text'
                            defaultValue={skor}
                            onChange={(e) => setSkor(e.target.value)}
                            className='border-2 h-8 border-stroke rounded-md' />
                    </div>


                </div>
                <div className='flex flex-row w-full justify-end px-4 py-2'>
                    <button onClick={() => submitEDitMonitoring(idMonitoring)}
                        className='bg-blue-600 rounded-md text-white text-xs font-bold px-10 py-3'>
                        SIMPAN
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ModalEditMonitoring
