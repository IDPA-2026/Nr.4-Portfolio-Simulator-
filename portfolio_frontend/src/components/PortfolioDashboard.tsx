import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, GitMerge, Trash2, Settings2, BarChart3, LayoutDashboard } from 'lucide-react';

import { Portfolio, PortfolioConfig, DepositStream } from '../types';
import { calculatePortfolio } from '../utils/calculator';
import PortfolioTabs from './PortfolioTabs';
import PortfolioMergePanel, { MergeSettings } from './PortfolioMergePanel';
import PortfolioComparePanel from './PortfolioComparePanel';
import PortfolioInputs from './PortfolioInputs';
import PortfolioChart from './PortfolioChart';
import GlassCard from './GlassCard';

const DashboardChart = memo(({ portfolio, isCompareMode }: { portfolio: Portfolio, isCompareMode: boolean }) => {
    const data = useMemo(() => calculatePortfolio(portfolio.config), [portfolio.config]);
    return (
        <GlassCard>
            <div className="card-header-small">
                <BarChart3 size={20} />
                <h3>{isCompareMode ? portfolio.name : 'Vermögensentwicklung'}</h3>
            </div>
            <PortfolioChart data={data} />
        </GlassCard>
    );
});

const defaultConfig: PortfolioConfig = {
    initialCapital: 10000,
    annualGrowthRate: 7,
    annualInflationRate: 2,
    simulationStart: '2024-01',
    simulationEnd: '2034-12',
    depositStreams: []
};

const COMPARE_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function PortfolioDashboard() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([{ id: '1', name: 'Hauptportfolio', config: defaultConfig }]);
    const [activePortfolioId, setActivePortfolioId] = useState<string>('1');
    const [showMerge, setShowMerge] = useState<boolean>(false);
    const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
    const [deleteOriginals, setDeleteOriginals] = useState<boolean>(false);
    const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [isCombinedView, setIsCombinedView] = useState<boolean>(false);

    const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

    const updateActiveConfig = (newConfig: PortfolioConfig) => {
        setPortfolios(portfolios.map(p => p.id === activePortfolioId ? { ...p, config: newConfig } : p));
    };

    const updatePortfolioName = (name: string) => {
        setPortfolios(portfolios.map(p => p.id === activePortfolioId ? { ...p, name } : p));
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
        resetModes();
    };

    const resetModes = () => {
        setShowMerge(false);
        setSelectedForMerge([]);
        setDeleteOriginals(false);
        setIsCompareMode(false);
        setIsCombinedView(false);
    };

    const toggleCompareMode = () => {
        if (!isCompareMode) {
            setShowMerge(false);
            setCompareIds([activePortfolioId]);
        }
        setIsCompareMode(!isCompareMode);
    };

    const executeMerge = (settings: MergeSettings) => {
        if (selectedForMerge.length === 0) return;
        const portfoliosToMerge = [activePortfolio, ...portfolios.filter(p => selectedForMerge.includes(p.id))];
        let minStart = portfoliosToMerge[0].config.simulationStart;
        let maxEnd = portfoliosToMerge[0].config.simulationEnd;
        let totalCapital = 0, allStreams: DepositStream[] = [];

        portfoliosToMerge.forEach(p => {
            totalCapital += p.config.initialCapital;
            if (p.config.simulationStart < minStart) minStart = p.config.simulationStart;
            if (p.config.simulationEnd > maxEnd) maxEnd = p.config.simulationEnd;
            allStreams = [...allStreams, ...p.config.depositStreams.map(s => ({ ...s, id: crypto.randomUUID() }))];
        });

        const getRate = (strategy: 'avg' | string, field: 'annualGrowthRate' | 'annualInflationRate') => {
            if (strategy === 'avg') {
                const sum = portfoliosToMerge.reduce((acc, p) => acc + p.config[field], 0);
                return Number((sum / portfoliosToMerge.length).toFixed(2));
            }
            const sourceP = portfoliosToMerge.find(p => p.id === strategy);
            return sourceP ? sourceP.config[field] : portfoliosToMerge[0].config[field];
        };

        const newPortfolio: Portfolio = {
            id: crypto.randomUUID(),
            name: `Fusion (${portfoliosToMerge.length})`,
            config: {
                initialCapital: totalCapital,
                annualGrowthRate: getRate(settings.growthStrategy, 'annualGrowthRate'),
                annualInflationRate: getRate(settings.inflationStrategy, 'annualInflationRate'),
                simulationStart: minStart,
                simulationEnd: maxEnd,
                depositStreams: allStreams
            }
        };

        let updatedPortfolios = deleteOriginals ? portfolios.filter(p => p.id !== activePortfolioId && !selectedForMerge.includes(p.id)) : [...portfolios];
        updatedPortfolios.push(newPortfolio);
        setPortfolios(updatedPortfolios);
        setActivePortfolioId(newPortfolio.id);
        resetModes();
    };

    const displayPortfolios = portfolios.filter(p => isCompareMode ? compareIds.includes(p.id) : p.id === activePortfolioId);

    const combinedChartData = useMemo(() => {
        return displayPortfolios.map((p, i) => ({
            name: p.name,
            data: calculatePortfolio(p.config),
            color: COMPARE_COLORS[i % COMPARE_COLORS.length]
        }));
    }, [displayPortfolios]);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-title-group">
                    <h1>WealthView</h1>
                    <p className="dashboard-subtitle">Strategische Finanzplanung</p>
                </motion.div>
                <div className="tabs-wrapper">
                    <PortfolioTabs portfolios={portfolios} activePortfolioId={activePortfolioId} onSelect={(id) => { setActivePortfolioId(id); resetModes(); }} onAdd={addPortfolio} />
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    <GlassCard>
                        <div className="action-bar">
                            <div className="portfolio-name-wrapper">
                                <div className="icon-wrapper"><TrendingUp size={24} /></div>
                                <input type="text" value={activePortfolio.name} onChange={(e) => updatePortfolioName(e.target.value)} className="portfolio-name-input" />
                            </div>
                            <div className="action-buttons">
                                {portfolios.length > 1 && (
                                    <>
                                        <button onClick={toggleCompareMode} className={`btn-compare ${isCompareMode ? 'active' : ''}`}><LayoutDashboard size={18} />Vergleichen</button>
                                        <button onClick={() => setShowMerge(!showMerge)} className={`btn-merge ${showMerge ? 'active' : ''}`}><GitMerge size={18} />Fusionieren</button>
                                    </>
                                )}
                                <button onClick={deleteActivePortfolio} className="btn-delete"><Trash2 size={20} /></button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showMerge && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <PortfolioMergePanel activePortfolio={activePortfolio} availablePortfolios={portfolios.filter(p => p.id !== activePortfolioId)} selectedForMerge={selectedForMerge} setSelectedForMerge={setSelectedForMerge} deleteOriginals={deleteOriginals} setDeleteOriginals={setDeleteOriginals} onCancel={() => setShowMerge(false)} onConfirm={executeMerge} />
                                </motion.div>
                            )}
                            {isCompareMode && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <PortfolioComparePanel
                                        portfolios={portfolios}
                                        compareIds={compareIds}
                                        setCompareIds={setCompareIds}
                                        onClose={() => setIsCompareMode(false)}
                                        isCombinedView={isCombinedView}
                                        setIsCombinedView={setIsCombinedView}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    <div className={`charts-grid ${isCompareMode && !isCombinedView && displayPortfolios.length > 1 ? 'compare-active' : ''}`}>
                        {isCompareMode && isCombinedView ? (
                            <GlassCard>
                                <div className="card-header-small"><BarChart3 size={20} /><h3>Kombinierter Vergleich</h3></div>
                                <PortfolioChart data={[]} multiData={combinedChartData} />
                            </GlassCard>
                        ) : (
                            displayPortfolios.map(p => (
                                <DashboardChart key={p.id} portfolio={p} isCompareMode={isCompareMode} />
                            ))
                        )}
                    </div>
                </div>

                <aside className="dashboard-sidebar">
                    <GlassCard>
                        <div className="card-header-small"><Settings2 size={20} /><h3>Konfiguration</h3></div>
                        <PortfolioInputs config={activePortfolio.config} setConfig={updateActiveConfig} />
                    </GlassCard>
                </aside>
            </div>
        </div>
    );
}