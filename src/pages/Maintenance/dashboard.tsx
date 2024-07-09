import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import CardDataStats from '../../components/CardDataStats';
import Production from '../../images/icon/production.svg';
import ApexCharts from 'apexcharts';
import DoughnutCart from '../../../src/components/Charts/DoughnutChart';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import BarChartVertical from '../UiElements/BarChartVertical';
import axios from 'axios';

function Dashboard() {
  const [defectOs2, setDefectOs2] = useState();
  const [QcProblemOs2, setQcProblemOs2] = useState();
  const [ProdProblemOs2, setProdProblemOs2] = useState();
  useEffect(() => {
    getMesinProblem();
  }, []);

  async function getMesinProblem() {
    const url = `${import.meta.env.VITE_API_LINK}/dashboardMtc/mesinProblem`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setDefectOs2(res.data.defectOs2);
      setQcProblemOs2(res.data.qcProblemOs2);
      setProdProblemOs2(res.data.prodProblemMesinOs2);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  return (
    <DefaultLayout>
      <>
        <main>
          <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
            Maintenance &gt; Overview Dashboard
          </p>
          <div className="flex md:flex-row flex-col gap-3">
            <div className="flex bg-white rounded-md shadow-md md:w-3/12">
              <div className="flex justify-center items-center py-3 pl-3">
                <p className="text-sm text-primary">Work Type:</p>
              </div>

              <div className="flex justify-center items-center">
                <div className="relative z-20 bg-[#D8EAFF] rounded-md dark:bg-form-input  w-40 m-3">
                  <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    ></svg>
                  </span>

                  <select
                    className={`relative text-primary font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                  >
                    <option value="d" className="text-body dark:text-bodydark">
                      All
                    </option>
                    <option value="N" className="text-body dark:text-bodydark">
                      Production
                    </option>
                    <option value="O" className="text-body dark:text-bodydark">
                      Quality
                    </option>
                  </select>

                  <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md shadow-md md:w-9/12 flex flex-col md:flex-row p-3 md:gap-10 gap-2">
              <div className="flex items-center justify-center ">
                <p className="text-primary text-sm font-bold">Filter Tanggal</p>
              </div>
              <div className="flex md:justify-center items-center gap-2">
                <p className="text-sm text-primary font-medium md:w-3/12 w-2/12">
                  Dari:
                </p>
                <div className="w-44 bg-[#D8EAFF]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="flex md:justify-center items-center gap-2">
                <p className="text-sm text-primary font-medium md:w-3/12 w-2/12">
                  Sampai:
                </p>
                <div className="w-44 bg-[#D8EAFF]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white flex md:flex-row flex-col gap-10    my-3 w-full">
            <div className="p-5">
              <div className="flex gap-3 p-3">
                <img src={Production} alt="Logo" />

                <p className="text-[14px] text-[#0065DE]">
                  Preventive Maintenance Overview
                </p>
              </div>
              <div className="p-3 flex justify-center">
                <DoughnutCart />
              </div>
            </div>
            <div className="p-5">
              <div className="flex gap-3 p-3">
                <img src={Production} alt="Logo" />

                <p className="text-[14px] text-[#0065DE]">
                  Corrective Maintenance Overview
                </p>
              </div>
              <div className="p-3 flex justify-center">
                <DoughnutCart />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5">
            <div className="bg-white rounded-md md:w-9/12 flex flex-col md:flex-row p-3 md:gap-10 gap-2">
              <div className="flex items-center justify-center ">
                <p className="text-primary text-sm font-bold">Filter Tanggal</p>
              </div>
              <div className="flex md:justify-center items-center gap-2">
                <p className="text-sm text-primary font-medium md:w-3/12 w-2/12">
                  Dari:
                </p>
                <div className="w-44 bg-[#D8EAFF]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="flex md:justify-center items-center gap-2">
                <p className="text-sm text-primary font-medium md:w-3/12 w-2/12">
                  Sampai:
                </p>
                <div className="w-44 bg-[#D8EAFF]">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      slotProps={{
                        textField: { fullWidth: true, size: 'small' },
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
            <div className="md:grid grid-cols-2 gap-5 px-10 pb-10 pt-5">
              <div className="">
                <div className="flex gap-3 p-3">
                  <img src={Production} alt="Logo" />

                  <p className="text-[14px] text-[#0065DE]">Defect</p>
                </div>
                <BarChartVertical value={defectOs2} />
              </div>
              <div className="">
                <div className="flex gap-3 p-3">
                  <img src={Production} alt="Logo" />

                  <p className="text-[14px] text-[#0065DE]">Breakdown Time</p>
                </div>
                <BarChartVertical value={defectOs2} />
              </div>
              <div className="">
                <div className="flex gap-3 p-3">
                  <img src={Production} alt="Logo" />

                  <p className="text-[14px] text-[#0065DE]">Quality Defect</p>
                </div>
                <BarChartVertical value={QcProblemOs2} />
              </div>
              <div className="">
                <div className="flex gap-3 p-3">
                  <img src={Production} alt="Logo" />

                  <p className="text-[14px] text-[#0065DE]">
                    Production Defect
                  </p>
                </div>
                <BarChartVertical value={ProdProblemOs2} />
              </div>
            </div>
          </div>
        </main>
      </>
    </DefaultLayout>
  );
}

export default Dashboard;
