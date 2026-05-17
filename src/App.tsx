import { AnimatePresence } from 'framer-motion';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { Navbar } from './components/layout/Navbar';
import { PageTransition } from './components/layout/PageTransition';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useGameLogic } from './hooks/useGameLogic';
import { useUiStore } from './store/uiStore';

const pages = {
  home: HomePage,
  game: GamePage,
  settings: SettingsPage,
  results: ResultsPage
};

export const App = () => {
  useGameLogic();
  const page = useUiStore((state) => state.page);
  const ActivePage = pages[page];

  return (
    <>
      <BackgroundEffects />
      <Navbar />
      <AnimatePresence mode="wait">
        <PageTransition key={page}>
          <ActivePage />
        </PageTransition>
      </AnimatePresence>
    </>
  );
};
