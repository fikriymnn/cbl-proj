import { BRAND } from '../../types/brand';
import BrandOne from '../../images/brand/brand-01.svg';
import BrandTwo from '../../images/brand/brand-02.svg';
import BrandThree from '../../images/brand/brand-03.svg';
import BrandFour from '../../images/brand/brand-04.svg';
import BrandFive from '../../images/brand/brand-05.svg';

const brandData: BRAND[] = [
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "pending verification",
    action: 4.8,
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "monitoring",
    action: 4.3,
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "pending",
    action: 3.7,
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "on progress",
    action: 2.5,
  },
  {

    name: 'EX000003',
    date: "12/22/24 07:00UTC",
    machine: 'iCutter GT40',
    status: "pending",
    action: 4.2,
  },
];

const TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Incoming Maintenance Ticket
      </h4>

      <div className="flex flex-col">

        <div
          className='flex border-b border-stroke dark:border-strokedark'


        >
          <div className="flex items-center  w-1/12 gap-3 p-2.5 ">

            <p className="hidden  text-slate-600 font-semibold dark:text-white sm:block">
              No
            </p>
          </div>

          <div className="flex items-center w-3/12 justify-center p-2.5 ">
            <p className="text-slate-600 font-semibold text-center dark:text-white">Ticket Code</p>
          </div>
          <div className="flex items-center w-3/12 justify-center p-2.5 ">
            <p className="text-slate-600 font-semibold text-center dark:text-white">Incoming Date</p>
          </div>

          <div className="flex items-center w-3/12 justify-center p-2.5 ">
            <p className="text-slate-600 font-semibold text-center">Machine Name</p>
          </div>

          <div className="hidden items-center justify-center w-3/12 p-2.5 sm:flex ">
            <p className="text-slate-600 font-semibold text-center dark:text-white">Status</p>
          </div>

          <div className="hidden items-center justify-center w-3/12 p-2.5 sm:flex ">
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
            <div className="flex items-center w-1/12   gap-3 p-2.5 ">

              <p className="hidden text-black dark:text-white sm:block">
                {key + 1}
              </p>
            </div>

            <div className="flex items-center w-3/12 justify-center p-2.5 ">
              <p className="text-black text-center dark:text-white">{brand.name}</p>
            </div>
            <div className="flex items-center w-3/12 justify-center p-2.5 ">
              <p className="text-black text-center dark:text-white">{brand.date}</p>
            </div>

            <div className="flex items-center w-3/12 justify-center p-2.5 ">
              <p className="text-black text-center">{brand.machine}</p>
            </div>

            <div className="hidden items-center justify-center w-3/12 p-2.5 sm:flex ">
              <td className=" border-[#eee]  px-4 dark:border-strokedark">
                <p
                  className={`inline-flex rounded-full bg-opacity-10  text-center px-3 text-sm font-medium ${brand.status === 'monitoring'
                    ? 'bg-success text-success'
                    : brand.status === 'on progress'
                      ? 'bg-blue-600 text-blue-bg-blue-600'
                      : brand.status === 'pending' || "pending verification" ? 'bg-warning text-warning' : 'bg-white'
                    }`}
                >
                  {brand.status}
                </p>
              </td>
            </div>

            <div className="hidden items-center justify-center w-3/12 p-2.5 sm:flex">
              <td className=" border-[#eee]  px-4 dark:border-strokedark">
                <button
                  className={`inline-flex rounded-full   px-3 text-sm font-medium primary-blue text-white hover:bg-blue-400 `}
                >
                  Detail
                </button>
              </td>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
