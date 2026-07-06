import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number; // product_id
  cartItemId?: number; // database cart_items.id
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  size: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ─── Fetch cart dari backend dan merge dengan guest cart jika ada ───────────
  const fetchCart = async (itemsToMerge?: CartItem[]) => {
    const token = localStorage.getItem('noken-token');
    if (!token) return;

    // Jika ada item dari guest cart (di localstorage), kirim ke database dulu
    if (itemsToMerge && itemsToMerge.length > 0) {
      for (const item of itemsToMerge) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: item.id,
              quantity: item.quantity,
              size: item.size,
            }),
          });
        } catch (e) {
          console.error('Error merging cart item:', e);
        }
      }
      localStorage.removeItem('noken-cart');
    }

    try {
      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data && Array.isArray(data.data.items)) {
        const mapped = data.data.items.map((item: any) => ({
          id: item.id,
          cartItemId: item.cartItemId,
          name: item.name,
          price: Number(item.price),
          image: item.image,
          category: item.category || 'Pakaian',
          quantity: item.quantity,
          size: item.size,
        }));
        setItems(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  // ─── Load cart on mount & setup event listeners ─────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('noken-token');
    const savedCartStr = localStorage.getItem('noken-cart');
    let localCart: CartItem[] = [];
    if (savedCartStr) {
      try {
        localCart = JSON.parse(savedCartStr);
      } catch {}
    }

    if (token) {
      fetchCart(localCart);
    } else {
      setItems(localCart);
    }

    // Listener untuk login di tab saat ini
    const handleLogin = () => {
      const saved = localStorage.getItem('noken-cart');
      let itemsToMerge: CartItem[] = [];
      if (saved) {
        try {
          itemsToMerge = JSON.parse(saved);
        } catch {}
      }
      fetchCart(itemsToMerge);
    };

    // Listener untuk login/logout di tab lain
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'noken-token') {
        if (e.newValue) {
          fetchCart();
        } else {
          setItems([]);
        }
      }
    };

    window.addEventListener('noken-login', handleLogin);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('noken-login', handleLogin);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ─── Save local cart ke localStorage (hanya jika guest/tidak login) ────────
  useEffect(() => {
    const token = localStorage.getItem('noken-token');
    if (!token) {
      localStorage.setItem('noken-cart', JSON.stringify(items));
    }
  }, [items]);

  // ─── Add to Cart ───────────────────────────────────────────────────────────
  const addToCart = async (newItem: CartItem) => {
    // 1. Update lokal secara optimis
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === newItem.id && item.size === newItem.size
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id && item.size === newItem.size
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prevItems, newItem];
    });

    // 2. Sync ke database jika logged in
    const token = localStorage.getItem('noken-token');
    if (token) {
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: newItem.id,
            quantity: newItem.quantity,
            size: newItem.size,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const newCartItemId = data.data.id;
          // Set database cartItemId ke item yang baru saja di-insert
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === newItem.id && item.size === newItem.size
                ? { ...item, cartItemId: newCartItemId }
                : item
            )
          );
        }
      } catch (error) {
        console.error('Error adding to backend cart:', error);
      }
    }
  };

  // ─── Remove from Cart ──────────────────────────────────────────────────────
  const removeFromCart = async (id: number, size: string) => {
    const previousItems = [...items];
    const targetItem = items.find((item) => item.id === id && item.size === size);

    // 1. Update lokal secara optimis
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.size === size))
    );

    // 2. Sync ke database jika logged in
    const token = localStorage.getItem('noken-token');
    if (token && targetItem) {
      try {
        // Jika cartItemId tidak ada, fetch cart dulu untuk mencocokkan ID
        let cartItemId = targetItem.cartItemId;
        if (!cartItemId) {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data.items)) {
            const match = data.data.items.find((i: any) => i.id === id && i.size === size);
            if (match) cartItemId = match.cartItemId;
          }
        }

        if (cartItemId) {
          const res = await fetch(`/api/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!data.success) {
            setItems(previousItems);
            console.error('Failed to remove backend cart item:', data.message);
          }
        }
      } catch (error) {
        setItems(previousItems);
        console.error('Error removing backend cart item:', error);
      }
    }
  };

  // ─── Update Quantity ───────────────────────────────────────────────────────
  const updateQuantity = async (id: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    const previousItems = [...items];
    const targetItem = items.find((item) => item.id === id && item.size === size);

    // 1. Update lokal secara optimis
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );

    // 2. Sync ke database jika logged in
    const token = localStorage.getItem('noken-token');
    if (token && targetItem) {
      try {
        let cartItemId = targetItem.cartItemId;
        if (!cartItemId) {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data.items)) {
            const match = data.data.items.find((i: any) => i.id === id && i.size === size);
            if (match) cartItemId = match.cartItemId;
          }
        }

        if (cartItemId) {
          const res = await fetch(`/api/cart/${cartItemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
          });
          const data = await res.json();
          if (!data.success) {
            setItems(previousItems);
            console.error('Failed to update quantity in backend:', data.message);
          }
        }
      } catch (error) {
        setItems(previousItems);
        console.error('Error updating quantity in backend:', error);
      }
    }
  };

  // ─── Clear Cart ────────────────────────────────────────────────────────────
  const clearCart = async () => {
    const previousItems = [...items];
    setItems([]);

    const token = localStorage.getItem('noken-token');
    if (token) {
      try {
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          setItems(previousItems);
          console.error('Failed to clear backend cart:', data.message);
        }
      } catch (error) {
        setItems(previousItems);
        console.error('Error clearing backend cart:', error);
      }
    } else {
      localStorage.removeItem('noken-cart');
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
