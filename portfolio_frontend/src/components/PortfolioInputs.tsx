import { AccountConfig, TransactionStream, AssetPosition, Account, TransferStream } from '../types';
import BaseDataInputs from './BaseDataInputs';
import DepositStreamInputs from './DepositStreamInputs';
import WithdrawalStreamInputs from './WithdrawalStreamInputs';
import TransferInputs from './TransferInputs';
import AssetInputs from './AssetInputs';

interface Props {
    config: AccountConfig;
    setConfig: (config: AccountConfig) => void;
    allAccounts: Account[];
    activeAccountId: string;
}

export default function PortfolioInputs({ config, setConfig, allAccounts, activeAccountId }: Props) {
    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig({
            ...config,
            [name]: e.target.type === 'number' ? (value === '' ? '' : Number(value)) : value
        });
    };

    const addDepositStream = () => {
        const newStream: TransactionStream = {
            id: crypto.randomUUID(), name: `Einzahlung ${(config.depositStreams || []).length + 1}`, isOneOff: false, startMonth: '2026-03', endMonth: '2056-03', amount: 100
        };
        setConfig({ ...config, depositStreams: [...(config.depositStreams || []), newStream] });
    };

    const updateDepositStream = (id: string, field: keyof TransactionStream, value: any) => {
        setConfig({ ...config, depositStreams: (config.depositStreams || []).map(stream => stream.id === id ? { ...stream, [field]: value } : stream) });
    };

    const removeDepositStream = (id: string) => { setConfig({ ...config, depositStreams: (config.depositStreams || []).filter(s => s.id !== id) }); };

    const addWithdrawalStream = () => {
        const newStream: TransactionStream = {
            id: crypto.randomUUID(), name: `Entnahme ${(config.withdrawalStreams || []).length + 1}`, isOneOff: false, startMonth: '2026-03', endMonth: '2056-03', amount: 500
        };
        setConfig({ ...config, withdrawalStreams: [...(config.withdrawalStreams || []), newStream] });
    };

    const updateWithdrawalStream = (id: string, field: keyof TransactionStream, value: any) => {
        setConfig({ ...config, withdrawalStreams: (config.withdrawalStreams || []).map(stream => stream.id === id ? { ...stream, [field]: value } : stream) });
    };

    const removeWithdrawalStream = (id: string) => { setConfig({ ...config, withdrawalStreams: (config.withdrawalStreams || []).filter(s => s.id !== id) }); };

    const addTransfer = () => {
        const newTransfer: TransferStream = {
            id: crypto.randomUUID(), name: `Umbuchung ${(config.transfers || []).length + 1}`, isOneOff: false, startMonth: '2026-03', endMonth: '2056-03', amount: 500, toAccountId: '', taxRate: 0
        };
        setConfig({ ...config, transfers: [...(config.transfers || []), newTransfer] });
    };

    const updateTransfer = (id: string, field: keyof TransferStream, value: any) => {
        setConfig({ ...config, transfers: (config.transfers || []).map(stream => stream.id === id ? { ...stream, [field]: value } : stream) });
    };

    const removeTransfer = (id: string) => { setConfig({ ...config, transfers: (config.transfers || []).filter(s => s.id !== id) }); };

    const addAsset = (asset: AssetPosition) => { setConfig({ ...config, assets: [...(config.assets || []), asset] }); };
    const removeAsset = (id: string) => { setConfig({ ...config, assets: (config.assets || []).filter(s => s.id !== id) }); };
    const updateAssetValue = (id: string, value: number) => { setConfig({ ...config, assets: (config.assets || []).map(asset => asset.id === id ? { ...asset, value } : asset) }); };

    const availableAccounts = allAccounts ? allAccounts.filter(p => p.id !== activeAccountId) : [];

    return (
        <div className="inputs-grid">
            <BaseDataInputs config={config} onChange={handleBaseChange} />
            <AssetInputs assets={config.assets || []} onAdd={addAsset} onRemove={removeAsset} onUpdateValue={updateAssetValue} />

            <TransferInputs
                streams={config.transfers || []}
                currentAssets={config.assets || []}
                availableAccounts={availableAccounts}
                onAdd={addTransfer} onUpdate={updateTransfer} onRemove={removeTransfer}
            />

            <DepositStreamInputs
                streams={config.depositStreams || []}
                assets={config.assets || []}
                onAdd={addDepositStream} onUpdate={updateDepositStream} onRemove={removeDepositStream}
            />

            <WithdrawalStreamInputs
                streams={config.withdrawalStreams || []}
                assets={config.assets || []}
                onAdd={addWithdrawalStream} onUpdate={updateWithdrawalStream} onRemove={removeWithdrawalStream}
            />
        </div>
    );
}