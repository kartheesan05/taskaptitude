import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";

function getDepartmentOffset(department) {
  const departments = ["CSE", "AIDS", "ECE", "EEE", "IT", "MECH"];
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

export async function POST(request) {
  try {
    const { department } = await request.json();
    
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

    return Response.json(questionData);
  } catch (error) {
    return Response.json({ error: "Failed to initialize test" }, { status: 500 });
  }
} 