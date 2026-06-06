import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useAutoLogout = (timeoutMinutes: number = 15): void => {
  const { isAuthenticated, logout } = useAuth();
  const navigate   = useNavigate();
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  // Warning সবসময় timeout এর অর্ধেক সময়ে আসবে
  // কিন্তু সর্বোচ্চ ১০ সেকেন্ড আগে
  const WARNING_MS = Math.max(TIMEOUT_MS - 10 * 1000, TIMEOUT_MS / 2);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    if (timerRef.current)   clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('inactivity-warning'));
    }, WARNING_MS);

    timerRef.current = setTimeout(async () => {
      await logout();
      navigate('/login', { state: { reason: 'inactivity' } });
    }, TIMEOUT_MS);

  }, [isAuthenticated, logout, navigate, TIMEOUT_MS, WARNING_MS]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events: string[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current)   clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAuthenticated, resetTimer]);
};

export default useAutoLogout;