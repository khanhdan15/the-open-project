// Shared visual identity tokens — single source of truth so colors stay in
// sync across the discipline picker, portfolio folders, and project cards.

export const COLORS = {
  ink: '#0A0A0A',
  paper: '#FFFFFF',
  paperCream: '#F9F9F1',
  panelGray: '#D4D4D4',
  placeholderPink: '#FFEFEF',
  accentBlue: '#83C7F9',
  accentBlueDark: '#2F4454',
  accentPink: '#D86077',
  gridLine: '#F1A1B2',
  pillGray: '#F9F9F9',
  // Brief result page info-block palette — two dark blocks (dark bg, white
  // text) alternating with light purple/blue blocks (dark olive text).
  blockDark: '#595020',
  blockDarkText: '#FFFFFF',
  blockPurple: '#FAF1FE',
  blockBlue: '#CDEEFD',
  blockLightText: '#595020',
  // Dark theme — used only inside the brief generator flow (discipline /
  // industry / timeline pickers + the brief result page). Card fills keep
  // their normal light colors and pop against this backdrop.
  darkBg: '#141414',
  darkCard: '#1A1A1A',
  darkText: '#F0F0F0',
  darkBorder: 'rgba(255,255,255,0.15)',
  darkMuted: 'rgba(255,255,255,0.5)',
}

// The four brief-generator disciplines. Each pairs a saturated background
// with a vivid `accentColor` for the title (so it pops off the block) and a
// separate, calmer `textColor` for the item list underneath — the same
// "color combo" language as the reference palette (West Coast / Thistle
// Green / Bismark / Woody Brown).
export const DISCIPLINES = [
  {
    name: 'Brand & Identity',
    color: '#595020',
    accentColor: '#C9DDE3',
    textColor: '#F1EADA',
    items: ['Branding', 'Packaging', 'Visual identity'],
  },
  {
    name: 'Print & Type',
    color: '#CDC9A0',
    accentColor: '#CC3333',
    textColor: '#4A3F24',
    items: ['Editorial', 'Typeface', 'Poster'],
  },
  {
    name: 'Digital & Screen',
    color: '#3E7A8C',
    accentColor: '#D9E8A0',
    textColor: '#FFFFFF',
    items: ['Editorial', 'Typeface', 'Poster'],
  },
  {
    name: 'Image & Direction',
    color: '#2E1512',
    accentColor: '#C6E86E',
    textColor: '#FFFFFF',
    items: ['Branding', 'Packaging', 'Visual identity'],
  },
]

// "Timeline" step — id stays sprint/marathon (matches TIMELINE_GUIDANCE in
// generateBrief.js), display name uses the same running metaphor shown on
// the combined brief-creation page.
export const TIMELINES = [
  { id: 'sprint', name: 'Sprint', description: 'Focused projects, streamlined process', color: '#7A2E1E', accentColor: '#C9DDE3', textColor: 'rgba(255,255,255,0.75)' },
  { id: 'marathon', name: 'Marathon', description: 'Complex projects, deeper collaboration', color: '#3E7A8C', accentColor: '#D9E8A0', textColor: 'rgba(255,255,255,0.75)' },
]

// Industry categories — the middle step of the brief flow (discipline →
// industry → timeline). Names match the category tags on INDUSTRY_POOL in
// generateBrief.js so a pick here actually filters which client scenarios
// the AI is offered, instead of just changing a label. Each pairs a
// saturated background with a vivid `accentColor` for the title and a
// calmer `textColor` for the item list, matching the DISCIPLINES palette.
export const INDUSTRIES = [
  { name: 'Food & Hospitality', color: '#7A2E1E', accentColor: '#C9DDE3', textColor: '#FFFFFF', items: ['Cafés & restaurants', 'Hotels', 'Beverage brands'] },
  { name: 'Fashion & Apparel', color: '#E8C9D6', accentColor: '#A6304A', textColor: '#4A2530', items: ['Streetwear', 'Swimwear', 'Heritage labels'] },
  { name: 'Culture & Community', color: '#3E7A8C', accentColor: '#D9E8A0', textColor: '#FFFFFF', items: ['Arts & music', 'Public institutions', 'Mutual aid'] },
  { name: 'Health & Wellness', color: '#4B5320', accentColor: '#C6E86E', textColor: '#F1EADA', items: ['Fitness', 'Mental health', 'Apothecary'] },
  { name: 'Tech & Product', color: '#28425C', accentColor: '#9FD8FF', textColor: '#FFFFFF', items: ['Startups', 'Hardware', 'Platforms'] },
  { name: 'Retail & Objects', color: '#CDBB8E', accentColor: '#B4432B', textColor: '#3A2A17', items: ['Shops', 'Ceramics', 'Department stores'] },
  { name: 'Education & Publishing', color: '#4A2545', accentColor: '#E3C9F0', textColor: '#FFFFFF', items: ['Schools', 'Publishers', 'Type foundries'] },
  { name: 'Space & Environment', color: '#1F3B3D', accentColor: '#9FE0C9', textColor: '#FFFFFF', items: ['Architecture', 'Sustainability', 'Parks'] },
]

export function disciplineColor(name) {
  return DISCIPLINES.find((d) => d.name === name)?.color || COLORS.panelGray
}

export function disciplineTextColor(name) {
  return DISCIPLINES.find((d) => d.name === name)?.textColor || COLORS.ink
}
