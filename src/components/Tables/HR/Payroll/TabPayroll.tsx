import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ListPayroll from './ListPayroll';
import PayrollBulanan from './PayrollBulanan';
import HistoryPayroll from './HistoryPayroll';
import HistoryPayrollBulanan from './HistoryPayrollBulanan';
import PayrollMinggu from './PayrollMinggu';
import HistoryMinggu from './HistoryMinggu';
import PengajuanPayrollMinggu from './PengajuanPayrollMinggu';




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

export default function TabPayroll() {
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
                            <Tab label="Payroll Mingguan + Uang Hadir" {...a11yProps(0)} />
                            <Tab label="Pengajuan Payroll Mingguan" {...a11yProps(1)} />
                            {/* <Tab label="Payroll Bulanan" {...a11yProps(2)} /> */}
                            <Tab label="History Payroll Mingguan + Uang Hadir" {...a11yProps(2)} />
                            {/* <Tab label="History Payroll Bulanan" {...a11yProps(4)} /> */}


                        </Tabs>
                    </ThemeProvider>
                </AppBar>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <PayrollMinggu />
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>
                    <PengajuanPayrollMinggu />
                </TabPanel>
                {/* <TabPanel value={value} index={2} dir={theme.direction}>
                    <PayrollBulanan />
                </TabPanel> */}
                <TabPanel value={value} index={2} dir={theme.direction}>
                    <HistoryMinggu />
                </TabPanel>
                {/* <TabPanel value={value} index={4} dir={theme.direction}>
                    <HistoryPayrollBulanan />
                </TabPanel> */}

            </Box>
        </>
    );
}
