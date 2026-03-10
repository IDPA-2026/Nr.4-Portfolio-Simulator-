import { DepositStream } from '../types';

interface Props {
    streams: DepositStream[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof DepositStream, value: string | number) => void;
    onRemove: (id: string) => void;
}

export default function DepositStreamInputs({ streams, onAdd, onUpdate, onRemove }: Props) {
    return (
        <div className="config-card">
            <div className="config-card-header">
                <h2 className="config-card-title">Einzahlungen</h2>
                <button onClick={onAdd} className="btn-add-stream">
                    + Hinzufügen
                </button>
            </div>

            <div className="stream-list">
                {streams.map(stream => (
                    <div key={stream.id} className="stream-item">
                        <button onClick={() => onRemove(stream.id)} className="btn-remove-stream">X</button>
                        <div className="stream-row">
                            <input
                                type="text"
                                value={stream.name}
                                onChange={e => onUpdate(stream.id, 'name', e.target.value)}
                                className="input-field"
                                placeholder="Name"
                            />
                            <div className="stream-amount-wrapper">
                                <input
                                    type="number"
                                    value={stream.monthlyAmount}
                                    onChange={e => onUpdate(stream.id, 'monthlyAmount', Number(e.target.value))}
                                    className="input-field"
                                    placeholder="Betrag"
                                />
                                <span className="stream-unit">€/Mt.</span>
                            </div>
                        </div>
                        <div className="stream-row">
                            <input
                                type="month"
                                value={stream.startMonth}
                                onChange={e => onUpdate(stream.id, 'startMonth', e.target.value)}
                                className="input-field"
                            />
                            <input
                                type="month"
                                value={stream.endMonth}
                                onChange={e => onUpdate(stream.id, 'endMonth', e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>
                ))}
                {streams.length === 0 && (
                    <p className="stream-empty">Keine Sparpläne hinterlegt.</p>
                )}
            </div>
        </div>
    );
}