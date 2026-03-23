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
  { cron: "0 0 * * 0" }, 
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
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

      // 1. Corrected AI Wrap to ensure it returns the text string
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
          // Explicitly return the text string so Inngest captures it
          return response.text;
        }
      );

      // 2. Defensive check for the JSON parse
      let insights;
      try {
        // If aiResponse is already an object (sometimes Inngest parses it), 
        // we use it; otherwise, we parse the string.
        insights = typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;
        
        // 3. SANITIZATION: Force enums to uppercase to prevent Prisma crashes
        insights.demandLevel = insights.demandLevel.toUpperCase();
        insights.marketOutlook = insights.marketOutlook.toUpperCase();
      } catch (error) {
        console.error(`JSON Parse failed for ${industry}:`, aiResponse);
        throw new Error(`Invalid AI response for ${industry}`);
      }

      await step.run(`Update ${industry} insights`, async () => {
        return await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
);