import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface NebulaTooltipProps {
  content: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const NebulaTooltip: React.FC<NebulaTooltipProps> = ({
  content,
  title,
  children,
  side = 'bottom',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      if (side === 'bottom') {
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
      } else if (side === 'top') {
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
      } else if (side === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
      } else {
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
      }

      setCoords({ top, left });
    }
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => updateCoords();
      const handleResize = () => updateCoords();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
      {isVisible && content && ReactDOM.createPortal(
        <div
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: side === 'bottom' || side === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: 1100,
          }}
          className={`fixed bg-slate-900 text-white text-[11px] rounded-xl p-2.5 shadow-2xl w-48 pointer-events-none animate-in fade-in zoom-in-95 duration-100 ${className}`}
        >
          {title && <div className="font-bold mb-0.5">{title}</div>}
          <div className="text-slate-300 text-[10px] leading-tight">{content}</div>
        </div>,
        document.body
      )}
    </div>
  );
};
