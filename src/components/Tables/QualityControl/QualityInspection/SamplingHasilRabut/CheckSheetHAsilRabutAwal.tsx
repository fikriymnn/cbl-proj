import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';

function CheckSheetHasilRabut() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cetakMesinAwal, setCetakMesinAwal] = useState<any>();

  useEffect(() => {
    getCetakMesinAwal();
  }, []);

  async function getCetakMesinAwal() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiRabut/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setCetakMesinAwal(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/start/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskCekAwal(
    id: number,
    startTime: any,
    catatan: any,
    line_clearance: any,
    design: any,
    redaksi: any,
    barcode: any,
    jenis_bahan: any,
    gramatur: any,
    layout_pisau: any,
    acc_warna_awal_jalan: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/stop/${id}`;
    try {
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          line_clearance: line_clearance,
          design: design,
          redaksi: redaksi,
          barcode: barcode,
          jenis_bahan: jenis_bahan,
          gramatur: gramatur,
          layout_pisau: layout_pisau,
          acc_warna_awal_jalan: acc_warna_awal_jalan,
        },
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }

  async function tambahTaskCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_rabut_point: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function doneCekAwal(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/done/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          id_inspeksi_rabut_point: id,
        },
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function pendingCekAwal(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiRabutPoint/pending/${id}`;
    try {
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      getCetakMesinAwal();
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const handleChangePoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = cetakMesinAwal;
    onchangeVal.inspeksi_rabut_point[0].inspeksi_rabut_defect[i][name] =
      value;
    setCetakMesinAwal(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(cetakMesinAwal?.tanggal);
  const jam = convertDateToTime(cetakMesinAwal?.tanggal);

  const jumlahWaktuCheck = formatElapsedTime(
    cetakMesinAwal?.inspeksi_rabut_point[0].waktu_check,
  );

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
             Sampling Hasil Rabut Checksheet
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
                  : {cetakMesinAwal?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.no_jo}
                </label>
                
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.customer}
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
                  Shift
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Mesin
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Operator
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Status
                </label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {cetakMesinAwal?.status}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            {cetakMesinAwal?.inspeksi_rabut_point[0].inspeksi_rabut_defect.map(
              (data: any, index: number) => {
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                return (
                  <>
                    <div className="flex flex-col py-6 px-10 ">
                      <div className=" grid grid-cols-6 w-full  gap-2">
                        <div className='w-11/12'>

                        <label className="text-neutral-500 text-sm font-semibold w-10/12">
                          QTY PALET KE {index + 1}
                        </label>
                        </div>
                        <div>
                        <label className="text-neutral-500 text-sm font-semibold ">
                            PARAMETER
                          </label>
                          <input type="text" className='px-1 border rounded border-strokedark w-10/12' />
                        </div>
                        <div className='flex flex-col'>
                        <label className="text-neutral-500 text-sm font-semibold ">
                            INSPEKTOR
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {data.inspektor?.nama}
                          </label>
                        </div>
                        <div className='flex flex-col'>
                        <label className="text-neutral-500 text-sm font-semibold ">
                            WAKTU
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {lamaPengerjaan}
                          </label>
                        </div>
                        <div className="flex flex-col ">
                          <>
                            <div className="flex flex-col ">
                              <p className="md:text-[14px] text-[9px] font-semibold">
                                Upload Foto (Optional):
                              </p>

                              <div className="">
                                <input
                                  disabled
                                  type="file"
                                  name=""
                                  id=""
                                  className="w-40"
                                />
                              </div>
                            </div>
                          </>
                        </div>
                        <div className="flex flex-col ">
                          <>
                            <div className="flex flex-col ">
                              <p className="md:text-[14px] text-[9px] font-semibold">
                               Start and stop
                              </p>

                             
                            </div>
                          </>
                        </div>
                      </div>
                      
                    </div>
                    <div className="grid grid-cols-8">
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1 - warna
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1 - warna 
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid py-4 px-4 items-center">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='px-1 border rounded border-strokedark w-full' />
                      </div>
                      
                    </div>
                    
                    <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] px-4 py-4 gap-3">
                      <div className="grid col-span-8">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          Catatan<span className="text-red-500">*</span> :
                        </label>
                        {data.status == 'on progress' ? (
                          <textarea
                            name="catatan"
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangePoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : data.status == 'done' ? (
                          <textarea
                            name="catatan"
                            disabled
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangePoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : null}
                      </div>
                      <div className="grid col-span-2 items-end justify-center">
                        
                      </div>
                    </div>
                  </>
                );
              },
            )}
          </div>
          {cetakMesinAwal?.inspeksi_rabut_point[0].status == 'incoming' ||
            cetakMesinAwal?.inspeksi_rabut_point[0].status == 'pending' ? (
            <button
              onClick={() =>
                tambahTaskCekAwal(cetakMesinAwal?.inspeksi_rabut_point[0].id)
              }
              className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 mb-2 hover:cursor-pointer"
            >
              + QTY PALET
            </button>
          ) : null}
<div className='bg-white '>
<p className='text-sm font-semibold px-5 pt-5'>SUB TOTAL</p>
<div>
  <div className='px-5'>
    <p className='font-semibold text-sm mt-5 '>Parameter Qty Palet</p>
    <input type="text" className='bg-[#e8e6e6] border rounded border-strokedark'/>
  </div>
  <div>
  <div className="grid grid-cols-8 gap-4 py-4 p-5">
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1 - warna
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1 - warna 
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      
                    </div>
                    <div className="grid grid-cols-8 gap-4 py-4 px-5 ">
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1 - warna
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1 - warna 
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          C1
                        </label>
                        <input type="text" className='bg-[#e8e6e6] px-1 border rounded border-strokedark w-full' />
                      </div>
                      
                    </div>
                    <div className='flex gap-10 p-5'>

                    <div className='w-3/12' >
                    <label className=" text-[#6c6b6b] text-sm font-semibold">
                          JUMLAH DEFECT YANG DITEMUKAN
                        </label>
                        <input type="text" className='bg-[#e8e6e6]  px-1 border rounded border-strokedark w-full' />
                    </div>
                    <div className='w-9/12'>
                    <label className=" text-[#6c6b6b] text-sm font-semibold">
                          Keterangan
                        </label>
                       <textarea name="" id="" className='w-full h-[70px] border rounded border-strokedark'></textarea>
                    </div>
                    </div>
                    <div className='flex justify-end p-5'>
                    <div className="grid col-span-6 gap-y-2 items-end justify-end">
              {cetakMesinAwal?.inspeksi_rabut_point[0].status == 'incoming' ? (
                <button
                  onClick={() =>
                    pendingCekAwal(cetakMesinAwal?.inspeksi_rabut_point[0].id)
                  }
                  className=" w-full h-10 rounded-sm bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  PENDING
                </button>
              ) : null}
              {cetakMesinAwal?.inspeksi_rabut_point[0].status == 'incoming' ||
                cetakMesinAwal?.inspeksi_rabut_point[0].status == 'pending' ? (
                <button
                  onClick={() =>
                    doneCekAwal(cetakMesinAwal?.inspeksi_rabut_point[0].id)
                  }
                  className=" w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                >
                  SIMPAN PERIODE
                </button>
              ) : null}
            </div>
                    </div>
  </div>
</div>
</div>
          
        </main>
      )}
    </>
  );
}

export default CheckSheetHasilRabut;
