"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getTestScores, getTestDepartment } from "@/lib/actions"
import { useRouter } from "next/navigation"


export default function TestScoresComponent() {
  const router = useRouter();
  const [testScores, setTestScores] = useState([
    { subject: "Total Marks", score: 0, maxScore: 50 },
    { subject: "Department", score: 0, maxScore: 20, department: "" },
    { subject: "Aptitude", score: 0, maxScore: 30 }
  ]);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    router.push("/login");
  };

  useEffect(() => {
    async function calculateScores() {
      try {
        const selectedOptions = JSON.parse(localStorage.getItem('selectedOptions') || '{}');
        // If selectedOptions is empty (no keys), set default scores
        if (Object.keys(selectedOptions).length === 0) {
          setTestScores([
            { subject: "Total Marks", score: 0, maxScore: 50 },
            { subject: "Department", score: 0, maxScore: 20, department: "" },
            { subject: "Aptitude", score: 0, maxScore: 30 }
          ]);
          return;
        }
        const scores = await getTestScores(selectedOptions);
        const department = await getTestDepartment();
        
        // Merge the department info into the scores
        const updatedScores = scores.map(score => 
          score.subject === "Department" 
            ? { ...score, department: department }
            : score
        );
        
        setTestScores(updatedScores);
      } catch (error) {
        setError('Failed to calculate scores. Please try again later.');
      }
    }

    calculateScores();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-600 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto relative">
        <button
          onClick={handleLogout}
          className="absolute right-0 top-0 px-4 py-2 bg-blue-100 text-black rounded-xl hover:bg-blue-200 transition-colors border border-blue-200 shadow-sm"
        >
          Logout
        </button>
        <h1 className="text-3xl font-bold text-black mb-6">Your Test Scores</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testScores.map((test) => (
            <Card key={test.subject} className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-100 rounded-t-xl">
                <CardTitle className="text-black">
                  {test.subject}
                  {test.department && (
                    <span className="block text-sm font-normal mt-1">
                      ({test.department})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-black">Score: {test.score}</span>
                  <span className="text-sm font-medium text-black">Max: {test.maxScore}</span>
                </div>
                <Progress
                  value={(test.score / test.maxScore) * 100}
                  className="h-3 bg-blue-200"/>
                <p className="text-right text-sm text-black mt-2">
                  {((test.score / test.maxScore) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
