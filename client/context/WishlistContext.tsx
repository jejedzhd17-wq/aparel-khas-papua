import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('noken-token');

  // Load wishlist from API on mount (if user is logged in)
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchWishlist();
    }

    // Listen untuk login di tab yang sama (custom event dari Login.tsx)
    const handleLogin = () => {
      fetchWishlist();
    };

    // Listen untuk login/logout di tab lain (storage event)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'noken-token') {
        if (e.newValue) {
          fetchWishlist();
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

  const fetchWishlist = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (newItem: WishlistItem) => {
    // Optimistic update
    setItems((prev) => {
      if (prev.some((item) => item.id === newItem.id)) return prev;
      return [...prev, newItem];
    });

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: newItem.id }),
      });
      const data = await res.json();
      if (!data.success && res.status !== 409) {
        // Rollback jika gagal (bukan karena duplikat)
        setItems((prev) => prev.filter((item) => item.id !== newItem.id));
        console.error('Gagal menambah wishlist:', data.message);
      }
    } catch (error) {
      // Rollback
      setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (id: number) => {
    // Optimistic update
    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback
        setItems(previous);
        console.error('Gagal menghapus wishlist:', data.message);
      }
    } catch (error) {
      // Rollback
      setItems(previous);
      console.error('Error removing from wishlist:', error);
    }
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const isInWishlist = (id: number): boolean => {
    return items.some((item) => item.id === id);
  };

  const clearWishlist = async () => {
    const previous = items;
    setItems([]);

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        setItems(previous);
        console.error('Gagal mengosongkan wishlist:', data.message);
      }
    } catch (error) {
      setItems(previous);
      console.error('Error clearing wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
