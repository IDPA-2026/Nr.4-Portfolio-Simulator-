import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
    data: ChartDataPoint[];
}

export default function PortfolioChart({ data }: Props) {
    // Ohne Tailwind CSS hat das div keine Höhe, daher war der Chart unsichtbar.
    // Das inline-style erzwingt jetzt die Darstellung.
    return (
        <div style={{ width: '100%', height: '500px', marginTop: '40px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280' }} tickMargin={10} />
                    <YAxis tick={{ fill: '#6b7280' }} tickFormatter={(value) => `${value.toLocaleString()} €`} width={100} />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('de-DE')} €`} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Area
                        type="monotone"
                        dataKey="totalDeposited"
                        fill="#f3f4f6"
                        stroke="#9ca3af"
                        name="Eingezahltes Kapital"
                    />
                    <Line
                        type="monotone"
                        dataKey="nominalValue"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        name="Nominalwert (inkl. Zinsen)"
                    />
                    <Line
                        type="monotone"
                        dataKey="realValue"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Realwert (Kaufkraft)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}