function buildPrompt(discipline) {
  return `You are a creative director giving a design brief to a designer.
Generate a realistic, open-ended design brief for the discipline: ${discipline}.

The brief should feel like a real client handoff — specific enough to
be grounded, loose enough to allow full creative freedom.
Do not over-specify visual direction. Let the designer interpret.

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

function buildChallengePrompt(discipline) {
  return `You are a creative director running a weekly public design challenge.
Generate a compelling open brief for this week's community challenge.
Discipline: ${discipline}

The brief should feel exciting and ambitious — something a design student
or junior designer would be proud to take on publicly.
It must be open-ended enough to allow wildly different creative responses.
Do not prescribe visual direction. Let the designer interpret freely.

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
