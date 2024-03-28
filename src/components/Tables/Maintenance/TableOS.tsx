import { BRAND } from '../../../types/brand';
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

const brandData: BRAND[] = [
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40 RTX4080 800cc pro max',
    status: "pending",
    schedule: "unscheduled",
    action: 'request mtc',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40',
    status: "pending",
    schedule: "schedule requested",
    action: 'detail',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40',
    status: "pending",
    schedule: "schedule declined",
    action: 'reschedule',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40',
    status: "scheduled",
    schedule: "10/04/24 to 12/04/24",
    action: 'begin mtc',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40',
    status: "on progress",
    schedule: "12/04/24 to 24/04/24",
    action: 'action',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40',
    status: "pending verification",
    schedule: "12/04/24 to 24/04/24",
    action: 'detail',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00AM",
    machine: 'iCutter GT40',
    status: "monitoring",
    schedule: "12/04/24 to 24/04/24",
    action: 'detail',
  },

];

const TableOS = () => {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  const openModal1 = () => setShowModal1(true);
  const closeModal1 = () => setShowModal1(false);

  const openModal2 = () => {
    setShowModal2(true);
    setShowModal1(false);
  };

  const closeModal2 = () => setShowModal2(false);
  return (
    <div className="rounded-b-xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">


      <div className="flex flex-col">

        <div
          className='flex border-b border-stroke dark:border-strokedark'


        >
          <div className="flex items-center w-[3%] gap-3 p-1 ">

            <p className="hidden  text-slate-600 font-semibold dark:text-white text-[14px] sm:block">
              No
            </p>
          </div>

          <div className="flex items-center w-[250px] justify-center p-1 ">
            <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Ticket Code</p>
          </div>
          <div className="flex items-center w-[250px] justify-center p-1 ">
            <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Incoming Date</p>
          </div>

          <div className="flex items-center w-[250px] justify-center p-1 ">
            <p className="text-slate-600 font-semibold text-center">Machine Name</p>
          </div>

          <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
            <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Status</p>
          </div>
          <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
            <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Schedule</p>
          </div>

          <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
            <p className="text-slate-600 font-semibold text-center">Detail</p>
          </div>
        </div>
        {brandData.map((brand, key) => (
          <div
            className={`flex ${key === brandData.length - 1
              ? ''
              : 'border-b border-stroke dark:border-strokedark'
              }`}
            key={key}
          >
            <div className="flex items-center w-[3%]   gap-3 p-1 ">

              <p className="hidden text-black dark:text-white text-[14px] sm:block">
                {key + 1}
              </p>
            </div>

            <div className="flex items-center w-[250px]  justify-center p-1 ">
              <p className="text-black text-center dark:text-white text-[14px]">{brand.name}</p>
            </div>
            <div className="flex items-center w-[250px] justify-center p-1 ">
              <p className="text-black text-center dark:text-white text-[14px]">{brand.date}</p>
            </div>

            <div className="flex items-center w-[250px] justify-center p-1 text-[14px]">
              <p className="text-black text-center line-clamp-2">{brand.machine}</p>
            </div>

            <div className="hidden items-center justify-center w-[250px] p-1 sm:flex text-[14px] ">
              <td className=" border-[#eee]  px-4 dark:border-strokedark">
                <p
                  className={`inline-flex rounded-full uppercase bg-opacity-10  text-center px-3 text-sm font-medium ${brand.status === 'monitoring'
                    ? 'bg-blue-600 text-blue-600'
                    : brand.status === 'on progress'
                      ? 'bg-success text-success'
                      : brand.status === 'pending' || "pending verification" ? 'bg-orange-400 text-orange-400' : 'bg-white'
                    }`}
                >
                  {brand.status}
                </p>
              </td>
            </div>
            <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
              <td className=" border-[#eee]  px-4 dark:border-strokedark">
                <p
                  className={`inline-flex rounded-full uppercase bg-opacity-10 text-[14px] text-center px-3 text-sm font-medium ${brand.schedule === 'unscheduled'
                    ? 'bg-warning text-warning'
                    : brand.schedule === "schedule requested" ? 'bg-orange-400 text-orange-400' : brand.schedule === 'schedule declined' ? 'bg-danger text-danger' : 'bg-white'
                    }`}
                >
                  {brand.schedule}
                </p>
              </td>
            </div>

            <div className="hidden items-center justify-center w-[250px] p-1 sm:flex">
              <td className=" border-[#eee] text-[14px]  dark:border-strokedark">
                <div className="container mx-auto ">

                  <button type="button" onClick={openModal1}
                    className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1   hover:bg-blue-400 border border-blue-600 font-bold text-[12px] justify-center ${brand.action === 'detail' ? 'bg-white text-primary' : 'primary-blue text-white'} `}
                  >
                    <p className='mx-auto'>

                      {brand.action}
                    </p>
                  </button>
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

                </div>

              </td>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOS;