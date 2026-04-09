import { AccountConfig, TransactionStream, Account, TransferStream } from '../types';
import BaseDataInputs from './BaseDataInputs';
import DepositStreamInputs from './DepositStreamInputs';
import WithdrawalStreamInputs from './WithdrawalStreamInputs';
import TransferInputs from './TransferInputs';
import LiquidationInputs from './LiquidationInputs';

interface Props {
    config: AccountConfig;
    setConfig: (config: AccountConfig) => void;
    allAccounts: Account[];
    activeAccountId: string;
    baseCurrency: string;
}

export default function PortfolioInputs({ config, setConfig, allAccounts, activeAccountId, baseCurrency }: Props) {
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
        setConfig({
            ...config,
            transfers: (config.transfers || []).map(stream => {
                if (stream.id === id) {
                    const updated = { ...stream, [field]: value };
                    if (field === 'toAccountId' && value !== activeAccountId) updated.toAssetId = '';
                    return updated;
                }
                return stream;
            })
        });
    };

    const removeTransfer = (id: string) => { setConfig({ ...config, transfers: (config.transfers || []).filter(s => s.id !== id) }); };

    const incomingTransfers = allAccounts.flatMap(a =>
        (a.config.transfers || [])
            .filter(t => t.toAccountId === activeAccountId)
            .map(t => ({ ...t, fromAccountName: a.name, sourceAccountIsSame: a.id === activeAccountId }))
    ).filter(t => !t.sourceAccountIsSame);

    const availableAccounts = allAccounts ? allAccounts.filter(p => p.id !== activeAccountId) : [];

    return (
        <div className="inputs-grid">
            <BaseDataInputs config={config} baseCurrency={baseCurrency} onChange={handleBaseChange} />

            <LiquidationInputs config={config} availableAccounts={availableAccounts} onChange={setConfig} />

            <TransferInputs
                streams={config.transfers || []}
                incomingTransfers={incomingTransfers}
                currentAssets={[]}
                availableAccounts={availableAccounts}
                baseCurrency={baseCurrency}
                isDetailedMode={false}
                onAdd={addTransfer} onUpdate={updateTransfer} onRemove={removeTransfer}
            />

            <DepositStreamInputs
                streams={config.depositStreams || []}
                assets={[]}
                baseCurrency={baseCurrency}
                isDetailedMode={false}
                onAdd={addDepositStream} onUpdate={updateDepositStream} onRemove={removeDepositStream}
            />

            <WithdrawalStreamInputs
                streams={config.withdrawalStreams || []}
                assets={[]}
                baseCurrency={baseCurrency}
                isDetailedMode={false}
                onAdd={addWithdrawalStream} onUpdate={updateWithdrawalStream} onRemove={removeWithdrawalStream}
            />
        </div>
    );
}