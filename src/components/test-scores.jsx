"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getTestScores } from "@/lib/actions"


export default function TestScoresComponent() {
  const [testScores, setTestScores] = useState([
    { subject: "Total Marks", score: 0, maxScore: 50 },
    { subject: "Department", score: 0, maxScore: 20 },
    { subject: "Aptitude", score: 0, maxScore: 30 }
  ]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function calculateScores() {
      try {
        const selectedOptions = JSON.parse(localStorage.getItem('selectedOptions') || '{}');
        const scores = await getTestScores(selectedOptions);
        setTestScores(scores);
      } catch (error) {
        console.error('Error calculating scores:', error);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Your Test Scores</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testScores.map((test) => (
            <Card key={test.subject} className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-100 rounded-t-xl">
                <CardTitle className="text-black">{test.subject}</CardTitle>
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
