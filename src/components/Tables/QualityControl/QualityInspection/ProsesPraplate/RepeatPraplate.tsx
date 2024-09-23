import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';
import ModalKonfirmasi from '../../../../Modals/Master/PM1/ModalKonfirmasi';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';

function ProsesPraplateRepeat() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const [Catatan, setCatatan] = useState<any>(null);
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };
  useEffect(() => {
    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [pondMesin, setPondMesin] = useState<any>();

  useEffect(() => {
    getPondMesin();
  }, []);

  async function getPondMesin() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiKelengkapanPlate`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'incoming',
        },
        withCredentials: true,
      });

      setPondMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function checkKebutuhanPlate(
    id: number,
    catatan: any,
    hasil_check: any,
    index: number,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiKelengkapanPlate/check/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil_check: hasil_check,
          catatan: catatan,
        },
        {
          withCredentials: true,
        },
      );

      setCatatan(null);
      getPondMesin();
      closeModalModal(index);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
  }

  const tanggal = convertDatetimeToDate(new Date());

  const [showModal, setShowModal] = useState<any>([]);
  const openModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = true;

    setShowModal(onchangeVal);
  };
  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;

    setShowModal(onchangeVal);
  };
  return (
    <>
      {!isMobile && (
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-10 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                <label className="text-neutral-500 text-sm font-semibold col-span-2 ">
                  No. JO
                </label>

                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                  Nama. JO
                </label>
              </div>
              <div className="w-2 h-full "></div>
              {pondMesin != null &&
                pondMesin.data?.map((data: any, i: any) => (
                  <>
                    <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] gap-2 items-center ">
                      <div className="flex w-full col-span-2 bg-red items-center">
                        <div
                          className={`w-2 h-full sticky left-0 z-20  gap-8 py-6 ${
                            data.jenis_potong == 'potong bahan'
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                          }`}
                        ></div>

                        <label className="text-neutral-500 text-sm font-semibold col-span-2 pl-6">
                          {data.no_jo}
                        </label>
                      </div>

                      <label className="text-neutral-500 text-sm font-semibold col-span-6 uppercase"></label>
                      <div className="justify-end flex pr-2 col-span-2">
                        <>
                          <button
                            onClick={() => openModalModal(i)}
                            className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                          >
                            Action
                          </button>
                          {showModal[i] == true && (
                            <>
                              <ModalKosonganSmall
                                isOpen={showModal[i]}
                                onClose={() => closeModalModal(i)}
                                judul={'Konfirmasi'}
                              >
                                <>
                                  <div className="flex flex-col w-full  px-4 py-2 pt-8">
                                    <input
                                      type="text"
                                      onChange={(e) =>
                                        setCatatan(e.target.value)
                                      }
                                      className="text-sm h-10 font-semibold w-full border-black border rounded-md"
                                    ></input>
                                    <button
                                      onClick={() => {
                                        checkKebutuhanPlate(
                                          data.id,
                                          Catatan,
                                          'OKE',
                                          i,
                                        );
                                      }}
                                      className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => {
                                        checkKebutuhanPlate(
                                          data.id,
                                          Catatan,
                                          'REJECT',
                                          i,
                                        );
                                      }}
                                      className={`uppercase px-14 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-red-400 border bg-red-600 border-red-600  justify-center`} // Dynamic class assignment
                                    >
                                      REJECT
                                    </button>
                                  </div>
                                </>
                              </ModalKosonganSmall>
                            </>
                          )}
                        </>
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default ProsesPraplateRepeat;
