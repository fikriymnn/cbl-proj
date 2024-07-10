import React, { useEffect, useState } from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'

import { Link } from 'react-router-dom';
import ModalPM3Schedule from '../../../components/Modals/ModalPM3Schedule';
const brandData = [
    {

        name: 'R700',
        tgl_permintaan:'25 Jun 2024',
        tgl_diajukan:'4 Jul 2024',
        tgl_terverifikasi:'6 Jul 2024',
        partOf:'printing'
    },
    {

        name: 'SM 74',
        tgl_permintaan:'25 Jun 2024',
        tgl_diajukan:'4 Jul 2024',
        tgl_terverifikasi:'6 Jul 2024',
    },
    {

        name: 'GTO',
        tgl_permintaan:'25 Jun 2024',
        tgl_diajukan:'4 Jul 2024',
        tgl_terverifikasi:'6 Jul 2024',
    },
    {

        name: 'ITOH',
        tgl_permintaan:'25 Jun 2024',
        tgl_diajukan:'4 Jul 2024',
        tgl_terverifikasi:'6 Jul 2024',
    },
    

];
function Eksekusi() {
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

    const [showModal2, setShowModal2] = useState(false);
    const [showModal22, setShowModal22] = useState(false);

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);
    const openModal22 = () => setShowModal22(true);
    const closeModal22 = () => setShowModal22(false);

    return (
       <>
       
       
       {!isMobile && (
           <main className='overflow-x-scroll'>
               <div className='min-w-[700px] bg-white rounded-xl'>

                  
                   <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                       <div className='w-2 h-full '>

                       </div>
                       <section className='grid grid-cols-3 justify-between w-full py-4  font-semibold text-[14px]'>


                           <p className=''>Nama Mesin</p>


                           <p>Jadwal</p>


                           <div className='w-[125px]'>{""}</div>



                       </section>
                   </div>
                   {brandData.map((brand, key) => (
                       <>
                           <section key={key} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                               <div className={`w-2 h-full sticky left-0 z-20 ${brand.partOf == 'printing' ? 'bg-green-600' : brand.partOf == 'water base' ? 'bg-yellow-600' : brand.partOf == 'pond' ? 'bg-violet-900' : brand.partOf == 'finishing' ? 'bg-red-900' : ''}`}>

                               </div>




                               <div className=' w-full h-full flex flex-col justify-center relative'>

                                   <div className='ps-7 w-full grid grid-cols-3 justify-between'>


                                       <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                           <p className=''>{brand.name}</p>
                                       </div>

                                      
                                     
                                       <div className='flex flex-col justify-center'>

                                           <p className='text-[#00AF09] font-bold'>{brand.tgl_terverifikasi != null ? brand.tgl_terverifikasi : '-'}</p>
                                       </div>


                                       <div className='w-full flex justify-end px-3'>

                                           <>
                                               <div 
                                                   className={`cursor-pointer uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center `} // Dynamic class assignment
                                                   onClick={openModal22}
                                               >
                                                   Eksekusi

                                               </div>
                                               {showModal22 && (
     <ModalPM3Schedule
       isOpen={showModal22}
       onClose={closeModal22}
       machineName={'R700'} children={undefined}          >
       
     </ModalPM3Schedule>
   )}

                                           </>



                                       </div>
                                   </div>
                               </div>
                           </section>
                       </>
                   ))}






               </div>


           </main>
       )}
       {isMobile && (
           <main className='overflow-x-scroll'>
               <div className='w-full bg-white rounded-xl'>

                   <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>01 April 2024</p>
                   <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                       <div className='w-2 h-full '>

                       </div>
                       <section className='grid grid-cols-1 w-full py-4  font-semibold text-[14px]'>


                           <p className=''>Nama Mesin</p>





                           <div className='w-[125px]'>{""}</div>



                       </section>
                   </div>
                   {brandData.map((brand, key) => (
                       <>
                           <section key={key} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                               <div className={`w-2 h-full sticky left-0 z-20 ${brand.partOf == 'printing' ? 'bg-green-600' : brand.partOf == 'water base' ? 'bg-yellow-600' : brand.partOf == 'pond' ? 'bg-violet-900' : brand.partOf == 'finishing' ? 'bg-red-900' : ''}`}>

                               </div>




                               <div className=' w-full h-full flex flex-col justify-center relative'>

                                   <div className='ps-7 w-full grid grid-cols-2'>


                                       <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                           <p className=''>{brand.name}</p>
                                       </div>




                                       <div className='flex w-full justify-center'>

                                           <>
                                               <div 
                                                   className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center `} // Dynamic class assignment
                                                   onClick={openModal22}
                                               >
                                                   REQUEST

                                               </div>

                                           </>



                                       </div>
                                   </div>
                               </div>
                           </section>
                       </>
                   ))}






               </div>


           </main>
       )}
       </>

      
    )
}

export default Eksekusi