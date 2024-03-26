import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableOne from './TableIncomingMaintenance';
import TableTwo from './TableOS';
import TableThree from '../TableThree';
import TableIncomingPrep from './TableIncomingPrep';
import TableOS from './TableOS';

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
            className=''
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

export default function MaterialFullWidthTabs() {
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

    return (
        <Box sx={{ bgcolor: 'background.paper', width: 'w-full' }}>
            <AppBar position="static" className=''>
                <ThemeProvider theme={theme}>

                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#00499F',
                                height: '4px'
                            }
                        }}

                        textColor="inherit"
                        variant="standard"
                        aria-label="full width tabs example"
                        className='bg-white text-[#00499F] font-semibold'

                    >
                        <Tab label="Incoming" {...a11yProps(0)} className='' />
                        {/* <Tab label="OS 2" {...a11yProps(1)} />
                        <Tab label="OS 3" {...a11yProps(2)} /> */}
                        {/* <Tab label={<Typography variant='h1'>OS 4</Typography>} /> */}
                    </Tabs>
                </ThemeProvider>
            </AppBar>
            {/* <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      > */}
            <TabPanel value={value} index={0} dir={theme.direction}>

                <TableIncomingPrep />

            </TabPanel>
            {/* <TabPanel value={value} index={1} dir={theme.direction}>



                <TableOS />

            </TabPanel>
            <TabPanel value={value} index={2} dir={theme.direction}>


                <TableOS />

            </TabPanel> */}
            {/* </SwipeableViews> */}
        </Box>
    );
}
