import { create } from 'zustand';
import { load, save } from './storage';

const DEFAULT_WEEKLY_POOLS = {
  food:      { limit: 3000, label: '餐飲' },
  transport: { limit: 1000, label: '交通' },
  social:    { limit: 1500, label: '社交' },
  shopping:  { limit: 1500, label: '購物' },
};

const DEFAULT_MONTHLY_POOLS = {
  housing:   { limit: 8000, label: '房租' },
  education: { limit: 3000, label: '學習' },
};

export const useFinanceStore = create((set) => ({
  coins:           load('coins', 2000),
  debt:            load('debt', 0),
  history:         load('history', []) || [],
  willpowerExp:    load('exp', 0),
  shield:          load('shield', 0),
  potions:         load('potions', 0),
  inventory:       load('inventory', { stinkyEggs: 0, rations: 0 }),
  weeklyPools:     load('weekly_pools', DEFAULT_WEEKLY_POOLS),
  monthlyPools:    load('monthly_pools', DEFAULT_MONTHLY_POOLS),
  insuranceExpiry: load('ins_expiry', null),
  hasZenSofa:      load('has_sofa', false),

  setCoins: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.coins) : valOrFn; save('coins', next); return { coins: next }; }),
  setDebt: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.debt) : valOrFn; save('debt', next); return { debt: next }; }),
  setHistory: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.history) : valOrFn; save('history', next); return { history: next }; }),
  setWillpowerExp: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.willpowerExp) : valOrFn; save('exp', next); return { willpowerExp: next }; }),
  setShield: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.shield) : valOrFn; save('shield', next); return { shield: next }; }),
  setPotions: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.potions) : valOrFn; save('potions', next); return { potions: next }; }),
  setInventory: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.inventory) : valOrFn; save('inventory', next); return { inventory: next }; }),
  setWeeklyPools: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.weeklyPools) : valOrFn; save('weekly_pools', next); return { weeklyPools: next }; }),
  setMonthlyPools: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.monthlyPools) : valOrFn; save('monthly_pools', next); return { monthlyPools: next }; }),
  setInsuranceExpiry: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.insuranceExpiry) : valOrFn; save('ins_expiry', next); return { insuranceExpiry: next }; }),
  setHasZenSofa: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.hasZenSofa) : valOrFn; save('has_sofa', next); return { hasZenSofa: next }; }),

  addToHistory: (tx) =>
    set((state) => {
      const updated = [tx, ...state.history].slice(0, 500);
      save('history', updated);
      return { history: updated };
    }),

  removeFromHistory: (txId) =>
    set((state) => {
      const updated = state.history.filter((tx) => tx.id !== txId);
      save('history', updated);
      return { history: updated };
    }),

  updateInHistory: (txId, patch) =>
    set((state) => {
      const updated = state.history.map((tx) =>
        tx.id === txId ? { ...tx, ...patch } : tx
      );
      save('history', updated);
      return { history: updated };
    }),
}));
