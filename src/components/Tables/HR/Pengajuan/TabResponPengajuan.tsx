import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IncomingSPL from './InputSPL/IncomingSpl';
import IncomingCutiHR from './Cuti/IncomingCutiHR';
import IncomingIzinHR from './Izin/IncomingIzinHR';
import IncomingSakitHR from './Sakit/IncomingSakitHR';
import IncomingPinjamanHR from './Pinjaman/IncomingPinjamanHR';
import IncomingDinas from './Dinas/IncomingDinas';
import IncomingSP from './SP/IncomingSP';
import IncomingKaryawan from './Karyawan/IncomingKaryawan';
import IncomingMangkirHR from './Mangkir/IncomingMangkirHR';
import { useEffect, useState } from 'react';
import axios from 'axios';
import IncomingTerlambat from './Terlambat/IncommingTerlambat';



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

export default function TabResponPengajuanHR() {

    const [task, setTask] = useState<any>();
    useEffect(() => {
        getMe()

    }, []);
    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/hr/incomingTask`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setTask(res.data);

            console.log('task', res.data)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

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

    return (
        <>
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
                            variant="scrollable"
                            aria-label="full width tabs example"
                            className="bg-white text-[#00499F] font-semibold mb-2 flex w-full"
                        >
                            <Tab label={`Lembur ${task?.pengajuan_lembur == 0 ? '' : '(' + task?.pengajuan_lembur + ')'}`} {...a11yProps(0)} />
                            <Tab label={`Cuti ${task?.pengajuan_cuti == 0 ? '' : '(' + task?.pengajuan_cuti + ')'}`} {...a11yProps(1)} />
                            <Tab label={`Izin ${task?.pengajuan_izin == 0 ? '' : '(' + task?.pengajuan_izin + ')'}`} {...a11yProps(2)} />
                            <Tab label={`Sakit ${task?.pengajuan_sakit == 0 ? '' : '(' + task?.pengajuan_sakit + ')'}`} {...a11yProps(3)} />
                            <Tab label={`Mangkir ${task?.pengajuan_mangkir == 0 ? '' : '(' + task?.pengajuan_mangkir + ')'}`} {...a11yProps(4)} />
                            <Tab label={`Pinjaman ${task?.pengajuan_pinjaman == 0 ? '' : '(' + task?.pengajuan_pinjaman + ')'}`} {...a11yProps(5)} />
                            <Tab label={`Terlambat`} {...a11yProps(6)} />
                            <Tab label={`Dinas`} {...a11yProps(7)} />
                            <Tab label="SP" {...a11yProps(8)} />
                            <Tab label="Penambahan Karyawan" {...a11yProps(9)} />

                        </Tabs>
                    </ThemeProvider>
                </AppBar>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <IncomingSPL />
                </TabPanel>

                <TabPanel value={value} index={1} dir={theme.direction}>
                    <IncomingCutiHR />
                </TabPanel>

                <TabPanel value={value} index={2} dir={theme.direction}>
                    <IncomingIzinHR />
                </TabPanel>

                <TabPanel value={value} index={3} dir={theme.direction}>
                    <IncomingSakitHR />
                </TabPanel>

                <TabPanel value={value} index={4} dir={theme.direction}>
                    <IncomingMangkirHR />
                </TabPanel>

                <TabPanel value={value} index={5} dir={theme.direction}>
                    <IncomingPinjamanHR />
                </TabPanel>

                <TabPanel value={value} index={6} dir={theme.direction}>
                    <IncomingTerlambat />
                </TabPanel>

                <TabPanel value={value} index={7} dir={theme.direction}>
                    <IncomingDinas />
                </TabPanel>

                <TabPanel value={value} index={8} dir={theme.direction}>
                    <IncomingSP />
                </TabPanel>

                <TabPanel value={value} index={9} dir={theme.direction}>
                    <IncomingKaryawan />
                </TabPanel>
            </Box>
        </>
    );
}
