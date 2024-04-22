import * as React from "react";
import {
    BarPlot,
    ChartsReferenceLine, ChartsTooltip,
    ChartsXAxis,
    ChartsYAxis,
    useYScale,
    ResponsiveChartContainer
} from '@mui/x-charts';

export default function Bars() {
    const SlotBarElement = (props: any) => {
        const yAxisScale = useYScale('left_axis_id')
        const yAxisValue = yAxisScale.invert(props.style.y.animation.to)
        const isBelowBar = yAxisValue < 8.5
        const color = isBelowBar ? '#ff0000' : '#00ff00'

        // work around export of BarElement
        return <rect
            fill={color}
            height={props.style.height.animation.to}
            width={props.style.width.animation.to}
            x={props.style.x.animation.to}
            y={props.style.y.animation.to}
        />
    }

    return (
        <ResponsiveChartContainer
            height={350}
            series={[
                { type: 'bar', data: [11, 7, 1, 9], yAxisKey: 'left_axis_id' },
            ]}
            xAxis={[{ scaleType: 'band', data: ['11/15', '11/16', '11/17', '11/18'] }]}
            yAxis={[{ id: 'left_axis_id' }]}

        >
            <BarPlot slots={{ bar: SlotBarElement }} />
            <ChartsYAxis />
            <ChartsXAxis axisId="left_axis_id" position="bottom" />

            <ChartsTooltip />
        </ResponsiveChartContainer>
    )
}
