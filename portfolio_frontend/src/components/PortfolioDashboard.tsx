import { useState, useMemo } from 'react';
import { Portfolio, PortfolioConfig } from '../types';
import { calculatePortfolio } from '../utils/calculator';
import PortfolioInputs from './PortfolioInputs';
import PortfolioChart from './PortfolioChart';

const defaultConfig: PortfolioConfig = {
    initialCapital: 10000,
    annualGrowthRate: 7,
    annualInflationRate: 2,
    simulationStart: '2024-01',
    simulationEnd: '2034-12',
    depositStreams: []
};

export default function PortfolioDashboard() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([
        { id: '1', name: 'Hauptportfolio', config: defaultConfig }
    ]);
    const [activePortfolioId, setActivePortfolioId] = useState<string>('1');

    const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

    const updateActiveConfig = (newConfig: PortfolioConfig) => {
        setPortfolios(portfolios.map(p =>
            p.id === activePortfolioId ? { ...p, config: newConfig } : p
        ));
    };

    const updatePortfolioName = (name: string) => {
        setPortfolios(portfolios.map(p =>
            p.id === activePortfolioId ? { ...p, name } : p
        ));
    };

    const addPortfolio = () => {
        const newId = crypto.randomUUID();
        setPortfolios([...portfolios, { id: newId, name: `Portfolio ${portfolios.length + 1}`, config: defaultConfig }]);
        setActivePortfolioId(newId);
    };

    const deleteActivePortfolio = () => {
        if (portfolios.length === 1) return;
        const newPortfolios = portfolios.filter(p => p.id !== activePortfolioId);
        setPortfolios(newPortfolios);
        setActivePortfolioId(newPortfolios[0].id);
    };

    const chartData = useMemo(() => calculatePortfolio(activePortfolio.config), [activePortfolio.config]);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Portfolio Simulator</h1>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {portfolios.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePortfolioId(p.id)}
                            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-colors ${
                                activePortfolioId === p.id
                                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                    <button
                        onClick={addPortfolio}
                        className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:bg-gray-200"
                    >
                        + Neues Portfolio
                    </button>
                </div>

                <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <input
                        type="text"
                        value={activePortfolio.name}
                        onChange={(e) => updatePortfolioName(e.target.value)}
                        className="text-xl font-bold border-b border-dashed border-gray-400 focus:outline-none focus:border-blue-600 bg-transparent px-1"
                    />
                    {portfolios.length > 1 && (
                        <button onClick={deleteActivePortfolio} className="text-red-500 hover:text-red-700 text-sm font-medium">
                            Portfolio löschen
                        </button>
                    )}
                </div>

                <PortfolioInputs config={activePortfolio.config} setConfig={updateActiveConfig} />
                <PortfolioChart data={chartData} />
            </div>
        </div>
    );
}