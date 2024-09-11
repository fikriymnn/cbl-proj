import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../images/logo/logo-cbl 2.svg';
import Dashboard from '../../images/icon/dashboard.svg';
import Inspect from '../../images/icon/inspect.svg';
import QC from '../../images/icon/qcc.svg';
import History from '../../images/icon/history2.svg';
import Master from '../../images/icon/master.svg';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  role: any;
  bagian: any;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  role,
  bagian,
}: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );
  const storedSidebarExpanded1 = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded1, setSidebarExpanded1] = useState(
    storedSidebarExpanded1 === null ? false : storedSidebarExpanded1 === 'true',
  );
  const renderAll = () => {
    // Conditionally render elements specific to the editor role
    return (
      <>
        <>
          <li>
            <NavLink
              to="/dashboard"
              className={`group relative flex items-center text-white mb-4 gap-5 rounded-sm py-3 px-4 font-medium  duration-300 ease-in-out  ${pathname.includes('/dashboard') && '!bg-white text-primary '
                }`}
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.998291 -0.00927734C0.445991 -0.00927734 -0.00170898 0.438723 -0.00170898 0.990723V13.9907C-0.00170898 16.1997 1.78919 17.9907 3.99829 17.9907H16.9983C17.5503 17.9907 17.9983 17.5427 17.9983 16.9907C17.9983 16.4387 17.5503 15.9907 16.9983 15.9907H3.99829C2.89369 15.9907 1.99829 15.0957 1.99829 13.9907V0.990723C1.99829 0.438723 1.55059 -0.00927734 0.998291 -0.00927734ZM10.9983 1.99072V3.99072H14.5603L11.7793 6.77173C11.6893 6.86273 11.4083 6.99072 11.2793 6.99072H9.71729C9.05829 6.99072 8.24529 7.30573 7.77929 7.77173L4.27949 11.2717C3.88899 11.6627 3.88899 12.3187 4.27949 12.7097C4.47479 12.9047 4.74239 12.9907 4.99829 12.9907C5.25419 12.9907 5.52179 12.9047 5.71709 12.7097L9.21729 9.20972C9.30729 9.11872 9.58829 8.99072 9.71729 8.99072H11.2793C11.9383 8.99072 12.7513 8.67572 13.2173 8.20972L15.9983 5.42871V8.99072H17.9983V2.99072C17.9983 2.43872 17.5503 1.99072 16.9983 1.99072H10.9983Z"
                  fill=""
                />
              </svg>
              Dashboard
            </NavLink>
          </li>
          <SidebarLinkGroup
            activeCondition={
              pathname === '/maintenance' || pathname.includes('maintenance')
            }
          >
            {(handleClick, open) => {
              return (
                <React.Fragment>
                  <NavLink
                    to="/maintenance/DashboardMaintenance"
                    className={({ isActive }) =>
                      `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4` +
                      (isActive &&
                        '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]')
                    }
                    onClick={(e) => {
                      e.preventDefault();

                      sidebarExpanded
                        ? handleClick()
                        : setSidebarExpanded(true);
                      navigate('/maintenance/DashboardMaintenance');
                    }}
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="19"
                      viewBox="0 0 20 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.6 4.55624L8.65 8.55702M4.6 4.55624H1.9L1 1.88906L1.9 1L4.6 1.88906V4.55624ZM16.5331 1.6588L14.1683 3.99492C13.8119 4.347 13.6336 4.52304 13.5669 4.72604C13.5081 4.9046 13.5081 5.09694 13.5669 5.27551C13.6336 5.47851 13.8119 5.65454 14.1683 6.00663L14.3817 6.21757C14.7381 6.56965 14.9164 6.74569 15.1219 6.81165C15.3026 6.86967 15.4974 6.86967 15.6781 6.81165C15.8836 6.74569 16.0619 6.56965 16.4183 6.21757L18.6304 4.03234C18.8686 4.60503 19 5.23228 19 5.88983C19 8.59045 16.7838 10.7797 14.05 10.7797C13.7204 10.7797 13.3983 10.7478 13.0868 10.6871C12.6492 10.6019 12.4305 10.5593 12.2979 10.5723C12.1569 10.5862 12.0874 10.6071 11.9625 10.6732C11.8449 10.7353 11.7271 10.8517 11.4913 11.0846L5.05 17.4476C4.30441 18.1841 3.09559 18.1841 2.35 17.4476C1.60441 16.7111 1.60441 15.5169 2.35 14.7804L8.7913 8.41744C9.0271 8.1845 9.14491 8.06808 9.20782 7.952C9.27469 7.82859 9.29584 7.75995 9.30988 7.62067C9.32311 7.48966 9.27991 7.27355 9.19369 6.84134C9.13222 6.53357 9.1 6.21542 9.1 5.88983C9.1 3.18925 11.3162 1 14.05 1C14.955 1 15.8032 1.23989 16.5331 1.6588ZM10.0001 12.5577L14.95 17.4475C15.6956 18.184 16.9044 18.184 17.65 17.4475C18.3956 16.711 18.3956 15.5169 17.65 14.7804L13.5778 10.7577C13.2895 10.7308 13.0084 10.6794 12.7367 10.6057C12.3865 10.5107 12.0024 10.5797 11.7457 10.8333L10.0001 12.5577Z" />
                    </svg>
                    Maintenance
                    <svg
                      className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                        }`}
                      width="7"
                      height="8"
                      viewBox="0 0 7 8"
                      fill=""
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                        fill=""
                      />
                    </svg>
                  </NavLink>
                  {/* <!-- Dropdown Menu Start --> */}
                  <div
                    className={`translate transform overflow-hidden ${!open && 'hidden'
                      }`}
                  >
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-3">
                      <li>
                        <NavLink
                          to="/maintenance/machine"
                          className={({ isActive }) =>
                            `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_481_1955)">
                              <path
                                d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                                fill=""
                              />
                              <path
                                d="M13.5 10.5H10.5V13.5H13.5V10.5Z"
                                fill=""
                              />
                              <path
                                d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                                fill=""
                              />
                              <path
                                d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                                fill=""
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_481_1955">
                                <rect width="24" height="24" fill="" />
                              </clipPath>
                            </defs>
                          </svg>
                          Corrective (CM)
                        </NavLink>
                      </li>
                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/inspection' ||
                            pathname.includes('inspection')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="#"
                                  className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/maintenance/inspection' ||
                                    pathname.includes(
                                      '/maintenance/inspection',
                                    )) &&
                                    ' dark:bg-meta-4'
                                    }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded1(true);
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  Preventive (PM)
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill="white"
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/pm_1"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        PM 1
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/pm_2"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        PM 2
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/pm_3"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 pb-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        PM 3
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/OS_3"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 pb-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        OS 3
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/histori"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 pb-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        Histori PM
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>

                      <li>
                        <NavLink
                          to="/maintenance/spb"
                          className={({ isActive }) =>
                            `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          <svg
                            width="17"
                            height="21"
                            viewBox="0 0 17 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M16.6667 6.25L10.4167 0H2.08333C1.5308 0 1.00089 0.219493 0.610194 0.610194C0.219493 1.00089 0 1.5308 0 2.08333V18.75C0 19.3025 0.219493 19.8324 0.610194 20.2231C1.00089 20.6138 1.5308 20.8333 2.08333 20.8333H14.5833C15.1359 20.8333 15.6658 20.6138 16.0565 20.2231C16.4472 19.8324 16.6667 19.3025 16.6667 18.75V6.25ZM5.20833 17.7083H3.125V8.33333H5.20833V17.7083ZM9.375 17.7083H7.29167V11.4583H9.375V17.7083ZM13.5417 17.7083H11.4583V14.5833H13.5417V17.7083ZM10.4167 7.29167H9.375V2.08333L14.5833 7.29167H10.4167Z"
                              fill="white"
                            />
                          </svg>
                          SPB
                        </NavLink>
                      </li>

                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/KPI' || pathname.includes('KPI')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="/maintenance/KPI"
                                  className={({ isActive }) =>
                                    `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                                    (isActive &&
                                      '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                  }
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded(true);
                                    navigate('/maintenance/KPI');
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  KPI
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill=""
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}

                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/KPIForm"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        KPI Form
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>
                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/maintenance/sparepart' ||
                            pathname.includes('/maintenance/sparepart')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="/maintenance/sparepart"
                                  className={({ isActive }) =>
                                    `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                                    (isActive && '')
                                  }
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded(true);
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  Sparepart
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill=""
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}

                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-5 pl-6 py-3">
                                    <li>
                                      <SidebarLinkGroup
                                        activeCondition={
                                          pathname ===
                                          '/maintenance/sparepart' ||
                                          pathname.includes('maintenance')
                                        }
                                      >
                                        {(handleClick, open) => {
                                          return (
                                            <React.Fragment>
                                              <NavLink
                                                to="/maintenance/sparepart/opname"
                                                className={({ isActive }) =>
                                                  `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-1 font-medium text-bodydark1 duration-300 ease-in-out ` +
                                                  (isActive && '')
                                                }
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  sidebarExpanded
                                                    ? handleClick()
                                                    : setSidebarExpanded(true);
                                                }}
                                              >
                                                <img src={Inspect} alt="Logo" />
                                                Stock Opname
                                                <svg
                                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                                    }`}
                                                  width="7"
                                                  height="8"
                                                  viewBox="0 0 7 8"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                                    fill=""
                                                  />
                                                </svg>
                                              </NavLink>
                                              {/* <!-- Dropdown Menu Start --> */}

                                              <div
                                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                                  }`}
                                              >
                                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                                  <li>
                                                    <NavLink
                                                      to="/maintenance/sparepart/opname/submitOpname"
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                                        (isActive &&
                                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                                      }
                                                    >
                                                      Submit
                                                    </NavLink>
                                                  </li>
                                                </ul>
                                              </div>
                                              <div
                                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                                  }`}
                                              >
                                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                                  <li>
                                                    <NavLink
                                                      to="/maintenance/sparepart/opname/adjustment"
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                                        (isActive &&
                                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                                      }
                                                    >
                                                      Adjustment
                                                    </NavLink>
                                                  </li>
                                                </ul>
                                              </div>
                                              <div
                                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                                  }`}
                                              >
                                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                                  <li>
                                                    <NavLink
                                                      to="/maintenance/sparepart/opname/histori"
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                                        (isActive &&
                                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                                      }
                                                    >
                                                      Histori
                                                    </NavLink>
                                                  </li>
                                                </ul>
                                              </div>
                                              {/* <!-- Dropdown Menu End --> */}
                                            </React.Fragment>
                                          );
                                        }}
                                      </SidebarLinkGroup>
                                    </li>
                                  </ul>
                                  <div
                                    className={`translate transform overflow-hidden ${!open && 'hidden'
                                      }`}
                                  >
                                    <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                      <li>
                                        <NavLink
                                          to="/maintenance/sparepart/stockmaster_sparepart"
                                          className={({ isActive }) =>
                                            'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                            (isActive &&
                                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                          }
                                        >
                                          Stock Master
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                  <div
                                    className={`translate transform overflow-hidden ${!open && 'hidden'
                                      }`}
                                  >
                                    <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                      <li>
                                        <NavLink
                                          to="/maintenance/sparepart/monitoringSparepart"
                                          className={({ isActive }) =>
                                            'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                            (isActive &&
                                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                          }
                                        >
                                          Monitoring Sparepart
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                  <div
                                    className={`translate transform overflow-hidden ${!open && 'hidden'
                                      }`}
                                  >
                                    <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                      <li>
                                        <NavLink
                                          to="/maintenance/sparepart/monitoringService"
                                          className={({ isActive }) =>
                                            'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                            (isActive &&
                                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                          }
                                        >
                                          Monitoring Service
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>
                      <NavLink
                        to="/maintenance/projectMtc"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path d="M13.5 10.5H10.5V13.5H13.5V10.5Z" fill="" />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Project Mtc Plan & Act
                      </NavLink>
                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/lapor' ||
                            pathname.includes('lapor')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="#"
                                  className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/maintenance/lapor' ||
                                    pathname.includes(
                                      '/maintenance/lapor',
                                    )) &&
                                    ' dark:bg-meta-4'
                                    }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded1(true);
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  LAPOR
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill="white"
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/lapor/ncr"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        NCR
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/lapor/capa"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        CAPA
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>


                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>
                    </ul>
                  </div>
                  {/* <!-- Dropdown Menu End --> */}
                </React.Fragment>
              );
            }}
          </SidebarLinkGroup>
        </>
        <SidebarLinkGroup
          activeCondition={
            pathname === '/qc' || pathname.includes('qc')
          }
        >
          {(handleClick, open) => {
            return (
              <React.Fragment>
                <NavLink
                  to="/qc"
                  className={({ isActive }) =>
                    `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4` +
                    (isActive &&
                      '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]')
                  }
                  onClick={(e) => {
                    e.preventDefault();

                    sidebarExpanded
                      ? handleClick()
                      : setSidebarExpanded(true);

                  }}
                >
                  <img src={QC} alt="Logo" />
                  Quality Control
                  <svg
                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                      }`}
                    width="7"
                    height="8"
                    viewBox="0 0 7 8"
                    fill=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                      fill=""
                    />
                  </svg>
                </NavLink>
                {/* <!-- Dropdown Menu Start --> */}
                <div
                  className={`translate transform overflow-hidden ${!open && 'hidden'
                    }`}
                >
                  <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-3">
                    <li>
                      <NavLink
                        to="/qc/validatenverify"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path
                              d="M13.5 10.5H10.5V13.5H13.5V10.5Z"
                              fill=""
                            />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Validate & Verify
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/qc/qualityinspection"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path
                              d="M13.5 10.5H10.5V13.5H13.5V10.5Z"
                              fill=""
                            />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Quality Inspection
                      </NavLink>
                    </li>
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/qms' ||
                          pathname.includes('qms')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/qc/qms' ||
                                  pathname.includes(
                                    '/qc/qms',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                QMS
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/qms/ncr"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      NCR
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/qms/capa"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      CAPA
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>


                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/lapor' ||
                          pathname.includes('lapor')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/qc/lapor' ||
                                  pathname.includes(
                                    '/qc/lapor',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                LAPOR
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/lapor/ncr"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      NCR
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/lapor/capa"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      CAPA
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>


                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                  </ul>
                </div>
                {/* <!-- Dropdown Menu End --> */}
              </React.Fragment>
            );
          }}
        </SidebarLinkGroup>

        <SidebarLinkGroup
          activeCondition={
            pathname === '/mr' || pathname.includes('mr')
          }
        >
          {(handleClick, open) => {
            return (
              <React.Fragment>
                <NavLink
                  to="/mr"
                  className={({ isActive }) =>
                    `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4` +
                    (isActive &&
                      '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]')
                  }
                  onClick={(e) => {
                    e.preventDefault();

                    sidebarExpanded
                      ? handleClick()
                      : setSidebarExpanded(true);

                  }}
                >
                  <img src={QC} alt="Logo" />
                  MR
                  <svg
                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                      }`}
                    width="7"
                    height="8"
                    viewBox="0 0 7 8"
                    fill=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                      fill=""
                    />
                  </svg>
                </NavLink>
                {/* <!-- Dropdown Menu Start --> */}
                <div
                  className={`translate transform overflow-hidden ${!open && 'hidden'
                    }`}
                >
                  <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-3">


                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/qms' ||
                          pathname.includes('qms')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/mr/qms' ||
                                  pathname.includes(
                                    '/mr/qms',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                QMS
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/mr/qms/ncr"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      NCR
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/mr/qms/capa"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      CAPA
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>


                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/lapor' ||
                          pathname.includes('lapor')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/mr/lapor' ||
                                  pathname.includes(
                                    '/mr/lapor',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                LAPOR
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/mr/lapor/ncr"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      NCR
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/mr/lapor/capa"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      CAPA
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>


                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                  </ul>
                </div>
                {/* <!-- Dropdown Menu End --> */}
              </React.Fragment>
            );
          }}
        </SidebarLinkGroup>
        <SidebarLinkGroup
          activeCondition={
            pathname === '/masterdata' || pathname.includes('masterdata')
          }
        >
          {(handleClick, open) => {
            return (
              <>
                <React.Fragment>
                  <NavLink
                    to="#"
                    className={`group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/masterdata' ||
                      pathname.includes('masterdata')) &&
                      ' dark:bg-meta-4'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      sidebarExpanded
                        ? handleClick()
                        : setSidebarExpanded(true);
                    }}
                  >
                    <img src={Master} alt="Logo" />
                    Master Data
                    <svg
                      className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                        }`}
                      width="7"
                      height="8"
                      viewBox="0 0 7 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                        fill="white"
                      />
                    </svg>
                  </NavLink>
                  {/* <!-- Dropdown Menu Start --> */}
                  <div
                    className={`translate transform overflow-hidden ${!open && 'hidden'
                      }`}
                  >
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/machine"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          Machine
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/mastersparepart"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          Sparepart
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masteranalisis"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          Analisis
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masterpm1"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          PM1
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masterpm2"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          PM2
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masterpm3"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          PM3
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masterkpi"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          KPI Form
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masterUsers"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          Users
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/masterRole"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          Role
                        </NavLink>
                      </li>
                    </ul>
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                      <li>
                        <NavLink
                          to="/masterdata/mastermonitoring"
                          className={({ isActive }) =>
                            'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          Monitoring
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                  {/* <!-- Dropdown Menu End --> */}
                </React.Fragment>
              </>
            );
          }}
        </SidebarLinkGroup>
        <SidebarLinkGroup
          activeCondition={
            pathname === '/masterdataqc' || pathname.includes('masterdataqc')
          }
        >
          {(handleClick, open) => {
            return (
              <React.Fragment>
                <NavLink
                  to="#"
                  className={`group relative flex items-center mb-5 gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/qc' || pathname.includes('qc')) &&
                    ' dark:bg-meta-4'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                  }}
                >
                  <img src={Master} alt="Logo" />
                  Master Data QC
                  <svg
                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                      }`}
                    width="7"
                    height="8"
                    viewBox="0 0 7 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                      fill="white"
                    />
                  </svg>
                </NavLink>
                {/* <!-- Dropdown Menu Start --> */}
                <div
                  className={`translate transform overflow-hidden ${!open && 'hidden'
                    }`}
                >
                  <ul className="mt-1 mb-5.5 flex flex-col gap-5 pl-6">
                    <li>
                      <NavLink
                        to="/masterdataqc/defect"
                        className={({ isActive }) =>
                          'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        Defect
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <div
                  className={`translate transform overflow-hidden ${!open && 'hidden'
                    }`}
                >
                  <ul className="mt-1 mb-5.5 flex flex-col gap-5 pl-6">
                    <li>
                      <NavLink
                        to="/masterdataqc/finalInspection"
                        className={({ isActive }) =>
                          'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        Final Inspection
                      </NavLink>
                    </li>
                  </ul>
                </div>
                ={/* <!-- Dropdown Menu End --> */}
              </React.Fragment>
            );
          }}
        </SidebarLinkGroup>
      </>
    );
  };
  const renderMTC = () => {
    // Conditionally render elements specific to the editor role
    return (
      <>
        <>
          <SidebarLinkGroup
            activeCondition={
              pathname === '/maintenance' || pathname.includes('maintenance')
            }
          >
            {(handleClick, open) => {
              return (
                <React.Fragment>
                  <NavLink
                    to="/maintenance/DashboardMaintenance"
                    className={({ isActive }) =>
                      `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4` +
                      (isActive &&
                        '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]')
                    }
                    onClick={(e) => {
                      e.preventDefault();

                      sidebarExpanded
                        ? handleClick()
                        : setSidebarExpanded(true);
                      navigate('/maintenance/DashboardMaintenance');
                    }}
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="19"
                      viewBox="0 0 20 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.6 4.55624L8.65 8.55702M4.6 4.55624H1.9L1 1.88906L1.9 1L4.6 1.88906V4.55624ZM16.5331 1.6588L14.1683 3.99492C13.8119 4.347 13.6336 4.52304 13.5669 4.72604C13.5081 4.9046 13.5081 5.09694 13.5669 5.27551C13.6336 5.47851 13.8119 5.65454 14.1683 6.00663L14.3817 6.21757C14.7381 6.56965 14.9164 6.74569 15.1219 6.81165C15.3026 6.86967 15.4974 6.86967 15.6781 6.81165C15.8836 6.74569 16.0619 6.56965 16.4183 6.21757L18.6304 4.03234C18.8686 4.60503 19 5.23228 19 5.88983C19 8.59045 16.7838 10.7797 14.05 10.7797C13.7204 10.7797 13.3983 10.7478 13.0868 10.6871C12.6492 10.6019 12.4305 10.5593 12.2979 10.5723C12.1569 10.5862 12.0874 10.6071 11.9625 10.6732C11.8449 10.7353 11.7271 10.8517 11.4913 11.0846L5.05 17.4476C4.30441 18.1841 3.09559 18.1841 2.35 17.4476C1.60441 16.7111 1.60441 15.5169 2.35 14.7804L8.7913 8.41744C9.0271 8.1845 9.14491 8.06808 9.20782 7.952C9.27469 7.82859 9.29584 7.75995 9.30988 7.62067C9.32311 7.48966 9.27991 7.27355 9.19369 6.84134C9.13222 6.53357 9.1 6.21542 9.1 5.88983C9.1 3.18925 11.3162 1 14.05 1C14.955 1 15.8032 1.23989 16.5331 1.6588ZM10.0001 12.5577L14.95 17.4475C15.6956 18.184 16.9044 18.184 17.65 17.4475C18.3956 16.711 18.3956 15.5169 17.65 14.7804L13.5778 10.7577C13.2895 10.7308 13.0084 10.6794 12.7367 10.6057C12.3865 10.5107 12.0024 10.5797 11.7457 10.8333L10.0001 12.5577Z" />
                    </svg>
                    Maintenance
                    <svg
                      className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                        }`}
                      width="7"
                      height="8"
                      viewBox="0 0 7 8"
                      fill=""
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                        fill=""
                      />
                    </svg>
                  </NavLink>
                  {/* <!-- Dropdown Menu Start --> */}
                  <div
                    className={`translate transform overflow-hidden ${!open && 'hidden'
                      }`}
                  >
                    <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-3">
                      <li>
                        <NavLink
                          to="/maintenance/machine"
                          className={({ isActive }) =>
                            `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_481_1955)">
                              <path
                                d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                                fill=""
                              />
                              <path
                                d="M13.5 10.5H10.5V13.5H13.5V10.5Z"
                                fill=""
                              />
                              <path
                                d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                                fill=""
                              />
                              <path
                                d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                                fill=""
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_481_1955">
                                <rect width="24" height="24" fill="" />
                              </clipPath>
                            </defs>
                          </svg>
                          Corrective (CM)
                        </NavLink>
                      </li>
                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/inspection' ||
                            pathname.includes('inspection')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="#"
                                  className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/maintenance/inspection' ||
                                    pathname.includes(
                                      '/maintenance/inspection',
                                    )) &&
                                    ' dark:bg-meta-4'
                                    }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded1(true);
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  Preventive (PM)
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill="white"
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/pm_1"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        PM 1
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/pm_2"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        PM 2
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/pm_3"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 pb-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        PM 3
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/OS_3"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 pb-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        OS 3
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/inspection/histori"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 pb-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        Histori PM
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>

                      <li>
                        <NavLink
                          to="/maintenance/spb"
                          className={({ isActive }) =>
                            `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                            (isActive &&
                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                          }
                        >
                          <svg
                            width="17"
                            height="21"
                            viewBox="0 0 17 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M16.6667 6.25L10.4167 0H2.08333C1.5308 0 1.00089 0.219493 0.610194 0.610194C0.219493 1.00089 0 1.5308 0 2.08333V18.75C0 19.3025 0.219493 19.8324 0.610194 20.2231C1.00089 20.6138 1.5308 20.8333 2.08333 20.8333H14.5833C15.1359 20.8333 15.6658 20.6138 16.0565 20.2231C16.4472 19.8324 16.6667 19.3025 16.6667 18.75V6.25ZM5.20833 17.7083H3.125V8.33333H5.20833V17.7083ZM9.375 17.7083H7.29167V11.4583H9.375V17.7083ZM13.5417 17.7083H11.4583V14.5833H13.5417V17.7083ZM10.4167 7.29167H9.375V2.08333L14.5833 7.29167H10.4167Z"
                              fill="white"
                            />
                          </svg>
                          SPB
                        </NavLink>
                      </li>

                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/KPI' || pathname.includes('KPI')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="/maintenance/KPI"
                                  className={({ isActive }) =>
                                    `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                                    (isActive &&
                                      '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                  }
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded(true);
                                    navigate('/maintenance/KPI');
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  KPI
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill=""
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}

                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/KPIForm"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        KPI Form
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>
                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/maintenance/sparepart' ||
                            pathname.includes('/maintenance/sparepart')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="/maintenance/sparepart"
                                  className={({ isActive }) =>
                                    `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                                    (isActive && '')
                                  }
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded(true);
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  Sparepart
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill=""
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}

                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-5 pl-6 py-3">
                                    <li>
                                      <SidebarLinkGroup
                                        activeCondition={
                                          pathname ===
                                          '/maintenance/sparepart' ||
                                          pathname.includes('maintenance')
                                        }
                                      >
                                        {(handleClick, open) => {
                                          return (
                                            <React.Fragment>
                                              <NavLink
                                                to="/maintenance/sparepart/opname"
                                                className={({ isActive }) =>
                                                  `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-1 font-medium text-bodydark1 duration-300 ease-in-out ` +
                                                  (isActive && '')
                                                }
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  sidebarExpanded
                                                    ? handleClick()
                                                    : setSidebarExpanded(true);
                                                }}
                                              >
                                                <img src={Inspect} alt="Logo" />
                                                Stock Opname
                                                <svg
                                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                                    }`}
                                                  width="7"
                                                  height="8"
                                                  viewBox="0 0 7 8"
                                                  fill="none"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                                    fill=""
                                                  />
                                                </svg>
                                              </NavLink>
                                              {/* <!-- Dropdown Menu Start --> */}

                                              <div
                                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                                  }`}
                                              >
                                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                                  <li>
                                                    <NavLink
                                                      to="/maintenance/sparepart/opname/submitOpname"
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                                        (isActive &&
                                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                                      }
                                                    >
                                                      Submit
                                                    </NavLink>
                                                  </li>
                                                </ul>
                                              </div>
                                              <div
                                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                                  }`}
                                              >
                                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                                  <li>
                                                    <NavLink
                                                      to="/maintenance/sparepart/opname/adjustment"
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                                        (isActive &&
                                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                                      }
                                                    >
                                                      Adjustment
                                                    </NavLink>
                                                  </li>
                                                </ul>
                                              </div>
                                              <div
                                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                                  }`}
                                              >
                                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                                  <li>
                                                    <NavLink
                                                      to="/maintenance/sparepart/opname/histori"
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                                        (isActive &&
                                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                                      }
                                                    >
                                                      Histori
                                                    </NavLink>
                                                  </li>
                                                </ul>
                                              </div>
                                              {/* <!-- Dropdown Menu End --> */}
                                            </React.Fragment>
                                          );
                                        }}
                                      </SidebarLinkGroup>
                                    </li>
                                  </ul>
                                  <div
                                    className={`translate transform overflow-hidden ${!open && 'hidden'
                                      }`}
                                  >
                                    <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                      <li>
                                        <NavLink
                                          to="/maintenance/sparepart/stockmaster_sparepart"
                                          className={({ isActive }) =>
                                            'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                            (isActive &&
                                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                          }
                                        >
                                          Stock Master
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                  <div
                                    className={`translate transform overflow-hidden ${!open && 'hidden'
                                      }`}
                                  >
                                    <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                      <li>
                                        <NavLink
                                          to="/maintenance/sparepart/monitoringSparepart"
                                          className={({ isActive }) =>
                                            'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                            (isActive &&
                                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                          }
                                        >
                                          Monitoring Sparepart
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                  <div
                                    className={`translate transform overflow-hidden ${!open && 'hidden'
                                      }`}
                                  >
                                    <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                      <li>
                                        <NavLink
                                          to="/maintenance/sparepart/monitoringService"
                                          className={({ isActive }) =>
                                            'group relative flex items-center gap-5  rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                            (isActive &&
                                              '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                          }
                                        >
                                          Monitoring Service
                                        </NavLink>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>
                      <NavLink
                        to="/maintenance/projectMtc"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path d="M13.5 10.5H10.5V13.5H13.5V10.5Z" fill="" />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Project Mtc Plan & Act
                      </NavLink>
                      <li>
                        <SidebarLinkGroup
                          activeCondition={
                            pathname === '/lapor' ||
                            pathname.includes('lapor')
                          }
                        >
                          {(handleClick, open) => {
                            return (
                              <React.Fragment>
                                <NavLink
                                  to="#"
                                  className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/maintenance/lapor' ||
                                    pathname.includes(
                                      '/maintenance/lapor',
                                    )) &&
                                    ' dark:bg-meta-4'
                                    }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    sidebarExpanded
                                      ? handleClick()
                                      : setSidebarExpanded1(true);
                                  }}
                                >
                                  <img src={Inspect} alt="Logo" />
                                  LAPOR
                                  <svg
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                      }`}
                                    width="7"
                                    height="8"
                                    viewBox="0 0 7 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                      fill="white"
                                    />
                                  </svg>
                                </NavLink>
                                {/* <!-- Dropdown Menu Start --> */}
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/lapor/ncr"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        NCR
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>
                                <div
                                  className={`translate transform overflow-hidden ${!open && 'hidden'
                                    }`}
                                >
                                  <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                    <li>
                                      <NavLink
                                        to="/maintenance/lapor/capa"
                                        className={({ isActive }) =>
                                          'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                          (isActive &&
                                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                        }
                                      >
                                        CAPA
                                      </NavLink>
                                    </li>
                                  </ul>
                                </div>


                                {/* <!-- Dropdown Menu End --> */}
                              </React.Fragment>
                            );
                          }}
                        </SidebarLinkGroup>
                      </li>
                    </ul>
                  </div>
                  {/* <!-- Dropdown Menu End --> */}
                </React.Fragment>
              );
            }}
          </SidebarLinkGroup>
          <SidebarLinkGroup
            activeCondition={
              pathname === '/masterdata' || pathname.includes('masterdata')
            }
          >
            {(handleClick, open) => {
              return (
                <>
                  <React.Fragment>
                    <NavLink
                      to="#"
                      className={`group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/masterdata' ||
                        pathname.includes('masterdata')) &&
                        ' dark:bg-meta-4'
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        sidebarExpanded
                          ? handleClick()
                          : setSidebarExpanded(true);
                      }}
                    >
                      <img src={Master} alt="Logo" />
                      Master Data
                      <svg
                        className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                          }`}
                        width="7"
                        height="8"
                        viewBox="0 0 7 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                          fill="white"
                        />
                      </svg>
                    </NavLink>
                    {/* <!-- Dropdown Menu Start --> */}
                    <div
                      className={`translate transform overflow-hidden ${!open && 'hidden'
                        }`}
                    >
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/machine"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            Machine
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/mastersparepart"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            Sparepart
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masteranalisis"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            Analisis
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masterpm1"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            PM1
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masterpm2"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            PM2
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masterpm3"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            PM3
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masterkpi"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            KPI Form
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masterUsers"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            Users
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/masterRole"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            Role
                          </NavLink>
                        </li>
                      </ul>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-6">
                        <li>
                          <NavLink
                            to="/masterdata/mastermonitoring"
                            className={({ isActive }) =>
                              'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                              (isActive &&
                                '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                            }
                          >
                            Monitoring
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                    {/* <!-- Dropdown Menu End --> */}
                  </React.Fragment>
                </>
              );
            }}
          </SidebarLinkGroup>
        </>
      </>
    );
  };
  const renderShift = () => {
    return (
      <>
        <li>
          <NavLink
            to="/dashboard"
            className={`group relative flex items-center text-white mb-4 gap-5 rounded-sm py-3 px-4 font-medium  duration-300 ease-in-out  ${pathname.includes('/dashboard') && '!bg-white text-primary '
              }`}
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.998291 -0.00927734C0.445991 -0.00927734 -0.00170898 0.438723 -0.00170898 0.990723V13.9907C-0.00170898 16.1997 1.78919 17.9907 3.99829 17.9907H16.9983C17.5503 17.9907 17.9983 17.5427 17.9983 16.9907C17.9983 16.4387 17.5503 15.9907 16.9983 15.9907H3.99829C2.89369 15.9907 1.99829 15.0957 1.99829 13.9907V0.990723C1.99829 0.438723 1.55059 -0.00927734 0.998291 -0.00927734ZM10.9983 1.99072V3.99072H14.5603L11.7793 6.77173C11.6893 6.86273 11.4083 6.99072 11.2793 6.99072H9.71729C9.05829 6.99072 8.24529 7.30573 7.77929 7.77173L4.27949 11.2717C3.88899 11.6627 3.88899 12.3187 4.27949 12.7097C4.47479 12.9047 4.74239 12.9907 4.99829 12.9907C5.25419 12.9907 5.52179 12.9047 5.71709 12.7097L9.21729 9.20972C9.30729 9.11872 9.58829 8.99072 9.71729 8.99072H11.2793C11.9383 8.99072 12.7513 8.67572 13.2173 8.20972L15.9983 5.42871V8.99072H17.9983V2.99072C17.9983 2.43872 17.5503 1.99072 16.9983 1.99072H10.9983Z"
                fill=""
              />
            </svg>
            Dashboard
          </NavLink>
        </li>
        <SidebarLinkGroup
          activeCondition={
            pathname === '/maintenance' || pathname.includes('maintenance')
          }
        >
          {(handleClick, open) => {
            return (
              <React.Fragment>
                <NavLink
                  to="/maintenance/DashboardMaintenance"
                  className={({ isActive }) =>
                    `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4` +
                    (isActive &&
                      '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]')
                  }
                  onClick={(e) => {
                    e.preventDefault();

                    sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                    navigate('/maintenance/DashboardMaintenance');
                  }}
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="19"
                    viewBox="0 0 20 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4.6 4.55624L8.65 8.55702M4.6 4.55624H1.9L1 1.88906L1.9 1L4.6 1.88906V4.55624ZM16.5331 1.6588L14.1683 3.99492C13.8119 4.347 13.6336 4.52304 13.5669 4.72604C13.5081 4.9046 13.5081 5.09694 13.5669 5.27551C13.6336 5.47851 13.8119 5.65454 14.1683 6.00663L14.3817 6.21757C14.7381 6.56965 14.9164 6.74569 15.1219 6.81165C15.3026 6.86967 15.4974 6.86967 15.6781 6.81165C15.8836 6.74569 16.0619 6.56965 16.4183 6.21757L18.6304 4.03234C18.8686 4.60503 19 5.23228 19 5.88983C19 8.59045 16.7838 10.7797 14.05 10.7797C13.7204 10.7797 13.3983 10.7478 13.0868 10.6871C12.6492 10.6019 12.4305 10.5593 12.2979 10.5723C12.1569 10.5862 12.0874 10.6071 11.9625 10.6732C11.8449 10.7353 11.7271 10.8517 11.4913 11.0846L5.05 17.4476C4.30441 18.1841 3.09559 18.1841 2.35 17.4476C1.60441 16.7111 1.60441 15.5169 2.35 14.7804L8.7913 8.41744C9.0271 8.1845 9.14491 8.06808 9.20782 7.952C9.27469 7.82859 9.29584 7.75995 9.30988 7.62067C9.32311 7.48966 9.27991 7.27355 9.19369 6.84134C9.13222 6.53357 9.1 6.21542 9.1 5.88983C9.1 3.18925 11.3162 1 14.05 1C14.955 1 15.8032 1.23989 16.5331 1.6588ZM10.0001 12.5577L14.95 17.4475C15.6956 18.184 16.9044 18.184 17.65 17.4475C18.3956 16.711 18.3956 15.5169 17.65 14.7804L13.5778 10.7577C13.2895 10.7308 13.0084 10.6794 12.7367 10.6057C12.3865 10.5107 12.0024 10.5797 11.7457 10.8333L10.0001 12.5577Z" />
                  </svg>
                  Maintenance
                  <svg
                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                      }`}
                    width="7"
                    height="8"
                    viewBox="0 0 7 8"
                    fill=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                      fill=""
                    />
                  </svg>
                </NavLink>
                {/* <!-- Dropdown Menu Start --> */}
                <div
                  className={`translate transform overflow-hidden ${!open && 'hidden'
                    }`}
                >
                  <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-3">
                    <li>
                      <NavLink
                        to="/maintenance/machine"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path d="M13.5 10.5H10.5V13.5H13.5V10.5Z" fill="" />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Corrective (CM)
                      </NavLink>
                    </li>
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/inspection' ||
                          pathname.includes('inspection')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/maintenance/inspection' ||
                                  pathname.includes(
                                    '/maintenance/inspection',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                Preventive (PM)
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/maintenance/inspection/pm_1"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      PM 1
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/maintenance/inspection/pm_2"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      PM 2
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/maintenance/inspection/pm_3"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 pb-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      PM 3
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/maintenance/inspection/OS_3"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 pb-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      OS 3
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/maintenance/inspection/histori"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 pb-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      Histori PM
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                  </ul>
                </div>
                {/* <!-- Dropdown Menu End --> */}
              </React.Fragment>
            );
          }}
        </SidebarLinkGroup>
      </>
    );
  };
  const renderQC = () => {
    return (
      <>
        <SidebarLinkGroup
          activeCondition={
            pathname === '/qc' || pathname.includes('qc')
          }
        >
          {(handleClick, open) => {
            return (
              <React.Fragment>
                <NavLink
                  to="/qc"
                  className={({ isActive }) =>
                    `group relative flex items-center mb-4 gap-5 rounded-sm py-2 px-4 font-medium !text-white duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4` +
                    (isActive &&
                      '!text-[#0065DE] bg-white text-primary py-3 px-1 text-[16px]')
                  }
                  onClick={(e) => {
                    e.preventDefault();

                    sidebarExpanded
                      ? handleClick()
                      : setSidebarExpanded(true);

                  }}
                >
                  <img src={QC} alt="Logo" />
                  Quality Control
                  <svg
                    className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                      }`}
                    width="7"
                    height="8"
                    viewBox="0 0 7 8"
                    fill=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                      fill=""
                    />
                  </svg>
                </NavLink>
                {/* <!-- Dropdown Menu Start --> */}
                <div
                  className={`translate transform overflow-hidden ${!open && 'hidden'
                    }`}
                >
                  <ul className="mt-4 mb-5.5 flex flex-col gap-5 pl-3">
                    <li>
                      <NavLink
                        to="/qc/validatenverify"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path
                              d="M13.5 10.5H10.5V13.5H13.5V10.5Z"
                              fill=""
                            />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Validate & Verify
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/qc/qualityinspection"
                        className={({ isActive }) =>
                          `group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out ` +
                          (isActive &&
                            '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                        }
                      >
                        <svg
                          className="fill-current"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_481_1955)">
                            <path
                              d="M15.5 16.5C15.7652 16.5 16.0196 16.3946 16.2071 16.2071C16.3946 16.0196 16.5 15.7652 16.5 15.5V14H17.25C17.4489 14 17.6397 13.921 17.7803 13.7803C17.921 13.6397 18 13.4489 18 13.25C18 13.0511 17.921 12.8603 17.7803 12.7197C17.6397 12.579 17.4489 12.5 17.25 12.5H16.5V11.5H17.25C17.4489 11.5 17.6397 11.421 17.7803 11.2803C17.921 11.1397 18 10.9489 18 10.75C18 10.5511 17.921 10.3603 17.7803 10.2197C17.6397 10.079 17.4489 10 17.25 10H16.5V8.5C16.5 8.23478 16.3946 7.98043 16.2071 7.79289C16.0196 7.60536 15.7652 7.5 15.5 7.5H14V6.75C14 6.55109 13.921 6.36032 13.7803 6.21967C13.6397 6.07902 13.4489 6 13.25 6C13.0511 6 12.8603 6.07902 12.7197 6.21967C12.579 6.36032 12.5 6.55109 12.5 6.75V7.5H11.5V6.75C11.5 6.55109 11.421 6.36032 11.2803 6.21967C11.1397 6.07902 10.9489 6 10.75 6C10.5511 6 10.3603 6.07902 10.2197 6.21967C10.079 6.36032 10 6.55109 10 6.75V7.5H8.5C8.23478 7.5 7.98043 7.60536 7.79289 7.79289C7.60536 7.98043 7.5 8.23478 7.5 8.5V10H6.75C6.55109 10 6.36032 10.079 6.21967 10.2197C6.07902 10.3603 6 10.5511 6 10.75C6 10.9489 6.07902 11.1397 6.21967 11.2803C6.36032 11.421 6.55109 11.5 6.75 11.5H7.5V12.5H6.75C6.55109 12.5 6.36032 12.579 6.21967 12.7197C6.07902 12.8603 6 13.0511 6 13.25C6 13.4489 6.07902 13.6397 6.21967 13.7803C6.36032 13.921 6.55109 14 6.75 14H7.5V15.5C7.5 15.7652 7.60536 16.0196 7.79289 16.2071C7.98043 16.3946 8.23478 16.5 8.5 16.5H10V17.25C10 17.4489 10.079 17.6397 10.2197 17.7803C10.3603 17.921 10.5511 18 10.75 18C10.9489 18 11.1397 17.921 11.2803 17.7803C11.421 17.6397 11.5 17.4489 11.5 17.25V16.5H12.5V17.25C12.5 17.4489 12.579 17.6397 12.7197 17.7803C12.8603 17.921 13.0511 18 13.25 18C13.4489 18 13.6397 17.921 13.7803 17.7803C13.921 17.6397 14 17.4489 14 17.25V16.5H15.5ZM9 9H15V15H9V9Z"
                              fill=""
                            />
                            <path
                              d="M13.5 10.5H10.5V13.5H13.5V10.5Z"
                              fill=""
                            />
                            <path
                              d="M22.8 9.34999L20.5 7.44999V3.74999C20.4984 3.65411 20.4693 3.56071 20.4161 3.48093C20.3629 3.40114 20.2879 3.33833 20.2 3.29999L15.25 1.04999H15.05L14.75 1.14999L14.5 1.29999V4.29999C14.5 4.4989 14.579 4.68967 14.7197 4.83032C14.8603 4.97097 15.0511 5.04999 15.25 5.04999C15.4489 5.04999 15.6397 4.97097 15.7803 4.83032C15.921 4.68967 16 4.4989 16 4.29999V3.59999L18.5 4.74999V8.44999L19.25 9.04999L21 10.45V13.55L19.25 14.95L18.5 15.55V19.25L16 20.4V19.75C16 19.5511 15.921 19.3603 15.7803 19.2197C15.6397 19.079 15.4489 19 15.25 19C15.0511 19 14.8603 19.079 14.7197 19.2197C14.579 19.3603 14.5 19.5511 14.5 19.75V22.75L14.75 22.9L15.05 23H15.25L20.2 20.75C20.2879 20.7116 20.3629 20.6488 20.4161 20.5691C20.4693 20.4893 20.4984 20.3959 20.5 20.3V16.55L22.8 14.65C22.8653 14.6065 22.9181 14.5468 22.9532 14.4766C22.9883 14.4064 23.0044 14.3283 23 14.25V9.74999C23.0103 9.67098 22.9968 9.59069 22.9611 9.51943C22.9255 9.44816 22.8694 9.38916 22.8 9.34999Z"
                              fill=""
                            />
                            <path
                              d="M8.94993 1H8.74993L3.79993 3.3C3.71204 3.33834 3.63703 3.40115 3.58384 3.48094C3.53065 3.56072 3.50152 3.65412 3.49993 3.75V7.45L1.19993 9.35C1.13055 9.38917 1.07444 9.44817 1.03881 9.51944C1.00318 9.59071 0.989641 9.67099 0.999934 9.75V14.25C0.995514 14.3283 1.01164 14.4064 1.04673 14.4766C1.08181 14.5468 1.13462 14.6065 1.19993 14.65L3.49993 16.55V20.25C3.50152 20.3459 3.53065 20.4393 3.58384 20.5191C3.63703 20.5988 3.71204 20.6617 3.79993 20.7L8.74993 22.95H8.94993L9.24993 22.85L9.49993 22.7V19.7C9.49993 19.5011 9.42092 19.3103 9.28026 19.1697C9.13961 19.029 8.94885 18.95 8.74993 18.95C8.55102 18.95 8.36026 19.029 8.2196 19.1697C8.07895 19.3103 7.99993 19.5011 7.99993 19.7V20.35L5.49993 19.2V15.55L4.74993 14.95L2.99993 13.55V10.45L4.74993 9.05L5.49993 8.45V4.75L7.99993 3.6V4.25C7.99993 4.44891 8.07895 4.63968 8.2196 4.78033C8.36026 4.92098 8.55102 5 8.74993 5C8.94885 5 9.13961 4.92098 9.28026 4.78033C9.42092 4.63968 9.49993 4.44891 9.49993 4.25V1.25L9.24993 1.1L8.94993 1Z"
                              fill=""
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_481_1955">
                              <rect width="24" height="24" fill="" />
                            </clipPath>
                          </defs>
                        </svg>
                        Quality Inspection
                      </NavLink>
                    </li>
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/qms' ||
                          pathname.includes('qms')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/qc/qms' ||
                                  pathname.includes(
                                    '/qc/qms',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                QMS
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/qms/ncr"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      NCR
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/qms/capa"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      CAPA
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>


                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                    <li>
                      <SidebarLinkGroup
                        activeCondition={
                          pathname === '/lapor' ||
                          pathname.includes('lapor')
                        }
                      >
                        {(handleClick, open) => {
                          return (
                            <React.Fragment>
                              <NavLink
                                to="#"
                                className={`group relative flex items-center gap-5 mb-2 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${(pathname === '/qc/lapor' ||
                                  pathname.includes(
                                    '/qc/lapor',
                                  )) &&
                                  ' dark:bg-meta-4'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  sidebarExpanded
                                    ? handleClick()
                                    : setSidebarExpanded1(true);
                                }}
                              >
                                <img src={Inspect} alt="Logo" />
                                LAPOR
                                <svg
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-90'
                                    }`}
                                  width="7"
                                  height="8"
                                  viewBox="0 0 7 8"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.5 3.13397C7.16667 3.51887 7.16667 4.48113 6.5 4.86603L2 7.4641C1.33334 7.849 0.500001 7.36788 0.500001 6.59808L0.500001 1.40193C0.500001 0.632125 1.33333 0.150999 2 0.535899L6.5 3.13397Z"
                                    fill="white"
                                  />
                                </svg>
                              </NavLink>
                              {/* <!-- Dropdown Menu Start --> */}
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5 md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/lapor/ncr"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-3 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      NCR
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>
                              <div
                                className={`translate transform overflow-hidden ${!open && 'hidden'
                                  }`}
                              >
                                <ul className=" flex flex-col gap-5  md:pl-12 pl-6 py-3">
                                  <li>
                                    <NavLink
                                      to="/qc/lapor/capa"
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-5 py-2 rounded-sm px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                        (isActive &&
                                          '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                                      }
                                    >
                                      CAPA
                                    </NavLink>
                                  </li>
                                </ul>
                              </div>


                              {/* <!-- Dropdown Menu End --> */}
                            </React.Fragment>
                          );
                        }}
                      </SidebarLinkGroup>
                    </li>
                  </ul>
                </div>
                {/* <!-- Dropdown Menu End --> */}
              </React.Fragment>
            );
          }}
        </SidebarLinkGroup>
      </>
    );
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-40 xl:z-40 flex h-screen  flex-col overflow-y-hidden w-[270px] bg-gradient-to-b from-[#016AE6] to-[#014BA2] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center md:justify-center  gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto  duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">
              {role === 'super admin' && renderAll()}
              {role === 'section head' &&
                bagian === 'maintenance' &&
                renderMTC()}
              {role === 'admin' && bagian === 'maintenance' && renderMTC()}
              {role === 'supervisor' && bagian === 'maintenance' && renderMTC()}

              {role === 'senior technician' &&
                bagian === 'maintenance' &&
                renderShift()}
              {role === 'shift technician' &&
                bagian === 'maintenance' &&
                renderShift()}
              {role === 'junior technician' &&
                bagian === 'maintenance' &&
                renderShift()}
              {role === 'admin' && bagian === 'quality control' && renderQC()}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
