import React, { useRef, useCallback } from 'react';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  title?: string;
}

export default function GlowButton({ children, onClick, className = '', disabled = false, type = 'button', style, title }: GlowButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Ripple effect
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.className = 'ripple';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    onClick?.(e);
  }, [onClick, disabled]);

  return (
    <button
      ref={btnRef}
      type={type}
      className={`btn-glow ripple-container ${className}`}
      onClick={handleClick}
      disabled={disabled}
      style={style}
      title={title}
    >
      {children}
    </button>
  );
}
