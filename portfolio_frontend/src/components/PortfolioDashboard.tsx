import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Trash2, Settings2, BarChart3, Clock, BookOpen, Download, Upload, Wallet, LayoutDashboard } from 'lucide-react';

import { Account, AccountConfig, GlobalConfig } from '../types';
import { calculateAccount, calculateTotalWealth } from '../utils/calculator';
import GlobalSettingsPanel from './GlobalSettingsPanel';
import AccountInputs from './PortfolioInputs';
import PortfolioChart from './PortfolioChart';
import GlassCard from './GlassCard';
import GlossaryPanel from './GlossaryPanel';
import PortfolioComparePanel from './PortfolioComparePanel';

type TimeRange = '5y' | '10y' | 'max';

const defaultGlobal: GlobalConfig = {
    simulationStart: '2026-03',
    simulationEnd: '2056-03',
    annualInflationRate: 2.0,
    baseCurrency: 'CHF'
};

const defaultBankConfig: AccountConfig = {
    initialCapital: 15000,
    annualGrowthRate: 0.5,
    isDetailedMode: false,
    liquidation: { active: false, date: '', splits: [] },
    depositStreams: [{ id: 'dep-1', name: 'Gehalt / Sparen', isOneOff: false, startMonth: '2026-03', endMonth: '2056-03', amount: 1500 }],
    withdrawalStreams: [],
    transfers: [{ id: 'trans-1', name: 'Investieren', isOneOff: false, startMonth: '2026-03', endMonth: '2056-03', amount: 1000, toAccountId: '2', taxRate: 0 }],
    assets: []
};

const defaultRetirementConfig: AccountConfig = {
    initialCapital: 25000,
    annualGrowthRate: 5.0,
    isDetailedMode: false,
    liquidation: { active: false, date: '', splits: [] },
    depositStreams: [],
    withdrawalStreams: [],
    transfers: [],
    assets: []
};

const COMPARE_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];

// HIER IST DER KORREKTE NAME WIEDER HERGESTELLT:
export default function PortfolioDashboard() {
    const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(defaultGlobal);
    const [accounts, setAccounts] = useState<Account[]>([
        { id: '1', name: 'Girokonto (Alltag)', config: defaultBankConfig },
        { id: '2', name: 'Vorsorge & Investment', config: defaultRetirementConfig }
    ]);
    const [activeTab, setActiveTab] = useState<string>('networth');
    const [timeRange, setTimeRange] = useState<TimeRange>('max');
    const [showGlossary, setShowGlossary] = useState<boolean>(false);
    const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
    const [compareIds, setCompareIds] = useState<string[]>([]);
    const [isCombinedView, setIsCombinedView] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateActiveAccount = (newConfig: AccountConfig) => {
        setAccounts(accounts.map(p => p.id === activeTab ? { ...p, config: newConfig } : p));
    };

    const updateAccountName = (name: string) => {
        setAccounts(accounts.map(p => p.id === activeTab ? { ...p, name } : p));
    };

    const addAccount = () => {
        const newId = crypto.randomUUID();
        setAccounts([...accounts, { id: newId, name: `Neues Konto ${accounts.length + 1}`, config: { initialCapital: 0, annualGrowthRate: 0, isDetailedMode: false, liquidation: { active: false, date: '', splits: [] }, depositStreams: [], withdrawalStreams: [], transfers: [], assets: [] } }]);
        setActiveTab(newId);
    };

    const deleteActiveAccount = () => {
        if (accounts.length === 1) return;
        setAccounts(accounts.filter(p => p.id !== activeTab));
        setActiveTab('networth');
        setCompareIds(compareIds.filter(id => id !== activeTab));
    };

    const exportConfig = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ globalConfig, accounts }, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `wealthview_export.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (parsed.globalConfig && parsed.accounts) {
                    setGlobalConfig(parsed.globalConfig);
                    setAccounts(parsed.accounts);
                    setActiveTab('networth');
                    setIsCompareMode(false);
                } else alert('Ungültiges Dateiformat.');
            } catch { alert('Fehler beim Einlesen der JSON.'); }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const activeAccount = accounts.find(p => p.id === activeTab);

    const combinedChartData = useMemo(() => {
        const displayAccounts = accounts.filter(a => compareIds.includes(a.id));
        return displayAccounts.map((acc, i) => {
            const result = calculateAccount(acc.id, accounts, globalConfig);
            const slicedData = timeRange === 'max' ? result.timeSeries : result.timeSeries.slice(0, timeRange === '5y' ? 60 : 120);
            return { name: acc.name, data: slicedData, color: COMPARE_COLORS[i % COMPARE_COLORS.length] };
        });
    }, [accounts, compareIds, globalConfig, timeRange]);

    const renderCharts = () => {
        if (isCompareMode) {
            if (isCombinedView) return (
                <div style={{ height: 'fit-content' }}>
                    <GlassCard><div className="card-header-small"><BarChart3 size={20} /><h3>Kombinierter Vergleich</h3></div><PortfolioChart data={[]} multiData={combinedChartData} /></GlassCard>
                </div>
            );
            return accounts.filter(a => compareIds.includes(a.id)).map(acc => {
                const result = calculateAccount(acc.id, accounts, globalConfig);
                const slicedData = timeRange === 'max' ? result.timeSeries : result.timeSeries.slice(0, timeRange === '5y' ? 60 : 120);
                return (
                    <div style={{ height: 'fit-content' }} key={acc.id}>
                        <GlassCard><div className="card-header-small"><BarChart3 size={20} /><h3>{acc.name}</h3></div><PortfolioChart data={slicedData} /></GlassCard>
                    </div>
                );
            });
        }

        if (activeTab === 'networth') {
            const totalWealthData = calculateTotalWealth(accounts, globalConfig);
            let slicedData = timeRange === 'max' ? totalWealthData : totalWealthData.slice(0, timeRange === '5y' ? 60 : 120);

            return (
                <div style={{ height: 'fit-content' }}>
                    <GlassCard>
                        <div className="card-header-small"><Wallet size={20} /><h3>Gesamtvermögen (Alle Konten)</h3></div>
                        <PortfolioChart data={slicedData} />
                    </GlassCard>
                </div>
            );
        }

        if (!activeAccount) return null;
        const { timeSeries } = calculateAccount(activeAccount.id, accounts, globalConfig);
        let slicedSeries = timeRange === 'max' ? timeSeries : timeSeries.slice(0, timeRange === '5y' ? 60 : 120);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
                <GlassCard><div className="card-header-small"><BarChart3 size={20} /><h3>Vermögensentwicklung: {activeAccount.name}</h3></div><PortfolioChart data={slicedSeries} /></GlassCard>
            </div>
        );
    };

    return (
        <div className="dashboard">
            {/* Header perfekt am unteren Rand (flex-end) ausgerichtet */}
            <header className="dashboard-header" style={{ alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-title-group" style={{ margin: 0, paddingBottom: '0.2rem' }}>
                    <h1 style={{ lineHeight: 1.1 }}>WealthView</h1>
                    <p className="dashboard-subtitle">Multi-Konto Finanzsimulator</p>
                </motion.div>

                <div className="dashboard-header-controls" style={{ alignItems: 'flex-end', gap: '1.5rem' }}>
                    {/* Filter Buttons mit leichtem Margin, um mit den Text-Baselines der Tabs abzuschließen */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2px' }}>
                        <button onClick={() => setShowGlossary(!showGlossary)} className="btn-filter dashboard-filter-btn"><BookOpen size={16} /> Glossar</button>
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                        <button onClick={() => fileInputRef.current?.click()} className="btn-filter dashboard-filter-btn"><Upload size={16} /> Import</button>
                        <button onClick={exportConfig} className="btn-filter dashboard-filter-btn"><Download size={16} /> Export</button>
                    </div>

                    {/* Tabs ohne Padding unten, damit der Rand perfekt anliegt */}
                    <div className="tabs-container" style={{ margin: 0, paddingBottom: 0 }}>
                        <button onClick={() => {setActiveTab('networth'); setIsCompareMode(false);}} className={`tab-button ${activeTab === 'networth' && !isCompareMode ? 'active' : ''}`} style={{ fontWeight: 'bold' }}>
                            <Wallet size={16} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/>Gesamtvermögen
                        </button>
                        {accounts.map(p => (
                            <button key={p.id} onClick={() => {setActiveTab(p.id); setIsCompareMode(false);}} className={`tab-button ${activeTab === p.id && !isCompareMode ? 'active' : ''}`}>{p.name}</button>
                        ))}
                        <button onClick={addAccount} className="tab-button tab-button-add">+ Neues Konto</button>
                    </div>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="dashboard-main">
                    <GlassCard>
                        <div className="action-bar">
                            <div className="portfolio-name-wrapper">
                                {isCompareMode ? ( <><div className="icon-wrapper"><LayoutDashboard size={24} /></div><h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 700}}>Konten Vergleichen</h2></> ) :
                                    activeTab === 'networth' ? ( <><div className="icon-wrapper"><Wallet size={24} /></div><h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 700}}>Gesamtvermögen</h2></> ) :
                                        activeAccount ? ( <><div className="icon-wrapper"><TrendingUp size={24} /></div><input type="text" value={activeAccount.name} onChange={(e) => updateAccountName(e.target.value)} className="portfolio-name-input" /></> ) : null}
                            </div>

                            <div className="action-buttons dashboard-action-buttons">
                                {accounts.length > 1 && (
                                    <button onClick={() => { setIsCompareMode(!isCompareMode); if (!isCompareMode && activeAccount) setCompareIds([activeAccount.id]); if (!isCompareMode && !activeAccount) setCompareIds(accounts.map(a=>a.id).slice(0, 2)); }} className={`btn-compare dashboard-btn-compare ${isCompareMode ? 'active' : ''}`}>
                                        <LayoutDashboard size={16} /> {isCompareMode ? 'Vergleich beenden' : 'Vergleichen'}
                                    </button>
                                )}
                                {!isCompareMode && activeAccount && activeTab !== 'networth' && (
                                    <button onClick={deleteActiveAccount} className="btn-delete dashboard-btn-delete-shrink"><Trash2 size={20} /> Konto Löschen</button>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showGlossary && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <GlossaryPanel onClose={() => setShowGlossary(false)} />
                                </motion.div>
                            )}
                            {isCompareMode && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="merge-panel-wrapper">
                                    <PortfolioComparePanel portfolios={accounts} compareIds={compareIds} setCompareIds={setCompareIds} onClose={() => setIsCompareMode(false)} isCombinedView={isCombinedView} setIsCombinedView={setIsCombinedView} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    <div className="filter-container" style={{ marginTop: '1rem' }}>
                        <div className="filter-label"><Clock size={14} /> Zeitraum:</div>
                        <div className="filter-buttons">
                            {(['5y', '10y', 'max'] as TimeRange[]).map(r => (
                                <button key={r} className={`btn-filter ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>{r === 'max' ? 'Max' : r.replace('y', ' Jahre')}</button>
                            ))}
                        </div>
                    </div>

                    <div className="charts-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {renderCharts()}
                    </div>
                </div>

                <aside className="dashboard-sidebar">
                    <GlobalSettingsPanel config={globalConfig} onChange={setGlobalConfig} />

                    {!isCompareMode && activeTab !== 'networth' && activeAccount ? (
                        <GlassCard>
                            <div className="card-header-small"><Settings2 size={20} /><h3>{activeAccount.name} konfigurieren</h3></div>
                            <AccountInputs config={activeAccount.config} setConfig={updateActiveAccount} allAccounts={accounts} activeAccountId={activeTab} baseCurrency={globalConfig.baseCurrency} />
                        </GlassCard>
                    ) : (
                        <GlassCard>
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}><Wallet size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} /><p>{isCompareMode ? "Im Vergleichsmodus sind die Konto-Einstellungen deaktiviert." : "Wähle oben ein spezifisches Konto aus, um Ströme und Assets zu bearbeiten."}</p></div>
                        </GlassCard>
                    )}
                </aside>
            </div>
        </div>
    );
}