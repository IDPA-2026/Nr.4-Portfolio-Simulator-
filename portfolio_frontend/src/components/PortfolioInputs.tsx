import { PortfolioConfig, DepositStream } from '../types';
import BaseDataInputs from './BaseDataInputs';
import DepositStreamInputs from './DepositStreamInputs';

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
        <div className="inputs-grid">
            <BaseDataInputs config={config} onChange={handleBaseChange} />
            <DepositStreamInputs
                streams={config.depositStreams}
                onAdd={addStream}
                onUpdate={updateStream}
                onRemove={removeStream}
            />
        </div>
    );
}