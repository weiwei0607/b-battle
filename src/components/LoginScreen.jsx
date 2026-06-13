import React, { useState } from 'react';
import { auth, googleProvider, signInWithRedirect, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../firebase';
import LoadingButton from './UI/LoadingButton';
import ErrorMessage from './UI/ErrorMessage';

/* ── 羅馬柱頭裝飾 SVG ─── */
const CapitalOrnament = () => (
  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" aria-hidden="true">
    <line x1="0" y1="23" x2="80" y2="23" stroke="#D8CFC3" strokeWidth="1"/>
    <line x1="8" y1="18" x2="72" y2="18" stroke="#D8CFC3" strokeWidth="0.75"/>
    <path d="M8 18 Q40 6 72 18" stroke="#C5A140" strokeWidth="0.8" fill="none" opacity="0.6"/>
    <circle cx="40" cy="8" r="2.5" fill="#C5A140" opacity="0.7"/>
    <circle cx="14" cy="18" r="1.5" fill="#D8CFC3"/>
    <circle cx="66" cy="18" r="1.5" fill="#D8CFC3"/>
  </svg>
);

const LoginScreen = ({ isModal = false, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('請輸入電子郵件和密碼'); return; }
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (isModal && onClose) onClose();
    } catch (err) {
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
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(`Google 登入失敗 (${err.code})`);
      setLoading(false);
    }
  };

  /* ── 表單卡片 ── */
  const content = (
    <div className="w-full max-w-md marble-card-elevated rounded-3xl p-8" style={{ background: '#FAF8F4' }}>
      {/* 卡片標題 */}
      <h2 className="font-cinzel text-lg font-semibold text-center mb-5 tracking-wider"
        style={{ color: '#2A2218', letterSpacing: '0.08em' }}>
        {isRegistering ? 'REGISTER' : 'ENTER THE ARENA'}
      </h2>

      {/* 金色分隔線 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #D8CFC3)' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: '#C5A140', opacity: 0.7 }} />
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #D8CFC3)' }} />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <form onSubmit={handleEmailAuth} className="space-y-4 mb-5">
        <div>
          <label htmlFor="login-email"
            className="block text-[11px] font-semibold mb-1.5 tracking-widest uppercase"
            style={{ color: '#6B5B45', fontFamily: 'Cinzel, serif' }}>
            電子郵件
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className="w-full px-4 py-3.5 rounded-2xl text-sm input-roman disabled:opacity-50"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="login-password"
            className="block text-[11px] font-semibold mb-1.5 tracking-widest uppercase"
            style={{ color: '#6B5B45', fontFamily: 'Cinzel, serif' }}>
            密碼
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            className="w-full px-4 py-3.5 rounded-2xl text-sm input-roman disabled:opacity-50"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-xs font-cinzel font-semibold tracking-[0.18em] uppercase btn-gold disabled:opacity-50"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          {loading ? '驗證中…' : isRegistering ? 'Join the Legion' : 'Enter Battle'}
        </button>
      </form>

      {/* OR 分隔 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: '#D8CFC3', opacity: 0.6 }} />
        <span className="text-[10px] tracking-[0.2em] uppercase font-cinzel" style={{ color: '#B8A898' }}>or</span>
        <div className="flex-1 h-px" style={{ background: '#D8CFC3', opacity: 0.6 }} />
      </div>

      {/* Google 登入 */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 text-sm font-semibold transition-all disabled:opacity-50 active:scale-[0.98]"
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--stone-line)',
          color: 'var(--stone-dark)',
          boxShadow: '0 2px 6px rgba(42,34,24,0.06)',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#C5A140'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--stone-line)'}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 24c2.87 0 5.28-.95 7.04-2.58l-3.57-2.77c-.95.64-2.17 1.02-3.47 1.02-2.68 0-4.95-1.81-5.76-4.25H2.5v2.85C4.26 21.75 7.82 24 12 24z"/>
          <path fill="#FBBC05" d="M6.24 15.42c-.2-.6-.32-1.25-.32-1.92s.12-1.32.32-1.92V8.73H2.5C1.79 10.16 1.39 11.75 1.39 13.5s.4 3.34 1.11 4.77l3.74-2.85z"/>
          <path fill="#EA4335" d="M12 4.98c1.56 0 2.96.54 4.07 1.6l3.05-3.05C17.28 1.68 14.87 0 12 0 7.82 0 4.26 2.25 2.5 5.73l3.74 2.85c.81-2.44 3.08-4.25 5.76-4.25z"/>
        </svg>
        以 Google 帳號繼續
      </button>

      {/* 切換登入 / 註冊 */}
      <p className="mt-7 text-center text-[12px]" style={{ color: '#B8A898' }}>
        {isRegistering ? '已有帳號？ ' : '尚未加入？ '}
        <button
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="font-semibold underline underline-offset-4 transition-colors"
          style={{ color: '#6B5B45' }}
          onMouseEnter={e => e.currentTarget.style.color = '#C5A140'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B5B45'}
        >
          {isRegistering ? '登入' : '立即加入'}
        </button>
      </p>
    </div>
  );

  if (isModal) return content;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--cream)' }}>

      {/* 大理石紋路光暈 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(197,161,64,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* 頂部羅馬紋樣線條 */}
      <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #C5A140 30%, #D4B55A 50%, #C5A140 70%, transparent 100%)', opacity: 0.4 }} />

      {/* ── 品牌區 ── */}
      <div className="text-center mb-10 relative z-10 bb-slide-up">
        {/* 裝飾性柱頭 */}
        <div className="flex justify-center mb-6">
          <CapitalOrnament />
        </div>

        {/* 品牌名 */}
        <h1 className="font-cinzel text-[2.2rem] font-black tracking-[0.15em] mb-2"
          style={{ color: '#2A2218', letterSpacing: '0.15em' }}>
          B·BATTLE
        </h1>

        {/* 金色細橫線 */}
        <div className="flex items-center justify-center gap-3 my-3">
          <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #C5A140)' }} />
          <div className="w-1 h-1 rounded-full" style={{ background: '#C5A140' }} />
          <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #C5A140)' }} />
        </div>

        <p className="text-[11px] tracking-[0.3em] uppercase font-cinzel"
          style={{ color: '#B8A898', fontFamily: 'Cinzel, serif' }}>
          意志力決鬥場
        </p>
      </div>

      {/* ── 卡片 ── */}
      <div className="relative z-10 w-full max-w-md bb-slide-up delay-200">
        {content}
      </div>

      {/* 底部裝飾文字 */}
      <p className="mt-8 text-[10px] tracking-[0.25em] relative z-10 bb-fade-in delay-500 font-cinzel"
        style={{ color: '#C5A140', opacity: 0.6, fontFamily: 'Cinzel, serif' }}>
        GUARD THE PILLARS · DEFEND THE BUDGET
      </p>

      {/* 底部羅馬線 */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #D8CFC3 30%, #D8CFC3 70%, transparent)' }} />
    </div>
  );
};

export default LoginScreen;
