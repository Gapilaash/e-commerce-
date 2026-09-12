import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    navigate(search ? `/products?search=${encodeURIComponent(search)}` : '/products');
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-line bg-paper sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-6">
        <Link to="/" className="font-display text-xl sm:text-2xl tracking-tight shrink-0" onClick={closeMenu}>
          Meridian
        </Link>

        {/* Search — hidden on mobile, shown from sm breakpoint up */}
        <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-md">
          <input
            className="input"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm ml-auto">
          <Link to="/products" className="hover:text-forest">Shop</Link>
          <Link to="/wishlist" className="hover:text-forest relative">
            Wishlist
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="hover:text-forest relative">
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-forest text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="hover:text-forest">Orders</Link>
              <button onClick={logout} className="btn-secondary py-1.5 px-3 text-sm">Log out</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-1.5 px-3 text-sm">Sign in</Link>
          )}
        </nav>

        {/* Mobile: cart icon + hamburger */}
        <div className="flex items-center gap-3 ml-auto md:hidden">
          <Link to="/cart" className="relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" />
              <path d="M2.5 3h2l2.4 12.4a2 2 0 002 1.6h7.7a2 2 0 002-1.6L20 7H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-forest text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-line px-4 sm:px-6 py-4 space-y-4 bg-paper">
          <form onSubmit={handleSearch}>
            <input
              className="input"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
          <nav className="flex flex-col gap-3 text-sm">
            <Link to="/products" onClick={closeMenu}>Shop</Link>
            <Link to="/wishlist" onClick={closeMenu}>Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={closeMenu}>Orders</Link>
                <button onClick={() => { logout(); closeMenu(); }} className="btn-secondary w-full">Log out</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className="btn-primary text-center">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
