import type { DiagramSpec } from "@/lib/strategies/types";

interface Props {
  spec: DiagramSpec;
  className?: string;
}

const W = 560;
const H = 220;
const PAD = 24;

// Map a 0..100 y-value to SVG coords (flip — higher y in data = higher visually).
function plotY(y: number): number {
  return H - PAD - ((y / 100) * (H - 2 * PAD));
}

function plotX(i: number, n: number): number {
  return PAD + (i / Math.max(1, n - 1)) * (W - 2 * PAD);
}

function pathFor(points: number[]): string {
  return points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${plotX(i, points.length)} ${plotY(y)}`)
    .join(" ");
}

export function StrategyDiagram({ spec, className }: Props) {
  const n = spec.points.length;
  const pricePath = pathFor(spec.points);
  const refPath = spec.refLine ? pathFor(spec.refLine.points) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Strategy pattern diagram"
    >
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="hsl(217 33% 17%)"
            strokeWidth="0.5"
          />
        </pattern>
        <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#grid)" opacity="0.4" />

      {/* Stop / target zones */}
      {spec.stopY != null && (
        <>
          <rect
            x={PAD}
            y={plotY(spec.stopY)}
            width={W - 2 * PAD}
            height={H - PAD - plotY(spec.stopY)}
            fill="hsl(0 84% 60%)"
            opacity="0.06"
          />
          <line
            x1={PAD}
            x2={W - PAD}
            y1={plotY(spec.stopY)}
            y2={plotY(spec.stopY)}
            stroke="hsl(0 84% 60%)"
            strokeDasharray="4 3"
            strokeWidth="1"
          />
          <text
            x={W - PAD - 4}
            y={plotY(spec.stopY) - 4}
            fill="hsl(0 84% 75%)"
            fontSize="10"
            textAnchor="end"
          >
            Stop
          </text>
        </>
      )}
      {spec.targetY != null && (
        <>
          <line
            x1={PAD}
            x2={W - PAD}
            y1={plotY(spec.targetY)}
            y2={plotY(spec.targetY)}
            stroke="hsl(160 84% 39%)"
            strokeDasharray="4 3"
            strokeWidth="1"
          />
          <text
            x={W - PAD - 4}
            y={plotY(spec.targetY) - 4}
            fill="hsl(160 84% 55%)"
            fontSize="10"
            textAnchor="end"
          >
            Target
          </text>
        </>
      )}

      {/* Reference line (MA, VWAP) */}
      {refPath && spec.refLine && (
        <>
          <path d={refPath} fill="none" stroke="hsl(45 80% 60%)" strokeWidth="1.5" strokeDasharray="3 3" />
          <text
            x={W - PAD - 4}
            y={plotY(spec.refLine.points[spec.refLine.points.length - 1]) + 14}
            fill="hsl(45 80% 70%)"
            fontSize="10"
            textAnchor="end"
          >
            {spec.refLine.label}
          </text>
        </>
      )}

      {/* Price path with area fill */}
      <path
        d={`${pricePath} L ${plotX(n - 1, n)} ${H - PAD} L ${plotX(0, n)} ${H - PAD} Z`}
        fill="url(#priceFill)"
      />
      <path d={pricePath} fill="none" stroke="hsl(239 84% 67%)" strokeWidth="2" />

      {/* Highlights */}
      {spec.highlights?.map((h) => (
        <g key={h.x}>
          <circle
            cx={plotX(h.x, n)}
            cy={plotY(spec.points[h.x])}
            r="4"
            fill="hsl(239 84% 67%)"
            stroke="hsl(224 50% 8%)"
            strokeWidth="1.5"
          />
          <text
            x={plotX(h.x, n)}
            y={plotY(spec.points[h.x]) - 10}
            fill="hsl(210 40% 95%)"
            fontSize="10"
            textAnchor="middle"
            fontWeight="600"
          >
            {h.label}
          </text>
        </g>
      ))}

      {/* Entry marker */}
      {spec.entryIdx != null && (
        <line
          x1={plotX(spec.entryIdx, n)}
          x2={plotX(spec.entryIdx, n)}
          y1={PAD}
          y2={H - PAD}
          stroke="hsl(160 84% 55%)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.6"
        />
      )}
    </svg>
  );
}
