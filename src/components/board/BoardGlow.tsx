interface BoardGlowProps {
  color: string;
}

export const BoardGlow = ({ color }: BoardGlowProps) => (
  <div
    className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-60 blur-2xl"
    style={{
      background: `radial-gradient(circle, ${color}35 0%, transparent 64%)`
    }}
  />
);
