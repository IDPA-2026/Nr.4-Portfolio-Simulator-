// components/BaseDataInputs.tsx
import { AccountConfig } from '../types';
import { GLOSSARY } from '../constants/glossary';
import InfoTooltip from './InfoTooltip';

export const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try { e.currentTarget.showPicker?.(); } catch (err) {}
};

interface Props {
    config: AccountConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BaseDataInputs({ config, onChange }: Props) {
    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Konto Basisdaten</h2>
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
            </div>
        </div>
    );
}