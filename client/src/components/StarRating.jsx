export default function StarRating({ value = 0, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map(n => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={interactive ? () => onChange(n) : undefined}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            style={{ lineHeight: 0 }}
            aria-label={interactive ? `Rate ${n} star${n > 1 ? 's' : ''}` : undefined}
          >
            <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? '#C98A2A' : 'none'} stroke="#C98A2A" strokeWidth="1">
              <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.6 1-5.8L1.6 7.6l5.8-.8z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
