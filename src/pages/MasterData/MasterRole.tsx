import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'

function MasterRole() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px] d'>Master Data &gt; Role</p>
                <div className="flex w-full bg-white p-2">
                    <div className='flex justify-between w-full'>


                        <div className='my-auto w-full flex justify-end items-end'>
                            <button className='w-40 text-xs font-semibold rounded-sm py-1 text-white bg-primary '>ADD USER</button>
                        </div>
                    </div>
                </div>
                <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-m'>
                    <p className='w-20'>No</p>
                    <div className='grid grid-cols-12 w-full'>
                        <div className='col-span-9'>Role</div>

                        <div className='col-span-3'></div>

                    </div>
                </div>
                <div className=' flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium'>
                    <p className='w-20'>1</p>
                    <div className='grid grid-cols-12 w-full'>
                        <div className='col-span-9'>Section Head</div>

                        <div className='col-span-3 flex gap-3 justify-end'><button className='py-1 w-20 bg-primary text-white text-xs rounded-sm font-semibold'>EDIT</button>
                            <button className='py-1 w-20 bg-red-500 text-white text-xs rounded-sm font-semibold'>DELETE</button>
                        </div>

                    </div>
                </div>


            </>
        </DefaultLayout>
    )
}

export default MasterRole