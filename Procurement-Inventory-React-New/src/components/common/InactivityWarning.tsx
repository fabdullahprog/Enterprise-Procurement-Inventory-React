 // src/components/common/InactivityWarning.tsx
import { useState, useEffect } from 'react';
import './InactivityWarning.css';

const InactivityWarning = () => {
  const [show, setShow]           = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10); ;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const handleWarning = () => {
      setShow(true);
      setCountdown(10);

      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setShow(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleActivity = () => {
      if (show) {
        setShow(false);
        if (interval) clearInterval(interval);
      }
    };

    window.addEventListener('inactivity-warning', handleWarning);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('inactivity-warning', handleWarning);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (interval) clearInterval(interval);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="warning-overlay">
      <div className="warning-box">
        <div className="warning-icon">⏱️</div>
        <h3>Are you still there?</h3>
        <p>You will be automatically logged out in <strong>{countdown} seconds</strong>.</p>
        <p className="warning-hint">Move your mouse or press any key to stay logged in.</p>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', marginTop: 8 }}
          onClick={() => setShow(false)}
        >
          I'm here, keep me logged in
        </button>
      </div>
    </div>
  );
};

export default InactivityWarning;