// ─── Industry Pool ───────────────────────────────────────────────────────────
// Claude picks from this randomly so briefs stay diverse across sessions
const INDUSTRY_POOL = [
  // Food & Hospitality
  "a new café opening in a converted warehouse",
  "a family-run ramen shop expanding to a second location",
  "a natural wine bar with no signage by design",
  "a ghost kitchen brand launching delivery-only",
  "a rooftop beekeeping collective selling urban honey",

  // Fashion & Apparel
  "an independent streetwear label dropping its first collection",
  "a vintage resale shop going online for the first time",
  "a slow-fashion brand made entirely from deadstock fabric",
  "a genderless swimwear line launching in summer",
  "a skate brand collaborating with a local muralist",

  // Culture & Arts
  "a contemporary dance company with no permanent venue",
  "an underground music festival in an industrial port",
  "a zine collective publishing quarterly on risograph",
  "a pop-up art fair running for 72 hours only",
  "a community radio station moving to FM for the first time",

  // Social & Community
  "a neighbourhood tool-lending library",
  "a youth coding club in an underserved suburb",
  "a mutual aid network formalizing its identity",
  "a community garden converting a parking lot",
  "a bilingual cultural centre serving two immigrant communities",

  // Health & Wellness
  "a women-only climbing gym opening downtown",
  "a mental health app built by therapists, not techies",
  "a herbalist apothecary going brick-and-mortar",
  "a queer-friendly therapy collective",
  "a sleep clinic rebranding away from clinical aesthetics",

  // Tech & Product (kept, but grounded)
  "a privacy-first browser extension for journalists",
  "a hardware startup making open-source air quality monitors",
  "a co-op ride-share launching in mid-size cities",
  "a platform connecting freelance translators with NGOs",
  "a tool that helps renters track landlord repair requests",

  // Retail & Objects
  "a candle brand built around scent memories",
  "a bookshop specializing in translated fiction only",
  "a ceramics studio launching a subscription box",
  "a plant shop with a lending library of rare cuttings",
  "a concept store selling only objects made within 100km",

  // Education & Publishing
  "a design school's open-enrolment summer program",
  "a children's book publisher focused on Indigenous authors",
  "a documentary photography magazine going print-first",
  "a podcast network for first-generation university students",
  "a type foundry releasing its first open-source typeface",

  // Space & Environment
  "a zero-waste architecture studio",
  "a urban cycling infrastructure advocacy group",
  "a rewilding charity working in post-industrial zones",
  "a tiny-home builder targeting remote workers",
  "a solar co-op in a low-income housing complex",
]

function pickIndustries(n = 4) {
  const shuffled = [...INDUSTRY_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
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
- Avoid fintech, banking, SaaS, or generic corporate clients unless the scenario above calls for it.
- Do NOT prescribe visual direction (no "use bold colors" or "minimal aesthetic"). Let the designer interpret freely.
- The client should feel like a real, interesting small-to-mid organization — not a Fortune 500.
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
- Avoid fintech, banking, or generic corporate contexts.
- Must be open-ended enough to produce wildly different creative responses from different designers.
- Do NOT prescribe visual direction. Let the designer interpret freely.
- The client/organization should feel culturally relevant, not textbook.

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
