import { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const section = searchParams.get("section") || "department";

    // Get test questions from cookies
    const encryptedData = (await cookies()).get("testQuestions")?.value;
    if (!encryptedData) {
      return Response.json({ error: "No test data found" }, { status: 404 });
    }
    
    const questionData = await decrypt(encryptedData);
    const questionIds = (section === "department" 
      ? questionData.depQuestionIds 
      : questionData.aptQuestionIds) as number[];

    const questionsPerPage = 5;
    const startIndex = (page - 1) * questionsPerPage;
    const pageQuestionIds = questionIds.slice(startIndex, startIndex + questionsPerPage);

    const table = section === "department" ? "dep_questions" : "aptitude_questions";
    
    const result = await db.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
       FROM ${table}
       WHERE id = ANY($1::int[])`,
      [pageQuestionIds]
    );

    const questions = result.rows
      .sort((a, b) => pageQuestionIds.indexOf(a.id) - pageQuestionIds.indexOf(b.id))
      .map((row) => ({
        id: row.id,
        text: row.question,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        type: section,
      }));

    return Response.json(questions);
  } catch (error) {
    return Response.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
} 