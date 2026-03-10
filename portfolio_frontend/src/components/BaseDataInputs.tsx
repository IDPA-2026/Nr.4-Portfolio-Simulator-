import { PortfolioConfig } from '../types';
import { GLOSSARY } from '../constants/glossary';
import InfoTooltip from './InfoTooltip';

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
                    <label className="input-label">
                        Startkapital (€) <InfoTooltip text={GLOSSARY.initialCapital} />
                    </label>
                    <input
                        type="number"
                        name="initialCapital"
                        value={config.initialCapital}
                        onChange={onChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">
                        Wachstum p.a. (%) <InfoTooltip text={GLOSSARY.growthRate} />
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        name="annualGrowthRate"
                        value={config.annualGrowthRate}
                        onChange={onChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">
                        Inflation p.a. (%) <InfoTooltip text={GLOSSARY.inflationRate} />
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        name="annualInflationRate"
                        value={config.annualInflationRate}
                        onChange={onChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Simulationsstart</label>
                    <input
                        type="month"
                        name="simulationStart"
                        value={config.simulationStart}
                        onChange={onChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Simulationsende</label>
                    <input
                        type="month"
                        name="simulationEnd"
                        value={config.simulationEnd}
                        onChange={onChange}
                        className="input-field"
                    />
                </div>
            </div>
        </div>
    );
}