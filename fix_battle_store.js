import fs from 'fs';

const fixStore = (path, fields) => {
  let content = fs.readFileSync(path, 'utf8');
  fields.forEach(f => {
    const setterName = 'set' + f.charAt(0).toUpperCase() + f.slice(1);
    // Regex to match the current setter implementation: e.g., setView: (v) => set({ view: v }),
    const regex = new RegExp(`${setterName}: \\(v\\) => set\\({ ${f}: v }\\)`, 'g');
    const replacement = `${setterName}: (valOrFn) => set((state) => ({ ${f}: typeof valOrFn === 'function' ? valOrFn(state.${f}) : valOrFn }))`;
    content = content.replace(regex, replacement);
  });
  fs.writeFileSync(path, content, 'utf8');
};

fixStore('/Users/daibao/development/b-battle/src/stores/useBattleStore.js', [
  'view', 'activeMode', 'roomId', 'isOnline', 'isCloudLoading', 
  'savingStreak', 'streakBroken', 'teamSpentDaily', 'teamSpentWeekly', 'teamSpentMonthly',
  'enemySpentDaily', 'enemySpentWeekly', 'enemySpentMonthly',
  'activeChallenges', 'claimedAvoidedItems', 'isSevered', 'battleLog',
  'aiComment', 'isAiProcessing', 'pendingTx', 'reflectionText', 'coldWarEndTime',
  'showBudgetSetup', 'showShop', 'showCustomModal', 'showAchievements',
  'showEvolutionPath', 'showFriends', 'showRoomInput', 'showInviteQR',
  'lastPersonaSwitch', 'now'
]);

console.log("BattleStore fixed.");
