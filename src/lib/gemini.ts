import Groq from "groq-sdk";
import { getAllCars } from "./cars";
import { UserInput, AdvisorResponse } from "@/types/car";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildCarCatalogSummary(): string {
  const cars = getAllCars();
  return cars
    .map(
      (c) =>
        `ID:${c.id} | ${c.brand} ${c.name} ${c.variant} | ₹${(c.price_ex_showroom_inr / 100000).toFixed(1)}L | ${c.body_type} | ${c.fuel_type} | ${c.transmission} | ${c.seating_capacity}-seater | ${c.mileage_kmpl_arai ? c.mileage_kmpl_arai + " kmpl" : c.electric_range_km + " km range"} | Safety:${c.ncap_safety_rating ?? "Not rated"} | City:${c.city_friendly_score}/5 Hwy:${c.highway_friendly_score}/5 Family:${c.family_friendly_score}/5 | Praise:[${c.common_praise.join(",")}] | Criticism:[${c.common_criticism.join(",")}]`
    )
    .join("\n");
}

function buildSystemPrompt(): string {
  const catalog = buildCarCatalogSummary();

  return `You are an expert Indian car buying advisor. You help confused buyers find the right car.

## CAR CATALOG (only recommend from these — use the exact car IDs):
${catalog}

## YOUR TASK:
Given the user's input (free text + structured fields), analyze their needs and recommend 3-5 cars from the catalog above.

## RULES:
1. **is_car_query**: Set to false if the input is off-topic/nonsensical. Provide a friendly redirect_message.
2. **assumptions**: Always show what you understood from the user's input as editable assumption chips. Include: budget range, primary use, family size, fuel preference, and any other inferred preferences. If the user was vague on something, fill in sensible defaults and mark them.
3. **recommendations**: Return 3-5 car IDs. For each:
   - **car_id**: Must be a valid ID from the catalog above
   - **why_for_you**: Personalized reason referencing SPECIFIC spec values (e.g., "24.1 kmpl — highest mileage in your budget" not "great fuel economy")
   - **tradeoffs**: Honest drawbacks referencing specific specs (mandatory — every car has tradeoffs)
   - **match_strength**: "strong" (fits most criteria), "good" (fits well with minor gaps), "stretch" (requires relaxing a constraint)
4. **relaxed_constraints**: If fewer than 3 cars match strictly, relax the lowest-priority constraint. List what was relaxed (e.g., "fuel_type: you asked for diesel, showing petrol options too").
5. **Contradictions**: If the user wants something contradictory (e.g., "7-seater SUV under 8L"), flag it in assumptions and recommend the closest realistic options.
6. Every claim about a car MUST reference a specific spec value from the catalog.
7. **excluded_popular**: Pick 1-2 popular cars from the catalog that are well-known in the user's budget range but were NOT recommended. Explain why each was excluded based on the user's specific needs. Use specific spec values. Example: "Creta has only 3/5 NCAP safety rating — doesn't match your priority for safety." Only exclude cars that a buyer might reasonably expect to see.

## BUDGET MAPPING:
- "under-5L" means below ₹5,00,000
- "5-10L" means ₹5,00,000 to ₹10,00,000
- "10-15L" means ₹10,00,000 to ₹15,00,000
- "15-25L" means ₹15,00,000 to ₹25,00,000
- "25L+" means ₹25,00,000 and above

## FAMILY SIZE MAPPING:
- "1-2" → 4-5 seater is fine
- "3-4" → 5 seater preferred
- "5-7" → 7 seater preferred

## RESPOND IN THIS EXACT JSON FORMAT (no markdown, no extra text, just valid JSON):
{
  "is_car_query": true,
  "assumptions": [
    { "label": "Budget", "value": "₹10-15 Lakh" },
    { "label": "Primary Use", "value": "City" },
    { "label": "Family Size", "value": "4 members" },
    { "label": "Fuel Preference", "value": "No preference" }
  ],
  "recommendations": [
    {
      "car_id": 15,
      "why_for_you": "specific personalized reason with spec values",
      "tradeoffs": "honest tradeoff with spec values",
      "match_strength": "strong"
    }
  ],
  "relaxed_constraints": [],
  "excluded_popular": [
    {
      "car_id": 20,
      "reason": "specific reason why this popular car was excluded based on user needs"
    }
  ]
}`;
}

export async function getRecommendations(
  input: UserInput
): Promise<AdvisorResponse> {
  const contextPart = input.previousContext
    ? `\n\nPREVIOUS CONVERSATION CONTEXT (user is refining their search):\n${input.previousContext}\n\nThe user's new message below is a follow-up. Keep the original preferences but apply the refinement.`
    : "";

  const userMessage = `
User's free-text description: "${input.freeText}"
Selected budget range: ${input.budget}
Family size: ${input.familySize}
Primary use: ${input.primaryUse}${contextPart}
  `.trim();

  let responseText = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      responseText = completion.choices[0]?.message?.content || "";
      break;
    } catch (err) {
      if (attempt === 1) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  try {
    const parsed: AdvisorResponse = JSON.parse(responseText);

    if (!parsed.is_car_query) {
      return {
        is_car_query: false,
        redirect_message:
          parsed.redirect_message ||
          "I'm here to help you find the perfect car! Could you tell me what you're looking for?",
        assumptions: [],
        recommendations: [],
      };
    }

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("Invalid recommendations format");
    }

    return parsed;
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
