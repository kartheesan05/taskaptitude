"use server";

import db from "@/lib/db";

export async function fetchQuestions(questionIds, questionType) {
  const table = questionType === 'department' ? 'dep_questions' : 'aptitude_questions';
  console.log(table);
  try {

    const result = await db.query(
      `SELECT id, question, option_a, option_b, option_c, option_d
       FROM ${table}
       WHERE id = ANY($1::int[])`,
      [questionIds]
    );

    const questions = result.rows
      .sort((a, b) => questionIds.indexOf(a.id) - questionIds.indexOf(b.id))
      .map(row => ({
        id: row.id,
        text: row.question,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        type: questionType
      }));
    // console.log(questions);
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to fetch questions');
  }
}

