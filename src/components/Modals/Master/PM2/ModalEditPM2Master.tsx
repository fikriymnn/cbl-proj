import { useEffect, useState } from 'react';
import axios from 'axios';

const ModalEditPM2Master = ({
  children,
  isOpen,
  onClose,
  idPoint,
  data,
}: {
  children: any;
  isOpen: any;
  onClose: any;
  idPoint: number;
  data: any;
}) => {
  if (!isOpen) return null;

  const [isMobile, setIsMobile] = useState(false);
  const [point, setPoint] = useState(data);
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

  //change value point pm1
  const handleChangePoint = (e: any) => {
    const { name, value } = e.target;
    const onchangeVal: any = point;
    onchangeVal.inspection_point = value;
    setPoint(onchangeVal);
  };

  //change value category pm1
  const handleChangePointCategory = (e: any) => {
    const { name, value } = e.target;
    const onchangeVal: any = point;
    onchangeVal.category = value;
    setPoint(onchangeVal);
  };

  //change value point Task pm1
  const handleChangePointTask = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = point;
    onchangeVal.ms_inspection_task_pm2s[i][name] = value;
    setPoint(onchangeVal);
  };

  async function submitEDitPointPm1(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/master/pointPm2/${id}`;

    try {
      const res = await axios.put(
        url,
        {
          inspection_point: point.inspection_point,
          category: point.category,
          ms_inspection_task_pm2s: point.ms_inspection_task_pm2s,
        },
        {
          withCredentials: true,
        },
      );

      alert(res.data.msg);
    } catch (error: any) {
      console.log(error);
      //alert(error.data.msg);
    }
  }

  return (
    <div className="fixed z-50 inset-0 h-full backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-md max-h-screen ">
        <div className="flex w-full items-center pt-4 px-3">
          <svg
            className="flex w-12"
            width="20"
            height="19"
            viewBox="0 0 20 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z"
              stroke="#0065DE"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <label className="flex w-11/12 text-blue-700 text-sm font-bold ">
            Form Edit Inspection Point
          </label>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 focus:outline-none"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="11" fill="#0065DE" />
              <rect
                x="6.03955"
                y="4.23242"
                width="17"
                height="3"
                rx="1.5"
                transform="rotate(42.8321 6.03955 4.23242)"
                fill="white"
              />
              <rect
                x="4.18213"
                y="16.0609"
                width="17"
                height="3"
                rx="1.5"
                transform="rotate(-45 4.18213 16.0609)"
                fill="white"
              />
            </svg>
          </button>
        </div>
        <div className="pt-10">
          <>
            <div className="flex flex-row gap-4 px-4">
              <label className="text-black text-xs font-bold">POINT</label>
              <label className="text-black text-xs font-bold">
                INSPECTION POINT
              </label>
            </div>
            <div className="flex w-full flex-row gap-4 pt-3 px-4">
              <div className="flex w-[40px] justify-center">
                <label className="text-neutral-500 text-sm font-semibold">
                  1
                </label>
              </div>
              <div className="flex w-10/12">
                <input
                  name="inspection_point"
                  defaultValue={point.inspection_point}
                  onChange={(e) => handleChangePoint(e)}
                  type="text"
                  className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                />
                <select
                  name="category"
                  defaultValue={point.category}
                  onChange={(e) => handleChangePointCategory(e)}
                  className='border-2 border-stroke rounded-md '
                >
                  <option selected disabled value={''}>
                    Select Category
                  </option>
                  <option value={'machine'}>Machine</option>
                  <option value={'man'}>Man</option>
                </select>
              </div>
            </div>

            {!isMobile && (
              <>
                <div className="flex  pt-6 border-b border-stroke ml-[80px]">
                  <label className="text-black text-xs font-bold">
                    TASK LIST
                  </label>
                </div>
                {data.ms_inspection_task_pm2s.map((task: any, i: number) => {
                  return (
                    <div className="flex  pt-4 border-b border-stroke ml-[70px] pb-4">
                      <div className="flex w-[60px] justify-center">
                        <label className="text-black text-xs font-bold">
                          {i + 1}
                        </label>
                      </div>
                      <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                        <label className="text-black text-xs font-bold">
                          TASK
                        </label>
                        <input
                          name="task"
                          defaultValue={task.task}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                        <label className="text-black text-xs font-bold pt-2">
                          INSPECTION METHOD
                        </label>
                        <input
                          name="method"
                          defaultValue={task.method}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                      </div>
                      <div className="flex w-5/12 justify-start pl-6 flex-col gap-2">
                        <label className="text-black text-xs font-bold text-start">
                          ACCEPTANCE CRITERIA
                        </label>
                        <input
                          name="acceptance_criteria"
                          defaultValue={task.acceptance_criteria}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                        <label className="text-black text-xs font-bold pt-2">
                          TOOLS
                        </label>
                        <input
                          name="tools"
                          defaultValue={task.tools}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {isMobile && (
              <>
                <div className="flex  pt-6 border-b border-stroke px-2 ">
                  <label className="text-black text-xs font-bold">
                    TASK LIST
                  </label>
                </div>
                {data.ms_inspection_task_pm2s.map((task: any, i: number) => {
                  return (
                    <div className="flex  pt-4 border-b border-stroke  pb-4">
                      <div className="flex w-[30px] justify-center">
                        <label className="text-black text-xs font-bold">
                          {i + 1}
                        </label>
                      </div>
                      <div className="flex w-5/12 justify-start flex-col gap-2">
                        <label className="text-black text-xs font-bold">
                          TASK
                        </label>
                        <input
                          name="task"
                          defaultValue={task.task}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                        <label className="text-black text-xs font-bold pt-2">
                          INSPECTION METHOD
                        </label>
                        <input
                          name="method"
                          defaultValue={task.method}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                      </div>
                      <div className="flex w-5/12 justify-start  flex-col gap-2 pl-2">
                        <label className="text-black text-xs font-bold text-start">
                          ACCEPTANCE CRITERIA
                        </label>
                        <input
                          name="acceptance_criteria"
                          defaultValue={task.acceptance_criteria}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                        <label className="text-black text-xs font-bold pt-2">
                          TOOLS
                        </label>
                        <input
                          name="tools"
                          defaultValue={task.tools}
                          onChange={(e) => handleChangePointTask(e, i)}
                          type="text"
                          className=" w-full h-12 border-2 border-stroke rounded-md"
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <div className="flex w-full px-6 py-3 justify-end">
              <button
                onClick={() => submitEDitPointPm1(idPoint)}
                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
              >
                SIMPAN
              </button>
            </div>
          </>
        </div>
        <div className="px-4 pb-4">
          <div className=" flex w-full pt-4 gap-5">
            <button
              title="button"
              type="button"
              onClick={onClose}
              className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
            ></button>
          </div>
          {children}
        </div>

        {/* {JSON.stringify(point)} */}
      </div>
    </div>
  );
};

export default ModalEditPM2Master;
