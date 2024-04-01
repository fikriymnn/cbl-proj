import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../images/logo/logo-cbl 2.svg';
import Dashboard from '../../images/icon/dashboard.svg'

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

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
      className={`absolute left-0 top-0 z-99999 xl:z-40 flex h-screen  flex-col overflow-y-hidden w-[278px] bg-gradient-to-b from-[#016AE6] to-[#014BA2] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center md:justify-center    gap-2 px-6 py-5.5 lg:py-6.5">
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
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <NavLink
                  to="/"
                  className={`group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out  ${pathname.includes('/') &&
                    '!bg-white text-primary '
                    }`}
                >

                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.998291 -0.00927734C0.445991 -0.00927734 -0.00170898 0.438723 -0.00170898 0.990723V13.9907C-0.00170898 16.1997 1.78919 17.9907 3.99829 17.9907H16.9983C17.5503 17.9907 17.9983 17.5427 17.9983 16.9907C17.9983 16.4387 17.5503 15.9907 16.9983 15.9907H3.99829C2.89369 15.9907 1.99829 15.0957 1.99829 13.9907V0.990723C1.99829 0.438723 1.55059 -0.00927734 0.998291 -0.00927734ZM10.9983 1.99072V3.99072H14.5603L11.7793 6.77173C11.6893 6.86273 11.4083 6.99072 11.2793 6.99072H9.71729C9.05829 6.99072 8.24529 7.30573 7.77929 7.77173L4.27949 11.2717C3.88899 11.6627 3.88899 12.3187 4.27949 12.7097C4.47479 12.9047 4.74239 12.9907 4.99829 12.9907C5.25419 12.9907 5.52179 12.9047 5.71709 12.7097L9.21729 9.20972C9.30729 9.11872 9.58829 8.99072 9.71729 8.99072H11.2793C11.9383 8.99072 12.7513 8.67572 13.2173 8.20972L15.9983 5.42871V8.99072H17.9983V2.99072C17.9983 2.43872 17.5503 1.99072 16.9983 1.99072H10.9983Z" fill="" />
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
                        to="#"
                        className={`group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/maintenance' ||
                          pathname.includes('maintenance')) &&
                          ' dark:bg-meta-4'
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.6 4.55624L8.65 8.55702M4.6 4.55624H1.9L1 1.88906L1.9 1L4.6 1.88906V4.55624ZM16.5331 1.6588L14.1683 3.99492C13.8119 4.347 13.6336 4.52304 13.5669 4.72604C13.5081 4.9046 13.5081 5.09694 13.5669 5.27551C13.6336 5.47851 13.8119 5.65454 14.1683 6.00663L14.3817 6.21757C14.7381 6.56965 14.9164 6.74569 15.1219 6.81165C15.3026 6.86967 15.4974 6.86967 15.6781 6.81165C15.8836 6.74569 16.0619 6.56965 16.4183 6.21757L18.6304 4.03234C18.8686 4.60503 19 5.23228 19 5.88983C19 8.59045 16.7838 10.7797 14.05 10.7797C13.7204 10.7797 13.3983 10.7478 13.0868 10.6871C12.6492 10.6019 12.4305 10.5593 12.2979 10.5723C12.1569 10.5862 12.0874 10.6071 11.9625 10.6732C11.8449 10.7353 11.7271 10.8517 11.4913 11.0846L5.05 17.4476C4.30441 18.1841 3.09559 18.1841 2.35 17.4476C1.60441 16.7111 1.60441 15.5169 2.35 14.7804L8.7913 8.41744C9.0271 8.1845 9.14491 8.06808 9.20782 7.952C9.27469 7.82859 9.29584 7.75995 9.30988 7.62067C9.32311 7.48966 9.27991 7.27355 9.19369 6.84134C9.13222 6.53357 9.1 6.21542 9.1 5.88983C9.1 3.18925 11.3162 1 14.05 1C14.955 1 15.8032 1.23989 16.5331 1.6588ZM10.0001 12.5577L14.95 17.4475C15.6956 18.184 16.9044 18.184 17.65 17.4475C18.3956 16.711 18.3956 15.5169 17.65 14.7804L13.5778 10.7577C13.2895 10.7308 13.0084 10.6794 12.7367 10.6057C12.3865 10.5107 12.0024 10.5797 11.7457 10.8333L10.0001 12.5577Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        Maintenance
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'
                            }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
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
                              to="/maintenance/machine"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-5 py-2 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                              }
                            >
                              Machine
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/maintenance/preparation"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-5 py-2 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                              }
                            >
                              Preparation
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/maintenance/material"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-5 py-2 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                              }
                            >
                              Materials
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/maintenance/MAN"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-5 py-2 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                              }
                            >
                              MAN
                            </NavLink>
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
                  pathname === '/quality_control' || pathname.includes('quality_control')
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/quality_control' ||
                          pathname.includes('quality_control')) &&
                          ' dark:bg-meta-4'
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.75526 20.0438C9.92464 21.2131 10.9927 21.2039 12.1529 20.0438L13.5708 18.635C13.7181 18.4969 13.847 18.4416 14.0404 18.4416H16.0292C17.6774 18.4416 18.4417 17.6866 18.4417 16.0293V14.0404C18.4417 13.8471 18.4969 13.7182 18.6349 13.5708L20.0345 12.1529C21.2131 10.9927 21.2038 9.92465 20.0345 8.75527L18.6349 7.33729C18.4969 7.19916 18.4417 7.06107 18.4417 6.87694V4.87887C18.4417 3.23991 17.6866 2.46649 16.0292 2.46649H14.0404C13.847 2.46649 13.7181 2.42045 13.5708 2.28232L12.1529 0.873575C10.9927 -0.295803 9.92464 -0.286571 8.75526 0.873575L7.33728 2.28232C7.19919 2.42045 7.06106 2.46649 6.87689 2.46649H4.87886C3.2307 2.46649 2.46648 3.22153 2.46648 4.87887V6.87694C2.46648 7.06107 2.42044 7.19916 2.28235 7.33729L0.873561 8.75527C-0.295779 9.92465 -0.286586 10.9927 0.873561 12.1529L2.28235 13.5708C2.42044 13.7182 2.46648 13.8471 2.46648 14.0404V16.0293C2.46648 17.6774 3.2307 18.4416 4.87886 18.4416H6.87689C7.06106 18.4416 7.19919 18.4969 7.33728 18.635L8.75526 20.0438ZM9.78651 19.0125L8.05546 17.2723C7.8529 17.0605 7.64115 16.9777 7.3557 16.9777H4.87886C4.0594 16.9777 3.93046 16.8487 3.93046 16.0293V13.5524C3.93046 13.2762 3.84761 13.0644 3.64505 12.8618L1.90481 11.1308C1.32476 10.5415 1.32476 10.3758 1.90481 9.78652L3.64505 8.05551C3.84761 7.85292 3.93046 7.64117 3.93046 7.35572V4.87887C3.93046 4.05018 4.0502 3.93051 4.87886 3.93051H7.3557C7.64115 3.93051 7.8529 3.85681 8.05546 3.64506L9.78651 1.90483C10.3758 1.32473 10.5415 1.32473 11.1308 1.90483L12.8618 3.64506C13.0644 3.85681 13.2762 3.93051 13.5524 3.93051H16.0292C16.8487 3.93051 16.9776 4.05937 16.9776 4.87887V7.35572C16.9776 7.64117 17.0697 7.85292 17.2723 8.05551L19.0124 9.78652C19.5925 10.3758 19.5925 10.5415 19.0124 11.1308L17.2723 12.8618C17.0697 13.0644 16.9776 13.2762 16.9776 13.5524V16.0293C16.9776 16.8487 16.8487 16.9777 16.0292 16.9777H13.5524C13.2762 16.9777 13.0644 17.0605 12.8618 17.2723L11.1308 19.0125C10.5415 19.5926 10.3758 19.5926 9.78651 19.0125ZM9.02228 14.8691C9.28931 14.8691 9.49187 14.7586 9.62999 14.5929L14.7402 7.4478C14.8415 7.30044 14.8967 7.13474 14.8967 6.97822C14.8967 6.57307 14.5837 6.25081 14.1601 6.25081C13.8563 6.25081 13.6905 6.35209 13.5064 6.61911L8.99467 12.9724L6.66514 10.4034C6.50863 10.2285 6.33369 10.1548 6.10347 10.1548C5.65232 10.1548 5.33005 10.4587 5.33005 10.8822C5.33005 11.0664 5.39448 11.2413 5.52342 11.3702L8.45142 14.6297C8.58955 14.777 8.76449 14.8691 9.02228 14.8691Z" fill="white" />
                        </svg>

                        Quality Control
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'
                            }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
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
                              to="/quality_control/maintenance"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-5 py-2 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                              }
                            >
                              Maintenance
                            </NavLink>
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
                  pathname === '/history' || pathname.includes('history')
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${(pathname === '/quality_control' ||
                          pathname.includes('history')) &&
                          ' dark:bg-meta-4'
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.6667 8.25L14.4167 2H6.08333C5.5308 2 5.00089 2.21949 4.61019 2.61019C4.21949 3.00089 4 3.5308 4 4.08333V20.75C4 21.3025 4.21949 21.8324 4.61019 22.2231C5.00089 22.6138 5.5308 22.8333 6.08333 22.8333H18.5833C19.1359 22.8333 19.6658 22.6138 20.0565 22.2231C20.4472 21.8324 20.6667 21.3025 20.6667 20.75V8.25ZM9.20833 19.7083H7.125V10.3333H9.20833V19.7083ZM13.375 19.7083H11.2917V13.4583H13.375V19.7083ZM17.5417 19.7083H15.4583V16.5833H17.5417V19.7083ZM14.4167 9.29167H13.375V4.08333L18.5833 9.29167H14.4167Z" fill="white" />
                        </svg>
                        History
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'
                            }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
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
                              to="/history"
                              className={({ isActive }) =>
                                'group relative flex items-center gap-5 py-2 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
                                (isActive && '!text-[#0065DE] bg-white py-3 px-1 text-[16px]')
                              }
                            >
                              History
                            </NavLink>
                          </li>

                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
