import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Neon Mint', value: '#8CFF9E' },
  { name: 'Sky Blue', value: '#60A5FA' },
  { name: 'Electric Violet', value: '#A78BFA' },
  { name: 'Sunset Orange', value: '#FB923C' },
  { name: 'Hot Pink', value: '#F472B6' },
  { name: 'Silver White', value: '#FFFFFF' },
];

export const AccentSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#8CFF9E');
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize from root CSS or localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio_accent_color');
      if (saved) {
        setCurrentColor(saved);
        applyAccentColor(saved);
      }
    } catch {
      // Fallback silently if storage unavailable
    }
  }, []);

  const applyAccentColor = (color: string) => {
    try {
      document.documentElement.style.setProperty('--accent', color);
      const hex = color.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
        document.documentElement.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.12)`);
      }
      localStorage.setItem('portfolio_accent_color', color);
    } catch {
      // Ignore storage errors
    }
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
    applyAccentColor(color);
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      {/* 36px glass circle with minimal palette outline icon */}
      <button
        ref={buttonRef}
        type="button"
        aria-label="Change portfolio accent color"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 backdrop-blur-md text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] group cursor-pointer"
        style={{
          boxShadow: isOpen ? '0 0 16px var(--accent-glow)' : 'none',
        }}
      >
        <Palette className="w-4 h-4 text-[#e3e2e6] group-hover:text-white transition-colors duration-200" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Accent color palette options"
          className="absolute right-0 top-12 z-50 w-52 p-3 rounded-2xl bg-[#141414]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200 select-none"
        >
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-2 px-1">
            Accent Theme
          </div>

          <div className="grid grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((preset) => {
              const isSelected = currentColor.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.name}
                  aria-label={`Select ${preset.name} theme`}
                  onClick={() => handleColorSelect(preset.value)}
                  className="w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  style={{
                    backgroundColor: preset.value,
                    boxShadow: isSelected ? `0 0 10px ${preset.value}` : 'inset 0 0 2px rgba(0,0,0,0.4)',
                  }}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${preset.value === '#FFFFFF' ? 'text-black' : 'text-black'}`} strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom color picker */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
            <span className="text-[12px]">Custom</span>
            <label className="relative flex items-center gap-2 cursor-pointer group">
              <span
                className="w-5 h-5 rounded-full border border-white/30 inline-block shadow-inner group-hover:scale-105 transition-transform"
                style={{ backgroundColor: currentColor }}
              />
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="sr-only"
                aria-label="Custom color picker"
              />
              <span className="text-[11px] font-mono text-white/60 group-hover:text-white transition-colors">
                {currentColor.toUpperCase()}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
