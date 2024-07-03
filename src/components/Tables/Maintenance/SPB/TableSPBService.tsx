import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableSPBRequested from './TableSPBRequested';

import TableSPBRequestedSparepart from './TableSPBRequestedSparepart';
import TableSPBHistoryServiceApproved from './TableSPBHistoryServiceApproved';
import TableSPBHistoryServiceRejected from './TableSPBHistoryServiceRejected';
import TableHistorySparepartApproved from './TableSPBHistorySparepartApproved';
import TableHistorySparepartRejected from './TableSPBHistorySparepartRejected';

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
      className="text-xs"
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

export default function TableSPBService() {
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
    fontSize:'7px'
  };
  return (
    <Box
      sx={{
        ...commonStyles,
        '& .MuiPaper-root': {
          borderTopRightRadius: '12px',
          borderTopLeftRadius: '12px',
          background: '#D8EAFF',
          boxShadow: 0,
          fontSize:'7px'
        },
        '& .MuiBox-root': {
          borderTopRightRadius: '12px',
          borderTopLeftRadius: '12px',
          background: '#D8EAFF',
          boxShadow: 0,
            fontSize:'7px'
        },
        '& .MuiTabs-root': {
          borderTopRightRadius: '12px',
          borderTopLeftRadius: '12px',
            fontSize:'7px'
        },
        '& .MuiTabs-flexcontainer': {
          borderTopRightRadius: '12px',
          borderTopLeftRadius: '12px',
            fontSize:'7px'
        },
        '& fieldset': {
          borderRadius: '12px',
            fontSize:'7px'
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
                fontSize:'9px'
              },
            }}
            textColor="inherit"
            variant="standard"
            aria-label="full width tabs example"
            
            className="bg-white text-xs text-[#00499F] font-light mb-2 overflow-x-scroll"
            
          >
            <Tab label="Service" {...a11yProps(0)} className="text-xs " />
            <Tab label="Sparepart" {...a11yProps(1)} className="" />
            <Tab label="Approved  Service " {...a11yProps(2)} />
            <Tab label="Rejected  Service " {...a11yProps(3)} />
            <Tab label="  Approved Sparepart" {...a11yProps(4)} />
            <Tab label="  Rejected Sparepart" {...a11yProps(5)} />
          </Tabs>
        </ThemeProvider>
      </AppBar>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <TableSPBRequested />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <TableSPBRequestedSparepart />
      </TabPanel>
      <TabPanel value={value} index={2} dir={theme.direction}>
        <TableSPBHistoryServiceApproved />
      </TabPanel>
      <TabPanel value={value} index={3} dir={theme.direction}>
        <TableSPBHistoryServiceRejected />
      </TabPanel>
      <TabPanel value={value} index={4} dir={theme.direction}>
        <TableHistorySparepartApproved />
      </TabPanel>
      <TabPanel value={value} index={5} dir={theme.direction}>
        <TableHistorySparepartRejected />
      </TabPanel>
    </Box>
  );
}
