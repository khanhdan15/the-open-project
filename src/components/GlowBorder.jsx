import { useLayoutEffect, useRef, useState } from 'react'

// Traveling glow border for selected step-picker cards. Two overlaid SVG
// rounded-rect strokes (pathLength=100, so stroke-dasharray/offset work in
// simple percentage-like units regardless of the card's actual size) — a
// blurred copy for the soft halo, a crisp copy on top for the line — both
// animated via stroke-dashoffset (see .glow-blur/.glow-line in index.css)
// so a short segment of light continuously travels around the frame.
//
// `radius` is a max cap, not a fixed value: for a pill-shaped button (much
// wider than it is tall), a plain SVG rx/ry clamp resolves rx against half
// the WIDTH and ry against half the HEIGHT independently, which produces
// elliptical corners — a visibly "oval" trace instead of a proper stadium.
// CSS `border-radius` avoids this by scaling both axes by the same factor.
// We replicate that here by measuring the rendered box and using a single
// radius equal to min(radius, width / 2, height / 2) for both axes.
export default function GlowBorder({ radius = 20 }) {
  const svgRef = useRef(null)
  const [r, setR] = useState(radius)

  useLayoutEffect(() => {
    const el = svgRef.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width && height) setR(Math.min(radius, width / 2, height / 2))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [radius])

  const rectProps = {
    pathLength: 100,
    x: 1,
    y: 1,
    rx: r,
    style: { width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' },
  }
  return (
    <svg ref={svgRef} className="glow-container" aria-hidden="true">
      <rect {...rectProps} className="glow-blur" />
      <rect {...rectProps} className="glow-line" />
    </svg>
  )
}
