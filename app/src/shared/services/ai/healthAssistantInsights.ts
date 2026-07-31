import { UserProfile, Biomarker, HealthScore, DailyInsight } from "../../types";
import { HealthAssistantResponse } from "./healthAssistantService";
import { formatHealthDataForPrompt } from "./healthAssistantPrompt";

export const OPENAI_API_URL_INSIGHTS =
  "https://api.openai.com/v1/chat/completions";

export function parseInsightsResponse(
  content: string,
): HealthAssistantResponse {
  const lines = content.split("\n").filter((line) => line.trim());
  return {
    insights: lines
      .slice(0, 3)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim()),
    recommendations: lines
      .slice(3, 6)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim()),
    riskAssessment: { level: "low" as const, concerns: [], improvements: [] },
    nextActions: lines
      .slice(-2)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim()),
    followUpQuestions: [],
  };
}

export function parseDailyRecommendations(content: string): DailyInsight[] {
  const lines = content.split("\n").filter((line) => line.trim());
  return lines.slice(0, 3).map((line, index) => ({
    id: `daily-${Date.now()}-${index}`,
    type: "recommendation" as const,
    title: `Daily Tip ${index + 1}`,
    description: line.replace(/^\d+\.\s*/, "").trim(),
    priority: "medium" as const,
    category: "nutrition" as const,
    date: new Date(),
    actionable: true,
  }));
}

export function getMockHealthInsights(): HealthAssistantResponse {
  return {
    insights: [
      "Your health metrics look pretty good overall!",
      "There might be some areas we can optimize together.",
      "Small consistent changes often make the biggest difference.",
    ],
    recommendations: [
      "Try to get 7-9 hours of quality sleep each night",
      "Consider adding more colorful vegetables to your meals",
      "Even a 10-minute daily walk can boost your energy",
    ],
    riskAssessment: { level: "low", concerns: [], improvements: [] },
    nextActions: [
      "Track your sleep for a week to identify patterns",
      "Schedule a check-in with your healthcare provider",
    ],
    followUpQuestions: [],
  };
}

export function getMockDailyRecommendations(): DailyInsight[] {
  return [
    {
      id: "mock-1",
      title: "Hydration Boost",
      description:
        "Drinking water first thing in the morning helps kickstart your metabolism and supports overall health.",
      category: "nutrition",
      priority: "medium",
      actionable: true,
    },
    {
      id: "mock-2",
      title: "Movement Break",
      description:
        "Short, regular walks throughout the day can improve circulation, energy, and focus.",
      category: "activity",
      priority: "medium",
      actionable: true,
    },
    {
      id: "mock-3",
      title: "Mindful Moment",
      description:
        "Practicing mindfulness, even briefly, can reduce stress and improve digestion.",
      category: "stress",
      priority: "low",
      actionable: true,
    },
  ];
}

export async function generateHealthInsights(
  apiKey: string,
  profile: UserProfile | null,
  biomarkers: Biomarker[],
  healthScore: HealthScore | null,
): Promise<HealthAssistantResponse> {
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    return getMockHealthInsights();
  }

  try {
    const healthData = formatHealthDataForPrompt({
      profile,
      biomarkers,
      healthScore,
    });

    const prompt = `Based on this health data, provide some friendly insights and recommendations:

${healthData}

Please provide:
1. A few key insights about their health
2. Some practical recommendations
3. A simple risk assessment
4. Next steps they could consider

Keep it conversational and helpful, not overly clinical.`;

    const response = await fetch(OPENAI_API_URL_INSIGHTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly health assistant providing insights from health data.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    return parseInsightsResponse(content);
  } catch (error) {
    console.error("Health Insights Error:", error);
    return getMockHealthInsights();
  }
}

export async function generateDailyRecommendations(
  apiKey: string,
  profile: UserProfile | null,
  biomarkers: Biomarker[],
  healthScore: HealthScore | null,
): Promise<DailyInsight[]> {
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    return getMockDailyRecommendations();
  }

  try {
    const healthData = formatHealthDataForPrompt({
      profile,
      biomarkers,
      healthScore,
    });

    const prompt = `Based on this health data, suggest 3 practical daily recommendations for today:

${healthData}

Make them actionable, friendly, and relevant to their health situation. Focus on simple things they can do today.`;

    const response = await fetch(OPENAI_API_URL_INSIGHTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly health assistant providing daily recommendations.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    return parseDailyRecommendations(content);
  } catch (error) {
    console.error("Daily Recommendations Error:", error);
    return getMockDailyRecommendations();
  }
}
