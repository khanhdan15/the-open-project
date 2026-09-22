// ─── Industry Pool ───────────────────────────────────────────────────────────
// Claude picks from this randomly so briefs stay diverse across sessions.
// Each scenario is tagged with a scale so briefs span from a single-location
// indie business up to a nationally/globally recognized name — not just
// boutique clients every time. The category tag matches INDUSTRIES in
// lib/theme.js, so a designer's pick on the industry step actually filters
// which scenarios the AI is offered, instead of just relabeling a random one.
const INDUSTRY_POOL = [
  // Food & Hospitality
  { text: "a new café opening in a converted warehouse", scale: "boutique", category: "Food & Hospitality" },
  { text: "a family-run ramen shop expanding to a second location", scale: "boutique", category: "Food & Hospitality" },
  { text: "a natural wine bar with no signage by design", scale: "boutique", category: "Food & Hospitality" },
  { text: "a specialty coffee roaster known for its single-origin sourcing", scale: "boutique", category: "Food & Hospitality" },
  { text: "a ghost kitchen brand launching delivery-only", scale: "growing", category: "Food & Hospitality" },
  { text: "a regional fast-casual chain expanding past its home city", scale: "growing", category: "Food & Hospitality" },
  { text: "a Michelin-starred restaurant group opening a casual sister concept", scale: "growing", category: "Food & Hospitality" },
  { text: "a national coffee chain relaunching its identity for a younger audience", scale: "established", category: "Food & Hospitality" },
  { text: "a legacy hotel group refreshing its identity after a generational handover", scale: "established", category: "Food & Hospitality" },

  // Fashion & Apparel
  { text: "an independent streetwear label dropping its first collection", scale: "boutique", category: "Fashion & Apparel" },
  { text: "a vintage resale shop going online for the first time", scale: "boutique", category: "Fashion & Apparel" },
  { text: "a slow-fashion brand made entirely from deadstock fabric", scale: "boutique", category: "Fashion & Apparel" },
  { text: "a genderless swimwear line launching in summer", scale: "growing", category: "Fashion & Apparel" },
  { text: "a regional denim brand opening its first flagship store", scale: "growing", category: "Fashion & Apparel" },
  { text: "a heritage outerwear brand modernizing after 80 years in business", scale: "established", category: "Fashion & Apparel" },
  { text: "a global sportswear brand launching a limited local capsule collection", scale: "established", category: "Fashion & Apparel" },

  // Culture & Community (arts + social/civic)
  { text: "a contemporary dance company with no permanent venue", scale: "boutique", category: "Culture & Community" },
  { text: "a zine collective publishing quarterly on risograph", scale: "boutique", category: "Culture & Community" },
  { text: "a neighbourhood tool-lending library", scale: "boutique", category: "Culture & Community" },
  { text: "a youth coding club in an underserved suburb", scale: "boutique", category: "Culture & Community" },
  { text: "a mutual aid network formalizing its identity", scale: "boutique", category: "Culture & Community" },
  { text: "an underground music festival in an industrial port", scale: "growing", category: "Culture & Community" },
  { text: "a pop-up art fair running for 72 hours only", scale: "growing", category: "Culture & Community" },
  { text: "a bilingual cultural centre serving two immigrant communities", scale: "growing", category: "Culture & Community" },
  { text: "a city's flagship contemporary art museum rebranding for a new wing", scale: "established", category: "Culture & Community" },
  { text: "a national theatre company modernizing for younger audiences", scale: "established", category: "Culture & Community" },
  { text: "a state-wide public library system redesigning its wayfinding", scale: "established", category: "Culture & Community" },

  // Health & Wellness
  { text: "a women-only climbing gym opening downtown", scale: "boutique", category: "Health & Wellness" },
  { text: "a herbalist apothecary going brick-and-mortar", scale: "boutique", category: "Health & Wellness" },
  { text: "a mental health app built by therapists, not techies", scale: "growing", category: "Health & Wellness" },
  { text: "a queer-friendly therapy collective expanding to three new cities", scale: "growing", category: "Health & Wellness" },
  { text: "a national fitness chain repositioning around mental health, not aesthetics", scale: "established", category: "Health & Wellness" },

  // Tech & Product (kept, but grounded)
  { text: "a privacy-first browser extension for journalists", scale: "boutique", category: "Tech & Product" },
  { text: "a hardware startup making open-source air quality monitors", scale: "boutique", category: "Tech & Product" },
  { text: "a platform connecting freelance translators with NGOs", scale: "growing", category: "Tech & Product" },
  { text: "a co-op ride-share launching in mid-size cities", scale: "growing", category: "Tech & Product" },
  { text: "a unicorn startup rebranding ahead of its IPO", scale: "established", category: "Tech & Product" },
  { text: "a legacy consumer electronics brand relaunching a product line for Gen Z", scale: "established", category: "Tech & Product" },

  // Retail & Objects
  { text: "a candle brand built around scent memories", scale: "boutique", category: "Retail & Objects" },
  { text: "a bookshop specializing in translated fiction only", scale: "boutique", category: "Retail & Objects" },
  { text: "a ceramics studio launching a subscription box", scale: "boutique", category: "Retail & Objects" },
  { text: "a plant shop with a lending library of rare cuttings", scale: "growing", category: "Retail & Objects" },
  { text: "a century-old department store reinventing its flagship experience", scale: "established", category: "Retail & Objects" },

  // Education & Publishing
  { text: "a design school's open-enrolment summer program", scale: "boutique", category: "Education & Publishing" },
  { text: "a children's book publisher focused on Indigenous authors", scale: "boutique", category: "Education & Publishing" },
  { text: "a podcast network for first-generation university students", scale: "growing", category: "Education & Publishing" },
  { text: "a type foundry releasing its first open-source typeface", scale: "growing", category: "Education & Publishing" },
  { text: "a major university rebranding its continuing-education division", scale: "established", category: "Education & Publishing" },

  // Space & Environment
  { text: "a zero-waste architecture studio", scale: "boutique", category: "Space & Environment" },
  { text: "a tiny-home builder targeting remote workers", scale: "boutique", category: "Space & Environment" },
  { text: "a rewilding charity working in post-industrial zones", scale: "growing", category: "Space & Environment" },
  { text: "a solar co-op in a low-income housing complex", scale: "growing", category: "Space & Environment" },
  { text: "a national parks foundation refreshing its brand for a new generation of visitors", scale: "established", category: "Space & Environment" },
]

// Picks n scenarios, guaranteeing a spread across scales (boutique / growing /
// established) rather than defaulting to only small indie businesses.
// When a category is given, only scenarios tagged with it are eligible —
// falls back to the full pool if the category has too few entries.
function pickIndustries(n = 4, category = null) {
  const pool = category ? INDUSTRY_POOL.filter((c) => c.category === category) : INDUSTRY_POOL
  const source = pool.length >= n ? pool : INDUSTRY_POOL

  const shuffled = [...source].sort(() => Math.random() - 0.5)
  const scales = ['boutique', 'growing', 'established']
  const picked = []

  for (const scale of scales) {
    if (picked.length >= n) break
    const match = shuffled.find((c) => c.scale === scale && !picked.includes(c))
    if (match) picked.push(match)
  }
  for (const c of shuffled) {
    if (picked.length >= n) break
    if (!picked.includes(c)) picked.push(c)
  }

  return picked.sort(() => Math.random() - 0.5).map((c) => c.text)
}

// ─── Quick Brief ─────────────────────────────────────────────────────────────
const TIMELINE_GUIDANCE = {
  sprint: 'This is a SPRINT (less than a week). Scope the deliverables down to what a single designer could realistically ship in a few days: a focused, high-impact core (e.g. one key deliverable plus 1-2 supporting pieces), not a full multi-channel rollout. Constraints should mention the tight turnaround explicitly.',
  marathon: 'This is a MARATHON (more than a week). Scope the deliverables up to a fuller system with enough surface area for real exploration and iteration (e.g. a small deliverable set spanning multiple touchpoints). Constraints should reflect the longer runway (more stakeholder rounds, more refinement expected).',
}

function buildPrompt(discipline, { industry, timeline } = {}) {
  const candidates = pickIndustries(4, industry)
  const timelineNote = TIMELINE_GUIDANCE[timeline] || ''

  return `You are a creative director giving a design brief to a designer.
Generate a realistic, open-ended design brief for the discipline: ${discipline}.
${industry ? `The client's industry should be within: ${industry}.` : ''}

Pick ONE of the following client scenarios that interests you most, or invent something equally unexpected within the same industry:
${candidates.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Rules:
- The brief should feel like a real client handoff: specific enough to be grounded, loose enough to allow full creative freedom.
- Vary the client's scale across generations: sometimes a single-location independent business, sometimes a widely recognized regional, national, or global name. Don't default to only small indie businesses; mix it up.
- Make the deliverables, budget/timeline constraints, and tone accurate to that client's real-world scale and industry norms. A neighbourhood café brief should read smaller in scope (tighter budget, faster timeline) than a national retailer brief (multi-channel, longer runway). Get that proportion right.
${timelineNote ? `- ${timelineNote}` : ''}
- Avoid flat, forgettable corporate scenarios (a generic bank tagline, a boilerplate SaaS logo). Even large, established clients should have a specific, textured story behind the ask: something with a real creative hook, not a template.
- Do NOT prescribe visual direction (no "use bold colors" or "minimal aesthetic"). Let the designer interpret freely.
- Make the summary feel written by the actual client, in their voice.
- Write every section like a professional design brief document: short, plain-spoken bullet points, not paragraphs. Each bullet is one clear, complete sentence, summarized rather than elaborated. Think "brief a designer would actually skim," not a pitch.
- Do not use em dashes (—) anywhere in your response. Use periods, commas, or colons instead, and make sure every sentence and bullet reads as a complete, natural thought.

Return ONLY a valid JSON object with exactly these fields, no other text:
{
  "brief_id": "brief-${Date.now()}",
  "title": "short evocative project title (8 words max)",
  "client": "fictional but believable client name",
  "industry": "one industry sector",
  "format": "primary deliverable format (e.g. Visual Identity, Editorial Layout, Campaign, Typeface, Installation)",
  "summary": "2-3 sentences. Who the client is, what they need, and why it matters. Written as if from the client. No visual prescriptions.",
  "details": {
    "Background": ["2-3 short bullets: who the client is and the context behind the project"],
    "Goals": ["2-3 short bullets: what the project needs to achieve"],
    "Target Audience": ["2-3 short bullets: who this is for"],
    "Deliverables": ["2-4 short bullets: specific outputs the designer must produce"],
    "Brand Tone": ["2-3 short bullets: the personality/voice the work should carry"],
    "Constraints": ["2-3 short bullets: real-world limits such as budget, timeline, format, or accessibility"]
  },
  "discipline": "${discipline}",
  "isChallenge": false,
  "status": "ongoing"
}`
}

export async function generateBrief(discipline, options = {}) {
  const response = await fetch('/api/generate-brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildPrompt(discipline, options) }),
  })

  const data = await response.json()
  console.log('API response status:', response.status)
  console.log('API raw data:', JSON.stringify(data))

  if (!response.ok) {
    console.error('API error:', data)
    throw new Error(data.error?.message || 'API request failed')
  }

  const text = data.content[0].text
  console.log('Raw text from Claude:', text)

  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

// ─── Challenge Brief ──────────────────────────────────────────────────────────
function buildChallengePrompt(discipline) {
  const candidates = pickIndustries(3)

  return `You are a creative director running a weekly public design challenge.
Generate a compelling open brief for this week's community challenge.
Discipline: ${discipline}

Pick ONE of the following scenarios as inspiration, or go somewhere equally bold and unexpected:
${candidates.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Rules:
- The brief should feel exciting and ambitious: something a design student or junior designer would be proud to submit publicly.
- Vary the client's scale: sometimes a scrappy local project, sometimes a nationally or globally recognized name taking a creative risk. Don't default to only small indie businesses.
- Keep deliverables and constraints proportional to the client's real scale, and keep it culturally relevant and specific. Avoid flat, textbook corporate scenarios even when the client is large.
- Must be open-ended enough to produce wildly different creative responses from different designers.
- Do NOT prescribe visual direction. Let the designer interpret freely.
- Do not use em dashes (—) anywhere in your response. Use periods, commas, or colons instead, and make sure every sentence reads as a complete, natural thought.

Return ONLY a valid JSON object with exactly these fields, no other text:
{
  "brief_id": "challenge-001",
  "title": "short punchy challenge title (6 words max)",
  "client": "fictional but inspiring client or organization name",
  "industry": "one industry sector",
  "format": "primary deliverable format",
  "summary": "2-3 sentences. The challenge context and why it matters to the design community. Energetic tone: this is public and exciting.",
  "details": {
    "Deliverables": "2-3 specific deliverables",
    "Audience": "who this is for",
    "Tone": "3 adjectives max",
    "Constraints": "1-2 constraints that make it interesting, not limiting",
    "Goal": "one sentence describing what a great submission looks like"
  },
  "discipline": "${discipline}",
  "isChallenge": true,
  "status": "ongoing",
  "categoryColor": "#4a9aba"
}`
}

export async function generateChallengeBrief(discipline) {
  const response = await fetch('/api/generate-brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildChallengePrompt(discipline) }),
  })

  const data = await response.json()
  console.log('Challenge API raw data:', JSON.stringify(data))

  if (!response.ok) {
    console.error('Challenge API error:', data)
    throw new Error(data.error?.message || 'API request failed')
  }

  const text = data.content[0].text
  console.log('Challenge raw text from Claude:', text)

  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}
