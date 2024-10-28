"use server";

import db from "@/lib/db";
import { LoginFormSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/util";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/session";

export async function login(state, formData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  try {
    const user = await getUser(email);
    if (!user) {
      return { errors: "invaliduser" };
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      await createSession({
        email: user.email,
      });
    } else {
      return { errors: "invaliduser" };
    }
  } catch (error) {
    return { errors: "servererror" };
  }

  redirect("/starttest");
}

function getDepartmentOffset(department) {
  const departments = [
    "CSE", "AIDS", "ECE", "EEE", "IT", "MECH", "CHEM", "BIOTECH", "MECHAUTO"
  ];
  const index = departments.indexOf(department);
  if (index === -1) throw new Error("Invalid department");
  return index * 200;
}

function generateRandomIds(count, max, offset = 0) {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(offset + (Math.floor(Math.random() * max) + 1));
  }
  return Array.from(ids);
}

export async function initializeTestQuestions(department) {
  const departmentOffset = getDepartmentOffset(department);
  const depIds = generateRandomIds(20, 200, departmentOffset);
  const aptIds = generateRandomIds(30, 300);
  
  const questionData = {
    department,
    depQuestionIds: depIds,
    aptQuestionIds: aptIds
  };

  const encryptedData = await encrypt(questionData);
  (await cookies()).set("testQuestions", encryptedData, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    sameSite: "lax",
    path: "/"
  });

  return questionData;
}

export async function getTestQuestions() {
  const encryptedData = (await cookies()).get("testQuestions")?.value;
  if (!encryptedData) {
    return await initializeTestQuestions();
  }
  
  const questionData = await decrypt(encryptedData);
  return questionData;
}

export async function getTestDepartment() {
  const questionData = await getTestQuestions();
  return questionData.department;
}

export async function fetchQuestions({ page, section }) {
  try {
    const questionData = await getTestQuestions();
    const questionIds = section === "department" 
      ? questionData.depQuestionIds 
      : questionData.aptQuestionIds;

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

    return questions;
  } catch (error) {
    throw new Error("Failed to fetch questions");
  }
}

async function fetchCorrectAnswers(questionIds, questionType) {
  const table =
    questionType === "department" ? "dep_questions" : "aptitude_questions";
  try {
    const result = await db.query(
      `SELECT id, correct_answer
       FROM ${table}
       WHERE id = ANY($1::int[])`,
      [questionIds]
    );

    return result.rows;
  } catch (error) {
    throw new Error("Failed to fetch correct answers");
  }
}

export async function getTestScores(selectedOptions) {
  try {
    const questionData = await getTestQuestions();
    if (!questionData) {
      throw new Error("No test data found");
    }

    const { depQuestionIds, aptQuestionIds } = questionData;

    const depCorrectAnswers = await fetchCorrectAnswers(
      depQuestionIds,
      "department"
    );
    const aptCorrectAnswers = await fetchCorrectAnswers(
      aptQuestionIds,
      "aptitude"
    );

    let depScore = 0;
    let aptScore = 0;

    depCorrectAnswers.forEach(({ id, correct_answer }) => {
      if (selectedOptions.department[id] === correct_answer) depScore++;
    });

    aptCorrectAnswers.forEach(({ id, correct_answer }) => {
      if (selectedOptions.aptitude[id] === correct_answer) aptScore++;
    });

    const totalScore = depScore + aptScore;

    return [
      { subject: "Total Marks", score: totalScore, maxScore: 50 },
      { subject: "Department", score: depScore, maxScore: 20 },
      { subject: "Aptitude", score: aptScore, maxScore: 30 },
    ];
  } catch (error) {
    throw new Error("Failed to compute test scores");
  }
}

export async function saveTestAnswers(selectedOptions) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) {
      throw new Error("No session found");
    }

    const session = await decrypt(sessionToken);
    const email = session.email;

    const formattedAnswers = {
      department: selectedOptions.department,
      aptitude: selectedOptions.aptitude
    };

    await db.query(
      `UPDATE users 
       SET test_answers = $1::jsonb 
       WHERE email = $2`,
      [JSON.stringify(formattedAnswers), email]
    );


    return true;
  } catch (error) {
    throw new Error("Failed to save test answers");
  }
}
