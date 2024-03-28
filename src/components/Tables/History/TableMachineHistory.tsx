import { BRAND } from '../../../types/brand';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

const brandData: BRAND[] = [
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "pending",
    schedule: "unscheduled",
    action: 'request mtc',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "pending",
    schedule: "schedule requested",
    action: 'detail',
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "pending",
    schedule: ["schedule declined", "12/04/24 to 24/04/24"],
    action: 3.7,
  },
];

const TableMachineHistory = () => {
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
    <div className=" border border-stroke rounded-b-xl bg-white px-5 pt-2 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">

      <div className="flex flex-col">
        <div className="relative flex w-full justify-end justify-items-end border-b border-stroke dark:border-strokedark pb-2">
          <input
            type="text"
            className="flex py-2 text-black text-sm font-normal bg-white h-full px-2 w-[220px] border-b border-stroke"
            placeholder="Search"
            id="searchInput"
          />
          <div className="flex items-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7593 10.9907L9.74977 8.99734C10.5298 8.02473 10.9076 6.79021 10.8054 5.54762C10.7032 4.30504 10.1288 3.14884 9.20026 2.31677C8.27176 1.48469 7.05974 1.03999 5.81343 1.07409C4.56712 1.1082 3.38124 1.61852 2.49963 2.50012C1.61803 3.38173 1.10771 4.56761 1.0736 5.81392C1.0395 7.06023 1.48421 8.27225 2.31628 9.20074C3.14836 10.1292 4.30455 10.7037 5.54714 10.8059C6.78972 10.9081 8.02424 10.5303 8.99685 9.75025L10.9902 11.7436C11.0405 11.7944 11.1004 11.8347 11.1665 11.8622C11.2325 11.8897 11.3033 11.9038 11.3748 11.9038C11.4463 11.9038 11.5171 11.8897 11.5831 11.8622C11.6491 11.8347 11.709 11.7944 11.7593 11.7436C11.857 11.6426 11.9116 11.5076 11.9116 11.3671C11.9116 11.2267 11.857 11.0917 11.7593 10.9907ZM5.9581 9.75025C5.20818 9.75025 4.4751 9.52788 3.85156 9.11124C3.22802 8.69461 2.74204 8.10243 2.45506 7.4096C2.16807 6.71676 2.09299 5.95438 2.23929 5.21887C2.38559 4.48336 2.74671 3.80775 3.27699 3.27747C3.80726 2.7472 4.48287 2.38608 5.21838 2.23978C5.95389 2.09347 6.71627 2.16856 7.40911 2.45554C8.10194 2.74253 8.69412 3.22851 9.11075 3.85205C9.52739 4.47559 9.74977 5.20867 9.74977 5.95859C9.74977 6.9642 9.35029 7.92862 8.63921 8.6397C7.92814 9.35078 6.96371 9.75025 5.9581 9.75025Z"
                fill="#717171"
              />
            </svg>
          </div>
        </div>
        <div
          className='flex border-b border-stroke dark:border-strokedark'
        >
          <div className="flex items-center  w-1/12 gap-3 p-2.5 ">

            <p className="hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
              No
            </p>
          </div>

          <div className="flex items-center w-3/12 justify-center p-2.5 ">
            <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Ticket Code</p>
          </div>
          <div className="flex items-center text-[14px] w-3/12 justify-center p-2.5 ">
            <p className="text-slate-600 font-semibold text-center dark:text-white">Incoming Date</p>
          </div>

          <div className="flex items-center text-[14px] w-3/12 justify-center p-2.5 ">
            <p className="text-slate-600 font-semibold text-center">Machine Name</p>
          </div>
          <div className="hidden items-center justify-center w-5/12 p-2.5 sm:flex ">
            <p className="text-slate-600 text-[14px] font-semibold text-center">Detail</p>
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
            <div className="flex items-center w-1/12   gap-3 p-2.5 ">

              <p className="hidden text-[14px] text-black dark:text-white sm:block">
                {key + 1}
              </p>
            </div>

            <div className="flex items-center w-3/12 justify-center p-2.5 ">
              <p className="text-black text-center text-[14px] dark:text-white">{brand.name}</p>
            </div>
            <div className="flex items-center w-3/12 justify-center p-2.5 ">
              <p className="text-black text-center text-[14px] dark:text-white">{brand.date}</p>
            </div>

            <div className="flex items-center w-3/12 justify-center p-2.5 ">
              <p className="text-black text-center text-[14px]">{brand.machine}</p>
            </div>



            <div className="hidden items-center justify-center w-5/12 p-2.5 sm:flex">
              <td className=" border-[#eee]   dark:border-strokedark">
                <div className="container mx-auto flex  gap-3">
                  <button type="button" onClick={openModal1}
                    className={`inline-flex rounded-[3px] my-auto px-2 text-sm font-bold text-[12px] bg-white border-[#0065DE] border text-primary justify-center items-center hover:bg-blue-400 `}
                  >
                    DETAIL
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

export default TableMachineHistory;
