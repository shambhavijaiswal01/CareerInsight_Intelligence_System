"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateAIInsights = async (industry) => {
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
            location: { type: "string" },
          },
          required: ["role", "min", "max", "median", "location"],
        },
      },
      growthRate: { type: "number" },
      demandLevel: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
      topSkills: { type: "array", items: { type: "string" } },
      marketOutlook: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
      keyTrends: { type: "array", items: { type: "string" } },
      recommendedSkills: { type: "array", items: { type: "string" } },
    },
    required: ["salaryRanges", "growthRate", "demandLevel", "topSkills", "marketOutlook", "keyTrends", "recommendedSkills"],
  };

  const prompt = `Analyze the current state of the ${industry} industry. Include at least 5 common roles for salary ranges. Include at least 5 skills and trends.`;

  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const insights = JSON.parse(result.text);

    // FIX: Ensure enums are uppercase to match Prisma exactly
    return {
      ...insights,
      demandLevel: insights.demandLevel.toUpperCase(),
      marketOutlook: insights.marketOutlook.toUpperCase(),
    };
  } catch (error) {
    console.error("AI Insight Error:", error);
    throw new Error("Failed to generate industry insights");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  const isStale = user.industryInsight && new Date() > new Date(user.industryInsight.nextUpdate);

  if (!user.industryInsight || isStale) {
    const insights = await generateAIInsights(user.industry);

    const updatedInsight = await db.industryInsight.upsert({
      where: { industry: user.industry },
      update: {
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return updatedInsight;
  }

  return user.industryInsight;
}