import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

const chartSetting = {
  xAxis: [
    {
      label: 'rainfall (mm)',
    },
  ],

  width: 500,
  height: 400,

};
const dataset = [
  {
    london: 59,
    paris: 57,
    newYork: 86,
    seoul: 100,
    name: 'mesin1',
    month: 'Jan',
  },
  {
    london: 50,
    paris: 52,
    newYork: 78,
    seoul: 28,
    name: 'mesin2',
    month: 'Fev',
  },
  {
    london: 47,
    paris: 53,
    newYork: 106,
    seoul: 41,
    name: 'mesin3',
    month: 'Mar',
  },
  {
    london: 54,
    paris: 56,
    newYork: 92,
    seoul: 73,
    name: 'mesin4',
    month: 'Apr',
  },
  {
    london: 57,
    paris: 69,
    newYork: 92,
    seoul: 99,
    name: 'mesin5',
    month: 'May',
  },
  {
    london: 60,
    paris: 63,
    newYork: 103,
    seoul: 144,
    name: 'mesin6',
    month: 'June',
  },
  {
    london: 59,
    paris: 60,
    newYork: 105,
    seoul: 319,
    name: 'mesin7',
    month: 'July',
  },
  {
    london: 65,
    paris: 60,
    newYork: 106,
    seoul: 249,
    name: 'mesin8',
    month: 'Aug',
  },
  {
    london: 51,
    paris: 51,
    newYork: 95,
    seoul: 131,
    name: 'mesin9',
    month: 'Sept',
  },
  {
    london: 60,
    paris: 65,
    newYork: 97,
    seoul: 55,
    name: 'mesin10',
    month: 'Oct',
  },
  {
    london: 67,
    paris: 64,
    newYork: 76,
    seoul: 48,
    name: 'mesin11',
    month: 'Nov',
  },
  {
    london: 61,
    paris: 70,
    newYork: 103,
    seoul: 25,
    name: 'mesin12dahfuo ed',
    month: 'Dec',
  },
];

const valueFormatter = (value: number | null) => `${value}mm`;

export default function HorizontalBars() {
  const seoulData = dataset.map(data => data.seoul);

  console.log(seoulData)
  const commonStyles = {
    fill: dataset.map(data => data.seoul > 100 ? "#A020F0" : "#0065DE")


  };
  return (
    <BarChart
      sx={{
        ...commonStyles,
        ".MuiBarElement-root": {

          // fill: seoulData > 100 ? "0065DE" : '#0065DE',
        },

      }}
      dataset={dataset}
      yAxis={[{ scaleType: 'band', dataKey: 'name' }]}
      series={[{ dataKey: 'seoul', label: 'Sparepart ', valueFormatter }]}
      layout="horizontal"
      {...chartSetting}
    />
  );
}
