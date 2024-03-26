import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../images/logo/logo-cbl 2.svg';

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
      className={`absolute left-0 top-0 z-9999 flex h-screen  flex-col overflow-y-hidden w-[278px] bg-gradient-to-b from-[#016AE6] to-[#014BA2] duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.7499 2.9812H14.2874V2.36245C14.2874 2.02495 14.0062 1.71558 13.6405 1.71558C13.2749 1.71558 12.9937 1.99683 12.9937 2.36245V2.9812H4.97803V2.36245C4.97803 2.02495 4.69678 1.71558 4.33115 1.71558C3.96553 1.71558 3.68428 1.99683 3.68428 2.36245V2.9812H2.2499C1.29365 2.9812 0.478027 3.7687 0.478027 4.75308V14.5406C0.478027 15.4968 1.26553 16.3125 2.2499 16.3125H15.7499C16.7062 16.3125 17.5218 15.525 17.5218 14.5406V4.72495C17.5218 3.7687 16.7062 2.9812 15.7499 2.9812ZM1.77178 8.21245H4.1624V10.9968H1.77178V8.21245ZM5.42803 8.21245H8.38115V10.9968H5.42803V8.21245ZM8.38115 12.2625V15.0187H5.42803V12.2625H8.38115ZM9.64678 12.2625H12.5999V15.0187H9.64678V12.2625ZM9.64678 10.9968V8.21245H12.5999V10.9968H9.64678ZM13.8374 8.21245H16.228V10.9968H13.8374V8.21245ZM2.2499 4.24683H3.7124V4.83745C3.7124 5.17495 3.99365 5.48433 4.35928 5.48433C4.7249 5.48433 5.00615 5.20308 5.00615 4.83745V4.24683H13.0499V4.83745C13.0499 5.17495 13.3312 5.48433 13.6968 5.48433C14.0624 5.48433 14.3437 5.20308 14.3437 4.83745V4.24683H15.7499C16.0312 4.24683 16.2562 4.47183 16.2562 4.75308V6.94683H1.77178V4.75308C1.77178 4.47183 1.96865 4.24683 2.2499 4.24683ZM1.77178 14.5125V12.2343H4.1624V14.9906H2.2499C1.96865 15.0187 1.77178 14.7937 1.77178 14.5125ZM15.7499 15.0187H13.8374V12.2625H16.228V14.5406C16.2562 14.7937 16.0312 15.0187 15.7499 15.0187Z"
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
                                'group relative flex items-center gap-5 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
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
                                'group relative flex items-center gap-5 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
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
                                'group relative flex items-center gap-5 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
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
                                'group relative flex items-center gap-5 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
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
                        <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.6 4.55624L8.65 8.55702M4.6 4.55624H1.9L1 1.88906L1.9 1L4.6 1.88906V4.55624ZM16.5331 1.6588L14.1683 3.99492C13.8119 4.347 13.6336 4.52304 13.5669 4.72604C13.5081 4.9046 13.5081 5.09694 13.5669 5.27551C13.6336 5.47851 13.8119 5.65454 14.1683 6.00663L14.3817 6.21757C14.7381 6.56965 14.9164 6.74569 15.1219 6.81165C15.3026 6.86967 15.4974 6.86967 15.6781 6.81165C15.8836 6.74569 16.0619 6.56965 16.4183 6.21757L18.6304 4.03234C18.8686 4.60503 19 5.23228 19 5.88983C19 8.59045 16.7838 10.7797 14.05 10.7797C13.7204 10.7797 13.3983 10.7478 13.0868 10.6871C12.6492 10.6019 12.4305 10.5593 12.2979 10.5723C12.1569 10.5862 12.0874 10.6071 11.9625 10.6732C11.8449 10.7353 11.7271 10.8517 11.4913 11.0846L5.05 17.4476C4.30441 18.1841 3.09559 18.1841 2.35 17.4476C1.60441 16.7111 1.60441 15.5169 2.35 14.7804L8.7913 8.41744C9.0271 8.1845 9.14491 8.06808 9.20782 7.952C9.27469 7.82859 9.29584 7.75995 9.30988 7.62067C9.32311 7.48966 9.27991 7.27355 9.19369 6.84134C9.13222 6.53357 9.1 6.21542 9.1 5.88983C9.1 3.18925 11.3162 1 14.05 1C14.955 1 15.8032 1.23989 16.5331 1.6588ZM10.0001 12.5577L14.95 17.4475C15.6956 18.184 16.9044 18.184 17.65 17.4475C18.3956 16.711 18.3956 15.5169 17.65 14.7804L13.5778 10.7577C13.2895 10.7308 13.0084 10.6794 12.7367 10.6057C12.3865 10.5107 12.0024 10.5797 11.7457 10.8333L10.0001 12.5577Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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
                                'group relative flex items-center gap-5 rounded-md px-4 font-medium text-white duration-300 ease-in-out hover:text-white ' +
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

            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
