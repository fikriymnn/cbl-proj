import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function DoughnutChart() {
  let data = [
    {
      label: 'OPEN',
      value: 55,
      color: '#FF0000',
      cutout: '50%',
    },
    {
      label: 'DONE',
      value: 15,
      color: '#009F19',
      cutout: '50%',
    },
    {
      label: 'MONITORING',
      value: 80,
      color: '#FCBF11',
      cutout: '50%',
    },
  ];

  const options: any = {
    plugins: {
      datalabels: {
        formatter: function (value: number) {
          let val = Math.round(value);
          return new Intl.NumberFormat('tr-TR').format(val); //for number format
        },
        color: 'white',

        font: {
          weight: 'bold',
          size: 14,
          family: 'poppins',
        },
      },
      responsive: true,
    },
    cutout: data.map((item) => item.cutout),
  };

  const finalData = {
    // labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => Math.round(item.value)),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  };

  return (
    <>
      <div className="flex justify-center items-center w-40 gap-5">
        <Doughnut data={finalData} options={options} />
        <div className="flex flex-col justify-start items-start gap-y-5">
          <div>
            <div className="flex gap-3 text-md font-bold text-red-600 justify-center items-center">
              <div className="w-4 h-4 bg-red-600"></div>
              <p>Open</p>
            </div>
            <div className="flex gap-3 text-xl font-bold">
              <div className="w-4 h-4 bg-transparent"></div>
              <p>{data[0].value}</p>
            </div>
          </div>
          <div>
            <div className="flex gap-3 text-md font-bold text-green-600 justify-center items-center">
              <div className="w-4 h-4 bg-green-600"></div>
              <p>Done</p>
            </div>
            <div className="flex gap-3 text-xl font-bold">
              <div className="w-4 h-4 bg-transparent"></div>
              <p>{data[1].value}</p>
            </div>
          </div>
          <div>
            <div className="flex gap-3 text-md font-bold text-yellow-500 justify-center items-center">
              <div className="w-4 h-4 bg-yellow-500"></div>
              <p>Monitoring</p>
            </div>
            <div className="flex gap-3 text-xl font-bold">
              <div className="w-4 h-4 bg-transparent"></div>
              <p>{data[2].value}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
