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

interface Props {
    data: ChartDataPoint[];
}

export default function PortfolioChart({ data }: Props) {
    return (
        <div style={{
            width: '100%',
            height: '500px',
            marginTop: '40px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickMargin={10}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value: number) => `${value.toLocaleString('de-DE')} €`}
                        width={80}
                    />
                    <Tooltip
                        formatter={(value: any) => [
                            `${Number(value).toLocaleString('de-DE')} €`
                        ]}
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Area
                        type="monotone"
                        dataKey="totalDeposited"
                        fill="#f3f4f6"
                        stroke="#9ca3af"
                        name="Eingezahltes Kapital"
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="nominalValue"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        name="Nominalwert (inkl. Zinsen)"
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="realValue"
                        stroke="#f59e0b"
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