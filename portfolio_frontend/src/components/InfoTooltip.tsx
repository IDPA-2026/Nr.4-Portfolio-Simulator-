import { useState } from 'react';

interface Props {
    text: string;
}

export default function InfoTooltip({ text }: Props) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="tooltip-container"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            <span className="tooltip-trigger">i</span>
            {visible && (
                <div className="tooltip-content">
                    {text}
                    <div className="tooltip-arrow" />
                </div>
            )}
        </div>
    );
}