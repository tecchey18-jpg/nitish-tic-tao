import { Trophy } from 'lucide-react';
import { usePlayerTurns } from '../hooks/usePlayerTurns';
import { getLeader } from '../utils/scoreHelpers';
import { GlassPanel } from '../components/ui/GlassPanel';

export const ResultsPage = () => {
  const { activePlayers } = usePlayerTurns();
  const leader = getLeader(activePlayers);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <GlassPanel intense className="p-6 text-center">
        <Trophy className="mx-auto mb-4 text-solar" size={42} />
        <h1 className="font-display text-4xl font-black text-white">Results</h1>
        <p className="mt-3 text-slate-300">{leader ? `${leader.name} leads the nexus with ${leader.score} points.` : 'No rounds played yet.'}</p>
      </GlassPanel>
    </div>
  );
};
