import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import db from "@/lib/db";

type QuestionData = {
  depQuestionIds: number[];
  aptQuestionIds: number[];
}

async function fetchCorrectAnswers(questionIds: number[], questionType: string) {
  const table = questionType === "department" ? "dep_questions" : "aptitude_questions";
  const result = await db.query(
    `SELECT id, correct_answer
     FROM ${table}
     WHERE id = ANY($1::int[])`,
    [questionIds]
  );
  return result.rows;
}

export async function POST(request: NextRequest) {
  try {
    const selectedOptions = await request.json();
    
    const encryptedData = (await cookies()).get("testQuestions")?.value;
    if (!encryptedData) {
      return Response.json({ error: "No test data found" }, { status: 404 });
    }

    const questionData = await decrypt(encryptedData) as unknown as QuestionData;
    const { depQuestionIds, aptQuestionIds } = questionData;

    const [depCorrectAnswers, aptCorrectAnswers] = await Promise.all([
      fetchCorrectAnswers(depQuestionIds, "department"),
      fetchCorrectAnswers(aptQuestionIds, "aptitude")
    ]);

    let depScore = 0;
    let aptScore = 0;

    depCorrectAnswers.forEach(({ id, correct_answer }) => {
      if (selectedOptions.department[id] === correct_answer) depScore++;
    });

    aptCorrectAnswers.forEach(({ id, correct_answer }) => {
      if (selectedOptions.aptitude[id] === correct_answer) aptScore++;
    });

    const totalScore = depScore + aptScore;

    return Response.json([
      { subject: "Total Marks", score: totalScore, maxScore: 50 },
      { subject: "Department", score: depScore, maxScore: 20 },
      { subject: "Aptitude", score: aptScore, maxScore: 30 },
    ]);
  } catch (error) {
    return Response.json({ error: "Failed to compute scores" }, { status: 500 });
  }
} 