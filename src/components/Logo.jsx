import logo from '../assets/logo-horizontal.png'

// The real Open Ruler mark — the drawn logo file, not a redrawn approximation.
// Native art is 788x387 (roughly 2.04:1), so height drives the sizing and
// width follows to keep it undistorted.
const RATIO = 788 / 387

export default function Logo({ size = 34 }) {
  return (
    <img
      src={logo}
      alt="Open Ruler"
      style={{ height: size, width: size * RATIO, display: 'block', objectFit: 'contain' }}
    />
  )
}
