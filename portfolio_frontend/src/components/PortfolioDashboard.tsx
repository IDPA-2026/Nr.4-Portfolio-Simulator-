import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    GitMerge,
    Trash2,
    Settings2,
    BarChart3,
    LayoutDashboard // Neues Icon für Compare
} from 'lucide-react';

import { Portfolio, PortfolioConfig, DepositStream } from '../types';
import { calculatePortfolio } from '../utils/calculator';
import PortfolioTabs from './PortfolioTabs';
import PortfolioMergePanel from './PortfolioMergePanel';
import PortfolioComparePanel from './PortfolioComparePanel'; // Neuer Import
import PortfolioInputs from './PortfolioInputs';
import PortfolioChart from './PortfolioChart';
import GlassCard from './GlassCard';

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

    // Merge State
    const [showMerge, setShowMerge] = useState<boolean>(false);
    const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
    const [deleteOriginals, setDeleteOriginals] = useState<boolean>(false);

    // Compare State
    const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
    const [compareIds, setCompareIds] = useState<string[]>([]);

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
        resetModes();
    };

    const deleteActivePortfolio = () => {
        if (portfolios.length === 1) return;
        const newPortfolios = portfolios.filter(p => p.id !== activePortfolioId);
        setPortfolios(newPortfolios);
        setActivePortfolioId(newPortfolios[0].id);

        // Remove from compare list if it was there
        if (compareIds.includes(activePortfolioId)) {
            setCompareIds(compareIds.filter(id => id !== activePortfolioId));
        }
        resetModes();
    };

    const resetModes = () => {
        setShowMerge(false);
        setSelectedForMerge([]);
        setDeleteOriginals(false);
        setIsCompareMode(false);
    };

    const toggleCompareMode = () => {
        if (!isCompareMode) {
            setShowMerge(false); // Close merge if open
            setCompareIds([activePortfolioId]); // Init mit dem aktuellen Portfolio
        }
        setIsCompareMode(!isCompareMode);
    };

    const toggleMergeMode = () => {
        if (!showMerge) {
            setIsCompareMode(false); // Close compare if open
            setSelectedForMerge([]);
        }
        setShowMerge(!showMerge);
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
        const newPortfolioName = combinedNames.length > 40 ? `Fusion (${count})` : combinedNames;

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
        resetModes();
    };

    const availableForMerge = portfolios.filter(p => p.id !== activePortfolioId);

    // Welche Portfolios sollen gerendert werden? (1 bei Normal, X bei Compare)
    const displayPortfolios = isCompareMode
        ? portfolios.filter(p => compareIds.includes(p.id))
        : [activePortfolio];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="dashboard-title-group"
                >
                    <h1>WealthView</h1>
                    <p className="dashboard-subtitle">Präzise Vermögensplanung & Simulation</p>
                </motion.div>

                <div className="tabs-wrapper">
                    <PortfolioTabs
                        portfolios={portfolios}
                        activePortfolioId={activePortfolioId}
                        onSelect={(id) => {
                            setActivePortfolioId(id);
                            resetModes();
                        }}
                        onAdd={addPortfolio}
                    />
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    <GlassCard>
                        <div className="action-bar">
                            <div className="portfolio-name-wrapper">
                                <div className="icon-wrapper">
                                    <TrendingUp size={24} />
                                </div>
                                <input
                                    type="text"
                                    value={activePortfolio.name}
                                    onChange={(e) => updatePortfolioName(e.target.value)}
                                    className="portfolio-name-input"
                                />
                            </div>

                            <div className="action-buttons">
                                {portfolios.length > 1 && (
                                    <>
                                        <button
                                            onClick={toggleCompareMode}
                                            className={`btn-compare ${isCompareMode ? 'active' : ''}`}
                                        >
                                            <LayoutDashboard size={18} />
                                            Vergleichen
                                        </button>
                                        <button
                                            onClick={toggleMergeMode}
                                            className={`btn-merge ${showMerge ? 'active' : ''}`}
                                        >
                                            <GitMerge size={18} />
                                            Fusionieren
                                        </button>
                                    </>
                                )}
                                {portfolios.length > 1 && (
                                    <button
                                        onClick={deleteActivePortfolio}
                                        className="btn-delete"
                                        title="Portfolio löschen"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Panels Animation */}
                        <AnimatePresence>
                            {showMerge && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="merge-panel-wrapper"
                                >
                                    <PortfolioMergePanel
                                        activePortfolio={activePortfolio}
                                        availablePortfolios={availableForMerge}
                                        selectedForMerge={selectedForMerge}
                                        setSelectedForMerge={setSelectedForMerge}
                                        deleteOriginals={deleteOriginals}
                                        setDeleteOriginals={setDeleteOriginals}
                                        onCancel={resetModes}
                                        onConfirm={executeMerge}
                                    />
                                </motion.div>
                            )}
                            {isCompareMode && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="merge-panel-wrapper"
                                >
                                    <PortfolioComparePanel
                                        portfolios={portfolios}
                                        compareIds={compareIds}
                                        setCompareIds={setCompareIds}
                                        onClose={() => setIsCompareMode(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    {/* Dynamisches Grid für die Graphen */}
                    <div className={`charts-grid ${isCompareMode && displayPortfolios.length > 1 ? 'compare-active' : ''}`}>
                        {displayPortfolios.map(p => (
                            <GlassCard key={p.id}>
                                <div className="card-header-small">
                                    <BarChart3 size={20} />
                                    <h3>{isCompareMode ? p.name : 'Vermögensentwicklung'}</h3>
                                </div>
                                {/* Der Chart wird pro ausgewähltem Portfolio einmal generiert */}
                                <PortfolioChart data={calculatePortfolio(p.config)} />
                            </GlassCard>
                        ))}
                    </div>
                </div>

                <aside className="dashboard-sidebar">
                    <GlassCard>
                        <div className="card-header-small">
                            <Settings2 size={20} />
                            <h3>Konfiguration {isCompareMode && `(${activePortfolio.name})`}</h3>
                        </div>
                        <PortfolioInputs config={activePortfolio.config} setConfig={updateActiveConfig} />
                    </GlassCard>
                </aside>
            </div>
        </div>
    );
}