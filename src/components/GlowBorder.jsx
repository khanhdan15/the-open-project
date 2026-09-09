// Traveling glow border for selected step-picker cards. Two overlaid SVG
// rounded-rect strokes (pathLength=100, so stroke-dasharray/offset work in
// simple percentage-like units regardless of the card's actual size) — a
// blurred copy for the soft halo, a crisp copy on top for the line — both
// animated via stroke-dashoffset (see .glow-blur/.glow-line in index.css)
// so a short segment of light continuously travels around the frame.
export default function GlowBorder({ radius = 20 }) {
  const rectProps = {
    pathLength: 100,
    x: 1,
    y: 1,
    rx: radius,
    style: { width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' },
  }
  return (
    <svg className="glow-container" aria-hidden="true">
      <rect {...rectProps} className="glow-blur" />
      <rect {...rectProps} className="glow-line" />
    </svg>
  )
}
