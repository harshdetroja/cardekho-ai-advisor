# CarDekho AI Advisor

An AI-powered car recommendation engine that helps confused buyers go from "I don't know what to buy" to "I'm confident about my shortlist."

**Live:** [Deployed on Vercel](https://cardekho-ai-advisor.vercel.app)

---

## What did you build and why?

### The Problem

Traditional car research platforms rely on search-and-filter — which assumes the buyer already knows what they want. But the brief says the buyer is *confused*. Filters don't help someone who can't articulate their needs into dropdowns.

### The Solution

A **hybrid input system** where users describe their needs in natural language ("I live in Bangalore with 2 kids, need something safe for city driving") combined with a few required structured fields (budget, family size, primary use). The AI understands intent, extracts preferences, and returns a **personalized shortlist** — not just a filtered list, but recommendations with:

- **"Why this car for you"** — spec-anchored reasoning tied to the user's specific needs (e.g., "24.79 kmpl — highest mileage in your budget" not "great fuel economy")
- **"What to consider"** — honest tradeoffs for every car, because trust comes from acknowledging what's *not* perfect
- **"Why we didn't recommend X"** — explains why popular cars were excluded, which builds confidence in what *was* recommended
- **Assumption chips** — shows the AI's interpretation of vague inputs, letting users correct misunderstandings without a back-and-forth

### The Core Insight

The gap isn't information — CarDekho already has all the specs. The gap is **decision confidence**. Users don't need more data, they need someone to say "given YOUR specific situation, here's what makes sense and here's why." That's what this tool does.

### What was deliberately cut

| Cut | Rationale |
|---|---|
| User accounts / login | The value is in the first interaction — no need to gate it behind auth |
| Dealer integration / booking | That's post-decision. Our problem is pre-decision |
| Full car detail pages | The shortlist with reasoning is the deliverable. Deep-dive can link to CarDekho's existing pages |
| User reviews | Used ratings and curated praise/criticism as a proxy — keeps data manageable |
| Real-time pricing APIs | Static ex-showroom prices are sufficient for comparison and recommendation |
| Database | Static JSON dataset loaded server-side — no DB setup overhead for 35 cars |
| Image assets | Used spec cards instead — information density over visual browsing |

These aren't missing features — they're deliberate scoping decisions. Each is a logical v2/v3 addition, not a gap in the core experience.

---

## Features

### v1 — Core Experience
- **Hybrid input** — free-text + required fields (budget, family size, primary use)
- **AI-powered recommendations** — 3-5 personalized car picks from a 35-car dataset
- **Spec-anchored claims** — every AI claim references actual spec values
- **Honest tradeoffs** — mandatory "What to consider" section on every card
- **Match strength badges** — Strong / Good / Stretch visual confidence indicators
- **Assumption chips** — shows what the AI understood from vague input
- **Side-by-side comparison** — select 2-3 cars, compare across 12 specs
- **Edge case handling** — off-topic detection, constraint relaxation, retry logic, malformed JSON handling

### v2 — Intelligence Layer
- **Example prompts** — 4 clickable starter queries that auto-fill the form, solving the cold-start problem
- **Follow-up conversation memory** — refinements ("show me diesel options") carry the original context
- **Excluded cars reasoning** — "Why we didn't recommend Creta" with spec-backed explanations

### v3 — Accessibility
- **Multilingual input** — type in Hindi, Tamil, Telugu, Marathi, Gujarati, or any Indian language
- **Voice input** — mic button using Web Speech API, works in Indian English
- **Shareable shortlist** — one-click copy of formatted summary for WhatsApp sharing

---

## Edge Cases Handled

| Edge Case | Strategy |
|---|---|
| No cars match constraints | Relax lowest-priority constraint (fuel → transmission → body type → budget). Show banner explaining what was relaxed |
| Vague input ("good car for family") | Sensible defaults + editable assumption chips. Avoids follow-up round trips |
| Off-topic / nonsense input | `is_car_query` boolean in LLM response — short-circuits to friendly redirect |
| Malformed JSON from LLM | Groq JSON mode minimizes this. Retry once on failure. Graceful fallback message |
| LLM recommends car not in dataset | LLM returns only car IDs — backend does the lookup. Invalid IDs are silently filtered |
| Contradictory inputs ("7-seater SUV under 8L") | AI flags the contradiction in assumptions, recommends closest realistic options |
| API quota / rate limits | Retry with backoff. User-friendly error messages (not raw API errors) |

---

## Tech Stack and Why

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Single deployable unit — frontend + API routes in one project. No separate backend server to manage. SSR for fast initial load |
| **Language** | TypeScript | Type safety for car data schema and LLM response parsing. Catches malformed AI responses at compile time |
| **Styling** | Tailwind CSS | Rapid UI iteration. No component library overhead — every element is purpose-built for this specific UI |
| **AI/LLM** | Groq (Llama 3.3 70B Versatile) | Generous free tier (30 RPM). Native JSON mode (`response_format: json_object`) reduces parsing failures. Sub-2-second response times — critical for UX. Initially tried Google Gemini but hit free-tier quota limits |
| **Data** | Static JSON (35 cars) | No database setup overhead. Cars loaded server-side once. For 35 records, a DB adds complexity without benefit |
| **Deployment** | Vercel | One-click deploy from GitHub. Auto-deploys on push. Free tier with edge functions |

### Why not a vector DB / RAG approach?

With 35 cars, the entire catalog fits in the LLM's context window (~2K tokens for the compressed catalog). Embedding + retrieval adds latency and complexity for zero benefit at this scale. The LLM sees all cars and makes a holistic recommendation — which is actually *better* than RAG here because it can compare across the full catalog.

---

## What was delegated to AI tools vs. done manually?

### Delegated to AI (Cursor + Claude)

- **Boilerplate and scaffolding** — Next.js project setup, TypeScript interfaces, Tailwind component structure. These are mechanical tasks where AI saves time without sacrificing quality.
- **Component code** — Car cards, comparison table, form inputs. The AI generated the JSX + Tailwind classes based on the product spec we'd defined together. This was the biggest time saver — the AI could produce well-structured, accessible components faster than manual coding.
- **System prompt engineering** — The AI helped iterate on the Groq system prompt structure (JSON schema, rules, mappings). The prompt went through several refinements to get spec-anchored outputs.
- **Edge case implementation** — Error handling patterns, retry logic, constraint relaxation in the API route. Standard patterns where AI's code is reliable.
- **Bug fixes** — When `relaxed_constraints` showed `[object Object]`, the AI diagnosed the issue (LLM returning objects vs strings) and added normalization at both the API and frontend layers.

### Done manually (human decisions)

- **Product scoping and feature prioritization** — What to build, what to cut, and why. The AI helped brainstorm but the decisions were human.
- **Edge case identification** — The list of edge cases (vague input, contradictions, off-topic, no-match scenarios) came from thinking about real user behavior, not generated.
- **Trust signals design** — The decision to require spec-anchored claims, mandatory tradeoffs, and excluded-car reasoning was a product design choice about building user confidence.
- **Architecture decisions** — Choosing hybrid input over pure chat, static JSON over a database, ID-only LLM responses over full car details — these required understanding the tradeoffs.
- **Dataset curation** — The 35-car dataset with praise/criticism arrays, friendliness scores, and review summaries was manually researched and compiled with Google's help.
- **Testing and QA** — Manual testing of multilingual inputs, voice recognition, and edge case scenarios.

### Where AI tools helped most

**Component generation was the biggest win.** The product spec was well-defined by the time we started coding, so the AI could translate requirements into working code with high accuracy. A 700+ line `page.tsx` with car cards, comparison tables, form handling, and result display — doing this manually would have taken 2-3x longer.

**Prompt engineering iteration** was the second win. The AI could rapidly restructure the system prompt and test different output formats.

### Where they got in the way

- **Environment/tooling issues** — The AI couldn't directly debug the Gemini API quota problem. It took multiple attempts to figure out the key was permanently exhausted (not rate-limited), wasting ~10 minutes before switching to Groq.
- **TypeScript types for browser APIs** — The Web Speech API isn't well-typed in TypeScript. The AI's first two attempts at typing `SpeechRecognition` failed the build, requiring a pragmatic `any` cast.
- **Over-confidence in first attempts** — The initial `relaxed_constraints` rendering worked in test but broke when the LLM returned objects instead of strings. The AI's generated code assumed consistent LLM output format — which is never guaranteed.

---

## If you had another 4 hours, what would you add?

### Hour 1-2: Conversational flow

Replace the single-shot input with a **multi-turn chat interface**. The current hybrid input works, but a true conversation would let the AI ask clarifying questions naturally ("You mentioned safety — do you also want ADAS features like lane assist?") and progressively narrow down options. This would handle the "truly confused" buyer better than any form.

### Hour 2-3: Richer data layer

- **Multiple variants per car** — Currently one variant per model. A buyer asking for "Creta diesel automatic" gets no result. Adding 2-3 key variants per model (different fuel/transmission combos) would dramatically improve recommendation accuracy.
- **Real pricing API** — Connect to a pricing feed so recommendations show on-road prices, not just ex-showroom. On-road price is what buyers actually pay.
- **User reviews integration** — Pull in summarized user reviews to add real-world ownership perspectives alongside spec data.

### Hour 3-4: Decision support

- **EMI calculator** — Show monthly payments for each recommendation. Budget in EMI terms is how most Indian buyers think about affordability.
- **Total cost of ownership** — Factor in insurance, fuel costs, service intervals, and resale value projections. A car that's cheap to buy but expensive to run should score differently.
- **Dealer proximity** — Show nearest service centers for each brand. Service network is a genuine concern for brands like Skoda/VW in tier-2/3 cities.
- **PDF export** — Generate a shareable comparison PDF that buyers can take to the dealership or discuss with family.

---

## Project Structure

```
src/
├── app/
│   ├── api/recommend/route.ts  # POST endpoint — orchestrates LLM + car lookup
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main UI — input form + results + comparison
│   └── globals.css             # Tailwind base styles
├── lib/
│   ├── cars.ts                 # Car data loader and utility functions
│   └── gemini.ts               # Groq/LLM integration — prompt + response parsing
├── types/
│   └── car.ts                  # TypeScript interfaces for car, input, and AI response
data/
└── cars.json                   # Curated dataset of 35 popular Indian cars
```

## Getting Started

### Prerequisites

- Node.js 18+
- Groq API key ([console.groq.com](https://console.groq.com))

### Setup

```bash
npm install

echo "GROQ_API_KEY=your_key_here" > .env

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy

Deploy via [Vercel](https://vercel.com) — connect your GitHub repo and add `GROQ_API_KEY` as an environment variable.
