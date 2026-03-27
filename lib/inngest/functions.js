import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateIndustryInsights = inngest.createFunction(
  { 
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
    concurrency: 1 
  },
  // Switch to an event-based trigger so it's tied to a specific user session
  { event: "app/generate.insights" }, 
  async ({ event, step }) => {
    const { userId, industry } = event.data;

    const responseSchema = {
      type: "object",
      properties: {
        salaryRanges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              min: { type: "number" },
              max: { type: "number" },
              median: { type: "number" },
              location: { type: "string" }
            },
            required: ["role", "min", "max", "median", "location"]
          }
        },
        growthRate: { type: "number" },
        demandLevel: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
        topSkills: { type: "array", items: { type: "string" } },
        marketOutlook: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
        keyTrends: { type: "array", items: { type: "string" } },
        recommendedSkills: { type: "array", items: { type: "string" } }
      },
      required: ["salaryRanges", "growthRate", "demandLevel", "topSkills", "marketOutlook", "keyTrends", "recommendedSkills"]
    };

    const prompt = `Analyze the current state of the ${industry} industry. Provide detailed salary roles, trends, and outlook.`;

    const aiResponse = await step.ai.wrap(
      "gemini-analysis",
      async () => {
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        return response.text;
      }
    );

    let insights;
    try {
      insights = typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;
      insights.demandLevel = insights.demandLevel.toUpperCase();
      insights.marketOutlook = insights.marketOutlook.toUpperCase();
    } catch (error) {
      console.error(`JSON Parse failed for ${industry}:`, aiResponse);
      throw new Error(`Invalid AI response for ${industry}`);
    }

    // UPDATED: Now identifies by userId to prevent overwriting other people's data
    await step.run(`Update insights for user: ${userId}`, async () => {
      return await db.industryInsight.upsert({
        where: { userId: userId }, // Unique to the user
        update: {
          industry,
          ...insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId,
          industry,
          ...insights,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });
  }
);