import React, { useState } from 'react';
import { auth, googleProvider, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('請輸入電子郵件和密碼');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('該電子郵件已被註冊');
      else if (err.code === 'auth/invalid-credential') setError('電子郵件或密碼錯誤');
      else if (err.code === 'auth/weak-password') setError('密碼強度太弱');
      else setError('發生錯誤：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // 🚀 使用 Redirect 模式以解決 disallowed_useragent 問題
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google 登入尚未在 Firebase Console 中啟用');
      } else if (err.code === 'auth/popup-blocked') {
        setError('登入視窗被瀏覽器攔截，請允許彈出視窗');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('登入視窗已關閉');
      } else {
        setError(`Google 登入失敗 (${err.code})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-stone-800 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-3xl font-black mb-8 text-center tracking-tight">
          {isRegistering ? '註冊帳號' : '登入 B-Battle'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-1">電子郵件</label>
            <input
              type="email"
              className="w-full bg-stone-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-1">密碼</label>
            <input
              type="password"
              className="w-full bg-stone-50 border-none px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-stone-800 text-white font-black py-4 rounded-xl mt-4 active:scale-95 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '處理中...' : (isRegistering ? '立即註冊' : '登入')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6 opacity-50">
          <div className="flex-1 h-px bg-stone-300"></div>
          <span className="text-xs font-bold uppercase tracking-widest">或</span>
          <div className="flex-1 h-px bg-stone-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full bg-white border-2 border-stone-100 text-stone-800 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-stone-50 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 24c2.87 0 5.28-.95 7.04-2.58l-3.57-2.77c-.95.64-2.17 1.02-3.47 1.02-2.68 0-4.95-1.81-5.76-4.25H2.5v2.85C4.26 21.75 7.82 24 12 24z" />
            <path fill="#FBBC05" d="M6.24 15.42c-.2-.6-.32-1.25-.32-1.92s.12-1.32.32-1.92V8.73H2.5C1.79 10.16 1.39 11.75 1.39 13.5s.4 3.34 1.11 4.77l3.74-2.85z" />
            <path fill="#EA4335" d="M12 4.98c1.56 0 2.96.54 4.07 1.6l3.05-3.05C17.28 1.68 14.87 0 12 0 7.82 0 4.26 2.25 2.5 5.73l3.74 2.85c.81-2.44 3.08-4.25 5.76-4.25z" />
          </svg>
          使用 Google 帳號登入
        </button>

        <p className="mt-8 text-center text-sm font-medium text-stone-500">
          {isRegistering ? '已經有帳號了？ ' : '還沒有帳號？ '}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-blue-500 font-bold underline underline-offset-4"
          >
            {isRegistering ? '登入' : '註冊'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
