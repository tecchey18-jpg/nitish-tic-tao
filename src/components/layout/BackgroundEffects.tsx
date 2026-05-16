import { ParticleField } from '../effects/ParticleField';

export const BackgroundEffects = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(0,245,255,.22),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(255,43,214,.2),transparent_28%),radial-gradient(circle_at_50%_92%,rgba(156,255,46,.13),transparent_34%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]" />
    <div className="absolute left-0 top-0 h-full w-px bg-cyan/60 shadow-[0_0_30px_#00f5ff]" />
    <div className="absolute right-0 top-0 h-full w-px bg-fuchsia/60 shadow-[0_0_30px_#ff2bd6]" />
    <ParticleField />
  </div>
);
