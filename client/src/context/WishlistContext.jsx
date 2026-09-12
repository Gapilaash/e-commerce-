import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      setItems(res.data);
    } catch {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggle(productId) {
    const res = await api.post(`/wishlist/toggle/${productId}`);
    setItems(res.data.products);
    return res.data.inWishlist;
  }

  function isWishlisted(productId) {
    return items.some(p => p.id === productId);
  }

  return (
    <WishlistContext.Provider value={{ items, refresh, toggle, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
