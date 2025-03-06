import React, { useEffect, useState } from 'react';

const BarChartKaryawan = ({ value }: { value: any }) => {
    const data = value;
    const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

    // Calculate total for percentages
    const total = data?.reduce((sum: number, item: any) => sum + item.jumlah, 0) || 0;

    // Generate an array of colors based on the data length
    const generateColors = (length: number) => {
        const colors = [];
        // Use HSL to easily create distinct colors by varying the hue
        for (let i = 0; i < length; i++) {
            const hue = (i * 360) / length;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    };

    const colors = generateColors(data?.length || 0);

    // Calculate the segments for the pie chart
    const calculateSegments = () => {
        let cumulativePercent = 0;
        return data?.map((item: any, index: number) => {
            const percent = total > 0 ? (item.jumlah / total) * 100 : 0;
            const startPercent = cumulativePercent;
            cumulativePercent += percent;

            return {
                ...item,
                percent,
                startAngle: (startPercent / 100) * 360,
                endAngle: (cumulativePercent / 100) * 360,
                color: colors[index % colors.length]
            };
        });
    };

    const segments = calculateSegments();

    // Create SVG arc path
    const createArc = (startAngle: number, endAngle: number, radius: number) => {
        // Convert angles from degrees to radians
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;

        const x1 = radius * Math.cos(startRad);
        const y1 = radius * Math.sin(startRad);
        const x2 = radius * Math.cos(endRad);
        const y2 = radius * Math.sin(endRad);

        // Determine if the arc should be drawn the long way around
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    // Size constants
    const radius = 120;
    const chartSize = radius * 2;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;

    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
                {/* Tooltip positioned to the left of the chart */}
                {hoveredSegment !== null && segments && segments[hoveredSegment] && (
                    <div
                        className="bg-white shadow-lg border border-gray-200 rounded-lg p-3 text-sm mr-4"
                        style={{
                            minWidth: "150px",
                            maxWidth: "200px",
                            position: "absolute",
                            left: "-170px", // Position to the left with some spacing
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10
                        }}
                    >
                        <div className="font-bold mb-1">{segments[hoveredSegment].nama}</div>
                        <div className="flex justify-between items-center">
                            <div>Jumlah:</div>
                            <div className="font-semibold">{segments[hoveredSegment].jumlah}</div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>Persentase:</div>
                            <div className="font-semibold">{segments[hoveredSegment].percent.toFixed(1)}%</div>
                        </div>
                        <div
                            className="w-full h-1 mt-2"
                            style={{ backgroundColor: segments[hoveredSegment].color }}
                        ></div>
                    </div>
                )}

                <div className="relative" style={{ width: chartSize, height: chartSize }}>
                    <svg
                        viewBox={`0 0 ${chartSize} ${chartSize}`}
                        width="100%"
                        height="100%"
                    >
                        <g transform={`translate(${centerX}, ${centerY})`}>
                            {segments?.map((segment: any, index: number) => {
                                return (
                                    <g key={index}>
                                        <path
                                            d={createArc(segment.startAngle, segment.endAngle, radius)}
                                            fill={segment.color}
                                            stroke="#fff"
                                            strokeWidth="1"
                                            onMouseEnter={() => setHoveredSegment(index)}
                                            onMouseLeave={() => setHoveredSegment(null)}
                                            style={{
                                                cursor: 'pointer',
                                                transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                                                transformOrigin: 'center',
                                                transition: 'transform 0.2s ease'
                                            }}
                                        />
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto w-full">
                {segments?.map((segment: any, index: number) => (
                    <div
                        key={index}
                        className="flex items-center text-xs"
                        onMouseEnter={() => setHoveredSegment(index)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: hoveredSegment === index ? segment.color + '33' : 'transparent',
                            padding: '2px 4px',
                            borderRadius: '4px'
                        }}
                    >
                        <div
                            className="w-3 h-3 mr-1 flex-shrink-0"
                            style={{ backgroundColor: segment.color }}
                        ></div>
                        <div className="flex-1 truncate">{segment.nama}</div>
                        <div className="ml-1 font-medium">{segment.jumlah} ({segment.percent.toFixed(1)}%)</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default BarChartKaryawan;
