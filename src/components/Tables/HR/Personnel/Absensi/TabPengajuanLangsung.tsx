import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import Loading from '../../../../Loading';
import { useEffect, useState } from 'react';
import axios from 'axios';



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

export default function TabPengajuanLangsung({ data }: { data: any }) {
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
    useEffect(() => {
        getMe()

    }, []);


    const [idPengaju, setIdPengaju] = useState<any>();

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIdPengaju(res.data.id_karyawan)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }
    const [alasanIzin, setAlasanIzin] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    async function postIzin(tglAbsen: any, id_KKaryawan: any) {
        if (alasanIzin == null) {
            alert('Alasan Izin Belum Diisi');
            return;
        }
        const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanIzin`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    id_karyawan: id_KKaryawan,
                    id_pengaju: idPengaju,
                    dari: tglAbsen,
                    sampai: tglAbsen,
                    jumlah_hari: 1,
                    alasan_izin: alasanIzin,
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    return (
        <>
            <Box
                sx={{
                    ...commonStyles,
                    '& .MuiPaper-root': {
                        borderTopRightRadius: '0px',
                        borderTopLeftRadius: '0px',
                        background: '#D8EAFF',
                        boxShadow: 0,
                    },
                    '& .MuiBox-root': {
                        borderTopRightRadius: '0px',
                        borderTopLeftRadius: '0px',
                        background: '#D8EAFF',
                        boxShadow: 0,
                    },
                    '& .MuiTabs-root': {
                        borderTopRightRadius: '0px',
                        borderTopLeftRadius: '0px',
                    },
                    '& .MuiTabs-flexcontainer': {
                        borderTopRightRadius: '0px',
                        borderTopLeftRadius: '0px',
                    },
                    '& fieldset': {
                        borderRadius: '0px',
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
                            className="bg-white text-[#00499F] font-semibold mb-2 flex w-full"
                        >
                            <Tab label="Izin" {...a11yProps(0)} />
                            <Tab label="Mangkir" {...a11yProps(0)} />

                        </Tabs>
                    </ThemeProvider>
                </AppBar>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <main className="overflow-x-scroll px-2 py-2">
                        {isLoading && <Loading />}
                        <div className=" bg-white">
                            <div className='grid grid-cols-2 gap-5  px-7 py-4 '>
                                <div className='flex flex-col gap-1'>
                                    <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                        Nama
                                    </label>
                                    <label className=' text-[#6c6b6b] text-sm'>
                                        {data.name}
                                    </label>
                                </div>

                            </div>
                            <div className='grid grid-cols-2 gap-5 px-7 py-4'>
                                <div className='flex flex-col gap-3'>
                                    <label className=' text-[#6c6b6b] text-sm font-semibold'>
                                        Tanggal
                                    </label>
                                    <label className=' text-[#6c6b6b] text-sm '>
                                        {convertTimeStampToDate(data.tgl_absen)}
                                    </label>
                                </div>

                                <div className="flex w-full flex-col">
                                    <label className="text-[#6c6b6b] text-sm font-semibold">
                                        Alasan Izin
                                    </label>
                                    <div className="flex w-full h-full">
                                        <textarea
                                            onChange={(e) => { setAlasanIzin(e.target.value) }}

                                            name="alasan_cuti"
                                            className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
                                        />
                                    </div>

                                </div>

                            </div>
                            <div className='flex w-full justify-end items-end px-7 py-4'>

                                <button
                                    onClick={() => postIzin(data.tgl_absen, data.userid)}
                                    disabled={isLoading}
                                    className='flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md'
                                >
                                    AJUKAN
                                </button>
                            </div>
                        </div>
                    </main>
                </TabPanel>
            </Box>
        </>
    );
}
