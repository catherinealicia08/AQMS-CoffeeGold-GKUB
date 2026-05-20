'use client';

import { createContext, useContext, useState } from 'react';

interface CartSheetContextValue {
  open: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

const CartSheetContext = createContext<CartSheetContextValue>({
  open: false,
  openSheet: () => {},
  closeSheet: () => {},
});

export function CartSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CartSheetContext.Provider value={{ open, openSheet: () => setOpen(true), closeSheet: () => setOpen(false) }}>
      {children}
    </CartSheetContext.Provider>
  );
}

export const useCartSheet = () => useContext(CartSheetContext);
