import { PortfolioConfig } from '../types';
import { GLOSSARY } from '../constants/glossary';
import InfoTooltip from './InfoTooltip';

interface Props {
    config: PortfolioConfig;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BaseDataInputs({ config, onChange }: Props) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Basisdaten</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Startkapital (€) <InfoTooltip text={GLOSSARY.initialCapital} />
                    </label>
                    <input type="number" name="initialCapital" value={config.initialCapital} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Wachstum p.a. (%) <InfoTooltip text={GLOSSARY.growthRate} />
                    </label>
                    <input type="number" step="0.1" name="annualGrowthRate" value={config.annualGrowthRate} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Inflation p.a. (%) <InfoTooltip text={GLOSSARY.inflationRate} />
                    </label>
                    <input type="number" step="0.1" name="annualInflationRate" value={config.annualInflationRate} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                </div>
                {/* ... Rest der Komponente bleibt gleich ... */}
            </div>
        </div>
    );
}