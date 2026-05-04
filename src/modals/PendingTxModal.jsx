import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import LoadingButton from '../components/UI/LoadingButton';

const PendingTxModal = ({ pendingTx, setPendingTx, executeTransaction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 錯誤訊息 3 秒後自動消失
  React.useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(t);
  }, [error]);

  if (!pendingTx) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // 🛡️ [Bug Fix] 必須傳遞 source 參數，否則發票會被誤判為手動輸入導致可刪除
      await executeTransaction(
        pendingTx.amount,
        pendingTx.desc,
        pendingTx.category,
        pendingTx.source
      );
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err?.message || '交易執行失敗，請稍後再試');
    } finally {
      setLoading(false);
      // 無論成功或失敗，一律關閉 modal（錯誤會顯示在 battle log）
      setPendingTx(null);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setPendingTx(null);
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-[500] bg-stone-50/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pending-tx-title"
    >
      <div
        className="bg-white border-2 border-[#D7C9B1] rounded-[3rem] p-8 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-6 right-6 p-2 bg-stone-200/50 rounded-full text-stone-500 active:scale-90 transition-all disabled:opacity-30"
          aria-label="關閉"
        >
          <X size={16} />
        </button>

        <h3
          id="pending-tx-title"
          className="text-2xl font-bold text-stone-800 italic text-center mb-6 tracking-tight"
        >
          情報解析完成
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
              項目名稱
            </label>
            <input
              value={pendingTx.desc}
              onChange={(e) => setPendingTx({ ...pendingTx, desc: e.target.value })}
              className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm focus:ring-2 focus:ring-stone-200 outline-none transition-all"
              aria-label="項目名稱"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
              金額
            </label>
            <input
              type="number"
              value={pendingTx.amount}
              onChange={(e) =>
                setPendingTx({
                  ...pendingTx,
                  amount: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-stone-50 border border-stone-100 p-4 rounded-2xl text-stone-800 font-bold text-sm focus:ring-2 focus:ring-stone-200 outline-none transition-all"
              aria-label="金額"
            />
          </div>

          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            variant="primary"
            size="lg"
          >
            確認送出攻擊
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default PendingTxModal;
