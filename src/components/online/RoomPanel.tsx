import { useState } from 'react';
import { Copy, Link2, LogIn, LogOut, Wifi } from 'lucide-react';
import { buildRoomSnapshot } from '../../utils/roomSnapshot';
import { useGameActions } from '../../hooks/useGameLogic';
import { useRoomStore } from '../../store/roomStore';
import { useUiStore } from '../../store/uiStore';
import { GlassPanel } from '../ui/GlassPanel';
import { NeonButton } from '../ui/NeonButton';

interface RoomPanelProps {
  compact?: boolean;
}

export const RoomPanel = ({ compact = false }: RoomPanelProps) => {
  const [joinCode, setJoinCode] = useState('');
  const [busyAction, setBusyAction] = useState<'create' | 'join' | null>(null);
  const [copied, setCopied] = useState(false);
  const mode = useRoomStore((state) => state.mode);
  const connectionState = useRoomStore((state) => state.connectionState);
  const endpoint = useRoomStore((state) => state.endpoint);
  const roomId = useRoomStore((state) => state.roomId);
  const role = useRoomStore((state) => state.role);
  const seatPlayerId = useRoomStore((state) => state.seatPlayerId);
  const connectedPlayers = useRoomStore((state) => state.connectedPlayers ?? []);
  const errorMessage = useRoomStore((state) => state.errorMessage);
  const createRoom = useRoomStore((state) => state.createRoom);
  const joinRoom = useRoomStore((state) => state.joinRoom);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const setPage = useUiStore((state) => state.setPage);
  const { startMatch } = useGameActions();
  const isBusy = busyAction !== null || connectionState === 'connecting';

  const handleCreateRoom = async () => {
    setBusyAction('create');
    setCopied(false);
    startMatch({ playerCount: 2, aiMode: false });
    const created = await createRoom(buildRoomSnapshot());
    if (created) setPage('game');
    setBusyAction(null);
  };

  const handleJoinRoom = async () => {
    setBusyAction('join');
    setCopied(false);
    const joined = await joinRoom(joinCode);
    if (joined) setPage('game');
    setBusyAction(null);
  };

  const copyRoomCode = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <GlassPanel className={compact ? 'p-4' : 'p-5'}>
      <div className="relative z-10 grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wifi size={18} className="text-cyan" />
            <h2 className="font-display text-lg font-black text-white">Online Room</h2>
          </div>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase text-slate-300">
            {connectionState}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-slate-400">Server {endpoint}</p>

        {mode === 'online' && roomId ? (
          <div className="grid gap-3">
            <div className="grid gap-2 rounded-md border border-cyan/20 bg-cyan/10 p-3">
              <span className="text-[10px] font-bold uppercase text-cyan">Room Code</span>
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-2xl font-black tracking-normal text-white">{roomId}</span>
                <button
                  className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 text-cyan"
                  onClick={copyRoomCode}
                  aria-label="Copy room code"
                >
                  <Copy size={16} />
                </button>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                {copied ? 'Copied' : `${connectedPlayers.length}/2 players connected`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase text-slate-300">
              <span className="rounded-md border border-white/10 bg-white/5 px-3 py-2">{role}</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-3 py-2">{seatPlayerId}</span>
            </div>

            <NeonButton variant="ghost" onClick={leaveRoom}>
              <LogOut size={16} />
              Leave
            </NeonButton>
          </div>
        ) : (
          <div className="grid gap-3">
            <NeonButton onClick={handleCreateRoom} disabled={isBusy}>
              <Link2 size={16} />
              {busyAction === 'create' ? 'Creating' : 'Create Room'}
            </NeonButton>
            <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-white/10 bg-white/5">
              <input
                className="min-w-0 bg-transparent px-3 py-2 font-display text-sm font-black uppercase text-white outline-none placeholder:text-slate-500"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                maxLength={6}
                aria-label="Room code"
              />
              <button
                className="grid h-10 w-11 place-items-center border-l border-white/10 text-cyan disabled:opacity-40"
                disabled={isBusy}
                onClick={handleJoinRoom}
                aria-label="Join room"
              >
                <LogIn size={16} />
              </button>
            </div>
          </div>
        )}

        {errorMessage && <p className="text-xs font-semibold text-red-200">{errorMessage}</p>}
      </div>
    </GlassPanel>
  );
};
