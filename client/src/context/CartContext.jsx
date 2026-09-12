import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    try {
      const res = await api.get('/cart');
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch {
      setItems([]);
      setTotal(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId, qty = 1) {
    const res = await api.post('/cart/add', { productId, qty });
    setItems(res.data.items);
    setTotal(res.data.total);
  }

  async function updateQty(productId, qty) {
    const res = await api.put('/cart/update', { productId, qty });
    setItems(res.data.items);
    setTotal(res.data.total);
  }

  async function removeFromCart(productId) {
    const res = await api.delete(`/cart/remove/${productId}`);
    setItems(res.data.items);
    setTotal(res.data.total);
  }

  async function clearCart() {
    const res = await api.delete('/cart/clear');
    setItems(res.data.items);
    setTotal(res.data.total);
  }

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, total, itemCount, refreshCart, addToCart, updateQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
