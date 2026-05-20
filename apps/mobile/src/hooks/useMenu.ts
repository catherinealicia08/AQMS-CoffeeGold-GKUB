'use client';

import { useEffect, useState } from 'react';
import { db } from '@aqms/shared';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import type { MenuItem } from '@/types/menu';

// Collection name — change 'products' to match your Firestore schema
const MENU_COLLECTION = 'products';

export function useMenu(category?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const col = collection(db, MENU_COLLECTION);
    const constraints = category && category !== 'All Drinks'
      ? [where('category', '==', category), orderBy('name')]
      : [orderBy('name')];

    const q = query(col, ...constraints);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const mapped = snap.docs.map((d) => {
          const item = { id: d.id, ...d.data() } as MenuItem;
          // Normalize Size option: replace any size choices with Normal/Upsize
          if (item.options) {
            // Remove Size option entirely — Upsize is handled as an add-on
            item.options = item.options.filter((opt) => opt.name.toLowerCase() !== 'size');
          }
          // Ensure Upsize is always last in add-ons
          if (!item.addons) item.addons = [];
          const withoutUpsize = item.addons.filter((a) => a.name.toLowerCase() !== 'upsize');
          item.addons = [...withoutUpsize, { name: 'Upsize', price: 5000 }];
          return item;
        });
        setItems(mapped);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [category]);

  return { items, loading, error };
}
