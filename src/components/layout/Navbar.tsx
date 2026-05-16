import { Crosshair, Home, Settings } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { NeonButton } from '../ui/NeonButton';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const Navbar = () => {
  const page = useUiStore((state) => state.page);
  const setPage = useUiStore((state) => state.setPage);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-void/76 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <button
          className="group flex items-center gap-3 text-left"
          onClick={() => setPage('home')}
          aria-label="Open Neon Nexus home"
        >
          <span className="grid h-11 w-11 place-items-center rounded-md border border-cyan/40 bg-cyan/10 text-cyan shadow-neon">
            <Crosshair size={21} />
          </span>
          <span>
            <span className="block font-display text-lg font-black uppercase text-white">Neon Nexus</span>
            <span className="block text-xs font-semibold uppercase text-cyan/70">Holographic arena</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <NeonButton variant={page === 'home' ? 'primary' : 'ghost'} onClick={() => setPage('home')}>
            <Home size={16} />
            <span className="hidden sm:inline">Home</span>
          </NeonButton>
          <NeonButton variant={page === 'settings' ? 'secondary' : 'ghost'} onClick={() => setPage('settings')}>
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </NeonButton>
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
};
