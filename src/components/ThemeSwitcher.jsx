import React, { useEffect, useState } from 'react';
import { Palette, LayoutTemplate } from 'lucide-react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('minimalist'); // 'minimalist', 'classic', 'dark'
  const [layout, setLayout] = useState('grid'); // 'grid', 'restaurant'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-layout', layout);
  }, [layout]);

  return (
    <div className="theme-switcher">
      <div className="theme-group">
        <Palette size={18} className="theme-icon-small" />
        <button className={theme === 'minimalist' ? 'active' : ''} onClick={() => setTheme('minimalist')}>Modern</button>
        <button className={theme === 'classic' ? 'active' : ''} onClick={() => setTheme('classic')}>Classic</button>
        <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
      </div>
      <div className="theme-divider"></div>
      <div className="theme-group">
        <LayoutTemplate size={18} className="theme-icon-small" />
        <button className={layout === 'grid' ? 'active' : ''} onClick={() => setLayout('grid')}>Cards</button>
        <button className={layout === 'restaurant' ? 'active' : ''} onClick={() => setLayout('restaurant')}>Menu</button>
      </div>
    </div>
  );
}
