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

export async function computeTestScores(selectedOptions, depQuestionIds, aptQuestionIds) {
  try {
    const depCorrectAnswers = await fetchCorrectAnswers(depQuestionIds, 'department');
    const aptCorrectAnswers = await fetchCorrectAnswers(aptQuestionIds, 'aptitude');

    let depScore = 0;
    let aptScore = 0;

    depCorrectAnswers.forEach(({ id, correct_answer }) => {
      if (selectedOptions[id] === correct_answer) depScore++;
    });

    aptCorrectAnswers.forEach(({ id, correct_answer }) => {
      if (selectedOptions[id] === correct_answer) aptScore++;
    });

    const totalScore = depScore + aptScore;

    return [
      { subject: "Total Marks", score: totalScore, maxScore: 50 },
      { subject: "Department", score: depScore, maxScore: 20 },
      { subject: "Aptitude", score: aptScore, maxScore: 30 }
    ];
  } catch (error) {
    console.error('Error computing test scores:', error);
    throw new Error('Failed to compute test scores');
  }
}

async function fetchCorrectAnswers(questionIds, questionType) {
  const table = questionType === 'department' ? 'dep_questions' : 'aptitude_questions';
  try {
    const result = await db.query(
      `SELECT id, correct_answer
       FROM ${table}
       WHERE id = ANY($1::int[])`,
      [questionIds]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching correct answers:', error);
    throw new Error('Failed to fetch correct answers');
  }
}
