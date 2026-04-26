import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/gemini";
import { getCarsByIds, getCarById } from "@/lib/cars";
import { UserInput } from "@/types/car";

export async function POST(req: NextRequest) {
  try {
    const body: UserInput = await req.json();

    if (!body.budget || !body.familySize || !body.primaryUse) {
      return NextResponse.json(
        { error: "Budget, family size, and primary use are required." },
        { status: 400 }
      );
    }

    const aiResponse = await getRecommendations(body);

    if (!aiResponse.is_car_query) {
      return NextResponse.json({
        is_car_query: false,
        redirect_message: aiResponse.redirect_message,
      });
    }

    const carIds = aiResponse.recommendations.map((r) => r.car_id);
    const cars = getCarsByIds(carIds);

    const enrichedRecommendations = aiResponse.recommendations
      .map((rec) => {
        const car = cars.find((c) => c.id === rec.car_id);
        if (!car) return null;
        return { ...rec, car };
      })
      .filter(Boolean);

    const enrichedExcluded = (aiResponse.excluded_popular || [])
      .map((exc) => {
        const car = getCarById(exc.car_id);
        if (!car) return null;
        return { ...exc, car };
      })
      .filter(Boolean);

    return NextResponse.json({
      is_car_query: true,
      assumptions: aiResponse.assumptions,
      recommendations: enrichedRecommendations,
      relaxed_constraints: aiResponse.relaxed_constraints || [],
      excluded_popular: enrichedExcluded,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    let userMessage = "Something went wrong. Please try again.";
    if (message.includes("429") || message.includes("quota")) {
      userMessage =
        "Our AI advisor is getting a lot of requests right now. Please try again in a minute.";
    } else if (message.includes("parse") || message.includes("JSON")) {
      userMessage =
        "The AI response was unexpected. Please try again.";
    } else if (message.includes("API key") || message.includes("401")) {
      userMessage = "AI service configuration error. Please contact support.";
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
