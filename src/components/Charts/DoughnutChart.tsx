import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function DoughnutChart() {

    let data = [
        {
            label: "Label 1",
            value: 55,
            color: "#FF0000",
            cutout: "50%",
        },
        {
            label: "Label 2",
            value: 15,
            color: "#009F19",
            cutout: "50%",
        },
        {
            label: "Label 3",
            value: 80,
            color: "#FCBF11",
            cutout: "50%",
        },
    ]

    const options: any = {
        plugins: {
            datalabels: {
                formatter: function (value: number) {
                    let val = Math.round(value);
                    return new Intl.NumberFormat("tr-TR").format(val); //for number format
                },
                color: "white",

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
        labels: data.map((item) => item.label),
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

    return <Doughnut data={finalData} options={options} />;
}