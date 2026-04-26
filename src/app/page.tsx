"use client";

import { useState } from "react";
import { Car, CarRecommendation } from "@/types/car";

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(price / 100000).toFixed(1)} L`;
}

interface EnrichedRecommendation extends CarRecommendation {
  car: Car;
}

interface ApiResponse {
  is_car_query: boolean;
  redirect_message?: string;
  assumptions?: { label: string; value: string }[];
  recommendations?: EnrichedRecommendation[];
  relaxed_constraints?: string[];
  error?: string;
}

const BUDGET_OPTIONS = [
  { label: "Under ₹5 Lakh", value: "under-5L" },
  { label: "₹5 - 10 Lakh", value: "5-10L" },
  { label: "₹10 - 15 Lakh", value: "10-15L" },
  { label: "₹15 - 25 Lakh", value: "15-25L" },
  { label: "₹25 Lakh+", value: "25L+" },
];

const FAMILY_OPTIONS = [
  { label: "Just me / couple", value: "1-2" },
  { label: "Small family (3-4)", value: "3-4" },
  { label: "Large family (5-7)", value: "5-7" },
];

const USE_OPTIONS = [
  { label: "City", value: "city" },
  { label: "Highway", value: "highway" },
  { label: "Mixed", value: "mixed" },
];

function MatchBadge({ strength }: { strength: string }) {
  const styles = {
    strong: "bg-emerald-100 text-emerald-800 border-emerald-200",
    good: "bg-blue-100 text-blue-800 border-blue-200",
    stretch: "bg-amber-100 text-amber-800 border-amber-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[strength as keyof typeof styles] || styles.good}`}
    >
      {strength.charAt(0).toUpperCase() + strength.slice(1)} match
    </span>
  );
}

function SafetyStars({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined)
    return <span className="text-xs text-slate-400">Not rated</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">NCAP</span>
    </div>
  );
}

function CarCard({
  rec,
  isComparing,
  onToggleCompare,
}: {
  rec: EnrichedRecommendation;
  isComparing: boolean;
  onToggleCompare: () => void;
}) {
  const { car } = rec;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500 font-medium">{car.brand}</p>
          <h3 className="text-xl font-bold text-slate-900">
            {car.name}{" "}
            <span className="text-base font-normal text-slate-500">
              {car.variant}
            </span>
          </h3>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {formatPrice(car.price_ex_showroom_inr)}
          </p>
          <p className="text-xs text-slate-400">Ex-showroom</p>
        </div>
        <MatchBadge strength={rec.match_strength} />
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-500">Fuel</p>
            <p className="text-sm font-semibold text-slate-800">
              {car.fuel_type}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-500">
              {car.fuel_type === "Electric" ? "Range" : "Mileage"}
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {car.fuel_type === "Electric"
                ? `${car.electric_range_km} km`
                : `${car.mileage_kmpl_arai} kmpl`}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-500">Seats</p>
            <p className="text-sm font-semibold text-slate-800">
              {car.seating_capacity}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-500">Transmission</p>
            <p className="text-sm font-semibold text-slate-800">
              {car.transmission}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-500">Power</p>
            <p className="text-sm font-semibold text-slate-800">
              {car.max_power_bhp} bhp
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <p className="text-xs text-slate-500">Safety</p>
            <SafetyStars rating={car.ncap_safety_rating} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-emerald-800 mb-1">
            Why this car for you
          </h4>
          <p className="text-sm text-emerald-700 leading-relaxed">
            {rec.why_for_you}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-1">
            What to consider
          </h4>
          <p className="text-sm text-amber-700 leading-relaxed">
            {rec.tradeoffs}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2 text-xs">
            {car.has_sunroof && (
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                Sunroof
              </span>
            )}
            {car.has_automatic_climate && (
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                Auto AC
              </span>
            )}
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
              {car.airbag_count} Airbags
            </span>
          </div>
          <button
            onClick={onToggleCompare}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              isComparing
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            {isComparing ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ cars }: { cars: EnrichedRecommendation[] }) {
  if (cars.length < 2) return null;

  const specs = [
    {
      label: "Price",
      get: (c: Car) => formatPrice(c.price_ex_showroom_inr),
    },
    { label: "Body Type", get: (c: Car) => c.body_type },
    { label: "Fuel", get: (c: Car) => c.fuel_type },
    { label: "Transmission", get: (c: Car) => c.transmission },
    {
      label: "Mileage / Range",
      get: (c: Car) =>
        c.fuel_type === "Electric"
          ? `${c.electric_range_km} km`
          : `${c.mileage_kmpl_arai} kmpl`,
    },
    { label: "Power", get: (c: Car) => `${c.max_power_bhp} bhp` },
    { label: "Seats", get: (c: Car) => `${c.seating_capacity}` },
    { label: "Boot Space", get: (c: Car) => `${c.boot_space_litres} L` },
    {
      label: "Ground Clearance",
      get: (c: Car) => `${c.ground_clearance_mm} mm`,
    },
    {
      label: "Safety Rating",
      get: (c: Car) =>
        c.ncap_safety_rating !== null
          ? `${c.ncap_safety_rating}/5 NCAP`
          : "Not rated",
    },
    { label: "Airbags", get: (c: Car) => `${c.airbag_count}` },
    { label: "Sunroof", get: (c: Car) => (c.has_sunroof ? "Yes" : "No") },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">
          Side-by-Side Comparison
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left p-3 text-slate-500 font-medium w-40">
              Spec
            </th>
            {cars.map((rec) => (
              <th
                key={rec.car_id}
                className="text-left p-3 font-semibold text-slate-800"
              >
                {rec.car.brand} {rec.car.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specs.map((spec, i) => (
            <tr
              key={spec.label}
              className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
            >
              <td className="p-3 text-slate-500 font-medium">{spec.label}</td>
              {cars.map((rec) => (
                <td key={rec.car_id} className="p-3 text-slate-800">
                  {spec.get(rec.car)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const [freeText, setFreeText] = useState("");
  const [budget, setBudget] = useState("");
  const [familySize, setFamilySize] = useState("");
  const [primaryUse, setPrimaryUse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [refineText, setRefineText] = useState("");

  const handleSubmit = async () => {
    if (!budget || !familySize || !primaryUse) {
      setError("Please select budget, family size, and primary use.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setCompareIds(new Set());

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freeText, budget, familySize, primaryUse }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (carId: number) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(carId)) {
        next.delete(carId);
      } else if (next.size < 3) {
        next.add(carId);
      }
      return next;
    });
  };

  const handleRefine = () => {
    if (refineText.trim()) {
      setFreeText(refineText.trim());
      setRefineText("");
      setResult(null);
      setCompareIds(new Set());
      setLoading(true);
      setError("");

      fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeText: refineText.trim(),
          budget,
          familySize,
          primaryUse,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setResult(data);
          }
        })
        .catch(() => {
          setError("Network error. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const comparedCars =
    result?.recommendations?.filter((r) => compareIds.has(r.car_id)) || [];

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              CarDekho AI Advisor
            </h1>
            <p className="text-xs text-slate-500">
              Your personal car buying assistant
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero + Input Section */}
        {!result && (
          <section className="text-center space-y-3 pt-4 pb-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Not sure which car to buy?
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Tell us what you need in your own words. We&apos;ll find the
              perfect match from 35+ popular cars.
            </p>
          </section>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {result && (
            <button
              onClick={() => {
                setResult(null);
                setCompareIds(new Set());
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              New search
            </button>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Describe what you&apos;re looking for
            </label>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="e.g., I live in Bangalore with a family of 4. Need something safe and fuel-efficient for daily city driving. Occasionally drive to Mysore on weekends..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Budget <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBudget(opt.value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      budget === opt.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Family size <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FAMILY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFamilySize(opt.value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      familySize === opt.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary use <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {USE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrimaryUse(opt.value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      primaryUse === opt.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Finding your perfect cars...
              </>
            ) : (
              "Find My Car"
            )}
          </button>
        </div>

        {/* Off-topic redirect */}
        {result && !result.is_car_query && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-800 text-lg font-medium">
              {result.redirect_message}
            </p>
          </div>
        )}

        {/* Results Section */}
        {result && result.is_car_query && (
          <div className="space-y-6">
            {/* Assumption Chips */}
            {result.assumptions && result.assumptions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-sm font-medium text-slate-600 mb-3">
                  Here&apos;s what we understood:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.assumptions.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm px-3 py-1.5 rounded-full border border-indigo-100"
                    >
                      <span className="font-medium">{a.label}:</span> {a.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Relaxed Constraints Banner */}
            {result.relaxed_constraints &&
              result.relaxed_constraints.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">
                      Showing closest matches:
                    </span>{" "}
                    {result.relaxed_constraints.join(". ")}
                  </p>
                </div>
              )}

            {/* Car Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {result.recommendations?.map((rec) => (
                <CarCard
                  key={rec.car_id}
                  rec={rec}
                  isComparing={compareIds.has(rec.car_id)}
                  onToggleCompare={() => toggleCompare(rec.car_id)}
                />
              ))}
            </div>

            {/* Comparison Table */}
            {comparedCars.length >= 2 && (
              <ComparisonTable cars={comparedCars} />
            )}

            {/* Refinement Input */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-sm font-medium text-slate-600 mb-3">
                Want something different?
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={refineText}
                  onChange={(e) => setRefineText(e.target.value)}
                  placeholder="e.g., Show me diesel options, or something cheaper..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && refineText.trim()) {
                      handleRefine();
                    }
                  }}
                />
                <button
                  onClick={handleRefine}
                  disabled={!refineText.trim() || loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Refine
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
