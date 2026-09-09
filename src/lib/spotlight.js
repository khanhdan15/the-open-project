// Shared mousemove handler for the cursor-follow spotlight hover effect
// (see .spotlight-card in index.css). Writes --mouse-x/--mouse-y as inline
// custom properties directly onto the DOM node so the radial-gradient
// pseudo-element can track the cursor without triggering a React re-render
// on every mousemove.
export function handleSpotlightMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
}
