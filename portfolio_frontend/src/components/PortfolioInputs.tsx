import { PortfolioConfig, DepositStream } from '../types';

interface Props {
    config: PortfolioConfig;
    setConfig: (config: PortfolioConfig) => void;
}

export default function PortfolioInputs({ config, setConfig }: Props) {
    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig({
            ...config,
            [name]: e.target.type === 'number' ? Number(value) : value
        });
    };

    const addStream = () => {
        const newStream: DepositStream = {
            id: crypto.randomUUID(),
            name: `Sparplan ${config.depositStreams.length + 1}`,
            startMonth: config.simulationStart,
            endMonth: config.simulationEnd,
            monthlyAmount: 100
        };
        setConfig({ ...config, depositStreams: [...config.depositStreams, newStream] });
    };

    const updateStream = (id: string, field: keyof DepositStream, value: string | number) => {
        const updatedStreams = config.depositStreams.map(stream =>
            stream.id === id ? { ...stream, [field]: value } : stream
        );
        setConfig({ ...config, depositStreams: updatedStreams });
    };

    const removeStream = (id: string) => {
        setConfig({ ...config, depositStreams: config.depositStreams.filter(s => s.id !== id) });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Basisdaten</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Startkapital (€)</label>
                        <input type="number" name="initialCapital" value={config.initialCapital} onChange={handleBaseChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Wachstum p.a. (%)</label>
                        <input type="number" step="0.1" name="annualGrowthRate" value={config.annualGrowthRate} onChange={handleBaseChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Inflation p.a. (%)</label>
                        <input type="number" step="0.1" name="annualInflationRate" value={config.annualInflationRate} onChange={handleBaseChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start (YYYY-MM)</label>
                            <input type="month" name="simulationStart" value={config.simulationStart} onChange={handleBaseChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ende (YYYY-MM)</label>
                            <input type="month" name="simulationEnd" value={config.simulationEnd} onChange={handleBaseChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Einzahlungen</h2>
                    <button onClick={addStream} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                        + Hinzufügen
                    </button>
                </div>

                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                    {config.depositStreams.map(stream => (
                        <div key={stream.id} className="p-4 border border-gray-100 bg-gray-50 rounded-lg relative">
                            <button onClick={() => removeStream(stream.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold">X</button>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <input type="text" value={stream.name} onChange={e => updateStream(stream.id, 'name', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm" placeholder="Name" />
                                <div className="flex items-center gap-2">
                                    <input type="number" value={stream.monthlyAmount} onChange={e => updateStream(stream.id, 'monthlyAmount', Number(e.target.value))} className="w-full rounded-md border-gray-300 shadow-sm p-1 border text-sm" placeholder="Betrag" />
                                    <span className="text-sm text-gray-600">€/Mt.</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="month" value={stream.startMonth} onChange={e => updateStream(stream.id, 'startMonth', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
                                <input type="month" value={stream.endMonth} onChange={e => updateStream(stream.id, 'endMonth', e.target.value)} className="rounded-md border-gray-300 shadow-sm p-1 border text-sm" />
                            </div>
                        </div>
                    ))}
                    {config.depositStreams.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">Keine Sparpläne hinterlegt.</p>
                    )}
                </div>
            </div>
        </div>
    );
}