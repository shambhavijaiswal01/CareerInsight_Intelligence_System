"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

// 1. Initialize with the modern client
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true },
  });

  if (!user) throw new Error("User not found");

  // 2. Define the exact shape of your quiz questions
  const quizSchema = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
            correctAnswer: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
    },
    required: ["questions"],
  };

  const prompt = `Generate 10 technical interview questions for a ${user.industry} professional ${
    user.skills?.length ? `with expertise in ${user.skills.join(", ")}` : ""
  }.`;

  try {
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash", // Upgraded to 2.5 for faster quiz generation
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    // The SDK handles JSON parsing directly in modern versions
    const quiz = JSON.parse(result.text);
    return quiz.questions;
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(q => `Q: "${q.question}" | Correct: "${q.answer}" | User: "${q.userAnswer}"`)
      .join("\n");

    const tipPrompt = `Based on these mistakes in a ${user.industry} interview: \n${wrongQuestionsText}\n Provide a 1-2 sentence encouraging improvement tip focused on the gap.`;

    try {
      // Simple text generation for the tip
      const tipResult = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: tipPrompt }] }],
      });
      improvementTip = tipResult.text.trim();
    } catch (e) {
      console.error("Tip Gen Error:", e);
    }
  }

  return await db.assessment.create({
    data: {
      userId: user.id,
      quizScore: score,
      questions: questionResults,
      category: "Technical",
      improvementTip,
    },
  });
}

// ... getAssessments remains unchanged

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}