import fs from 'fs';

const fixStore = (path, fields) => {
  let content = fs.readFileSync(path, 'utf8');
  fields.forEach(f => {
    const setterName = 'set' + f.charAt(0).toUpperCase() + f.slice(1);
    // Regex to match the current setter implementation
    const regex = new RegExp(`${setterName}: \\(v\\) => { save\\('${f}', v\\);\\s+set\\({ ${f}: v }\\); }`, 'g');
    const replacement = `${setterName}: (valOrFn) => set((state) => {
    const next = typeof valOrFn === 'function' ? valOrFn(state.${f}) : valOrFn;
    save('${f}', next);
    return { ${f}: next };
  })`;
    content = content.replace(regex, replacement);
  });
  fs.writeFileSync(path, content, 'utf8');
};

fixStore('/Users/daibao/development/b-battle/src/stores/useUserStore.js', [
  'lang', 'userName', 'userId', 'userAvatar', 'persona', 'personaStats', 
  'achievements', 'unlockedTitles', 'userTitle', 'userFrame', 
  'currentTier', 'isStudent', 'currency', 'wishlist', 'wishlistGoal', 'homeMaterials'
]);

fixStore('/Users/daibao/development/b-battle/src/stores/useFinanceStore.js', [
  'coins', 'debt', 'history', 'willpowerExp', 'shield', 'potions', 
  'inventory', 'weeklyPools', 'monthlyPools', 'insuranceExpiry', 'hasZenSofa'
]);

console.log("Stores fixed with functional update support.");
