// components/GlobalSettingsPanel.tsx
import { GlobalConfig } from '../types';
import { Calendar, Percent } from 'lucide-react';
import { openPicker } from './BaseDataInputs';
import InfoTooltip from './InfoTooltip';
import { GLOSSARY } from '../constants/glossary';

interface Props {
    config: GlobalConfig;
    onChange: (config: GlobalConfig) => void;
}

export default function GlobalSettingsPanel({ config, onChange }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({
            ...config,
            [name]: e.target.type === 'number' ? Number(value) : value
        });
    };

    return (
        <div className="config-card" style={{ marginBottom: '1.5rem', borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
            <h3 className="config-card-title" style={{ color: '#3b82f6', marginBottom: '1rem', fontSize: '1rem' }}>Globale Parameter</h3>
            <div className="input-grid-2">
                <div className="input-group">
                    <label className="input-label">Globale Inflation p.a. <InfoTooltip text={GLOSSARY.inflationRate} /></label>
                    <div className="date-input-wrapper">
                        <input type="number" step="0.1" name="annualInflationRate" value={config.annualInflationRate} onChange={handleChange} className="input-field" />
                        <Percent size={18} className="date-icon" />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">Währung</label>
                    <input type="text" name="baseCurrency" value={config.baseCurrency} onChange={handleChange} className="input-field" />
                </div>
                <div className="input-group">
                    <label className="input-label">Start Datum</label>
                    <div className="date-input-wrapper">
                        <input type="month" name="simulationStart" value={config.simulationStart} onChange={handleChange} onClick={openPicker} className="input-field" />
                        <Calendar size={18} className="date-icon" />
                    </div>
                </div>
                <div className="input-group">
                    <label className="input-label">End Datum</label>
                    <div className="date-input-wrapper">
                        <input type="month" name="simulationEnd" value={config.simulationEnd} onChange={handleChange} onClick={openPicker} className="input-field" />
                        <Calendar size={18} className="date-icon" />
                    </div>
                </div>
            </div>
        </div>
    );
}