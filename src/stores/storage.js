// Shared localStorage helpers — same keys as App.jsx bb_v4_ prefix
export const load = (k, fallback) => {
  try {
    const v = localStorage.getItem('bb_v4_' + k);
    if (!v || v === 'null') return fallback;
    const p = JSON.parse(v);
    return p !== null ? p : fallback;
  } catch {
    return fallback;
  }
};

export const save = (k, v) => localStorage.setItem('bb_v4_' + k, JSON.stringify(v));
