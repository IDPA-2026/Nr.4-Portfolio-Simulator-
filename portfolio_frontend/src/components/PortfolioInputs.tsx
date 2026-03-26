import { PortfolioConfig, DepositStream, AssetPosition, Portfolio, TransferStream } from '../types';
import BaseDataInputs from './BaseDataInputs';
import DepositStreamInputs from './DepositStreamInputs';
import WithdrawalStreamInputs from './WithdrawalStreamInputs';
import TransferInputs from './TransferInputs';
import AssetInputs from './AssetInputs';

interface Props {
    config: PortfolioConfig;
    setConfig: (config: PortfolioConfig) => void;
    allPortfolios: Portfolio[];
    activePortfolioId: string;
}

export default function PortfolioInputs({ config, setConfig, allPortfolios, activePortfolioId }: Props) {
    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig({
            ...config,
            [name]: e.target.type === 'number' ? (value === '' ? '' : Number(value)) : value
        });
    };

    const addDepositStream = () => {
        const newStream: DepositStream = {
            id: crypto.randomUUID(),
            name: `Einzahlung ${(config.depositStreams || []).length + 1}`,
            startMonth: config.simulationStart,
            endMonth: config.simulationEnd,
            monthlyAmount: 100
        };
        setConfig({ ...config, depositStreams: [...(config.depositStreams || []), newStream] });
    };

    const updateDepositStream = (id: string, field: keyof DepositStream, value: string | number) => {
        const updatedStreams = (config.depositStreams || []).map(stream =>
            stream.id === id ? { ...stream, [field]: value } : stream
        );
        setConfig({ ...config, depositStreams: updatedStreams });
    };

    const removeDepositStream = (id: string) => {
        setConfig({ ...config, depositStreams: (config.depositStreams || []).filter(s => s.id !== id) });
    };

    const addWithdrawalStream = () => {
        const newStream: DepositStream = {
            id: crypto.randomUUID(),
            name: `Entnahme ${(config.withdrawalStreams || []).length + 1}`,
            startMonth: config.simulationStart,
            endMonth: config.simulationEnd,
            monthlyAmount: 500
        };
        setConfig({ ...config, withdrawalStreams: [...(config.withdrawalStreams || []), newStream] });
    };

    const updateWithdrawalStream = (id: string, field: keyof DepositStream, value: string | number) => {
        const updatedStreams = (config.withdrawalStreams || []).map(stream =>
            stream.id === id ? { ...stream, [field]: value } : stream
        );
        setConfig({ ...config, withdrawalStreams: updatedStreams });
    };

    const removeWithdrawalStream = (id: string) => {
        setConfig({ ...config, withdrawalStreams: (config.withdrawalStreams || []).filter(s => s.id !== id) });
    };

    const addTransfer = () => {
        const newTransfer: TransferStream = {
            id: crypto.randomUUID(),
            name: `Umbuchung ${(config.transfers || []).length + 1}`,
            startMonth: config.simulationStart,
            endMonth: config.simulationEnd,
            monthlyAmount: 500,
            toPortfolioId: ''
        };
        setConfig({ ...config, transfers: [...(config.transfers || []), newTransfer] });
    };

    const updateTransfer = (id: string, field: keyof TransferStream, value: string | number) => {
        const updatedTransfers = (config.transfers || []).map(stream =>
            stream.id === id ? { ...stream, [field]: value } : stream
        );
        setConfig({ ...config, transfers: updatedTransfers });
    };

    const removeTransfer = (id: string) => {
        setConfig({ ...config, transfers: (config.transfers || []).filter(s => s.id !== id) });
    };

    const addAsset = (asset: AssetPosition) => {
        setConfig({ ...config, assets: [...(config.assets || []), asset] });
    };

    const removeAsset = (id: string) => {
        setConfig({ ...config, assets: (config.assets || []).filter(s => s.id !== id) });
    };

    const updateAssetValue = (id: string, value: number) => {
        const updatedAssets = (config.assets || []).map(asset =>
            asset.id === id ? { ...asset, value } : asset
        );
        setConfig({ ...config, assets: updatedAssets });
    };

    return (
        <div className="inputs-grid">
            <BaseDataInputs config={config} onChange={handleBaseChange} />

            <AssetInputs
                assets={config.assets || []}
                onAdd={addAsset}
                onRemove={removeAsset}
                onUpdateValue={updateAssetValue}
            />

            <TransferInputs
                streams={config.transfers || []}
                availablePortfolios={allPortfolios.filter(p => p.id !== activePortfolioId)}
                onAdd={addTransfer}
                onUpdate={updateTransfer}
                onRemove={removeTransfer}
            />

            <DepositStreamInputs
                streams={config.depositStreams || []}
                onAdd={addDepositStream}
                onUpdate={updateDepositStream}
                onRemove={removeDepositStream}
            />

            <WithdrawalStreamInputs
                streams={config.withdrawalStreams || []}
                onAdd={addWithdrawalStream}
                onUpdate={updateWithdrawalStream}
                onRemove={removeWithdrawalStream}
            />
        </div>
    );
}