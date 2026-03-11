import { PortfolioConfig } from '../types';
import { GLOSSARY } from '../constants/glossary';
import InfoTooltip from './InfoTooltip';
import { Calendar } from 'lucide-react';

export const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try { e.currentTarget.showPicker?.(); } catch (err) {}
};

interface Props {
    config: PortfolioConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BaseDataInputs({ config, onChange }: Props) {
    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Basisdaten</h2>
            </div>
            <div className="input-grid-2">
                <div className="input-group">
                    <label className="input-label">Startkapital (€) <InfoTooltip text={GLOSSARY.initialCapital} /></label>
                    <input type="number" name="initialCapital" value={config.initialCapital} onChange={onChange} className="input-field" />
                </div>
                <div className="input-group">
                    <label className="input-label">Wachstum p.a. (%) <InfoTooltip text={GLOSSARY.growthRate} /></label>
                    <input type="number" step="0.1" name="annualGrowthRate" value={config.annualGrowthRate} onChange={onChange} className="input-field" />
                </div>
                <div className="input-group">
                    <label className="input-label">Inflation p.a. (%) <InfoTooltip text={GLOSSARY.inflationRate} /></label>
                    <input type="number" step="0.1" name="annualInflationRate" value={config.annualInflationRate} onChange={onChange} className="input-field" />
                </div>
                <div className="input-group">
                    <label className="input-label">Simulationsstart</label>
                    <div className="date-input-wrapper">
                        <input type="month" name="simulationStart" value={config.simulationStart} onChange={onChange} onClick={openPicker} className="input-field" />
                        <Calendar size={18} className="date-icon" />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Simulationsende</label>
                    <div className="date-input-wrapper">
                        <input type="month" name="simulationEnd" value={config.simulationEnd} onChange={onChange} onClick={openPicker} className="input-field" />
                        <Calendar size={18} className="date-icon" />
                    </div>
                </div>
            </div>
        </div>
    );
}