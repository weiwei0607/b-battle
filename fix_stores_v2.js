import fs from 'fs';

const fixUserStore = () => {
  const path = '/Users/daibao/development/b-battle/src/stores/useUserStore.js';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/setLang: \(v\) => { save\('lang', v\); set\({ lang: v }\); }/g, "setLang: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.lang) : valOrFn; save('lang', next); return { lang: next }; })");
  content = content.replace(/setUserName: \(v\) => { save\('user_name', v\); set\({ userName: v }\); }/g, "setUserName: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userName) : valOrFn; save('user_name', next); return { userName: next }; })");
  content = content.replace(/setUserId: \(v\) => { save\('user_id', v\); set\({ userId: v }\); }/g, "setUserId: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userId) : valOrFn; save('user_id', next); return { userId: next }; })");
  content = content.replace(/setUserAvatar: \(v\) => { save\('user_avatar', v\); set\({ userAvatar: v }\); }/g, "setUserAvatar: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userAvatar) : valOrFn; save('user_avatar', next); return { userAvatar: next }; })");
  content = content.replace(/setPersona: \(v\) => { save\('persona', v\); set\({ persona: v }\); }/g, "setPersona: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.persona) : valOrFn; save('persona', next); return { persona: next }; })");
  content = content.replace(/setPersonaStats: \(v\) => { save\('persona_stats', v\); set\({ personaStats: v }\); }/g, "setPersonaStats: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.personaStats) : valOrFn; save('persona_stats', next); return { personaStats: next }; })");
  content = content.replace(/setAchievements: \(v\) => { save\('achievements', v\); set\({ achievements: v }\); }/g, "setAchievements: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.achievements) : valOrFn; save('achievements', next); return { achievements: next }; })");
  content = content.replace(/setUnlockedTitles: \(v\) => { save\('unlocked_titles', v\); set\({ unlockedTitles: v }\); }/g, "setUnlockedTitles: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.unlockedTitles) : valOrFn; save('unlocked_titles', next); return { unlockedTitles: next }; })");
  content = content.replace(/setUserTitle: \(v\) => { save\('title', v\); set\({ userTitle: v }\); }/g, "setUserTitle: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userTitle) : valOrFn; save('title', next); return { userTitle: next }; })");
  content = content.replace(/setUserFrame: \(v\) => { save\('frame', v\); set\({ userFrame: v }\); }/g, "setUserFrame: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.userFrame) : valOrFn; save('frame', next); return { userFrame: next }; })");
  content = content.replace(/setCurrentTier: \(v\) => { save\('tier', v\); set\({ currentTier: v }\); }/g, "setCurrentTier: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.currentTier) : valOrFn; save('tier', next); return { currentTier: next }; })");
  content = content.replace(/setIsStudent: \(v\) => { save\('isStudent', v\); set\({ isStudent: v }\); }/g, "setIsStudent: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.isStudent) : valOrFn; save('isStudent', next); return { isStudent: next }; })");
  content = content.replace(/setCurrency: \(v\) => { save\('currency', v\); set\({ currency: v }\); }/g, "setCurrency: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.currency) : valOrFn; save('currency', next); return { currency: next }; })");
  content = content.replace(/setWishlist: \(v\) => { save\('wishlist', v\); set\({ wishlist: v }\); }/g, "setWishlist: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.wishlist) : valOrFn; save('wishlist', next); return { wishlist: next }; })");
  content = content.replace(/setWishlistGoal: \(v\) => { save\('wishlist_goal', v\); set\({ wishlistGoal: v }\); }/g, "setWishlistGoal: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.wishlistGoal) : valOrFn; save('wishlist_goal', next); return { wishlistGoal: next }; })");
  content = content.replace(/setHomeMaterials: \(v\) => { save\('materials', v\); set\({ homeMaterials: v }\); }/g, "setHomeMaterials: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.homeMaterials) : valOrFn; save('materials', next); return { homeMaterials: next }; })");
  fs.writeFileSync(path, content, 'utf8');
};

const fixFinanceStore = () => {
  const path = '/Users/daibao/development/b-battle/src/stores/useFinanceStore.js';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/setCoins:\s+\(v\) => { save\('coins', v\);\s+set\({ coins: v }\); }/g, "setCoins: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.coins) : valOrFn; save('coins', next); return { coins: next }; })");
  content = content.replace(/setDebt:\s+\(v\) => { save\('debt', v\);\s+set\({ debt: v }\); }/g, "setDebt: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.debt) : valOrFn; save('debt', next); return { debt: next }; })");
  content = content.replace(/setHistory:\s+\(v\) => { save\('history', v\);\s+set\({ history: v }\); }/g, "setHistory: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.history) : valOrFn; save('history', next); return { history: next }; })");
  content = content.replace(/setWillpowerExp:\s+\(v\) => { save\('exp', v\);\s+set\({ willpowerExp: v }\); }/g, "setWillpowerExp: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.willpowerExp) : valOrFn; save('exp', next); return { willpowerExp: next }; })");
  content = content.replace(/setShield:\s+\(v\) => { save\('shield', v\);\s+set\({ shield: v }\); }/g, "setShield: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.shield) : valOrFn; save('shield', next); return { shield: next }; })");
  content = content.replace(/setPotions:\s+\(v\) => { save\('potions', v\);\s+set\({ potions: v }\); }/g, "setPotions: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.potions) : valOrFn; save('potions', next); return { potions: next }; })");
  content = content.replace(/setInventory:\s+\(v\) => { save\('inventory', v\);\s+set\({ inventory: v }\); }/g, "setInventory: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.inventory) : valOrFn; save('inventory', next); return { inventory: next }; })");
  content = content.replace(/setWeeklyPools:\s+\(v\) => { save\('weekly_pools', v\);\s+set\({ weeklyPools: v }\); }/g, "setWeeklyPools: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.weeklyPools) : valOrFn; save('weekly_pools', next); return { weeklyPools: next }; })");
  content = content.replace(/setMonthlyPools:\s+\(v\) => { save\('monthly_pools', v\);\s+set\({ monthlyPools: v }\); }/g, "setMonthlyPools: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.monthlyPools) : valOrFn; save('monthly_pools', next); return { monthlyPools: next }; })");
  content = content.replace(/setInsuranceExpiry:\s+\(v\) => { save\('ins_expiry', v\);\s+set\({ insuranceExpiry: v }\); }/g, "setInsuranceExpiry: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.insuranceExpiry) : valOrFn; save('ins_expiry', next); return { insuranceExpiry: next }; })");
  content = content.replace(/setHasZenSofa:\s+\(v\) => { save\('has_sofa', v\);\s+set\({ hasZenSofa: v }\); }/g, "setHasZenSofa: (valOrFn) => set((state) => { const next = typeof valOrFn === 'function' ? valOrFn(state.hasZenSofa) : valOrFn; save('has_sofa', next); return { hasZenSofa: next }; })");
  fs.writeFileSync(path, content, 'utf8');
};

fixUserStore();
fixFinanceStore();
console.log("Stores fixed manually.");
