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
import formatInteger from '../../../../utils/formaterInteger';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';

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
    const [potongan, setPotongan] = useState<any>();
    const [namaPotongan, setNamaPotongan] = useState<any>();
    async function postPotongan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawanPotongan`;
        try {
            setIsLoading(true)
            const res = await axios.post(
                url,
                {
                    id_biodata_karyawan: karyawan?.data?.biodata_karyawan[0]?.id,
                    jumlah_potongan: potongan,
                    nama_potongan: namaPotongan,
                },
                {
                    withCredentials: true,
                },
            );

            getKaryawan()
            setIsLoading(false)

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function deletePotongan(idPot: any) {
        if (window.confirm('Apakah Anda yakin ingin Menghapus Potongan Ini?')) {
            const url = `${import.meta.env.VITE_API_LINK
                }/hr/karyawanPotongan/${idPot}`;
            try {
                setIsLoading(true)
                const res = await axios.delete(
                    url,

                    {
                        withCredentials: true,
                    },
                );

                getKaryawan()
                setIsLoading(false)

            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);
    return (
        <>
            {isLoading && <Loading />}
            <div className=" bg-white rounded-xl">
                <div className=" w-full h-full flex gap-1 flex-col border-b-8 border-[#D8EAFF] px-6 py-[2%] justify-between">
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
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>{karyawan?.data?.biodata_karyawan[0]?.grade?.kategori == null ? '-' : karyawan?.data?.biodata_karyawan[0]?.grade?.kategori}</label>
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
                    <DetailTabMasterKaryawan  >
                        <>
                            <div className='bg-[#eeeeee] px-6 py-2'>
                                <label htmlFor="" className='text-blue-400 text-sm font-normal '>OVERVIEW</label>
                            </div>
                            <div className='grid grid-cols-2 px-6 py-3 border-b-8 border-[#D8EAFF]'>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>IZIN</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>-</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>SAKIT</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>-</label>
                                    </div>

                                </div>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>CUTI</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>-</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>CUTI KHUSUS</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>-</label>
                                    </div>
                                    <div className='flex flex-col gap-1'>

                                        <label htmlFor="" className='text-black text-sm font-semibold'>SISA CUTI TAHUN INI</label>
                                        <label htmlFor="" className='text-[#636363] text-xl font-normal '>-</label>
                                    </div>
                                </div>
                            </div>
                            <div className='bg-[#eeeeee] px-6 py-2'>
                                <label htmlFor="" className='text-blue-400 text-sm font-normal '>KETERLAMBATAN</label>
                            </div>
                            <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JAM</label>
                            </div>
                            <div className='grid grid-cols-12 gap-1 px-6 py-2'>

                                <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>8:20</label>
                            </div>
                        </>
                    </DetailTabMasterKaryawan>
                </TabPanel>

                <TabPanel value={value} index={2} dir={theme.direction}>
                    <DetailTabMasterKaryawan  >
                        <>
                            <div className='border-b-8 border-[#D8EAFF]'>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>PROMOSI</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JABATAN ASAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JABATAN BARU</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                    <label htmlFor="" className='text-red-300 text-sm font-semibold col-span-3'>OPERATOR</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>SENIOR OPERATOR</label>
                                </div>
                            </div>
                            <div className='border-b-8 border-[#D8EAFF]'>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>DEMOSI</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JABATAN ASAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JABATAN BARU</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                    <label htmlFor="" className='text-red-300 text-sm font-semibold col-span-3'>OPERATOR</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>SENIOR OPERATOR</label>
                                </div>
                            </div>
                            <div className=''>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>MUTASI</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JABATAN ASAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JABATAN BARU</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                    <label htmlFor="" className='text-red-300 text-sm font-semibold col-span-3'>OPERATOR</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>SENIOR OPERATOR</label>
                                </div>
                            </div>
                        </>
                    </DetailTabMasterKaryawan>
                </TabPanel>
                <TabPanel value={value} index={3} dir={theme.direction}>
                    <DetailTabMasterKaryawan  >
                        <>
                            <div className='border-b-8 border-[#D8EAFF]'>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>UPAH SAAT INI</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='"text-[#636363] text-xl'>Rp.{(karyawan?.data?.biodata_karyawan[0]?.gaji == null || karyawan?.data?.biodata_karyawan[0]?.gaji == 0) ? '-' : formatInteger(karyawan?.data?.biodata_karyawan[0]?.gaji)}</label>

                                </div>

                            </div>
                            <div className='flex flex-col gap-1 px-4 py-1 w-full'>

                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-4'>Nama Potongan</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>Jumlah Potongan</label>

                                </div>
                                {karyawan?.data?.biodata_karyawan[0]?.potongan_karyawan?.map((data: any, i: any) => (
                                    <>
                                        <div
                                            className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                            <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-4'>{data.nama_potongan}</label>
                                            <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>{data.jumlah_potongan
                                                ? formatInteger(data.jumlah_potongan)
                                                : 0
                                            }</label>
                                            <button
                                                onClick={() => deletePotongan(data.id)}
                                                className='px-2 py-1  text-xs bg-red-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                ))}
                                <button
                                    onClick={() => openModalHistory()}
                                    className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-2'>
                                    TAMBAH POTONGAN
                                </button>
                                {showHistory == true && (
                                    <>
                                        <ModalKosonganSmall
                                            isOpen={showHistory}
                                            onClose={() => closeModalHistory()}
                                            judul={'Tambah Potongan'}
                                        >
                                            <>
                                                <div className='flex flex-col gap-1 w-full px-[1%] py-[1%]'>

                                                    <div className='flex flex-col w-full'>
                                                        <label className=' text-black text-sm font-semibold'>
                                                            Nama Potongan
                                                        </label>
                                                        <input
                                                            onChange={(e) => setNamaPotongan(e.target.value)}
                                                            type='text' className='border-stroke border-2 rounded-md w-full' />
                                                    </div>
                                                    <div className='flex flex-col w-full'>
                                                        <label className=' text-black text-sm font-semibold'>
                                                            Total Potongan
                                                        </label>
                                                        <input
                                                            onChange={(e) => setPotongan(e.target.value)}
                                                            type='number' className='border-stroke border-2 rounded-md w-full' />
                                                    </div>
                                                    <button
                                                        onClick={() => postPotongan()}
                                                        className='bg-blue-500 px-2 text-white font-semibold rounded-md text-md'>
                                                        Simpan
                                                    </button>
                                                </div>
                                            </>
                                        </ModalKosonganSmall>
                                    </>
                                )}

                            </div>
                            <div className=''>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>RIWAYAT</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>GAJI</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TIPE PENGGAJIAN</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>500.000</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>HARIAN</label>
                                </div>
                            </div>

                        </>
                    </DetailTabMasterKaryawan>
                </TabPanel>
                <TabPanel value={value} index={4} dir={theme.direction}>
                    <DetailTabMasterKaryawan  >
                        <>
                            <div className='border-b-8 border-[#D8EAFF]'>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>STATUS MARITAL</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>STATUS</label>

                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>

                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>SINGLE</label>
                                </div>
                            </div>
                            <div className='border-b-8 border-[#D8EAFF]'>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>ANAK</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>NAMA</label>

                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>ADUDU</label>

                                </div>
                            </div>
                            <div className=''>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>RIWAYAT PENDIDIKAN</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>INSTANSI</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-2'>TAHUN LULUS</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JURUSAN</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-2'>BERIJAZAH</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>SDN MELONG</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-2'>2004</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>SEKOLAH DASAR</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-2'>YA</label>
                                </div>
                            </div>
                        </>
                    </DetailTabMasterKaryawan>
                </TabPanel>
                <TabPanel value={value} index={5} dir={theme.direction}>
                    <DetailTabMasterKaryawan  >
                        <>
                            <div className='border-b-8 border-[#D8EAFF]'>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>SISA PINJAMAN</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='"text-[#636363] text-xl'>Rp.{(karyawan?.data?.biodata_karyawan[0]?.limit_pinjaman == null || karyawan?.data?.biodata_karyawan[0]?.limit_pinjaman == 0) ? '-' : formatInteger(karyawan?.data?.biodata_karyawan[0]?.limit_pinjaman)}</label>

                                </div>

                            </div>
                            <div className=''>

                                <div className='bg-[#eeeeee] px-6 py-2'>
                                    <label htmlFor="" className='text-blue-400 text-sm font-normal '>RIWAYAT PINJAMAN</label>
                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 border-b-4 border-[#D8EAFF]'>

                                    <label htmlFor="" className='text-black text-sm font-semibold'>NO</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>TANGGAL</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-3'>JUMLAH</label>
                                    <label htmlFor="" className='text-black text-sm font-semibold col-span-2'>CICILAN</label>

                                </div>
                                <div className='grid grid-cols-12 gap-1 px-6 py-2 '>

                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold'>1</label>
                                    <label htmlFor="" className='text-stone-500 text-sm font-semibold col-span-3'>12 - DESEMBER - 2024</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>500.000</label>
                                    <label htmlFor="" className='text-blue-300 text-sm font-semibold col-span-3'>100.000</label>
                                </div>
                            </div>

                        </>
                    </DetailTabMasterKaryawan>
                </TabPanel>
            </Box>
        </>
    );
}
