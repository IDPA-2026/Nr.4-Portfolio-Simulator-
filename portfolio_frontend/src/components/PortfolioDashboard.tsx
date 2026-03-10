import { useState, useMemo } from 'react';
import { Portfolio, PortfolioConfig, DepositStream } from '../types';
import { calculatePortfolio } from '../utils/calculator';
import PortfolioTabs from './PortfolioTabs';
import PortfolioMergePanel from './PortfolioMergePanel';
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

    const [showMerge, setShowMerge] = useState<boolean>(false);
    const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
    const [deleteOriginals, setDeleteOriginals] = useState<boolean>(false);

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
        resetMerge();
    };

    const deleteActivePortfolio = () => {
        if (portfolios.length === 1) return;
        const newPortfolios = portfolios.filter(p => p.id !== activePortfolioId);
        setPortfolios(newPortfolios);
        setActivePortfolioId(newPortfolios[0].id);
        resetMerge();
    };

    const resetMerge = () => {
        setShowMerge(false);
        setSelectedForMerge([]);
        setDeleteOriginals(false);
    };

    const executeMerge = () => {
        if (selectedForMerge.length === 0) return;

        const portfoliosToMerge = [
            activePortfolio,
            ...portfolios.filter(p => selectedForMerge.includes(p.id))
        ];

        let totalCapital = 0;
        let totalGrowthRate = 0;
        let totalInflationRate = 0;
        let minStart = portfoliosToMerge[0].config.simulationStart;
        let maxEnd = portfoliosToMerge[0].config.simulationEnd;
        let allStreams: DepositStream[] = [];

        portfoliosToMerge.forEach(p => {
            totalCapital += p.config.initialCapital;
            totalGrowthRate += p.config.annualGrowthRate;
            totalInflationRate += p.config.annualInflationRate;

            if (p.config.simulationStart < minStart) minStart = p.config.simulationStart;
            if (p.config.simulationEnd > maxEnd) maxEnd = p.config.simulationEnd;

            const clonedStreams = p.config.depositStreams.map(s => ({ ...s, id: crypto.randomUUID() }));
            allStreams = [...allStreams, ...clonedStreams];
        });

        const count = portfoliosToMerge.length;

        const mergedConfig: PortfolioConfig = {
            initialCapital: totalCapital,
            annualGrowthRate: Number((totalGrowthRate / count).toFixed(2)),
            annualInflationRate: Number((totalInflationRate / count).toFixed(2)),
            simulationStart: minStart,
            simulationEnd: maxEnd,
            depositStreams: allStreams
        };

        const newId = crypto.randomUUID();
        const combinedNames = portfoliosToMerge.map(p => p.name).join(' + ');
        const newPortfolioName = combinedNames.length > 40 ? `Gemergtes Portfolio (${count})` : combinedNames;

        const newPortfolio: Portfolio = {
            id: newId,
            name: newPortfolioName,
            config: mergedConfig
        };

        let updatedPortfolios = [...portfolios];

        if (deleteOriginals) {
            updatedPortfolios = updatedPortfolios.filter(
                p => p.id !== activePortfolioId && !selectedForMerge.includes(p.id)
            );
        }

        updatedPortfolios.push(newPortfolio);

        setPortfolios(updatedPortfolios);
        setActivePortfolioId(newId);
        resetMerge();
    };

    const chartData = useMemo(() => calculatePortfolio(activePortfolio.config), [activePortfolio.config]);
    const availableForMerge = portfolios.filter(p => p.id !== activePortfolioId);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Portfolio Simulator</h1>

                <PortfolioTabs
                    portfolios={portfolios}
                    activePortfolioId={activePortfolioId}
                    onSelect={(id) => { setActivePortfolioId(id); resetMerge(); }}
                    onAdd={addPortfolio}
                />

                <div className="mb-6 flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center">
                        <input
                            type="text"
                            value={activePortfolio.name}
                            onChange={(e) => updatePortfolioName(e.target.value)}
                            className="text-xl font-bold border-b border-dashed border-gray-400 focus:outline-none focus:border-blue-600 bg-transparent px-1 w-1/2"
                        />
                        <div className="flex gap-4">
                            {portfolios.length > 1 && !showMerge && (
                                <button onClick={() => setShowMerge(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Zusammenführen (Merge)
                                </button>
                            )}
                            {portfolios.length > 1 && (
                                <button onClick={deleteActivePortfolio} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                    Portfolio löschen
                                </button>
                            )}
                        </div>
                    </div>

                    {showMerge && (
                        <PortfolioMergePanel
                            activePortfolio={activePortfolio}
                            availablePortfolios={availableForMerge}
                            selectedForMerge={selectedForMerge}
                            setSelectedForMerge={setSelectedForMerge}
                            deleteOriginals={deleteOriginals}
                            setDeleteOriginals={setDeleteOriginals}
                            onCancel={resetMerge}
                            onConfirm={executeMerge}
                        />
                    )}
                </div>

                <PortfolioInputs config={activePortfolio.config} setConfig={updateActiveConfig} />
                <PortfolioChart data={chartData} />
            </div>
        </div>
    );
}