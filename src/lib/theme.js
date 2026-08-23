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
}

// The four brief-generator disciplines, with the exact background/text
// colors from the visual identity mockups.
export const DISCIPLINES = [
  {
    name: 'Brand & Identity',
    color: '#53401A',
    textColor: '#F1EADA',
    items: ['Branding', 'Packaging', 'Visual identity'],
  },
  {
    name: 'Print & Type',
    color: '#FFEFEF',
    textColor: '#0A0A0A',
    items: ['Editorial', 'Typeface', 'Poster'],
  },
  {
    name: 'Digital & Screen',
    color: '#82DFFD',
    textColor: '#0A0A0A',
    items: ['Editorial', 'Typeface', 'Poster'],
  },
  {
    name: 'Image & Direction',
    color: '#A40011',
    textColor: '#FFFFFF',
    items: ['Branding', 'Packaging', 'Visual identity'],
  },
]

export const TIMELINES = [
  { id: 'sprint', name: 'Sprint', duration: '1 WEEK', color: '#F4CACA' },
  { id: 'marathon', name: 'Marathon', duration: '3 WEEKS', color: '#5CB9FC' },
]

// Industry categories — the middle step of the brief flow (discipline →
// industry → timeline). Names match the category tags on INDUSTRY_POOL in
// generateBrief.js so a pick here actually filters which client scenarios
// the AI is offered, instead of just changing a label.
export const INDUSTRIES = [
  { name: 'Food & Hospitality', color: '#E8A659', items: ['Cafés & restaurants', 'Hotels', 'Beverage brands'] },
  { name: 'Fashion & Apparel', color: '#F3D6E8', items: ['Streetwear', 'Swimwear', 'Heritage labels'] },
  { name: 'Culture & Community', color: '#9ED6C9', items: ['Arts & music', 'Public institutions', 'Mutual aid'] },
  { name: 'Health & Wellness', color: '#CFE8A8', items: ['Fitness', 'Mental health', 'Apothecary'] },
  { name: 'Tech & Product', color: '#A8C5F0', items: ['Startups', 'Hardware', 'Platforms'] },
  { name: 'Retail & Objects', color: '#F0C99B', items: ['Shops', 'Ceramics', 'Department stores'] },
  { name: 'Education & Publishing', color: '#D9C7F0', items: ['Schools', 'Publishers', 'Type foundries'] },
  { name: 'Space & Environment', color: '#B8DCE0', items: ['Architecture', 'Sustainability', 'Parks'] },
]

export function disciplineColor(name) {
  return DISCIPLINES.find((d) => d.name === name)?.color || COLORS.panelGray
}

export function disciplineTextColor(name) {
  return DISCIPLINES.find((d) => d.name === name)?.textColor || COLORS.ink
}
