import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { RevealImg } from './Thumb'
import { thumbUrl } from '../lib/images'

// Landing-page hero: a slowly turning 3D ring of project cases (3:4), seen
// from slightly above, with the headline floating in the middle of the ring
// and the search bar underneath it. Title and search are passed in as
// children: the .hero-title-wrap and .hero-search elements are positioned
// by CSS (index.css → "Landing hero").
//
//  - Hover the ring: it pauses; the case under the pointer lifts.
//  - Click a case: the ring turns it to the front, where it faces the viewer
//    and grows 30%. Click it again to open the project (real projects only);
//    click anywhere else to put it back.
//  - Phones: stacked instead (title, then a smaller ring, then search).
//
// Real public projects fill the ring first; remaining cases use sample
// design imagery (free Unsplash photos) so the page looks full while there's
// still little real work posted.

// Free-licence Unsplash photos (unsplash.com/license: free commercial use,
// no attribution required), mixed across disciplines: posters, packaging,
// product/industrial and digital work.
const SAMPLE_IMAGES = [
  '1617825295690-28ae56c56135', // pink & green boxes
  '1584448097764-374f81551427', // vintage travel poster
  '1764737740462-2a310c7b2c39', // eyewear sketches
  '1626320290598-03656e931a31', // cans
  '1543487945-139a97f387d5',    // Helvetica poster
  '1786396965325-84479e1fea48', // 3D-printed part
  '1561070791-2526d30994b5',    // colour swatch book
  '1673297180075-411992cad941', // abstract shapes, orange
  '1585221330389-24fb30535ec7', // white & pink box
  '1558655146-d09347e92766',    // design system on screen
  '1533319417894-6fbb331e5513', // poster wall
  '1633533447057-56ccf997f4fe', // coffee bags
  '1586717791821-3f44a563fa4c', // wireframe sketches
  '1618331833071-ce81bd50d300', // blue & yellow painting
  '1650122597661-ceccf6d50692', // colourful cans
  '1764737734436-7eb904d3a4ab', // caliper + technical drawing
]
const sampleUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=280&h=373&q=70`

// Fewer cases on phones, so the smaller ring stays airy instead of packed.
const CASE_COUNT = 40
const PHONE_CASE_COUNT = 24
const PHONE_QUERY = '(max-width: 768px)'
const subscribePhone = (callback) => {
  const mql = window.matchMedia(PHONE_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}
const getIsPhone = () => window.matchMedia(PHONE_QUERY).matches
const SPIN_SPEED = 0.05 // degrees per frame (~ one turn every 2 minutes)
const TILT = -30 // degrees; how far we look down onto the ring
// Entrance: the ring fades in (CSS), settles from a steeper tilt, and only
// then starts turning, easing up to full speed.
const INTRO_TILT = -14 // extra tilt at the start, eased away
const INTRO_SETTLE = 1.6 // seconds for the tilt to settle
const SPIN_DELAY = 0.7 // seconds before the ring starts turning
const SPIN_RAMP = 2.2 // seconds to ease up to full speed
// Cursor tilt: how far the whole ring leans toward the pointer.
const LEAN_X = 9 // degrees forward/back (pointer up/down)
const LEAN_Z = 7 // degrees sideways (pointer left/right)
const smooth = (t) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Ring radius and case width for a given hero width (and phone or not).
function ringSize(width, phone) {
  if (phone) {
    // Keep the whole ring (radius both sides + a case) inside the screen.
    return { radius: Math.min(200, width * 0.4), caseWidth: Math.max(48, Math.min(70, width * 0.15)) }
  }
  return { radius: Math.min(540, width * 0.37), caseWidth: Math.max(66, Math.min(108, width * 0.068)) }
}

// `ringCenter` (optional) is shown in the middle of the ring — used on phones
// for a small badge (see .hero-ring-badge in index.css).
export default function HeroShowcase({ projects = [], onOpenProject, searching = false, ringCenter, children }) {
  const heroRef = useRef(null)
  const sceneRef = useRef(null)
  const ringRef = useRef(null)
  const spin = useRef(0)
  const target = useRef(null)
  const hovering = useRef(false)
  const pointer = useRef({ x: 0, y: 0 }) // where the cursor is, -1..1
  const lean = useRef({ x: 0, z: 0 }) // current (smoothed) lean
  const openRef = useRef(false)
  const [openIndex, setOpenIndex] = useState(null)
  const isPhone = useSyncExternalStore(subscribePhone, getIsPhone, () => false)
  const caseCount = isPhone ? PHONE_CASE_COUNT : CASE_COUNT

  const real = projects.filter((p) => p.coverImage || p.image || p.images?.[0])
  const cases = Array.from({ length: caseCount }, (_, i) => {
    const project = real[i]
    if (project) {
      const src = project.coverImage || project.image || project.images[0]
      return { project, src: thumbUrl(src), fallback: src }
    }
    return { src: sampleUrl(SAMPLE_IMAGES[(i - real.length) % SAMPLE_IMAGES.length]) }
  })

  // Size the ring to the hero (CSS variables, set directly: no re-render).
  useEffect(() => {
    const hero = heroRef.current
    const scene = sceneRef.current
    if (!hero || !scene) return
    const resize = () => {
      const phone = getIsPhone()
      const { radius, caseWidth } = ringSize(hero.offsetWidth, phone)
      scene.style.setProperty('--R', `${radius}px`)
      scene.style.setProperty('--cw', `${caseWidth}px`)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  // Turn the ring: fades in, settles, then turns slowly on its own (easing
  // to a stop while hovered), leans toward the cursor, and eases to a
  // clicked case when one is open. Written straight to the element's style
  // every frame, so it never re-renders React.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let speed = 0 // 0..1 of SPIN_SPEED
    let frame
    const tick = (now) => {
      const t = (now - start) / 1000
      const ramp = reduced ? 0 : smooth((t - SPIN_DELAY) / SPIN_RAMP)
      const wanted = hovering.current ? 0 : ramp
      speed += (wanted - speed) * 0.06

      if (target.current !== null) spin.current += (target.current - spin.current) * 0.08
      else spin.current -= SPIN_SPEED * speed

      // Lean toward the pointer (flat again while a case is open, so it
      // faces the viewer squarely).
      const p = openRef.current || reduced ? { x: 0, y: 0 } : pointer.current
      lean.current.x += (p.y * LEAN_X - lean.current.x) * 0.06
      lean.current.z += (p.x * LEAN_Z - lean.current.z) * 0.06

      const intro = reduced ? 0 : INTRO_TILT * (1 - smooth(t / INTRO_SETTLE))
      if (ringRef.current) {
        ringRef.current.style.transform =
          `rotateZ(${lean.current.z.toFixed(3)}deg) rotateX(${(TILT + intro + lean.current.x).toFixed(3)}deg) rotateY(${spin.current.toFixed(3)}deg)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const handlePointerMove = (e) => {
    if (!canHover()) return
    const rect = sceneRef.current.getBoundingClientRect()
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    }
  }

  const close = () => {
    target.current = null
    openRef.current = false
    setOpenIndex(null)
  }

  const handleCaseClick = (e, i) => {
    e.stopPropagation()
    if (openIndex === i) {
      if (cases[i].project) onOpenProject?.(cases[i].project)
      return
    }
    // Turn the shortest way round so this case ends up at the front.
    const angle = (i * 360) / caseCount
    const delta = ((((-angle - spin.current) % 360) + 540) % 360) - 180
    target.current = spin.current + delta
    openRef.current = true
    setOpenIndex(i)
  }

  return (
    <section ref={heroRef} className={`hero-showcase${searching ? ' is-searching' : ''}`}>
      <div
        ref={sceneRef}
        className="ring-scene"
        aria-hidden={searching}
        onMouseEnter={() => { hovering.current = true }}
        onMouseMove={handlePointerMove}
        onMouseLeave={() => { hovering.current = false; pointer.current = { x: 0, y: 0 } }}
        onClick={close}
      >
        <div ref={ringRef} className={`ring${openIndex !== null ? ' has-open' : ''}`}>
          {cases.map((c, i) => (
            <div
              key={i}
              className={`ring-card img-placeholder${c.project ? ' is-project' : ''}${openIndex === i ? ' is-open' : ''}`}
              style={{ '--a': `${(i * 360) / caseCount}deg` }}
              onClick={(e) => handleCaseClick(e, i)}
              role={c.project ? 'button' : undefined}
              tabIndex={c.project ? 0 : undefined}
              onKeyDown={c.project ? (e) => { if (e.key === 'Enter') handleCaseClick(e, i) } : undefined}
              title={c.project ? c.project.title || 'Untitled' : undefined}
            >
              <RevealImg src={c.src} fallbackSrc={c.fallback} alt={c.project ? c.project.title || 'Project' : ''} />
            </div>
          ))}
        </div>
        {ringCenter}
      </div>

      <div className="hero-center">{children}</div>
    </section>
  )
}
