import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const StackedBarChart = ({ timeline, duration }) => {
    const [chartData, setChartData] = useState([]);
    const [chartLabels, setChartLabels] = useState([]);

    useEffect(() => {
        if (timeline.length > 0) {
            const bins = Math.ceil(timeline.length / duration);
            const aggregatedData = Array.from({ length: bins }, (_, index) => {
                const start = index * duration;
                const end = start + duration;
                const slice = timeline.slice(start, end);

                const aggregate = slice.reduce(
                    (acc, curr) => {
                        acc.eat += curr.eat;
                        acc.missing += curr.missing;
                        acc.play += curr.play;
                        acc.sleep += curr.sleep;
                        return acc;
                    },
                    { eat: 0, missing: 0, play: 0, sleep: 0 }
                );

                return {
                    eat: aggregate.eat / slice.length,
                    missing: aggregate.missing / slice.length,
                    play: aggregate.play / slice.length,
                    sleep: aggregate.sleep / slice.length
                };
            });

            const limitedData = aggregatedData.slice(-10);
            const currentTime = new Date();
            const startTime = new Date(currentTime.getTime() - timeline.length * 60000);

            const labels = aggregatedData.map((_, index) => {
                let labelTime = new Date(startTime.getTime() + (index + 1) * duration * 60000);
                if (labelTime > currentTime) {
                    labelTime = currentTime;
                }

                return `${labelTime.getHours().toString().padStart(2, '0')}:${labelTime.getMinutes().toString().padStart(2, '0')}`;
            });

            setChartData(limitedData);
            setChartLabels(labels.slice(-10));
        }
    }, [timeline, duration]);

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Eat',
                data: chartData.map(item => item.eat),
                backgroundColor: '#36A2EB',
            },
            {
                label: 'Missing',
                data: chartData.map(item => item.missing),
                backgroundColor: '#FF6384',
            },
            {
                label: 'Play',
                data: chartData.map(item => item.play),
                backgroundColor: '#4BC0C0',
            },
            {
                label: 'Sleep',
                data: chartData.map(item => item.sleep),
                backgroundColor: '#FFCE56',
            },
        ],
    };

    const options = {
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
        plugins: {
            legend: {
                display: true,
            },
        },
    };

    return <Bar data={data} options={options} width={500} height={200} />;
};

export default StackedBarChart;
