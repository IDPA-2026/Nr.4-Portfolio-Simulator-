// components/PortfolioChart.tsx
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';
import { useEffect, useState } from 'react';

interface Props {
    data: ChartDataPoint[];
    multiData?: { name: string, data: ChartDataPoint[], color: string }[];
    assetsNames?: string[];
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' });

const formatMonth = (label: any) => {
    if (typeof label !== 'string') return label;
    const [year, month] = label.split('-');
    return dateFormatter.format(new Date(parseInt(year), parseInt(month) - 1));
};

export default function PortfolioChart({ data, multiData, assetsNames = [] }: Props) {
    const [chartColors, setChartColors] = useState({
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
                grid: root.getPropertyValue('--chart-grid').trim() || '#e2e8f0',
                text: root.getPropertyValue('--chart-text').trim() || '#6b7280',
                tooltipBg: isDark ? '#1e293b' : '#ffffff',
                tooltipText: isDark ? '#f8fafc' : '#0f172a'
            });
        };

        updateColors();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') updateColors();
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const isCombined = !!multiData && multiData.length > 0;
    const ASSET_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#84cc16', '#6366f1'];

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 10, right: 10, bottom: 0, left: 10 }} data={isCombined ? [] : data}>
                    <defs>
                        <linearGradient id="colorDeposited" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chartColors.grid} />

                    <XAxis
                        dataKey="date"
                        allowDuplicatedCategory={false}
                        tick={{ fill: chartColors.text, fontSize: 12 }}
                        tickMargin={12}
                        tickFormatter={formatMonth}
                        minTickGap={40}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fill: chartColors.text, fontSize: 12 }}
                        tickFormatter={(value: number) => `${(value / 1000).toLocaleString('de-DE')}k €`}
                        width={60}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        labelFormatter={formatMonth}
                        formatter={(value: any, name: any) => [
                            `${Number(value).toLocaleString('de-DE')} €`,
                            name
                        ]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: chartColors.tooltipBg,
                            color: chartColors.tooltipText,
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            padding: '12px 16px'
                        }}
                    />

                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                    {!isCombined ? (
                        <>
                            <Line
                                type="stepAfter"
                                data={data}
                                dataKey="nominalValue"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={false}
                                name="Total Nominalwert"
                            />
                            <Line
                                type="stepAfter"
                                data={data}
                                dataKey="cashValue"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                                name="Cash"
                            />
                            {assetsNames.map((assetName, idx) => (
                                <Line
                                    key={assetName}
                                    type="stepAfter"
                                    data={data}
                                    dataKey={assetName}
                                    stroke={ASSET_COLORS[idx % ASSET_COLORS.length]}
                                    strokeWidth={2}
                                    dot={false}
                                    name={assetName}
                                />
                            ))}
                        </>
                    ) : (
                        multiData.map((set) => (
                            <Line
                                key={set.name}
                                data={set.data}
                                type="stepAfter"
                                dataKey="nominalValue"
                                stroke={set.color}
                                strokeWidth={3}
                                dot={false}
                                name={set.name}
                                isAnimationActive={true}
                            />
                        ))
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}