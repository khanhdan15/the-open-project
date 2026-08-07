// ─── Industry Pool ───────────────────────────────────────────────────────────
// Claude picks from this randomly so briefs stay diverse across sessions.
// Each scenario is tagged with a scale so briefs span from a single-location
// indie business up to a nationally/globally recognized name — not just
// boutique clients every time.
const INDUSTRY_POOL = [
  // Food & Hospitality
  { text: "a new café opening in a converted warehouse", scale: "boutique" },
  { text: "a family-run ramen shop expanding to a second location", scale: "boutique" },
  { text: "a natural wine bar with no signage by design", scale: "boutique" },
  { text: "a specialty coffee roaster known for its single-origin sourcing", scale: "boutique" },
  { text: "a ghost kitchen brand launching delivery-only", scale: "growing" },
  { text: "a regional fast-casual chain expanding past its home city", scale: "growing" },
  { text: "a Michelin-starred restaurant group opening a casual sister concept", scale: "growing" },
  { text: "a national coffee chain relaunching its identity for a younger audience", scale: "established" },
  { text: "a legacy hotel group refreshing its identity after a generational handover", scale: "established" },

  // Fashion & Apparel
  { text: "an independent streetwear label dropping its first collection", scale: "boutique" },
  { text: "a vintage resale shop going online for the first time", scale: "boutique" },
  { text: "a slow-fashion brand made entirely from deadstock fabric", scale: "boutique" },
  { text: "a genderless swimwear line launching in summer", scale: "growing" },
  { text: "a regional denim brand opening its first flagship store", scale: "growing" },
  { text: "a heritage outerwear brand modernizing after 80 years in business", scale: "established" },
  { text: "a global sportswear brand launching a limited local capsule collection", scale: "established" },

  // Culture & Arts
  { text: "a contemporary dance company with no permanent venue", scale: "boutique" },
  { text: "a zine collective publishing quarterly on risograph", scale: "boutique" },
  { text: "an underground music festival in an industrial port", scale: "growing" },
  { text: "a pop-up art fair running for 72 hours only", scale: "growing" },
  { text: "a city's flagship contemporary art museum rebranding for a new wing", scale: "established" },
  { text: "a national theatre company modernizing for younger audiences", scale: "established" },

  // Social & Community
  { text: "a neighbourhood tool-lending library", scale: "boutique" },
  { text: "a youth coding club in an underserved suburb", scale: "boutique" },
  { text: "a mutual aid network formalizing its identity", scale: "boutique" },
  { text: "a bilingual cultural centre serving two immigrant communities", scale: "growing" },
  { text: "a state-wide public library system redesigning its wayfinding", scale: "established" },

  // Health & Wellness
  { text: "a women-only climbing gym opening downtown", scale: "boutique" },
  { text: "a herbalist apothecary going brick-and-mortar", scale: "boutique" },
  { text: "a mental health app built by therapists, not techies", scale: "growing" },
  { text: "a queer-friendly therapy collective expanding to three new cities", scale: "growing" },
  { text: "a national fitness chain repositioning around mental health, not aesthetics", scale: "established" },

  // Tech & Product (kept, but grounded)
  { text: "a privacy-first browser extension for journalists", scale: "boutique" },
  { text: "a hardware startup making open-source air quality monitors", scale: "boutique" },
  { text: "a platform connecting freelance translators with NGOs", scale: "growing" },
  { text: "a co-op ride-share launching in mid-size cities", scale: "growing" },
  { text: "a unicorn startup rebranding ahead of its IPO", scale: "established" },
  { text: "a legacy consumer electronics brand relaunching a product line for Gen Z", scale: "established" },

  // Retail & Objects
  { text: "a candle brand built around scent memories", scale: "boutique" },
  { text: "a bookshop specializing in translated fiction only", scale: "boutique" },
  { text: "a ceramics studio launching a subscription box", scale: "boutique" },
  { text: "a plant shop with a lending library of rare cuttings", scale: "growing" },
  { text: "a century-old department store reinventing its flagship experience", scale: "established" },

  // Education & Publishing
  { text: "a design school's open-enrolment summer program", scale: "boutique" },
  { text: "a children's book publisher focused on Indigenous authors", scale: "boutique" },
  { text: "a podcast network for first-generation university students", scale: "growing" },
  { text: "a type foundry releasing its first open-source typeface", scale: "growing" },
  { text: "a major university rebranding its continuing-education division", scale: "established" },

  // Space & Environment
  { text: "a zero-waste architecture studio", scale: "boutique" },
  { text: "a tiny-home builder targeting remote workers", scale: "boutique" },
  { text: "a rewilding charity working in post-industrial zones", scale: "growing" },
  { text: "a solar co-op in a low-income housing complex", scale: "growing" },
  { text: "a national parks foundation refreshing its brand for a new generation of visitors", scale: "established" },
]

// Picks n scenarios, guaranteeing a spread across scales (boutique / growing /
// established) rather than defaulting to only small indie businesses.
function pickIndustries(n = 4) {
  const shuffled = [...INDUSTRY_POOL].sort(() => Math.random() - 0.5)
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
function buildPrompt(discipline) {
  const candidates = pickIndustries(4)

  return `You are a creative director giving a design brief to a designer.
Generate a realistic, open-ended design brief for the discipline: ${discipline}.

Pick ONE of the following client scenarios that interests you most — or invent something equally unexpected:
${candidates.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Rules:
- The brief should feel like a real client handoff — specific enough to be grounded, loose enough to allow full creative freedom.
- Vary the client's scale across generations: sometimes a single-location independent business, sometimes a widely recognized regional, national, or global name. Don't default to only small indie businesses — mix it up.
- Make the deliverables, budget/timeline constraints, and tone accurate to that client's real-world scale and industry norms. A neighbourhood café brief should read smaller in scope (tighter budget, faster timeline) than a national retailer brief (multi-channel, longer runway) — get that proportion right.
- Avoid flat, forgettable corporate scenarios (a generic bank tagline, a boilerplate SaaS logo). Even large, established clients should have a specific, textured story behind the ask — something with a real creative hook, not a template.
- Do NOT prescribe visual direction (no "use bold colors" or "minimal aesthetic"). Let the designer interpret freely.
- Make the summary feel written by the actual client, in their voice.

Return ONLY a valid JSON object with exactly these fields, no other text:
{
  "brief_id": "brief-${Date.now()}",
  "title": "short evocative project title (8 words max)",
  "client": "fictional but believable client name",
  "industry": "one industry sector",
  "format": "primary deliverable format (e.g. Visual Identity, Editorial Layout, Campaign, Typeface, Installation)",
  "summary": "2-3 sentences. Who the client is, what they need, and why it matters. Written as if from the client. No visual prescriptions.",
  "details": {
    "Deliverables": "2-4 specific deliverables",
    "Audience": "who this is for",
    "Tone": "3 adjectives max",
    "Constraints": "1-2 real-world constraints (budget, timeline, format restriction)",
    "Goal": "one clear sentence on what success looks like"
  },
  "discipline": "${discipline}",
  "isChallenge": false,
  "status": "ongoing"
}`
}

export async function generateBrief(discipline) {
  const response = await fetch('/api/generate-brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildPrompt(discipline) }),
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

Pick ONE of the following scenarios as inspiration — or go somewhere equally bold and unexpected:
${candidates.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Rules:
- The brief should feel exciting and ambitious — something a design student or junior designer would be proud to submit publicly.
- Vary the client's scale: sometimes a scrappy local project, sometimes a nationally or globally recognized name taking a creative risk. Don't default to only small indie businesses.
- Keep deliverables and constraints proportional to the client's real scale, and keep it culturally relevant and specific — avoid flat, textbook corporate scenarios even when the client is large.
- Must be open-ended enough to produce wildly different creative responses from different designers.
- Do NOT prescribe visual direction. Let the designer interpret freely.

Return ONLY a valid JSON object with exactly these fields, no other text:
{
  "brief_id": "challenge-001",
  "title": "short punchy challenge title (6 words max)",
  "client": "fictional but inspiring client or organization name",
  "industry": "one industry sector",
  "format": "primary deliverable format",
  "summary": "2-3 sentences. The challenge context and why it matters to the design community. Energetic tone — this is public and exciting.",
  "details": {
    "Deliverables": "2-3 specific deliverables",
    "Audience": "who this is for",
    "Tone": "3 adjectives max",
    "Constraints": "1-2 constraints that make it interesting, not limiting",
    "Goal": "one sentence — what a great submission looks like"
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
