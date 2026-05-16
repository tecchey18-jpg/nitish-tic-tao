import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { NeonButton } from './NeonButton';
import { GlassPanel } from './GlassPanel';

interface AnimatedModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const AnimatedModal = ({ open, title, onClose, children }: AnimatedModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-void/72 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <GlassPanel intense className="w-full max-w-lg p-6">
          <div className="relative z-10 mb-5 flex items-center justify-between">
            <h2 className="font-display text-2xl font-black text-white">{title}</h2>
            <NeonButton variant="ghost" className="h-10 w-10 px-0" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </NeonButton>
          </div>
          <div className="relative z-10">{children}</div>
        </GlassPanel>
      </motion.div>
    )}
  </AnimatePresence>
);
