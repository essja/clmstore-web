import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartCustomization } from '@/types';

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string;
  restaurantSlug: string;

  addItem: (
    item: Omit<CartItem, 'cart_key' | 'quantity'>,
    restaurantId: number,
    restaurantName: string,
    restaurantSlug: string,
    quantity?: number,
  ) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

function makeCartKey(menuItemId: number, customizations: CartCustomization[]): string {
  const sorted = [...customizations].sort((a, b) => a.option_id - b.option_id);
  return `${menuItemId}-${sorted.map((c) => c.option_id).join(',')}`;
}

function itemTotal(item: CartItem): number {
  const customizationsExtra = (item.customizations ?? []).reduce(
    (sum, c) => sum + c.price_modifier,
    0,
  );
  return (item.price + customizationsExtra) * item.quantity;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: '',
      restaurantSlug: '',

      addItem: (itemData, restaurantId, restaurantName, restaurantSlug, quantity = 1) => {
        const { items, restaurantId: currentRestaurantId } = get();
        const customizations = itemData.customizations ?? [];
        const cartKey = makeCartKey(itemData.menu_item_id, customizations);
        const newItem: CartItem = { ...itemData, customizations, cart_key: cartKey, quantity };

        // Different restaurant — clear cart first
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          set({ items: [newItem], restaurantId, restaurantName, restaurantSlug });
          return;
        }

        const existing = items.find((i) => i.cart_key === cartKey);
        if (existing) {
          set({
            items: items.map((i) =>
              i.cart_key === cartKey ? { ...i, quantity: i.quantity + quantity } : i,
            ),
            restaurantId,
            restaurantName,
            restaurantSlug,
          });
        } else {
          set({ items: [...items, newItem], restaurantId, restaurantName, restaurantSlug });
        }
      },

      removeItem: (cartKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.cart_key !== cartKey),
          ...(state.items.length === 1
            ? { restaurantId: null, restaurantName: '', restaurantSlug: '' }
            : {}),
        })),

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) { get().removeItem(cartKey); return; }
        set((state) => ({
          items: state.items.map((i) =>
            i.cart_key === cartKey ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: '', restaurantSlug: '' }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + itemTotal(i), 0),
    }),
    { name: 'clm-cart' },
  ),
);
