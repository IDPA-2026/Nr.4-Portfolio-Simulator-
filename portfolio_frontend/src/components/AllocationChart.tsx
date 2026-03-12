import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AssetAllocation } from '../utils/calculator';
import { useEffect, useState } from 'react';

interface Props {
    data: AssetAllocation[];
    currency: string;
}

export default function AllocationChart({ data, currency }: Props) {
    const [tooltipColor, setTooltipColor] = useState({ bg: '#ffffff', text: '#0f172a' });

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTooltipColor({
            bg: isDark ? '#1e293b' : '#ffffff',
            text: isDark ? '#f8fafc' : '#0f172a'
        });
    }, []);

    if (!data || data.length === 0) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6b7280' }}>Keine Assets vorhanden</div>;
    }

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => [
                            `${Number(value).toLocaleString('de-CH')} ${currency}`,
                            'Anteil am Portfolio'
                        ]}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: tooltipColor.bg,
                            color: tooltipColor.text,
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}