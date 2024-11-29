import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DetailTabMasterKaryawan from './DetailTabMasterKaryawan';

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
            className=""
        >
            {value === index && (
                <Box sx={{ p: 0 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export default function DetailMasterKaryawanIsi() {
    const theme = createTheme({
        palette: {
            primary: {
                light: '#ffffff',
                main: '#ffffff',
                dark: '#002884',
                contrastText: '#fff',
            },
            secondary: {
                light: '#0065DE',
                main: '#f44336',
                dark: '#ba000d',
                contrastText: '#000',
            },
        },
    });
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index: number) => {
        setValue(index);
    };
    const commonStyles = {
        bgcolor: 'background.paper',
        borderColor: 'text.primary',
        width: 'w-full',
        borderTopRightRadius: '12px',
        borderTopLeftRadius: '12px',
    };
    function convertDatetimeToDate(datetime: any) {
        const dateObject = new Date(datetime);
        const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
        const year = dateObject.getFullYear();
        const hours = dateObject.getHours().toString().padStart(2, '0');
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');

        return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
    }

    const tanggal = convertDatetimeToDate(new Date());
    const { id } = useParams();

    useEffect(() => {

        getKaryawan()
    }, []);

    const [karyawan, setKaryawan] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,
                {
                    withCredentials: true,
                },
            );
            console.log(res.data)
            setKaryawan(res.data)
            setIsLoading(false)

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    return (
        <>
            {isLoading && <Loading />}
            <div className="min-w-[700px] bg-white rounded-xl">
                <div className=" w-full h-full flex gap-3 flex-col border-b-8 border-[#D8EAFF] px-6 py-[2%] justify-between">
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='text-black text-sm font-semibold'>Nama Karyawan</label>
                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.name}</label>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="" className='text-black text-sm font-semibold'>Departemen</label>
                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.department?.nama_department}</label>
                    </div>
                </div>
            </div>
            <Box
                sx={{
                    ...commonStyles,
                    '& .MuiPaper-root': {
                        borderTopRightRadius: '12px',
                        borderTopLeftRadius: '12px',
                        background: '#D8EAFF',
                        boxShadow: 0,
                    },
                    '& .MuiBox-root': {
                        borderTopRightRadius: '12px',
                        borderTopLeftRadius: '12px',
                        background: '#D8EAFF',
                        boxShadow: 0,
                    },
                    '& .MuiTabs-root': {
                        borderTopRightRadius: '12px',
                        borderTopLeftRadius: '12px',
                    },
                    '& .MuiTabs-flexcontainer': {
                        borderTopRightRadius: '12px',
                        borderTopLeftRadius: '12px',
                    },
                    '& fieldset': {
                        borderRadius: '12px',
                    },
                }}
            >
                <AppBar position="static" className="">
                    <ThemeProvider theme={theme}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor="primary"
                            TabIndicatorProps={{
                                style: {
                                    backgroundColor: '#00499F',
                                    height: '4px',
                                },
                            }}
                            textColor="inherit"
                            variant="standard"

                            aria-label="full width tabs example"
                            className="bg-white text-[#00499F] font-semibold mb-2 flex w-full px-3"
                        >
                            <Tab label="Informasi" {...a11yProps(0)} />

                            <Tab label="Presensi" {...a11yProps(1)} />

                            <Tab label="Karir" {...a11yProps(2)} />

                            <Tab label="Upah" {...a11yProps(3)} />

                            <Tab label="Riwayat" {...a11yProps(4)} />

                            <Tab label="Pinjaman" {...a11yProps(5)} />
                        </Tabs>
                    </ThemeProvider>
                </AppBar>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <DetailTabMasterKaryawan  >
                        <>
                            <div className='bg-[#eeeeee] px-6 py-2'>
                                <label htmlFor="" className='text-blue-400 text-sm font-normal '>BIODATA</label>
                            </div>
                            <div className='grid grid-cols-2 px-6 py-3'>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>NIK</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.nik}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Nama Karyawan</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.name}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Gender</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.jenis_kelamin}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Departemen</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.department?.nama_department}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Divisi</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.divisi?.nama_divisi}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Bagian</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.bagian?.nama_bagian}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Jabatan</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.jabatan}</label>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Tanggal Masuk</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{convertTimeStampToDateOnly(karyawan?.data?.biodata_karyawan[0]?.tgl_masuk)}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Tanggal Keluar</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.tgl_keluar == null ? '-' : convertTimeStampToDateOnly(karyawan?.data?.biodata_karyawan[0]?.tgl_keluar)}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Status Karyawan</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.status_karyawan}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Tipe Penggajian</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.tipe_penggajian}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Status Pajak</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.status_pajak}</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Grade</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.grade?.kategori}</label>
                                    </div>
                                    {/* <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>Masa Kerja</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>L</label>
                                    </div> */}
                                </div>
                            </div>
                        </>
                    </DetailTabMasterKaryawan>
                </TabPanel>

                <TabPanel value={value} index={1} dir={theme.direction}>

                </TabPanel>
            </Box>
        </>
    );
}
