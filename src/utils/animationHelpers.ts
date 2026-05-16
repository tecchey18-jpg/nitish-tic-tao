export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const glowStyle = (color: string, intensity = 0.45) => ({
  boxShadow: `0 0 22px ${color}${Math.round(intensity * 255)
    .toString(16)
    .padStart(2, '0')}, inset 0 0 18px ${color}26`
});

export const particleSeed = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    x: (index * 47) % 100,
    y: (index * 83) % 100,
    delay: (index % 9) * 0.22,
    size: 2 + (index % 4)
  }));
