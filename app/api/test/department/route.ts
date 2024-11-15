import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function GET() {
  try {
    const encryptedData = (await cookies()).get("testQuestions")?.value;
    if (!encryptedData) {
      return Response.json({ error: "No test data found" }, { status: 404 });
    }
    
    const questionData = await decrypt(encryptedData);
    return Response.json({ department: questionData.department });
  } catch (error) {
    return Response.json({ error: "Failed to get department" }, { status: 500 });
  }
} 