'use client';


 

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';


 

export interface CartItem {

  mealId:    string;

  mealDate:  string;

  mealSlot:  'lunch' | 'dinner';

  name:      string;

  is_veg:    boolean;

  price:     number;

  quantity:  number;

  itemType?: 'meal' | 'menu_item';

}


 

interface CartContextValue {

  items:      CartItem[];

  count:      number;

  add:        (item: Omit<CartItem, 'quantity'>) => void;

  remove:     (mealId: string, mealDate: string) => void;

  increment:  (mealId: string, mealDate: string) => void;

  decrement:  (mealId: string, mealDate: string) => void;

  clear:      () => void;

  hasItem:    (mealId: string, mealDate: string) => boolean;

  isCartOpen: boolean;

  openCart:   () => void;

  closeCart:  () => void;

}


 

const CartContext = createContext<CartContextValue | null>(null);

const KEY = 'dv_cart';


 

export function CartProvider({ children }: { children: ReactNode }) {

  const [items,      setItems]      = useState<CartItem[]>([]);

  const [hydrated,   setHydrated]   = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);


 

  useEffect(() => {

    try {

      const raw = localStorage.getItem(KEY);

      if (raw) setItems(JSON.parse(raw));

    } catch { /* corrupted — start fresh */ }

    setHydrated(true);

  }, []);


 

  useEffect(() => {

    if (!hydrated) return;

    localStorage.setItem(KEY, JSON.stringify(items));

  }, [items, hydrated]);


 

  const add = useCallback((item: Omit<CartItem, 'quantity'>) => {

    setItems((prev) => {

      const existing = prev.find((i) => i.mealId === item.mealId && i.mealDate === item.mealDate);

      if (existing) {

        return prev.map((i) =>

          i.mealId === item.mealId && i.mealDate === item.mealDate

            ? { ...i, quantity: i.quantity + 1 } : i

        );

      }

      return [...prev, { ...item, quantity: 1 }];

    });

  }, []);


 

  const remove = useCallback((mealId: string, mealDate: string) => {

    setItems((prev) => prev.filter((i) => !(i.mealId === mealId && i.mealDate === mealDate)));

  }, []);


 

  const increment = useCallback((mealId: string, mealDate: string) => {

    setItems((prev) => prev.map((i) =>

      i.mealId === mealId && i.mealDate === mealDate ? { ...i, quantity: i.quantity + 1 } : i

    ));

  }, []);


 

  const decrement = useCallback((mealId: string, mealDate: string) => {

    setItems((prev) =>

      prev.flatMap((i) => {

        if (i.mealId !== mealId || i.mealDate !== mealDate) return [i];

        if (i.quantity <= 1) return [];

        return [{ ...i, quantity: i.quantity - 1 }];

      })

    );

  }, []);


 

  const clear   = useCallback(() => setItems([]), []);

  const hasItem = useCallback((mealId: string, mealDate: string) =>

    items.some((i) => i.mealId === mealId && i.mealDate === mealDate), [items]);


 

  const openCart  = useCallback(() => setIsCartOpen(true),  []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);


 

  const count = items.reduce((s, i) => s + i.quantity, 0);


 

  return (

    <CartContext.Provider value={{ items, count, add, remove, increment, decrement, clear, hasItem, isCartOpen, openCart, closeCart }}>

      {children}

    </CartContext.Provider>

  );

}


 

export function useCart(): CartContextValue {

  const ctx = useContext(CartContext);

  if (!ctx) throw new Error('useCart must be used within CartProvider');

  return ctx;

}