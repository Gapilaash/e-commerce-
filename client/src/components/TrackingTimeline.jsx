export default function TrackingTimeline({ tracking }) {
  if (!tracking) return null;

  return (
    <div className="flex items-start justify-between mt-4 mb-2">
      {tracking.map((stage, i) => (
        <div key={stage.key} className="flex-1 flex flex-col items-center relative">
          {i > 0 && (
            <div
              className={`absolute top-2.5 right-1/2 w-full h-0.5 ${tracking[i - 1].completed ? 'bg-forest' : 'bg-line'}`}
              style={{ zIndex: 0 }}
            />
          )}
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center relative z-10 ${
              stage.completed ? 'bg-forest text-white' : 'bg-line text-muted'
            } ${stage.current ? 'ring-4 ring-forest-light' : ''}`}
          >
            {stage.completed && !stage.current ? (
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="3">
                <path d="M4 10l4 4 8-8" />
              </svg>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
            )}
          </div>
          <span className={`text-[10px] sm:text-xs mt-2 text-center leading-tight ${stage.current ? 'text-forest font-medium' : 'text-muted'}`}>
            {stage.label}
          </span>
        </div>
      ))}
    </div>
  );
}
