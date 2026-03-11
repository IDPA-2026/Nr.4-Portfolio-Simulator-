import { PortfolioConfig, DepositStream, StockPosition } from '../types';
import BaseDataInputs from './BaseDataInputs';
import DepositStreamInputs from './DepositStreamInputs';
import StockSearchInputs from './StockSearchInputs';

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

    // Sparpläne Logik
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

    // Aktien Logik
    const addStock = (stock: StockPosition) => {
        setConfig({ ...config, stocks: [...(config.stocks || []), stock] });
    };

    const removeStock = (id: string) => {
        setConfig({ ...config, stocks: (config.stocks || []).filter(s => s.id !== id) });
    };

    const updateStockShares = (id: string, shares: number) => {
        const updatedStocks = (config.stocks || []).map(stock =>
            stock.id === id ? { ...stock, shares } : stock
        );
        setConfig({ ...config, stocks: updatedStocks });
    };

    return (
        <div className="inputs-grid">
            <BaseDataInputs config={config} onChange={handleBaseChange} />

            <StockSearchInputs
                stocks={config.stocks || []}
                onAdd={addStock}
                onRemove={removeStock}
                onUpdateShares={updateStockShares}
            />

            <DepositStreamInputs
                streams={config.depositStreams}
                onAdd={addStream}
                onUpdate={updateStream}
                onRemove={removeStream}
            />
        </div>
    );
}