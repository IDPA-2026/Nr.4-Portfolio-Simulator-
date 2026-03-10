import { useState, useMemo } from 'react';
import { Portfolio, PortfolioConfig, DepositStream } from '../types';
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

    // Merge States
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

        // Alle zu mergenden Portfolios sammeln (Aktives + Ausgewählte)
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

            // Streams kopieren und neue IDs vergeben, um React-Key-Konflikte zu vermeiden
            const clonedStreams = p.config.depositStreams.map(s => ({ ...s, id: crypto.randomUUID() }));
            allStreams = [...allStreams, ...clonedStreams];
        });

        const count = portfoliosToMerge.length;

        const mergedConfig: PortfolioConfig = {
            initialCapital: totalCapital,
            // Durchschnittliche Wachstums- und Inflationsrate berechnen
            annualGrowthRate: Number((totalGrowthRate / count).toFixed(2)),
            annualInflationRate: Number((totalInflationRate / count).toFixed(2)),
            simulationStart: minStart,
            simulationEnd: maxEnd,
            depositStreams: allStreams
        };

        const newId = crypto.randomUUID();

        // Namen der gemergten Portfolios für den neuen Titel kombinieren
        const combinedNames = portfoliosToMerge.map(p => p.name).join(' + ');
        const newPortfolioName = combinedNames.length > 40 ? `Gemergtes Portfolio (${count})` : combinedNames;

        const newPortfolio: Portfolio = {
            id: newId,
            name: newPortfolioName,
            config: mergedConfig
        };

        let updatedPortfolios = [...portfolios];

        if (deleteOriginals) {
            // Lösche das aktive Portfolio und alle ausgewählten aus der Liste
            updatedPortfolios = updatedPortfolios.filter(
                p => p.id !== activePortfolioId && !selectedForMerge.includes(p.id)
            );
        }

        // Füge das neue zusammengeführte Portfolio hinzu
        updatedPortfolios.push(newPortfolio);

        setPortfolios(updatedPortfolios);
        setActivePortfolioId(newId);
        resetMerge();
    };

    const chartData = useMemo(() => calculatePortfolio(activePortfolio.config), [activePortfolio.config]);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Portfolio Simulator</h1>

                {/* Tabs für die Portfolios */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {portfolios.map(p => (
                        <button
                            key={p.id}
                            onClick={() => { setActivePortfolioId(p.id); resetMerge(); }}
                            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-colors whitespace-nowrap ${
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
                        className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:bg-gray-200 whitespace-nowrap"
                    >
                        + Neues Portfolio
                    </button>
                </div>

                {/* Portfolio Aktionen & Merge Menü */}
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

                    {/* Erweitertes Merge UI */}
                    {showMerge && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-blue-900">Mit welchen Portfolios soll "{activePortfolio.name}" zusammengeführt werden?</h3>

                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto bg-white p-3 rounded border border-blue-200">
                                {portfolios.filter(p => p.id !== activePortfolioId).map(p => (
                                    <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600"
                                            checked={selectedForMerge.includes(p.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedForMerge([...selectedForMerge, p.id]);
                                                } else {
                                                    setSelectedForMerge(selectedForMerge.filter(id => id !== p.id));
                                                }
                                            }}
                                        />
                                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 pt-2 border-t border-blue-200">
                                <label className="flex items-center gap-2 cursor-pointer mr-auto">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-red-600"
                                        checked={deleteOriginals}
                                        onChange={(e) => setDeleteOriginals(e.target.checked)}
                                    />
                                    <span className="text-sm font-bold text-red-600">Ausgewählte Original-Portfolios nach dem Merge löschen</span>
                                </label>

                                <button
                                    onClick={resetMerge}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    onClick={executeMerge}
                                    disabled={selectedForMerge.length === 0}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium disabled:bg-blue-300 hover:bg-blue-700 transition-colors"
                                >
                                    Bestätigen
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <PortfolioInputs config={activePortfolio.config} setConfig={updateActiveConfig} />
                <PortfolioChart data={chartData} />
            </div>
        </div>
    );
}