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

const dateFormatter = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' });

const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return dateFormatter.format(new Date(parseInt(year), parseInt(month) - 1));
};

export default function PortfolioChart({ data }: Props) {
    const [chartColors, setChartColors] = useState({
        nominal: '#10b981',
        real: '#f59e0b',
        area: '#3b82f6',
        stroke: '#2563eb',
        grid: '#e2e8f0',
        text: '#6b7280',
        tooltipBg: '#ffffff',
        tooltipText: '#0f172a'
    });

    useEffect(() => {
        const updateColors = () => {
            const root = getComputedStyle(document.documentElement);
            const isDark = document.documentElement.classList.contains('dark');

            setChartColors({
                nominal: root.getPropertyValue('--chart-line-nominal').trim() || '#10b981',
                real: root.getPropertyValue('--chart-line-real').trim() || '#f59e0b',
                area: root.getPropertyValue('--primary').trim() || '#3b82f6',
                stroke: root.getPropertyValue('--primary').trim() || '#2563eb',
                grid: root.getPropertyValue('--chart-grid').trim() || '#e2e8f0',
                text: root.getPropertyValue('--chart-text').trim() || '#6b7280',
                tooltipBg: isDark ? '#1e293b' : '#ffffff',
                tooltipText: isDark ? '#f8fafc' : '#0f172a'
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
                <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                    <defs>
                        <linearGradient id="colorDeposited" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.area} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColors.area} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke={chartColors.grid}
                    />

                    <XAxis
                        dataKey="date"
                        tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 500 }}
                        tickMargin={12}
                        tickFormatter={formatMonth}
                        minTickGap={40}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fill: chartColors.text, fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value: number) => `${(value / 1000).toLocaleString('de-DE')}k €`}
                        width={60}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                    />

                    <Tooltip
                        labelFormatter={(label) => formatMonth(label as string)}
                        formatter={(value: any, name: any) => [
                            `${Number(value).toLocaleString('de-DE')} €`,
                            name
                        ]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: chartColors.tooltipBg,
                            color: chartColors.tooltipText,
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            padding: '12px 16px',
                            fontWeight: 500
                        }}
                        itemStyle={{
                            paddingTop: '4px'
                        }}
                    />

                    <Legend
                        wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }}
                        iconType="circle"
                    />

                    <Area
                        type="monotone"
                        dataKey="totalDeposited"
                        fill="url(#colorDeposited)"
                        stroke={chartColors.stroke}
                        strokeWidth={2}
                        name="Eingezahltes Kapital"
                        isAnimationActive={true}
                        animationDuration={1500}
                    />
                    <Line
                        type="monotone"
                        dataKey="nominalValue"
                        stroke={chartColors.nominal}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Nominalwert (inkl. Zinsen)"
                        isAnimationActive={true}
                        animationDuration={1500}
                    />
                    <Line
                        type="monotone"
                        dataKey="realValue"
                        stroke={chartColors.real}
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                        name="Realwert (Kaufkraft)"
                        isAnimationActive={true}
                        animationDuration={1500}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}