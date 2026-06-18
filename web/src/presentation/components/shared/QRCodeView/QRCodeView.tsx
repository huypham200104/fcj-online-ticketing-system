import React from 'react';
import QRCode from 'react-qr-code';
import './QRCodeView.css';

interface QRCodeViewProps {
  value: string;
  label?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({ value, label }) => {
  return (
    <div className="qr-code-view">
      <div className="qr-code-view__frame">
        <QRCode value={value} size={184} bgColor="var(--color-bg-surface)" fgColor="var(--color-gray-900)" />
      </div>
      {label ? <p>{label}</p> : null}
    </div>
  );
};

