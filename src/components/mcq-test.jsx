"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { fetchQuestions, getTotalQuestions } from "@/lib/actions";

export default function McqTest() {
  const [currentPage, setCurrentPage] = useState(1)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [depQuestionIds, setDepQuestionIds] = useState([])
  const [aptQuestionIds, setAptQuestionIds] = useState([])
  const questionsPerPage = 5
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const storedOptions = localStorage.getItem('selectedOptions');
    return storedOptions ? JSON.parse(storedOptions) : {};
  });

  useEffect(() => {
    // Generate random IDs for department and aptitude questions
    function generateRandomIds(count, max) {
      const ids = new Set();
      while (ids.size < count) {
        ids.add(Math.floor(Math.random() * max) + 1);
      }
      return Array.from(ids);
    }

    // Load IDs from local storage or generate new ones if not present
    const storedDepIds = localStorage.getItem('depQuestionIds');
    const storedAptIds = localStorage.getItem('aptQuestionIds');

    if (storedDepIds && storedAptIds) {
      setDepQuestionIds(JSON.parse(storedDepIds));
      setAptQuestionIds(JSON.parse(storedAptIds));
    } else {
      const newDepIds = generateRandomIds(20, 200);
      const newAptIds = generateRandomIds(30, 300);
      setDepQuestionIds(newDepIds);
      setAptQuestionIds(newAptIds);
      localStorage.setItem('depQuestionIds', JSON.stringify(newDepIds));
      localStorage.setItem('aptQuestionIds', JSON.stringify(newAptIds));
    }
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true)
      try {
        const questionType = currentPage <= 4 ? 'department' : 'aptitude';
        const ids = questionType === 'department' ? depQuestionIds : aptQuestionIds;
        const startIndex = (currentPage - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        const currentIds = ids.slice(startIndex, endIndex);

        // Ensure that currentIds is not empty before fetching
        if (currentIds.length > 0) {
          const fetchedQuestions = await fetchQuestions(currentIds, questionType);
          setQuestions(fetchedQuestions);
        } else {
          setQuestions([]); // Clear questions if no more IDs are available
        }

        // Set total questions based on the length of question ID arrays
        if (totalQuestions === 0) {
          setTotalQuestions(depQuestionIds.length + aptQuestionIds.length);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false)
      }
    }

    if (depQuestionIds.length > 0 && aptQuestionIds.length > 0) {
      loadQuestions();
    }
  }, [currentPage, depQuestionIds, aptQuestionIds])

  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleOptionChange = (questionId, option) => {
    const updatedOptions = { ...selectedOptions, [questionId]: option };
    setSelectedOptions(updatedOptions);
    localStorage.setItem('selectedOptions', JSON.stringify(updatedOptions));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">MCQ Test Software</h1>
        <Card className="mb-4 shadow-lg border-purple-200">
          <CardHeader className="bg-purple-100">
            <CardTitle className="text-2xl text-purple-700">
              {currentPage <= 4 ? "Department Questions" : "Aptitude Questions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-purple-200 opacity-75 animate-ping"></div>
                  <div className="w-12 h-12 rounded-full bg-purple-500 absolute top-0 left-0"></div>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="mb-8">
                  <h3 className="font-semibold mb-3 text-lg text-purple-700">
                    {`Q${(currentPage - 1) * questionsPerPage + index + 1}. ${question.text}`}
                  </h3>
                  <RadioGroup
                    className="space-y-2"
                    value={selectedOptions[question.id] || ''}
                    onValueChange={(value) => handleOptionChange(question.id, value)}
                  >
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-50 transition-colors">
                        <RadioGroupItem
                          value={option}
                          id={`q${question.id}-${index}`}
                          className="border-purple-300 text-purple-600" />
                        <Label
                          htmlFor={`q${question.id}-${index}`}
                          className="flex-grow cursor-pointer text-purple-800">{`(${String.fromCharCode(65 + index)}) ${option}`}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Progress
              value={(currentPage / totalPages) * 100}
              className="w-full bg-purple-100"
              indicatorclassname="bg-purple-500" />
            <div className="flex justify-between items-center w-full">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                className="w-24 border-purple-300 text-purple-700 hover:bg-purple-50">
                Previous
              </Button>
              <span className="text-sm font-medium text-purple-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="w-24 bg-purple-600 hover:bg-purple-700 text-white">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
