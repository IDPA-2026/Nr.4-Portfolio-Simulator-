import { TransferStream, Portfolio } from '../types';
import { Calendar } from 'lucide-react';
import { openPicker } from './BaseDataInputs';

interface Props {
    streams: TransferStream[];
    availablePortfolios: Portfolio[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof TransferStream, value: string | number) => void;
    onRemove: (id: string) => void;
}

export default function TransferInputs({ streams, availablePortfolios, onAdd, onUpdate, onRemove }: Props) {
    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Umbuchungen (Allocation)</h2>
                <button onClick={onAdd} className="btn-add-stream" style={{backgroundColor: '#8b5cf6'}}>+ Umbuchung</button>
            </div>
            <div className="stream-list">
                {streams.map(stream => (
                    <div key={stream.id} className="stream-item" style={{borderLeft: '4px solid #8b5cf6'}}>
                        <button onClick={() => onRemove(stream.id)} className="btn-remove-stream">X</button>
                        <div className="stream-row">
                            <input type="text" value={stream.name} onChange={e => onUpdate(stream.id, 'name', e.target.value)} className="input-field" placeholder="Name" />
                            <div className="stream-amount-wrapper">
                                <input type="number" value={stream.monthlyAmount} onChange={e => onUpdate(stream.id, 'monthlyAmount', e.target.value === '' ? '' : Number(e.target.value))} className="input-field" placeholder="Betrag" />
                                <span className="stream-unit">€/Mt.</span>
                            </div>
                        </div>
                        <div className="stream-row">
                            <div className="date-input-wrapper" style={{ gridColumn: 'span 2' }}>
                                <select value={stream.toPortfolioId} onChange={e => onUpdate(stream.id, 'toPortfolioId', e.target.value)} className="input-field">
                                    <option value="">Zielkonto wählen</option>
                                    {availablePortfolios.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="stream-row">
                            <div className="date-input-wrapper">
                                <input type="month" value={stream.startMonth} onChange={e => onUpdate(stream.id, 'startMonth', e.target.value)} onClick={openPicker} className="input-field" />
                                <Calendar size={18} className="date-icon" />
                            </div>
                            <div className="date-input-wrapper">
                                <input type="month" value={stream.endMonth} onChange={e => onUpdate(stream.id, 'endMonth', e.target.value)} onClick={openPicker} className="input-field" />
                                <Calendar size={18} className="date-icon" />
                            </div>
                        </div>
                    </div>
                ))}
                {streams.length === 0 && <p className="stream-empty">Keine Umbuchungen hinterlegt.</p>}
            </div>
        </div>
    );
}