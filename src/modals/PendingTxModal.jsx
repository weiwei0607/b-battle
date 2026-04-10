import React from 'react';

const PendingTxModal = ({ pendingTx, setPendingTx, executeTransaction }) => {
  if (!pendingTx) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-stone-50/90 backdrop-blur-sm flex items-center justify-center p-8" onClick={() => setPendingTx(null)}>
      <div className="bg-white border-2 border-[#D7C9B1] rounded-[3rem] p-8 w-full max-w-sm shadow-xl animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-stone-800 italic text-center mb-6 tracking-tight">情報解析完成</h3>
        <div className="space-y-4">
          <input 
            value={pendingTx.desc} 
            onChange={e => setPendingTx({...pendingTx, desc: e.target.value})} 
            className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm" 
          />
          <input 
            type="number" 
            value={pendingTx.amount} 
            onChange={e => setPendingTx({...pendingTx, amount: parseInt(e.target.value)||0})} 
            className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm" 
          />
          <button 
            onClick={() => { 
              // 🛡️ [Bug Fix] 必須傳遞 source 參數，否則發票會被誤判為手動輸入導致可刪除
              executeTransaction(pendingTx.amount, pendingTx.desc, pendingTx.category, pendingTx.source); 
              setPendingTx(null); 
            }} 
            className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold uppercase text-xs shadow-xl active:scale-95"
          >
            確認送出攻擊
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTxModal;
