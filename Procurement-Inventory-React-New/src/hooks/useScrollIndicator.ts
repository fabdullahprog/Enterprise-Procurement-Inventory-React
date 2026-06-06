// src/hooks/useScrollIndicator.ts
import { useEffect } from 'react';

export const useScrollIndicator = () => {
  useEffect(() => {
    let indicator: HTMLDivElement | null = null;
    let hideTimeout: number;

    const createIndicator = () => {
      indicator = document.createElement('div');
      indicator.id = 'scroll-indicator';
      indicator.style.cssText = `
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 70px;
        background: rgba(45, 55, 72, 0.95);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        font-weight: 700;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-family: 'Courier New', monospace;
      `;
      document.body.appendChild(indicator);
    };

    const updateIndicator = () => {
      if (!indicator) createIndicator();
      if (!indicator) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      const pageNumber = Math.ceil(scrollPercent / 10) || 1; // Divide into 10 pages

      indicator.textContent = `${pageNumber}`;
      indicator.style.opacity = '1';

      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        if (indicator) indicator.style.opacity = '0';
      }, 1500);
    };

    window.addEventListener('scroll', updateIndicator);

    return () => {
      window.removeEventListener('scroll', updateIndicator);
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
      clearTimeout(hideTimeout);
    };
  }, []);
};
