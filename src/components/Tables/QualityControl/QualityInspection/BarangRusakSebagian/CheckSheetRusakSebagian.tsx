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
                  No. IO
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Customer
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
                  : {FinalInspection?.data?.no_jo}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.customer}
                </label>
                
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Qty Rusak Sebagian
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                 Waktu Sortir
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                : 12
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                : YYMMDD
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
         <div className='bg-white mb-2 text-blue-500 text-sm font-semibold px-5 py-2'>
          ASAL TEMUAN CETAK
         </div>
         <div className='bg-white mb-2 p-5'>
          <div className='grid grid-cols-4 gap-5'>

          <div className=''>

          <p className='text-blue-500 text-sm font-semibold '>KODE MASALAH</p>
          <p className='font-semibold text-sm'>C1.2</p>
          </div>
         <div  className=''>
          <p className='text-blue-500 text-sm font-semibold '>JENIS DEFECT YANG DITEMUKAN</p>
          <p className='font-semibold text-sm'>C1.2</p>
         </div>
         <div className=''>
          <p className='font-semibold text-sm'>Upload Foto:</p>
          
          <input type="file" name="" id="" />
         </div>
         <div  className=''>

          <p className='font-semibold text-sm'>Time:</p>
         <button
                                 
                                  className="flex w-[50%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
         </div>
          </div>
          <p className='text-blue-500 text-sm font-semibold '>QUANTITY TEMUAN</p>
          <div className='grid grid-cols-6 gap-5'>
<div>
<p className='font-semibold text-sm'>SETTING AWAL</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
<div>
<p className='font-semibold text-sm'>DRUK AWAL</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
<div>
<p className='font-semibold text-sm'>SUB TOTAL</p>
<input type="text" name="" id="" className='w-full border rounded bg-[#D9D9D9]' />
</div>
<div className='col-span-3'>
<p className='font-semibold text-sm'>CATATAN:*</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
          </div>
         </div>
         <div className='bg-white mb-2 text-blue-500 text-sm font-semibold px-5 py-2'>
          ASAL TEMUAN COATING
         </div>
         <div className='bg-white mb-2 p-5'>
          <div className='grid grid-cols-4 gap-5'>

          <div className=''>

          <p className='text-blue-500 text-sm font-semibold '>KODE MASALAH</p>
          <p className='font-semibold text-sm'>C1.2</p>
          </div>
         <div  className=''>
          <p className='text-blue-500 text-sm font-semibold '>JENIS DEFECT YANG DITEMUKAN</p>
          <p className='font-semibold text-sm'>C1.2</p>
         </div>
         <div className=''>
          <p className='font-semibold text-sm'>Upload Foto:</p>
          
          <input type="file" name="" id="" />
         </div>
         <div  className=''>

          <p className='font-semibold text-sm'>Time:</p>
         <button
                                 
                                  className="flex w-[50%]  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
         </div>
          </div>
          <p className='text-blue-500 text-sm font-semibold '>QUANTITY TEMUAN</p>
          <div className='grid grid-cols-6 gap-5'>
<div>
<p className='font-semibold text-sm'>SETTING AWAL</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
<div>
<p className='font-semibold text-sm'>DRUK AWAL</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
<div>
<p className='font-semibold text-sm'>SUB TOTAL</p>
<input type="text" name="" id="" className='w-full border rounded bg-[#D9D9D9]' />
</div>
<div className='col-span-3'>
<p className='font-semibold text-sm'>CATATAN:*</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
          </div>
         </div>
         <div className='bg-white mb-2 text-blue-500 text-sm font-semibold px-5 py-2'>
          ASAL TEMUAN COATING
         </div>
         <div className='bg-white mb-2 p-5'>
          
         
          <p className='text-blue-500 text-sm font-semibold mb-2'>QUANTITY TEMUAN</p>
          <div className='grid grid-cols-6 gap-5'>
<div>
<p className='font-semibold text-sm'>SETTING AWAL</p>
<input type="text" name="" id="" className='w-full border rounded bg-[#D9D9D9]' />
</div>
<div>
<p className='font-semibold text-sm'>DRUK AWAL</p>
<input type="text" name="" id="" className='w-full border rounded bg-[#D9D9D9]' />
</div>
<div>
<p className='font-semibold text-sm'>SUB TOTAL</p>
<input type="text" name="" id="" className='w-full border rounded bg-[#D9D9D9]' />
</div>
<div>
<p className='font-semibold text-sm'>BARANG BAIK</p>
<input type="text" name="" id="" className='w-full border rounded bg-[#D9D9D9]' />
</div>
<div className='col-span-5'>
<p className='font-semibold text-sm'>CATATAN:*</p>
<input type="text" name="" id="" className='w-full border rounded' />
</div>
<button className='bg-green-600 text-xs px-2 text-white font-semibold'>SUBMIT CHECKSHEET</button>
          </div>
         </div>
         
        </main>
      )}
    </>
  );
}

export default ChecksheetRusakSebagian;
