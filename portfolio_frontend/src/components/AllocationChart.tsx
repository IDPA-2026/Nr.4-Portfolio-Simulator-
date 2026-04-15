import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
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

    // Sicherheitscheck für valide Daten
    const validData = Array.isArray(data) ? data.filter(item => item && item.value > 0) : [];

    // Fallback falls nichts drin ist
    if (validData.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px', color: 'var(--text-muted)' }}>
                Kein Kapital vorhanden (0 {currency})
            </div>
        );
    }

    const totalValue = validData.reduce((sum, item) => sum + (item.value || 0), 0);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (!percent || percent < 0.05) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '350px' }}>
            {/* DER FIX: Absolut feste Größe anstatt ResponsiveContainer erzwingt
                ein fehlerfreies Rendering und verhindert den "width(-1)" Absturz */}
            <PieChart width={400} height={350}>
                <Pie
                    data={validData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    isAnimationActive={false} /* Deaktiviert Animations-Glitches beim Tab-Wechsel */
                >
                    {validData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: any) => [
                        `${Number(value).toLocaleString('de-CH')} ${currency} (${((Number(value) / totalValue) * 100).toFixed(1)}%)`,
                        'Anteil'
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
        </div>
    );
}