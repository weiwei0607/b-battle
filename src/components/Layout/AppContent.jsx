import React from 'react';
import { Receipt, Send, LifeBuoy, Trophy } from 'lucide-react';
import Header from './Header';
import BottomNav from './BottomNav';
import BattleArenaView from '../BattleArena/BattleArenaView';
import HistoryView from '../History/HistoryView';
import HeroHallView from '../HeroHall/HeroHallView';
import PendingTxModal from '../../modals/PendingTxModal';
import BudgetSetupModal from '../../modals/BudgetSetupModal';
import ShopModal from '../../modals/ShopModal';
import CustomPersonaModal from '../../modals/CustomPersonaModal';
import AchievementModal from '../../modals/AchievementModal';
import LeaderboardModal from '../../modals/LeaderboardModal';
import ManualModal from '../../modals/ManualModal';
import { CURRENCIES } from '../../utils/constants';
import { LOCALES } from '../../utils/locales';

const AppContent = ({
  isSevered, view, setView, coins, setCoins, debt, setDebt, willpowerExp, persona, personaStats, setPersona,
  history, wishlist, setWishlist, homeMaterials, activeMode, setActiveMode, battleLog, activeChallenges,
  pendingTx, setPendingTx, isAiProcessing, aiComment, reflectionText, setReflectionText, 
  coldWarEndTime, now, nlpInput, setNlpInput, showBudgetSetup, setShowBudgetSetup, showShop, setShowShop, 
  showCustomModal, setShowCustomModal, showAchievements, setShowAchievements, achievements,
  showEvolutionPath, setShowEvolutionPath, showFriends, setShowFriends, showRoomInput, setShowRoomInput, showInviteQR, setShowInviteQR,
  hpData, enemyHpData, executeTransaction, processTransaction, 
  executeRitual, handleClaimChallenge, handleGiveUpChallenge, simulateInvoice, handleAutoCalculate, 
  handleSavePersona, getSeveredReason, getHellPlaceholder, currentTier, lastPersonaSwitch, setLastPersonaSwitch,
  userFrame, setUserFrame, salaryInput, setSalaryInput, isStudent, setIsStudent, currency, setCurrency, setCurrentTier,
  deleteTransaction, updateTransaction, weeklyPools, setWeeklyPools, monthlyPools, setMonthlyPools,
  getBondLevel, getFrameStyle, potions, setPotions, healTransaction,
  shield, setShield, userTitle, setUserTitle, unlockedTitles, setUnlockedTitles, handleClaimAchievement,
  user, setShowLogin, unlockAchievement, generateMonthlyReview, isOnline, lang, setLang,
  userName, setUserName, userId, userAvatar, setUserAvatar, roomId, setRoomId,
  enemyConnected,
  savingStreak,
  wishlistGoal, setWishlistGoal
}) => {
  const t = LOCALES[lang] || LOCALES.zh;
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const [showManual, setShowManual] = React.useState(false);

  const isModalOpen = showShop || showAchievements || showEvolutionPath || showFriends || showRoomInput || showInviteQR || showBudgetSetup || showCustomModal || showLeaderboard || showManual;

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isSevered ? 'bg-[#450a0a]' : 'bg-[#F7F4EF]'} text-stone-800 font-sans text-left`}>
      <div className="max-w-md mx-auto p-6 h-screen flex flex-col relative overflow-hidden">
        
        {/* 🏆 當好友名單、商店、成就、進化之路等開啟時，完全隱藏 Header 以免擠在一起 */}
        {!isSevered && !isModalOpen && (
          <div className="flex justify-between items-center z-20 mb-2 gap-2 animate-in fade-in duration-300">
            <div className="flex-1 min-w-0">
              <Header 
                currentTier={currentTier} 
                coins={coins} 
                debt={debt} 
                willpowerExp={willpowerExp} 
                setView={setView} 
                onShopClick={() => setShowShop(true)} 
                onAchievementsClick={() => setShowAchievements(true)}
                onLeaderboardClick={() => setShowLeaderboard(true)}
                lang={lang} 
                setLang={setLang} 
                onWalletClick={() => setShowEvolutionPath(true)} 
              />
            </div>
          </div>
        )}
        
        <main className="flex-1 mt-2 z-10 overflow-y-auto no-scrollbar px-1">
          {isSevered ? (
            <div className="flex flex-col h-full justify-center text-center text-white animate-in zoom-in-95 duration-700">
              <h2 className="text-4xl font-black text-red-500 mb-4 uppercase italic tracking-tighter text-center">關係斷絕中</h2>
              <p className="text-sm text-red-200 mb-8 px-8 opacity-80 leading-relaxed text-center font-medium">{getSeveredReason()}</p>
              <button onClick={() => executeRitual(reflectionText)} className="w-full max-w-[280px] mx-auto py-5 bg-red-600 text-white rounded-[2rem] font-black tracking-widest active:scale-95 transition-all shadow-2xl">執行重建儀式</button>
            </div>
          ) : (
            <>
              {view === 'battle' && <BattleArenaView stats={personaStats[persona]} hpData={hpData} enemyHpData={enemyHpData} enemyConnected={enemyConnected} isAiProcessing={isAiProcessing} aiComment={aiComment} activeMode={activeMode} setActiveMode={setActiveMode} battleLog={battleLog} activeChallenges={activeChallenges} handleClaimChallenge={handleClaimChallenge} handleGiveUpChallenge={handleGiveUpChallenge} roomId={roomId} setRoomId={setRoomId} userId={userId} lang={lang} showFriends={showFriends} setShowFriends={setShowFriends} showRoomInput={showRoomInput} setShowRoomInput={setShowRoomInput} showInviteQR={showInviteQR} setShowInviteQR={setShowInviteQR} savingStreak={savingStreak} />}
              {view === 'history' && <HistoryView history={history} aiComment={aiComment} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} potions={potions} healTransaction={healTransaction} unlockAchievement={unlockAchievement} generateMonthlyReview={generateMonthlyReview} personaStats={personaStats} persona={persona} isAiProcessing={isAiProcessing} achievements={achievements} lang={lang} />}
              {view === 'heroHall' && <HeroHallView userTitle={userTitle} persona={persona} personaStats={personaStats} setPersona={setPersona} setShowBudgetSetup={()=>setShowBudgetSetup(true)} setShowManual={() => setShowManual(true)} currentTier={currentTier} lastPersonaSwitch={lastPersonaSwitch} setLastPersonaSwitch={setLastPersonaSwitch} wishlist={wishlist} setWishlist={setWishlist} debt={debt} userFrame={userFrame} homeMaterials={homeMaterials} user={user} setShowLogin={setShowLogin} setView={setView} lang={lang} userName={userName} setUserName={setUserName} userId={userId} userAvatar={userAvatar} setUserAvatar={setUserAvatar} showEvolutionPath={showEvolutionPath} setShowEvolutionPath={setShowEvolutionPath} willpowerExp={willpowerExp} setShowCustomModal={setShowCustomModal} coins={coins} wishlistGoal={wishlistGoal} setWishlistGoal={setWishlistGoal} />}
            </>
          )}
        </main>

        {!isSevered && !isModalOpen && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[150] animate-in slide-in-from-bottom-4 duration-300">
            <div className={`bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl p-2 shadow-xl flex items-center gap-2 ${isSevered ? 'opacity-100 scale-105 border-red-500 shadow-red-900/20' : ''}`}>
              <button onClick={simulateInvoice} className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center active:scale-90 transition-all shrink-0"><Receipt size={16} /></button>
              <input value={nlpInput} onChange={(e)=>setNlpInput(e.target.value)} placeholder={getHellPlaceholder()} className={`bg-stone-50/50 flex-1 text-xs px-4 py-3.5 rounded-xl outline-none focus:bg-white transition-all shadow-inner ${isSevered ? 'text-red-600 placeholder:text-red-300 font-bold' : 'text-stone-800'}`} onKeyDown={(e) => e.key === 'Enter' && processTransaction(nlpInput)} />
              <button onClick={() => processTransaction(nlpInput)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all shrink-0 ${isSevered ? 'bg-red-600' : 'bg-stone-800'}`}><Send size={16} /></button>
            </div>
          </div>
        )}
        {!isSevered && !showFriends && <BottomNav view={view} setView={setView} lang={lang} />}

        <PendingTxModal pendingTx={pendingTx} setPendingTx={setPendingTx} executeTransaction={executeTransaction} />
        <BudgetSetupModal show={showBudgetSetup} onClose={() => setShowBudgetSetup(false)} salaryInput={salaryInput} setSalaryInput={setSalaryInput} handleAutoCalculate={handleAutoCalculate} weeklyPools={weeklyPools} setWeeklyPools={setWeeklyPools} monthlyPools={monthlyPools} setMonthlyPools={setMonthlyPools} isStudent={isStudent} setIsStudent={setIsStudent} currency={currency} setCurrency={setCurrency} CURRENCIES={CURRENCIES} currentTier={currentTier} setCurrentTier={setCurrentTier} />
        <ShopModal 
          show={showShop} 
          onClose={() => setShowShop(false)} 
          coins={coins} 
          setCoins={setCoins} 
          setUserFrame={setUserFrame} 
          potions={potions} 
          setPotions={setPotions} 
          shield={shield} 
          setShield={setShield}
          insuranceExpiry={insuranceExpiry}
          setInsuranceExpiry={setInsuranceExpiry}
          hasZenSofa={hasZenSofa}
          setHasZenSofa={setHasZenSofa}
          bannerText={bannerText}
          setBannerText={setBannerText}
          inventory={inventory}
          setInventory={setInventory}
        />
        <CustomPersonaModal show={showCustomModal} onClose={() => setShowCustomModal(false)} onSave={handleSavePersona} />
        <AchievementModal show={showAchievements} onClose={() => setShowAchievements(false)} achievements={achievements} onClaim={handleClaimAchievement} userTitle={userTitle} setUserTitle={setUserTitle} lang={lang} />
        <LeaderboardModal show={showLeaderboard} onClose={() => setShowLeaderboard(false)} currentUserId={user?.uid} />
        <ManualModal show={showManual} onClose={() => setShowManual(false)} lang={lang} />
      </div>
    </div>
  );
};

export default AppContent;
