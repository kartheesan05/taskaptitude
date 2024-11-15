import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const selectedOptions = await request.json();
    
    const sessionToken = (await cookies()).get("session")?.value;
    if (!sessionToken) {
      return Response.json({ error: "No session found" }, { status: 401 });
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

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to save answers" }, { status: 500 });
  }
} 