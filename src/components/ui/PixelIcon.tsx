const GRID = 8;

type IconName = "lightning" | "gamepad" | "card" | "robot" | "note";

interface IconDef {
  pixels: [number, number][];
  color: string;
}

const ICONS: Record<IconName, IconDef> = {
  lightning: {
    color: "#FFD700",
    pixels: [
      [4, 0],
      [3, 1], [4, 1],
      [2, 2], [3, 2],
      [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
      [3, 4], [4, 4],
      [2, 5], [3, 5],
      [1, 6], [2, 6],
    ],
  },
  gamepad: {
    color: "#00f3ff",
    pixels: [
      [3, 1], [4, 1],
      [2, 2], [3, 2], [4, 2], [5, 2],
      [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
      [1, 4], [3, 4], [4, 4], [6, 4],
      [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5],
      [2, 6], [5, 6],
    ],
  },
  card: {
    color: "#ff00ff",
    pixels: [
      [3, 0],
      [2, 1], [3, 1], [4, 1],
      [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
      [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
      [1, 4], [2, 4], [4, 4], [5, 4],
      [3, 5],
      [2, 6], [3, 6], [4, 6],
    ],
  },
  robot: {
    color: "#c0c0c0",
    pixels: [
      [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
      [1, 1], [3, 1], [4, 1], [6, 1],
      [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
      [2, 3], [3, 3], [4, 3], [5, 3],
      [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
      [1, 5], [3, 5], [4, 5], [6, 5],
      [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
      [2, 7], [5, 7],
    ],
  },
  note: {
    color: "#ff00ff",
    pixels: [
      [3, 0], [4, 0], [5, 0],
      [3, 1], [5, 1],
      [3, 2],
      [3, 3],
      [3, 4],
      [1, 5], [2, 5], [3, 5],
      [0, 6], [1, 6], [2, 6], [3, 6],
      [1, 7], [2, 7],
    ],
  },
};

interface PixelIconProps {
  name: IconName;
  size?: number;
}

export default function PixelIcon({ name, size = 32 }: PixelIconProps) {
  const icon = ICONS[name];
  if (!icon) return null;

  const scale = size / GRID;
  const shadow = icon.pixels
    .map(([x, y]) => `${x}px ${y}px 0 ${icon.color}`)
    .join(", ");

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "inline-block",
        position: "relative",
        verticalAlign: "middle",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1px",
          height: "1px",
          boxShadow: shadow,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
