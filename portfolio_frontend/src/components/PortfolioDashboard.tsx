import { useState, useMemo } from 'react';
import { PortfolioConfig } from '../types';
import { calculatePortfolio } from '../utils/calculator';
import PortfolioInputs from './PortfolioInputs';
import PortfolioChart from './PortfolioChart';

export default function PortfolioDashboard() {
    const [config, setConfig] = useState<PortfolioConfig>({
        initialCapital: 10000,
        annualGrowthRate: 7,
        annualInflationRate: 2,
        simulationStart: '2024-01',
        simulationEnd: '2034-12',
        depositStreams: []
    });

    const chartData = useMemo(() => calculatePortfolio(config), [config]);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Portfolio Simulator</h1>
                <PortfolioInputs config={config} setConfig={setConfig} />
                <PortfolioChart data={chartData} />
            </div>
        </div>
    );
}