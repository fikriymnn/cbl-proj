import React, { useState } from 'react'
import Filter from '../../../images/icon/filter.svg'
import Burger from '../../../images/icon/burger.svg'
import Arrow from '../../../images/icon/arrowDown.svg'
import ModalStockCheckPengganti from '../../Modals/ModalStockCheckPilihPengganti'
import ModalPopupReq from '../../Modals/ModalDetailPopupReq'
import ModalMtcDate from '../../Modals/ModalMtcDate'
import ModalStockCheck1 from '../../Modals/ModalStockCheck1'

const tiket = [
  {
    KodeTiket: '1376',
    waktuMesin: "12/22/24 7:00UTC",
    namaMesin: "R700",
    kendala: "problem settingan mesin",

  },
  {
    KodeTiket: '1376',
    waktuMesin: "12/22/24 7:00UTC",
    namaMesin: "R700",
    kendala: "problem settingan mesin",

  },
  {
    KodeTiket: '1376',
    waktuMesin: "12/22/24 7:00UTC",
    namaMesin: "R700",
    kendala: "problem settingan mesin",

  }
]

function TableOS() {


  const [showTwoButtons, setShowTwoButtons] = useState<boolean[]>(new Array(tiket.length).fill(false));
  const [showDetail, setShowDetail] = useState<boolean[]>(new Array(tiket.length).fill(false));
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);


  const openModal1 = () => setShowModal1(true);
  const openModal2 = () => setShowModal2(true);
  const closeModal1 = () => setShowModal1(false);
  const closeModal2 = () => setShowModal2(false);
  const handleClick = (index: number) => {
    setShowTwoButtons((prevState) => {
      const updatedShowTwoButtons = [...prevState]; // Create a copy
      updatedShowTwoButtons[index] = !updatedShowTwoButtons[index]; // Toggle value
      // Reset showTwoButtons for all other rows
      for (let i = 0; i < updatedShowTwoButtons.length; i++) {
        if (i !== index) {
          updatedShowTwoButtons[i] = false;
        }
      }
      return updatedShowTwoButtons;
    });
  };
  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };
  return (
    <main>
      <div className='flex justify-between bg-white p-3'>
        <img src={Filter} alt="" className='mx-3' />
        {/* <input className='w-96 py-1 mx-3 bg-[#E9F3FF]'>
          search
        </input> */}
        <input type="search" placeholder='search' name="" id="" className='md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]' />
      </div>
      <div className=' overflow-x-auto'>
        <div className='min-w-[700px]'>

          {tiket.map((data, i) => (
            <>
              <div className='my-3'>

                <section className='flex  bg-white  rounded-lg'>


                  <div key={i} className='p-5 flex justify-center items-center'>
                    {i + 1}
                  </div>
                  <div className='grid md:grid-cols-8 grid-cols-7 w-full  '>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div className=''>

                        <h5 className='text-xs font-bold'>Kode Tiket</h5>
                        <p className='text-sm font-light'>{data.KodeTiket}</p>
                      </div>

                    </div>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div>
                        <h5 className='text-xs font-bold'>Nama Mesin</h5>
                        <p className='text-sm font-light'>R700</p>
                      </div>

                    </div>
                    <div className='flex flex-col col-span-2 md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div>
                        <h5 className='text-xs font-bold'>Jenis Kendala</h5>
                        <p className='text-sm font-light'>3.1.7 - Feeder tidak bisa on</p>
                      </div>

                    </div>
                    <div className='flex items-center md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div className='flex '>
                        <p className='text-sm font-light bg-[#B1ECFF] rounded-xl px-2 text-[#004CDE]'>FINISHED </p>
                      </div>
                    </div>
                    <div className='flex items-center md:gap-5 gap-1 md:px-7 md:py-[14px] p-2'>
                      <div className='flex '>
                        <p className='text-sm px-2  font-light  rounded-xl flex justify-center bg-[#00de3f4b] text-[#2EB300] '>100%</p>
                      </div>
                    </div>
                    <div className='flex flex-col md:gap-5 gap-1 md:m-[14px] m-[7px]'>
                      <div>
                        <h5 className='text-xs font-bold'>Jadwal</h5>
                        <p className='text-sm font-light'>-</p>
                      </div>

                    </div>
                    <div className='flex gap-2 items-center md:mb-0 mb-2'>
                      <div>
                        <div>
                          <button
                            className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                            onClick={() => handleClick(i)}
                          >
                            <img src={Burger} alt="" className="mx-3" />
                            {/* Include icon in both states */}
                          </button>
                          {showTwoButtons[i] ? (
                            <div className="absolute bg-white p-3 shadow-5 rounded-md"> {/* Wrap buttons for styling */}
                              <div className='flex flex-col gap-1'>

                                <button onClick={openModal1} className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md">
                                  PROSES
                                </button>
                                <button onClick={openModal2} className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md">
                                  JADWALKAN                              </button>
                              </div>
                              {showModal1 && (
                                <ModalStockCheck1 children={undefined} isOpen={showModal1} onClose={closeModal1} kendala={"mesin rusak"} machineName={"R700"} tgl={"12/12/24"} jam={"19.09"} namaPemeriksa={'Troy'} no={'109299'} />
                              )}
                              {showModal2 && (
                                <ModalMtcDate
                                  isOpen={showModal2}
                                  onClose={closeModal2}
                                  machineName={'GMC Printer 2'}>
                                  <p></p>
                                </ModalMtcDate>
                              )}
                            </div>

                          ) : (
                            ""
                          )}
                        </div>

                      </div>
                      <div>

                        <button onClick={() => handleClickDetail(i)} className='text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md'><img src={Arrow} alt="" className='mx-3' /></button>
                      </div>
                    </div>

                  </div>

                </section>
                {showDetail[i] && (
                  <div className='w-full flex flex-col bg-[#E9F3FF]  rounded-lg'>
                    <div className='md:w-9/12 w-11/12 px-5 py-2'>
                      <div className='grid grid-cols-5 gap-3'>
                        <p className='text-xs font-bold'>Pekerjaan 1</p>
                        <div>
                          <p className='text-xs font-bold'>Waktu</p>
                          <p className='text-sm font-light'>12/22/24 07:00</p>
                        </div>
                        <div>
                          <p className='text-xs font-bold'>Eksekutor</p>
                          <p className='text-sm font-light'>Jonathan L</p>
                        </div>
                        <div>
                          <p className='text-xs font-bold'>Waktu Respon</p>
                          <p className='text-sm font-light'>20m</p>
                        </div>
                        <div className='flex items-center md:gap-5 gap-1 md:px-7 md:py-[14px] p-2'>
                          <div className='flex '>
                            <p className='text-sm px-2  font-light bg-red-200 rounded-xl flex justify-center text-red-600'>40%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='md:w-9/12 w-11/12 px-5 py-2'>
                      <div className='grid grid-cols-5 gap-3'>
                        <p className='text-xs font-bold'>Pekerjaan 2</p>
                        <div>
                          <p className='text-xs font-bold'>Waktu</p>
                          <p className='text-sm font-light'>12/22/24 07:00</p>
                        </div>
                        <div>
                          <p className='text-xs font-bold'>Eksekutor</p>
                          <p className='text-sm font-light'>Jonathan L</p>
                        </div>
                        <div>
                          <p className='text-xs font-bold'>Waktu Respon</p>
                          <p className='text-sm font-light'>20m</p>
                        </div>
                        <div className='flex items-center md:gap-5 gap-1 md:px-7 md:py-[14px] p-2'>
                          <div className='flex '>
                            <p className='text-sm px-2  font-light  rounded-xl flex justify-center  bg-[#00de3f4b] text-[#2EB300]'>100%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ))}
        </div>
      </div>
    </main>
  )
}

export default TableOS