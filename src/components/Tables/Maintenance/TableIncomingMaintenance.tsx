import { BRAND } from '../../../types/brand';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useEffect, useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';
import ModalMtc from '../../Modals/ModalMtcType';
import ModalMtc6type from '../../Modals/Modal6type';
import ModalMtcStockCheck from '../../Modals/ModalMtcStockCheck';
import ModalMtcDate from '../../Modals/ModalMtcDate';
import ModalReplaced from '../../Modals/ModalReplaced';
import ModalPurchasing from '../../Modals/ModalPurchasing';
import ModalMtcLightHeavy from '../../Modals/ModalMtcLightHeavy';
import ModalNewVendor from '../../Modals/ModalNewVendor';
import Arrow from '../../../images/icon/arrowDown.svg'


const tiket = [
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: "R700",
    problem: 'Problem settingan mesin',
    status: "pending",
    schedule: "unscheduled",
    action: 'request mtc',

  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: "R700",
    problem: 'Problem settingan mesin',
    status: "pending",
    schedule: "schedule requested",
    action: 'detail',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: "R700",
    problem: 'Problem settingan mesin',
    status: "pending",
    schedule: ["schedule declined", "12/04/24 to 24/04/24"],
    action: 3.7,
    idResponser: "1313jn"
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: "R700",
    problem: 'Problem settingan mesin',
    status: "pending",
    schedule: ["schedule declined", "12/04/24 to 24/04/24"],
    action: 3.7,
    idResponser: "1313jn"
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: "R700",
    problem: 'Problem settingan mesin',
    status: "pending",
    schedule: ["schedule declined", "12/04/24 to 24/04/24"],
    action: 3.7,
    idResponser: "1313jn"
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: "R700",
    problem: 'Problem settingan mesin',
    status: "pending",
    schedule: ["schedule declined", "12/04/24 to 24/04/24"],
    action: 3.7,
    idResponser: "1313jn"
  },
];


const TableIncomingMaintenance = () => {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);
  const [showModal6, setShowModal6] = useState(false);
  const [showModal7, setShowModal7] = useState(false);
  const [showModal8, setShowModal8] = useState(false);
  const [showModal9, setShowModal9] = useState(false);


  const openModal1 = () => setShowModal1(true);
  const closeModal1 = () => setShowModal1(false);

  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);


  const closeModal3 = () => setShowModal3(false);
  const openModal3 = () => {
    setShowModal3(true);
    setShowModal2(false);
  };

  const closeModal4 = () => setShowModal4(false);
  const openModal4 = () => {
    setShowModal4(true);
    setShowModal8(false);
  };

  const closeModal8 = () => setShowModal8(false);
  const openModal8 = () => {
    setShowModal8(true);
    setShowModal2(false);
  };

  const closeModal5 = () => setShowModal5(false);
  const openModal5 = () => {
    setShowModal5(true);
    setShowModal4(false);
  };

  const closeModal6 = () => setShowModal6(false);
  const openModal6 = () => {
    setShowModal6(true);
    setShowModal4(false);
  };

  const closeModal7 = () => setShowModal7(false);
  const openModal7 = () => {
    setShowModal7(true);
    setShowModal6(false);
  };
  const closeModal9 = () => setShowModal9(false);
  const openModal9 = () => {
    setShowModal9(true);
    setShowModal6(false);
  };
  const [showTwoButtons, setShowTwoButtons] = useState<boolean[]>(new Array(tiket.length).fill(false));
  const [showDetail, setShowDetail] = useState<boolean[]>(new Array(tiket.length).fill(false));
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

  const [isMobile, setIsMobile] = useState(false);
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


  return (
    <div className='overflow-x-scroll'>


      {!isMobile && (
        <>
          <div className="rounded-b-xl lg:min-w-[700px]  border border-stroke bg-white  pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">


            <div className="flex flex-col">
              <div
                className='flex border-b-8  border-[#D8EAFF] dark:border-strokedark '
              >
                <div className=" flex items-center  w-1/12 gap-3 p-2.5 md:px-7.5 px-5 ">

                  <p className=" md:text-[12px] text-[10px] text-slate-600 font-semibold dark:text-white sm:block">
                    No
                  </p>
                </div>

                <div className=" flex items-center w-2/12 justify-center p-2.5 ml-2 md:px-7.5 px-5 ">
                  <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center dark:text-white">Kode Tiket</p>
                </div>
                <div className=" flex items-center md:text-[12px] text-[10px] w-3/12 ml-4 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center dark:text-white">Waktu Masuk</p>
                </div>

                <div className=" flex items-center md:text-[12px] text-[10px] w-4/12 ml-4 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center">Nama Mesin</p>
                </div>
                <div className=" flex items-center md:text-[12px] text-[10px] w-4/12 mr-2 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center">Kendala</p>
                </div>



                <div className=" items-center justify-center  md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 flex ">
                  <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center">Detail</p>
                </div>
              </div>
              <>
                {tiket.map((brand, key) => (
                  <div
                    className={`flex ${key === tiket.length - 1
                      ? ''
                      : 'border-b-8  border-[#D8EAFF] dark:border-strokedark '
                      }`}
                    key={key}
                  >
                    <div className=" flex items-center w-1/12   gap-3 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF]  ">

                      <p className=" md:text-[12px] text-[10px] text-black dark:text-white block">
                        {key + 1}
                      </p>
                    </div>

                    <div className=" flex items-center w-2/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                      <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">{brand.name}</p>
                    </div>
                    <div className=" flex items-center w-3/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                      <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">{brand.date}</p>
                    </div>


                    <div className=" flex items-center w-4/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                      <p className="text-black text-center md:text-[12px] text-[10px]">{brand.machine}</p>
                    </div>
                    <div className=" flex items-center w-3/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                      <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">{brand.name}</p>
                    </div>


                    <div className=" items-center justify-center md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] flex ">
                      <td className=" border-[#eee]   dark:border-strokedark">
                        <div className=" mx-auto flex gap-3">
                          <button type="button"
                            className={`inline-flex py-2 rounded-[3px] my-auto  md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-[#0065DE] text-white hover:bg-[#234a79] justify-center`}
                          >
                            RESPON
                          </button>
                          <button type="button" onClick={openModal1}
                            className={`inline-flex py-2 rounded-[3px] my-auto  md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-white border-[#0065DE] border text-primary justify-center`}
                          >
                            DETAIL
                          </button>


                          {/* <button type="button" onClick={openModal1}
                    className={`inline-flex rounded-[3px] my-auto py-2 md:px-2 px-1 md:text-[12px] text-[10px] font-semibold bg-white border-[#0065DE] border text-primary justify-center items-center  `}
                  >
                    DETAIL
                  </button> */}
                          {showModal1 && (
                            <Modal title="Incoming Maintenance Ticket"
                              isOpen={showModal1}
                              onClose={closeModal1}
                              ticketCode={'CTR03591'}
                              prepName={'GMC Ink 229'}
                              incDate={'28 May, 2024 06:37AM'}
                              prepCode={'3.2'} >
                              <p></p>
                            </Modal>
                          )}

                          {showModal2 && (
                            <ModalMtc
                              title="Select Maintenance Type"
                              isOpen={showModal2}
                              onClose={closeModal2}
                              machineName={'GMC Printer 2'}                    >
                              <div className="pt-5">

                                <button onClick={openModal3} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  RIGHT AWAY MAINTENANCE
                                </button>
                              </div>
                              <div className="pt-2">
                                <button onClick={openModal8} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  SCHEDULE MAINTENANCE
                                </button>
                              </div>
                            </ModalMtc>
                          )}

                          {showModal8 && (
                            <ModalMtcLightHeavy
                              title="Select Maintenance Type"
                              isOpen={showModal8}
                              onClose={closeModal8}
                            >
                              <div className="pt-5">

                                <button onClick={openModal4} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  MAINTENANCE RINGAN
                                </button>
                              </div>
                              <div className="pt-2">
                                <button onClick={openModal4} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  MAINTENANCE BERAT
                                </button>
                              </div>
                            </ModalMtcLightHeavy>
                          )}
                          {showModal3 && (
                            <ModalMtc6type
                              isOpen={showModal3}
                              onClose={closeModal3}
                              ticketCode={'EXC0008'}
                            >
                              <p></p>
                            </ModalMtc6type>
                          )}
                          {showModal4 && (
                            <ModalMtcStockCheck
                              machineName={'GMC Printer 2'}
                              machineCode={'3.2'}
                              isOpen={showModal4}
                              onClose={closeModal4}
                            >
                              <button onClick={openModal6} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                REQUIRED STOCK UNAVAILABLE
                              </button>
                              <button onClick={openModal5} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                NEXT STEP
                              </button>
                            </ModalMtcStockCheck>
                          )}

                          {showModal5 && (
                            <ModalMtc6type children={undefined} isOpen={showModal5} onClose={closeModal5} ticketCode={undefined} />
                          )}
                          {showModal6 && (
                            <ModalReplaced
                              isOpen={showModal6}
                              onClose={closeModal6}
                            >
                              <div className="flex  w-full gap-3 pt-5">
                                <button onClick={openModal7} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  YES
                                </button>
                                <button onClick={openModal9} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  NO
                                </button>
                              </div>
                            </ModalReplaced>
                          )}
                          {showModal7 && (
                            <ModalPurchasing
                              isOpen={showModal7}
                              onClose={closeModal7}>
                            </ModalPurchasing>
                          )}
                          {showModal9 && (
                            <ModalNewVendor
                              isOpen={showModal9}
                              onClose={closeModal9}
                            >
                              <div className="flex  w-full gap-3 pt-5 justify-end pt-[300px]">
                                <button className="w-4/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md ">
                                  SEND REQUEST
                                </button>
                              </div>
                            </ModalNewVendor>
                          )}

                        </div>

                      </td>
                    </div>
                  </div>
                ))}
              </>
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <>
          <div className="rounded-b-xl lg:min-w-[700px]  border border-stroke bg-white  pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">


            <div className="flex flex-col">
              <div
                className='flex border-b-8  border-[#D8EAFF] dark:border-strokedark '
              >
                <div className='flex w-6/12'>

                </div>
                <div className=" flex items-center w-5/12 justify-center p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 md:text-[12px] text-[10px] font-semibold text-center dark:text-white">Kode Tiket</p>
                </div>
                <div className=" flex items-center md:text-[12px] text-[10px] w-7/12 justify-start p-2.5 md:px-7.5 px-5 ">
                  <p className="text-slate-600 font-semibold text-center dark:text-white">Waktu Masuk</p>
                </div>


              </div>
              <>
                {tiket.map((brand, key) => (
                  <div className=''>
                    <div className='w-full'>


                      <div
                        className={`flex ${key === tiket.length - 1
                          ? ''
                          : 'border-b-8  border-[#D8EAFF] dark:border-strokedark '
                          }`}
                        key={key}
                      >

                        <div className='flex justify-center items-center pl-2 py-2'>

                          <button onClick={() => handleClickDetail(key)} className='h-14 w-8 text-xs font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-[4px]'><img src={Arrow} alt="" className='mx-2 py-1' /></button>
                        </div>

                        <div className=" flex flex-wrap  w-4/12  border-b-[#D8EAFF] px-2 gap-1  py-2">

                          <button type="button"
                            className={`inline-flex py-[6px] rounded-[3px] my-auto  md:px-5 px-1 md:text-[12px] text-[10px] sm:font-semibold bg-[#0065DE] text-white hover:bg-[#234a79] justify-center`}
                          >
                            RESPON
                          </button>
                          <button type="button" onClick={openModal1}
                            className={`inline-flex py-1 rounded-[3px] my-auto  md:px-5 px-2 md:text-[12px] text-[10px] sm:font-semibold bg-white border-[#0065DE] border text-primary justify-center`}
                          >
                            DETAIL
                          </button>
                        </div>

                        <div className=" flex items-center w-6/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                          <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">{brand.name}</p>
                        </div>
                        <div className=" flex items-center w-5/12 justify-center p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] ">
                          <p className="text-black text-center md:text-[12px] text-[10px] dark:text-white">{brand.date}</p>
                        </div>

                        <div className=" items-center justify-center md:w-5/12 w-2/12 p-2.5 md:px-7.5 px-5 border-b-[#D8EAFF] flex ">
                          <td className=" border-[#eee]   dark:border-strokedark">


                            {showModal1 && (
                              <Modal title="Incoming Maintenance Ticket"
                                isOpen={showModal1}
                                onClose={closeModal1}
                                ticketCode={'CTR03591'}
                                prepName={'GMC Ink 229'}
                                incDate={'28 May, 2024 06:37AM'}
                                prepCode={'3.2'} >
                                <p></p>
                              </Modal>
                            )}

                            {showModal2 && (
                              <ModalMtc
                                title="Select Maintenance Type"
                                isOpen={showModal2}
                                onClose={closeModal2}
                                machineName={'GMC Printer 2'}                    >
                                <div className="pt-5">

                                  <button onClick={openModal3} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                    RIGHT AWAY MAINTENANCE
                                  </button>
                                </div>
                                <div className="pt-2">
                                  <button onClick={openModal8} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                    SCHEDULE MAINTENANCE
                                  </button>
                                </div>
                              </ModalMtc>
                            )}

                            {showModal8 && (
                              <ModalMtcLightHeavy
                                title="Select Maintenance Type"
                                isOpen={showModal8}
                                onClose={closeModal8}
                              >
                                <div className="pt-5">

                                  <button onClick={openModal4} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                    MAINTENANCE RINGAN
                                  </button>
                                </div>
                                <div className="pt-2">
                                  <button onClick={openModal4} className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                    MAINTENANCE BERAT
                                  </button>
                                </div>
                              </ModalMtcLightHeavy>
                            )}
                            {showModal3 && (
                              <ModalMtc6type
                                isOpen={showModal3}
                                onClose={closeModal3}
                                ticketCode={'EXC0008'}
                              >
                                <p></p>
                              </ModalMtc6type>
                            )}
                            {showModal4 && (
                              <ModalMtcStockCheck
                                machineName={'GMC Printer 2'}
                                machineCode={'3.2'}
                                isOpen={showModal4}
                                onClose={closeModal4}
                              >
                                <button onClick={openModal6} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  REQUIRED STOCK UNAVAILABLE
                                </button>
                                <button onClick={openModal5} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                  NEXT STEP
                                </button>
                              </ModalMtcStockCheck>
                            )}

                            {showModal5 && (
                              <ModalMtc6type children={undefined} isOpen={showModal5} onClose={closeModal5} ticketCode={undefined} />
                            )}
                            {showModal6 && (
                              <ModalReplaced
                                isOpen={showModal6}
                                onClose={closeModal6}
                              >
                                <div className="flex  w-full gap-3 pt-5">
                                  <button onClick={openModal7} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                    YES
                                  </button>
                                  <button onClick={openModal9} className="w-6/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                    NO
                                  </button>
                                </div>
                              </ModalReplaced>
                            )}
                            {showModal7 && (
                              <ModalPurchasing
                                isOpen={showModal7}
                                onClose={closeModal7}>
                              </ModalPurchasing>
                            )}
                            {showModal9 && (
                              <ModalNewVendor
                                isOpen={showModal9}
                                onClose={closeModal9}
                              >
                                <div className="flex w-full gap-3 justify-end pt-[300px]">
                                  <button className="w-4/12 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md ">
                                    SEND REQUEST
                                  </button>
                                </div>
                              </ModalNewVendor>
                            )}
                          </td>
                        </div>
                      </div>
                      <div className='flex w-full'>
                        {showDetail[key] && (
                          <div className='w-full  bg-[#E9F3FF]  rounded-lg py-2'>
                            <div className='flex w-full'>
                              <div className='flex w-full'>

                                <div className='flex w-6/12 flex-col'>
                                  <p className='text-xs font-bold'>Nama Mesin</p>
                                  <p className='text-sm font-light'>R700</p>
                                </div>
                                <div className='flex w-6/12 flex-col'>
                                  <p className='text-xs font-bold'>Kendala</p>
                                  <p className='text-sm font-light'>Mesin Macet</p>
                                </div>


                              </div>

                            </div>

                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))
                }

              </>
            </div>

          </div>
        </>
      )}
    </div>

  );
};

export default TableIncomingMaintenance;
