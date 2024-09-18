import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';

function ChecksheetOutsourcingBarangJadi() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [FinalInspection, setFinalInspection] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();

  useEffect(() => {
    getFinalInspection();
  }, []);

  async function getFinalInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/incoming_outsourcing_barang_jadi/${id}`;
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
    }/qc/cs/incoming_outsourcing_barang_jadi/start/${id}`;
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
    }/qc/cs/incoming_outsourcing_barang_jadi/stop/${id}`;
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
    }/qc/cs/incoming_outsourcing_barang_jadi/create`;
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
              Final Inspection Checksheet
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
                <label className="text-neutral-500 text-sm font-semibold">
                  Qty
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
                <label className="text-neutral-500 text-sm font-semibold">
                  : {FinalInspection?.data?.qty}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
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
         
          <div className='grid w-full grid-cols-2 gap-2'>
          <div className="bg-white ">
            <p className="text-sm text-blue-700 font-semibold px-5 pt-5">Standar Pemeriksaan</p>
            <div className=''>
              <div className="px-5">
                <p className="font-semibold text-sm mt-5 ">
                √N + 1 = Jumlah Packing yang akan dicek
                </p>
                <p className="font-semibold text-sm mt-5 ">
                (N Jumlah packing dalam 1 palet)
                </p>
                <p className="font-semibold text-sm mt-5 ">
                JUMLAH PACKING yang diambil 1 palet (pack) :
                </p>
                <input
                  type="text"
                  
                 
                  className=" border rounded border-strokedark mb-4"
                />
              </div>
             
            </div>
          </div>
          <div className="bg-white ">
            <p className="text-sm text-blue-700 font-semibold px-5 pt-5">Standar Pemeriksaan</p>
            <div>
              <div className="px-5 flex gap-5 items-center justify-between mt-5">
                <p className="font-semibold text-sm  ">
                No Pallet yang di Cek :
                </p>
                
                <input
                  type="text"
                  
                 
                  className=" border rounded border-strokedark"
                />
              </div>
              <div className="px-5 flex gap-5 items-center justify-between mt-5">
                <p className="font-semibold text-sm  ">
                No Packing yang diperiksa :
                </p>
                
                <input
                  type="text"
                  
                 
                  className=" border rounded border-strokedark"
                />
              </div>
             
            </div>
          </div>

          </div>
          <div className='bg-white mt-2 w-full grid grid-cols-4 text-blue-600 text-sm font-semibold '>
<div >
  <p className='text-center'>QTY PCS/PALLET</p>
</div>
<div>
  <p className='text-center'>JUMLAH YANG DIPERIKSA</p>
</div>
<div className='flex flex-col justify-center'>
  <p className='text-center'>TINGKAT PENERIMAAN KUALITAS</p>
  <div className='grid grid-cols-2 justify-center w-full'>
    <p className='text-center'>LULUS</p>
    <p className='text-center'>TOLAK</p>
  </div>
</div>
<div>
  <p className='text-center'>REJECT YANG DITEMUKAN</p>
</div>
          </div>
          <div className='bg-white mt-2  text-sm font-semibold '>
            <div className='w-full grid grid-cols-4 py-2 '>

<div className='mb-2'>
  <p className='text-center'>3201 Pcs S/D 10.000 Pcs</p>
</div>
<div className='mb-2'>
  <p className='text-center'>200 pcs</p>
</div>
<div className='flex flex-col justify-center mb-2'>

  <div className='grid grid-cols-2 justify-center w-full mb-2'>
    <p className='text-center'>10</p>
    <p className='text-center'>11</p>
  </div>
</div>
<div className='flex justify-center w-full mb-2'>
<input
                  type="text"
                  
                 
                  className=" border rounded border-strokedark"
                />
</div>
            </div>

          </div>
          <div className='bg-white mt-2 w-full grid grid-cols-11 p-2 text-sm font-semibold '>
<div >
  <p className='text-center'>NO</p>
</div>
<div  className='col-span-2'>
  <p className='text-center'>POINT CHECK</p>
</div>
<div className='col-span-2'>
  <p className='text-center'>STANDAR</p>
</div>
<div className='flex flex-col justify-center col-span-2'>
  <p className='text-center'>CARA PERIKSA</p>
 
</div>
<div className='col-span-2'>
  <p className='text-center'>HASIL</p>
</div>
<div className='col-span-2'>
  <p className='text-center'>QTY REJECT</p>
</div>
          </div>
          <div className='bg-white mt-2 w-full grid grid-cols-11 p-2 text-sm font-semibold '>
<div >
  <p className='text-center'>1</p>
</div>
<div  className='col-span-2'>
  <p className='text-center'>Warna</p>
</div>
<div className='col-span-2'>
  <p className='text-center'>Standar Warna</p>
</div>
<div className='flex flex-col justify-center col-span-2'>
  <p className='text-center'>Visual</p>
 
</div>
<div className='col-span-2 flex flex-col items-center'>
  <div>

<div>
                              <input
                                type="radio"
                                id="SESUAI"
                                value="SESUAI"
                                name="register"
                              
                              />
                              <label className="pl-2">SESUAI</label>
                            </div>
<div>
                              <input
                                type="radio"
                                id="TIDAK SESUAI"
                                value="TIDAK SESUAI"
                                name="register"
                              
                              />
                              <label className="pl-2">TIDAK SESUAI</label>
                            </div>
  </div>
</div>
<div className='col-span-2 flex items-center'>
<input
                  type="text"
                  
                 
                  className=" border rounded border-strokedark"
                />
</div>

          </div>
          <div className='bg-white mt-2 w-full grid grid-cols-12 gap-5 p-2 text-sm font-semibold '>
<div className='col-span-6'>
  <p className=''>Catatan *:</p>
  <textarea name="" id="" rows={4} className='w-full border rounded px-2' ></textarea>
</div>
<div className='col-span-3 flex flex-col justify-end'>

<div>
                              <input
                                type="radio"
                                id="SESUAI"
                                value="SESUAI"
                                name="register"
                              
                              />
                              <label className="pl-2">BISA KIRIM</label>
                            </div>
<div>
                              <input
                                type="radio"
                                id="TIDAK BISA KIRIM"
                                value="TIDAK BISA KIRIM"
                                name="register"
                              
                              />
                              <label className="pl-2">TIDAK BISA KIRIM</label>
                            </div>
  </div>
  <div className='col-span-3 flex flex-col justify-end'>

  <button className='px-2 py-2 bg-green-700 w-full  text-white'>SUBMIT CHECKSHEET</button>
  </div>
          </div>
        </main>
      )}
    </>
  );
}

export default ChecksheetOutsourcingBarangJadi;
