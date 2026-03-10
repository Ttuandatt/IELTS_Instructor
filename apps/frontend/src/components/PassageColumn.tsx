import React from 'react';

interface PassageColumnProps {
  html: string;
}

const PassageColumn: React.FC<PassageColumnProps> = ({ html }) => {
  return (
    <div
      style={{ padding: '32px', fontSize: '1.05rem', lineHeight: 1.7, color: '#f6f6f6' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default PassageColumn;
