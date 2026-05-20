
interface AppHeaderProps {
  showCart?: boolean;
  cartCount?: number;
  onCartClick?: () => void;
}

export default function AppHeader({ showCart, cartCount = 0, onCartClick }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-4 bg-cream safe-top">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded border border-gold flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          </svg>
        </div>
        <span className="text-base font-bold text-gold tracking-wide">Coffee Gold</span>
      </div>
      {showCart && (
        <button onClick={onCartClick} className="relative p-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      )}
    </header>
  );
}
