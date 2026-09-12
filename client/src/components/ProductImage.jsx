import { useState } from 'react';

// Colorful, deterministic gradient per product name so the fallback still
// looks intentional (not a generic gray box) if an image URL ever fails to load.
const GRADIENTS = [
  'linear-gradient(135deg, #2F6F4E, #7CC49A)',
  'linear-gradient(135deg, #C98A2A, #F0C97A)',
  'linear-gradient(135deg, #22523A, #4E9C74)',
  'linear-gradient(135deg, #B5541C, #E3985C)',
  'linear-gradient(135deg, #3A5A6E, #8FB8CC)'
];

function gradientFor(name = '') {
  const idx = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center text-white font-display text-2xl ${className}`}
        style={{ background: gradientFor(alt) }}
      >
        {alt?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
