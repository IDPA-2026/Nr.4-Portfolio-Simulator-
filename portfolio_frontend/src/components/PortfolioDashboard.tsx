// components/PortfolioDashboard.tsx
import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { TrendingUp, GitMerge, Trash2, Settings2, BarChart3, LayoutDashboard, Clock, PieChart as PieChartIcon, BookOpen, Download } from 'lucide-react';

import { Portfolio, PortfolioConfig, DepositStream, TransferStream, AssetPosition } from '../types';
import { calculatePortfolio } from '../utils/calculator';
import PortfolioTabs from './PortfolioTabs';
import PortfolioMergePanel, { MergeSettings } from './PortfolioMergePanel';
import PortfolioComparePanel from './PortfolioComparePanel';
import PortfolioInputs from './PortfolioInputs';
import PortfolioChart from './PortfolioChart';
import GlassCard from './GlassCard';
import AllocationChart from './AllocationChart';
import GlossaryPanel from './GlossaryPanel';

type TimeRange = '5y' | '10y' | 'max';

const DashboardChart = memo(({ portfolioId, allPortfolios, isCompareMode, timeRange }: { portfolioId: string, allPortfolios: Portfolio[], isCompareMode: boolean, timeRange: TimeRange }) => {
    const portfolio = allPortfolios.find(p => p.id === portfolioId);
    if (!portfolio) return null;

    const { timeSeries, allocation } = useMemo(() => {
        const result = calculatePortfolio(portfolio.id, allPortfolios);
        let slicedSeries = result.timeSeries;
        if (timeRange !== 'max') {
            const months = timeRange === '5y' ? 60 : 120;
            slicedSeries = result.timeSeries.slice(0, months);
        }
        return { timeSeries: slicedSeries, allocation: result.allocation };
    }, [portfolio.id, allPortfolios, timeRange]);

    const assetsNames = portfolio.config.assets?.map(a => a.name) || [];

    return (
        <>
            <GlassCard>
                <div className="card-header-small">
                    <BarChart3 size={20} />
                    <h3>{isCompareMode ? portfolio.name : 'Vermögensentwicklung'}</h3>
                </div>
                <PortfolioChart data={timeSeries} assetsNames={assetsNames} />
            </GlassCard>

            {/* Die Karte wird jetzt IMMER gerendert, damit das Layout nicht zerspringt */}
            <GlassCard>
                <div className="card-header-small">
                    <PieChartIcon size={20} />
                    <h3>{isCompareMode ? `Allocation: ${portfolio.name}` : 'Aktuelle Asset Allocation'}</h3>
                </div>
                <AllocationChart data={allocation} currency={portfolio.config.baseCurrency} />
            </GlassCard>
        </>
    );
});

// Realistische Basisdaten für den ersten Start der App
const defaultBankConfig: PortfolioConfig = {
    initialCapital: 15000,
    baseCurrency: 'CHF',
    usdToChfRate: 0.88,
    annualGrowthRate: 0.5,
    annualInflationRate: 2.0,
    simulationStart: '2026-03',
    simulationEnd: '2056-03', // 30 Jahre Simulation
    depositStreams: [
        { id: 'dep-1', name: 'Monatliches Sparen', startMonth: '2026-03', endMonth: '2056-03', monthlyAmount: 1500 }
    ],
    withdrawalStreams: [],
    transfers: [
        // Bucht automatisch jeden Monat 1000 CHF ins Investment-Konto (ID '2')
        { id: 'trans-1', name: 'ETF Sparplan (Umbuchung)', startMonth: '2026-03', endMonth: '2056-03', monthlyAmount: 1000, toPortfolioId: '2' }
    ],
    assets: []
};

const defaultRetirementConfig: PortfolioConfig = {
    initialCapital: 0, // Startet bei 0 Cash, bekommt aber Geld durch die Umbuchung
    baseCurrency: 'CHF',
    usdToChfRate: 0.88,
    annualGrowthRate: 1.0,
    annualInflationRate: 2.0,
    simulationStart: '2026-03',
    simulationEnd: '2056-03',
    depositStreams: [],
    withdrawalStreams: [],
    transfers: [],
    assets: [
        { id: 'ast-1', name: 'Global ETF Portfolio', value: 25000, expectedGrowth: 7.0 }
    ]
};

const defaultConfig: PortfolioConfig = {
    ...defaultBankConfig,
    initialCapital: 10000,
    depositStreams: [],
    transfers: []
};

const COMPARE_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function PortfolioDashboard() {

    const [portfolios, setPortfolios] = useState<Portfolio[]>([
        { id: '1', name: 'Girokonto (Alltag)', config: defaultBankConfig },
        { id: '2', name: 'Vorsorge & Investment', config: defaultRetirementConfig }
    ]);
    const [activePortfolioId, setActivePortfolioId] = useState<string>('1');
    const [timeRange, setTimeRange] = useState<TimeRange>('max');

    const [showMerge, setShowMerge] = useState<boolean>(false);
    const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
    const [deleteOriginals, setDeleteOriginals] = useState<boolean>(false);

    const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [isCombinedView, setIsCombinedView] = useState<boolean>(false);

    const [showGlossary, setShowGlossary] = useState<boolean>(false);

    const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

    const updateActiveConfig = (newConfig: PortfolioConfig) => {
        setPortfolios(portfolios.map(p => p.id === activePortfolioId ? { ...p, config: newConfig } : p));
    };

    const updatePortfolioName = (name: string) => {
        setPortfolios(portfolios.map(p => p.id === activePortfolioId ? { ...p, name } : p));
    };

    const addPortfolio = () => {
        const newId = crypto.randomUUID();
        setPortfolios([...portfolios, { id: newId, name: `Neues Konto ${portfolios.length + 1}`, config: defaultConfig }]);
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

    const exportConfig = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolios, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `wealthview_export.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const resetModes = () => {
        setShowMerge(false);
        setSelectedForMerge([]);
        setDeleteOriginals(false);
        setIsCompareMode(false);
        setIsCombinedView(false);
        setShowGlossary(false);
    };

    const executeMerge = (settings: MergeSettings) => {
        if (selectedForMerge.length === 0) return;
        const portfoliosToMerge = [activePortfolio, ...portfolios.filter(p => selectedForMerge.includes(p.id))];
        let maxEnd = portfoliosToMerge[0].config.simulationEnd;
        let totalCapital = 0, allStreams: DepositStream[] = [], allWithdrawals: DepositStream[] = [], allTransfers: TransferStream[] = [];
        let allAssets: AssetPosition[] = [];

        portfoliosToMerge.forEach(p => {
            totalCapital += p.config.initialCapital;
            if (p.config.simulationEnd > maxEnd) maxEnd = p.config.simulationEnd;
            allStreams = [...allStreams, ...(p.config.depositStreams || []).map(s => ({ ...s, id: crypto.randomUUID() }))];
            allWithdrawals = [...allWithdrawals, ...(p.config.withdrawalStreams || []).map(s => ({ ...s, id: crypto.randomUUID() }))];
            allTransfers = [...allTransfers, ...(p.config.transfers || []).map(s => ({ ...s, id: crypto.randomUUID() }))];
            allAssets = [...allAssets, ...(p.config.assets || []).map(s => ({ ...s, id: crypto.randomUUID() }))];
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
                baseCurrency: portfoliosToMerge[0].config.baseCurrency,
                usdToChfRate: portfoliosToMerge[0].config.usdToChfRate,
                annualGrowthRate: getRate(settings.growthStrategy, 'annualGrowthRate'),
                annualInflationRate: getRate(settings.inflationStrategy, 'annualInflationRate'),
                simulationStart: settings.fusionDate,
                simulationEnd: maxEnd,
                depositStreams: allStreams,
                withdrawalStreams: allWithdrawals,
                transfers: allTransfers,
                assets: allAssets
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
        return displayPortfolios.map((p, i) => {
            const result = calculatePortfolio(p.id, portfolios);
            const slicedData = timeRange === 'max' ? result.timeSeries : result.timeSeries.slice(0, timeRange === '5y' ? 60 : 120);
            return {
                name: p.name,
                data: slicedData,
                color: COMPARE_COLORS[i % COMPARE_COLORS.length]
            };
        });
    }, [displayPortfolios, timeRange, portfolios]);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-title-group">
                    <h1>WealthView</h1>
                    <p className="dashboard-subtitle">Strategische Finanzplanung (Stand: 2026)</p>
                </motion.div>
                <div className="dashboard-header-controls">
                    <button onClick={() => setShowGlossary(!showGlossary)} className="btn-filter dashboard-filter-btn">
                        <BookOpen size={16} /> Glossar
                    </button>
                    <div className="tabs-wrapper">
                        <PortfolioTabs portfolios={portfolios} activePortfolioId={activePortfolioId} onSelect={(id) => { setActivePortfolioId(id); resetModes(); }} onAdd={addPortfolio} />
                    </div>
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
                            <div className="action-buttons dashboard-action-buttons">
                                <button onClick={exportConfig} className="btn-compare dashboard-btn-compare">
                                    <Download size={16} /> JSON Export
                                </button>
                                {portfolios.length > 1 && (
                                    <>
                                        <button onClick={() => { setIsCompareMode(!isCompareMode); setCompareIds([activePortfolioId]); }} className={`btn-compare dashboard-btn-compare ${isCompareMode ? 'active' : ''}`}>
                                            <LayoutDashboard size={16} /> Vergleichen
                                        </button>
                                        <button onClick={() => setShowMerge(!showMerge)} className={`btn-merge dashboard-btn-compare ${showMerge ? 'active' : ''}`}>
                                            <GitMerge size={16} /> Fusionieren
                                        </button>
                                    </>
                                )}
                                <button onClick={deleteActivePortfolio} className="btn-delete dashboard-btn-delete-shrink">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showGlossary && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <GlossaryPanel onClose={() => setShowGlossary(false)} />
                                </motion.div>
                            )}
                            {showMerge && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <PortfolioMergePanel activePortfolio={activePortfolio} availablePortfolios={portfolios.filter(p => p.id !== activePortfolioId)} selectedForMerge={selectedForMerge} setSelectedForMerge={setSelectedForMerge} deleteOriginals={deleteOriginals} setDeleteOriginals={setDeleteOriginals} onCancel={() => setShowMerge(false)} onConfirm={executeMerge} />
                                </motion.div>
                            )}
                            {isCompareMode && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <PortfolioComparePanel portfolios={portfolios} compareIds={compareIds} setCompareIds={setCompareIds} onClose={() => setIsCompareMode(false)} isCombinedView={isCombinedView} setIsCombinedView={setIsCombinedView} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    <div className="filter-container">
                        <div className="filter-label"><Clock size={14} /> Zeitraum:</div>
                        <div className="filter-buttons">
                            {(['5y', '10y', 'max'] as TimeRange[]).map(r => (
                                <button
                                    key={r}
                                    className={`btn-filter ${timeRange === r ? 'active' : ''}`}
                                    onClick={() => setTimeRange(r)}
                                >
                                    {r === 'max' ? 'Max' : r.replace('y', ' Jahre')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`charts-grid ${isCompareMode && !isCombinedView && displayPortfolios.length > 1 ? 'compare-active' : ''}`}>
                        {isCompareMode && isCombinedView ? (
                            <GlassCard>
                                <div className="card-header-small"><BarChart3 size={20} /><h3>Kombinierter Vergleich</h3></div>
                                <PortfolioChart data={[]} multiData={combinedChartData} />
                            </GlassCard>
                        ) : (
                            displayPortfolios.map(p => (
                                <DashboardChart key={p.id} portfolioId={p.id} allPortfolios={portfolios} isCompareMode={isCompareMode} timeRange={timeRange} />
                            ))
                        )}
                    </div>
                </div>

                <aside className="dashboard-sidebar">
                    <GlassCard>
                        <div className="card-header-small"><Settings2 size={20} /><h3>Konfiguration</h3></div>
                        <PortfolioInputs config={activePortfolio.config} setConfig={updateActiveConfig} allPortfolios={portfolios} activePortfolioId={activePortfolioId} />
                    </GlassCard>
                </aside>
            </div>
        </div>
    );
}