import React from 'react';
import { useText } from '../context/LanguageContext';

export default function Classes() {
  const { content } = useText();

  return (
    <div style={{ padding: '40px', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary)' }}>{content.nav.classes}</h1>
      <p>{content.classes.description}</p>
      {/* You can build a 'ClassCard' component later */}
    </div>
  );
}