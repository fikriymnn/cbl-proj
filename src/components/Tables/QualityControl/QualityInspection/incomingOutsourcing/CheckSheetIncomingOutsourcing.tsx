import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';

function ChecksheetRusakSebagian() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [FinalInspection, setFinalInspection] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();

  useEffect(() => {
    getFinalInspection();
  }, []);

  async function getFinalInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiFinal/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setFinalInspection(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskFinal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinalPoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskRabut(
    id: number,
    startTime: any,
    catatan: any,
    qty_pallet: any,
    data_defect: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinalPoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          qty_pallet,
          data_defect,
        },
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinalPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_rabut: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinal/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          catatan: Catatan,
        },
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function pendingRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiFinal/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getFinalInspection();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.data.inspeksi_rabut_point[i].inspeksi_rabut_defect[ii][name] =
      value;
    setFinalInspection(onchangeVal);
  };

  const handleChangeRabutPoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = FinalInspection;
    onchangeVal.data.inspeksi_rabut_point[i][name] = value;
    setFinalInspection(onchangeVal);
    console.log(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(FinalInspection?.data?.tanggal);
  const jam = convertDateToTime(FinalInspection?.data?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(FinalInspection?.data?.waktu_check);

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-hidden">
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z"
                  fill="#0065DE"
                />
              </svg>{' '}
             Barang Rusak Sebagian Checksheet
            </p>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. JO
                </label>
               

                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>
                
                <label className="text-neutral-500 text-sm font-semibold">
                Jumlah Druk
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Outsourcing
                </label>
               
              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
               
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.no_jo}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.jumlah_druk}
                </label>
                <input type="text" name="" className='border' id="" />
                
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis
                </label>
               <label htmlFor=""></label>
                <label className="text-neutral-500 text-sm font-semibold">
                 Waktu Sortir
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  dropdown
                </label>
                <div className='flex flex-col'>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss" />
            <label  className='mr-2' htmlFor="ss">Sesuai</label>
            </div>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss1" />
            <label className='mr-2' htmlFor="ss1">Tidak Sesuai</label>
            </div>
          </div>
         
                <label className="text-neutral-500 text-sm font-semibold">
                : dropdown
                </label>
               
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Inspector
                </label>

                
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
               
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.inspector}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            
          </div>
         <div className='bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2'>
          <p className='w-20'>No</p>
          <div className='grid grid-cols-5 w-full'>

          <p>Point Check</p>
          <p>Standar</p>
          <p>Hasil Point</p>
          </div>
         </div>
         <div className='bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2'>
          <p className='w-20 my-auto'>1</p>
          <div className='grid grid-cols-5 items-center w-full'>

          <p>Warna</p>
          <p className=''>Color Tolerance</p>
          <div className='flex flex-col'>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss" />
            <label  className='mr-2' htmlFor="ss">Sesuai</label>
            </div>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss1" />
            <label className='mr-2' htmlFor="ss1">Tidak Sesuai</label>
            </div>
          </div>
          <div>
            <input type="file" name="" id="" />
          </div>
          </div>
         </div>
         <div className='bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2'>
          <p className='w-20 my-auto'>2</p>
          <div className='grid grid-cols-5 items-center w-full'>

          <p>Warna</p>
          <p className=''>Color Tolerance</p>
          <div className='flex flex-col'>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss" />
            <label  className='mr-2' htmlFor="ss">Sesuai</label>
            </div>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss1" />
            <label className='mr-2' htmlFor="ss1">Tidak Sesuai</label>
            </div>
          </div>
          <div>
            <input type="file" name="" id="" />
          </div>
          </div>
         </div>
         <div className='bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2'>
          <p className='w-20 my-auto'>3</p>
          <div className='grid grid-cols-5 items-center w-full'>

          <p>Warna</p>
          <p className=''>Color Tolerance</p>
          <div className='flex flex-col'>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss" />
            <label  className='mr-2' htmlFor="ss">Sesuai</label>
            </div>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss1" />
            <label className='mr-2' htmlFor="ss1">Tidak Sesuai</label>
            </div>
          </div>
          <div>
            <input type="file" name="" id="" />
          </div>
          </div>
         </div>
         <div className='bg-white mb-2text-sm flex font-semibold px-5 py-2 mb-2'>
         
          <div className='grid grid-cols-5 gap-5 items-center w-full'>
<div className='col-span-3'>
  <p>catatan*:</p>
  <textarea name="" id="" className='w-full border'></textarea>
</div>
<div className='flex flex-col'>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss" />
            <label  className='mr-2' htmlFor="ss">DITERIMA</label>
            </div>
            <div className='flex gap-2'>

            <input type="radio" name="ss" id="ss1" />
            <label className='mr-2' htmlFor="ss1">DITOLAK</label>
            </div>
          </div>
          <button className='text-sm text-white bg-green-600 py-2'>SUBMIT CHECKSHEET</button>

         </div>
         </div>
         
        </main>
      )}
    </>
  );
}

export default ChecksheetRusakSebagian;
