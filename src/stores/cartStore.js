import { create } from "zustand";
const getInitialCart = () => {
  const saved = localStorage.getItem("cart");
  return saved ? JSON.parse(saved) : [];
};

export const useCartStore = create((set, get) => ({
  items: getInitialCart(),

  addItem: (product) => {
    const exists = get().items.find(i => i.id.toString() === product.id.toString());
    if (exists) {
      set((state) => {
        const updated = state.items.map(i =>
          i.id.toString() === product.id.toString()
            ? { ...i, qty: i.qty + 1 }
            : i
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return { items: updated };
      });
    } else {
      set((state) => {
        const updated = [...state.items, { ...product, qty: 1 }];
        localStorage.setItem("cart", JSON.stringify(updated));
        return { items: updated };
      });
    }
  },

  removeItem: (id) => {
    set((state) => {
      const updated = state.items.filter(i => i.id.toString() !== id.toString());
      localStorage.setItem("cart", JSON.stringify(updated));
      return { items: updated };
    });
  },

  updateQty: (id, qty) => {
    set((state) => {
      const updated = state.items.map(i =>
        i.id.toString() === id.toString() ? { ...i, qty } : i
      );
      localStorage.setItem("cart", JSON.stringify(updated));
      return { items: updated };
    });
  },

  isInCart: (id) => !!get().items.find(i => i.id.toString() === id.toString()),
}));