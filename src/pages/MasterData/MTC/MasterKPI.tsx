import React from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import { Link } from 'react-router-dom'

function MasterKPI() {
    return (
        <DefaultLayout>
            <>
                <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; KPI Form</p>
                <div className='grid grid-cols-10 bg-white p-3 text-sm font-semibold rounded-sm mb-3'>
                    <p className='flex col-span-1'>No</p>
                    <p className='flex col-span-7'>Role</p>
                    <p className='flex col-span-2'></p>
                </div>
                <div className='grid grid-cols-10 bg-white px-3 py-2 text-sm font-medium rounded-md mt-1'>
                    <p className='flex col-span-1'>1</p>
                    <p className='flex col-span-7'>Section Head</p>
                    <div className='w-full  flex justify-end col-span-2'>

                        <Link to='form' className='bg-primary rounded-sm md:px-15 px-10 py-1 text-xs font-semibold text-white'>EDIT</Link>
                    </div>
                </div>
                <div className='grid grid-cols-10 bg-white px-3 py-2 text-sm font-medium rounded-md mt-1'>
                    <p className='flex col-span-1'>2</p>
                    <p className='flex col-span-7'>Pelaksana Non Shift</p>
                    <div className='w-full  flex justify-end col-span-2'>

                        <Link to='form' className='bg-primary rounded-sm md:px-15 px-10 py-1 text-xs font-semibold text-white'>EDIT</Link>
                    </div>
                </div>
            </>
        </DefaultLayout>
    )
}

export default MasterKPI