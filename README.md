# CarDekho AI Advisor

An AI-powered car recommendation engine that helps confused buyers go from "I don't know what to buy" to "I'm confident about my shortlist."

## Problem

Car buyers are overwhelmed with options. Traditional search-and-filter requires users to already know what they want. This tool works differently — users describe their needs in natural language, and AI finds the best matches with personalized reasoning.

## How It Works

1. **Hybrid Input** — Users describe their needs in free text + select budget, family size, and primary use
2. **AI Analysis** — Groq (Llama 3.3 70B) understands intent, extracts preferences, and matches against a curated dataset of 35 popular Indian cars
3. **Personalized Shortlist** — 3-5 car recommendations with spec-anchored "why this car for you" reasoning and honest tradeoffs
4. **Compare** — Side-by-side comparison table across 12 key specs

## Key Features

- **Natural language understanding** — "I live in Bangalore with 2 kids, need something safe for city driving"
- **Editable assumption chips** — Shows what the AI understood, catches misinterpretations
- **Spec-anchored claims** — "24.1 kmpl — highest mileage in your budget" not "great fuel economy"
- **Honest tradeoffs** — Every recommendation includes what's not great
- **Match strength badges** — Strong / Good / Stretch visual confidence indicators
- **Constraint relaxation** — When nothing matches, relaxes lowest-priority constraint and explains what changed
- **Off-topic detection** — Graceful redirect for non-car queries

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq (Llama 3.3 70B Versatile) with JSON mode
- **Data**: Static JSON dataset of 35 popular Indian cars

## Getting Started

### Prerequisites

- Node.js 18+
- Groq API key ([console.groq.com](https://console.groq.com))

### Setup

```bash
# Install dependencies
npm install

# Create .env file
echo "GROQ_API_KEY=your_key_here" > .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Edge Cases Handled

| Edge Case | Strategy |
|---|---|
| No cars match | Relax lowest-priority constraint, show banner |
| Vague input | Sensible defaults + editable assumption chips |
| Off-topic input | `is_car_query` boolean, friendly redirect |
| Malformed AI response | JSON mode + retry once + graceful fallback |
| Car not in dataset | LLM returns IDs only, backend lookup |
| Contradictory inputs | AI flags conflict, suggests adjustment |

## Dataset

35 popular Indian cars covering Hatchbacks, Sedans, Compact SUVs, SUVs, MPVs, and EVs from brands including Maruti Suzuki, Hyundai, Tata, Kia, Mahindra, Honda, Toyota, Skoda, Volkswagen, and MG.

Each car includes: price, specs, mileage, safety rating, review summary, common praise/criticism, and city/highway/family friendliness scores.

## Deploy on Vercel

```bash
npm run build
```

Deploy via [Vercel](https://vercel.com) — add `GROQ_API_KEY` as an environment variable in the Vercel dashboard.
