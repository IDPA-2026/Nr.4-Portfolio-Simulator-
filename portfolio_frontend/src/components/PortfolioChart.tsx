import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { ChartDataPoint } from '../types';
import { useEffect, useState } from 'react';

interface Props {
    data: ChartDataPoint[];
}

export default function PortfolioChart({ data }: Props) {
    const [chartColors, setChartColors] = useState({
        nominal: '#10b981',
        real: '#f59e0b',
        area: '#f3f4f6',
        stroke: '#9ca3af',
        grid: '#e2e8f0',
        text: '#6b7280'
    });

    useEffect(() => {
        const updateColors = () => {
            const root = getComputedStyle(document.documentElement);
            setChartColors({
                nominal: root.getPropertyValue('--chart-line-nominal').trim() || '#10b981',
                real: root.getPropertyValue('--chart-line-real').trim() || '#f59e0b',
                area: root.getPropertyValue('--chart-area-fill').trim() || '#f3f4f6',
                stroke: root.getPropertyValue('--chart-area-stroke').trim() || '#9ca3af',
                grid: root.getPropertyValue('--chart-grid').trim() || '#e2e8f0',
                text: root.getPropertyValue('--chart-text').trim() || '#6b7280'
            });
        };

        updateColors();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateColors();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: chartColors.text, fontSize: 12 }}
                        tickMargin={10}
                    />
                    <YAxis
                        tick={{ fill: chartColors.text, fontSize: 12 }}
                        tickFormatter={(value: number) => `${value.toLocaleString('de-DE')} €`}
                        width={80}
                    />
                    <Tooltip
                        formatter={(value: any) => [
                            `${Number(value).toLocaleString('de-DE')} €`
                        ]}
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none'
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Area
                        type="monotone"
                        dataKey="totalDeposited"
                        fill={chartColors.area}
                        stroke={chartColors.stroke}
                        name="Eingezahltes Kapital"
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="nominalValue"
                        stroke={chartColors.nominal}
                        strokeWidth={3}
                        dot={false}
                        name="Nominalwert (inkl. Zinsen)"
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="realValue"
                        stroke={chartColors.real}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Realwert (Kaufkraft)"
                        isAnimationActive={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}