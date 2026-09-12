const ICONS = {
  Electronics: <path d="M4 5h16v10H4z M9 19h6 M12 15v4" />,
  Home: <path d="M3 11l9-7 9 7 M5 10v10h14V10" />,
  Fashion: <path d="M8 3l4 3 4-3 3 4-3 2v11H5V9L2 7z" />,
  Accessories: <path d="M4 8h16l-1.5 12h-13z M8 8V6a4 4 0 018 0v2" />,
  Beauty: <path d="M12 3c2 2 3 4 3 6a3 3 0 01-6 0c0-2 1-4 3-6z M7 21c0-3 2-5 5-5s5 2 5 5" />,
  Sports: <path d="M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3c2.5 2.5 2.5 15.5 0 18 M12 3c-2.5 2.5-2.5 15.5 0 18" />,
  Books: <path d="M4 4h9a3 3 0 013 3v13a3 3 0 00-3-3H4z M20 4h-4a3 3 0 00-3 3v13a3 3 0 013-3h4z" />,
  Toys: <path d="M12 3l2.5 5 5.5.7-4 3.9 1 5.4-5-2.7-5 2.7 1-5.4-4-3.9 5.5-.7z" />
};

export default function CategoryIcon({ category, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[category] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
