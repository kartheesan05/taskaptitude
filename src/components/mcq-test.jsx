"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { fetchQuestions } from "@/lib/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

function generateRandomIds(count, max) {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(ids);
}

const questionsPerPage = 5;

export default function McqTest() {
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionSection, setQuestionSection] = useState("department");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [depQuestionIds, setDepQuestionIds] = useState([]);
  const [aptQuestionIds, setAptQuestionIds] = useState([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const router = useRouter();

  useEffect(() => {
    const storedDepIds = localStorage.getItem("depQuestionIds");
    const storedAptIds = localStorage.getItem("aptQuestionIds");

    if (storedDepIds && storedAptIds) {
      setDepQuestionIds(JSON.parse(storedDepIds));
      setAptQuestionIds(JSON.parse(storedAptIds));
    } else {
      const newDepIds = generateRandomIds(20, 200);
      const newAptIds = generateRandomIds(30, 300);
      setDepQuestionIds(newDepIds);
      setAptQuestionIds(newAptIds);
      localStorage.setItem("depQuestionIds", JSON.stringify(newDepIds));
      localStorage.setItem("aptQuestionIds", JSON.stringify(newAptIds));
    }
  }, []);

  useEffect(() => {
    const savedOptions = localStorage.getItem('selectedOptions');
    if (savedOptions) {
      setSelectedOptions(JSON.parse(savedOptions));
    }
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const ids =
          questionSection === "department" ? depQuestionIds : aptQuestionIds;
        const startIndex = ((currentPage - 1) % 4) * questionsPerPage; // Reset index for aptitude section
        const endIndex = startIndex + questionsPerPage;
        const currentIds = ids.slice(startIndex, endIndex);

        if (currentIds.length > 0) {
          const fetchedQuestions = await fetchQuestions(
            currentIds,
            questionSection
          );
          setQuestions(fetchedQuestions);
        } else {
          setQuestions([]);
        }

        if (totalQuestions === 0) {
          setTotalQuestions(depQuestionIds.length + aptQuestionIds.length);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    }

    if (depQuestionIds.length > 0 && aptQuestionIds.length > 0) {
      loadQuestions();
    }
  }, [
    currentPage,
    questionSection,
    depQuestionIds,
    aptQuestionIds,
    questionsPerPage,
    totalQuestions,
  ]);

  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      if (currentPage - 1 === 4) setQuestionSection("department");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (newPage === 5) setQuestionSection("aptitude");
    }
  };

  const handleOptionChange = (questionId, option) => {
    const updatedOptions = { ...selectedOptions, [questionId]: option };
    setSelectedOptions(updatedOptions);
    localStorage.setItem("selectedOptions", JSON.stringify(updatedOptions));
  };

  const handleSubmit = () => {
    const answeredQuestions = Object.keys(selectedOptions).length;
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmit = () => {
    console.log("Test submitted!");
    setIsSubmitDialogOpen(false);
    router.push('/result');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-800">
          MCQ Test Software
        </h1>
        <Card className="mb-4 shadow-lg border-purple-200">
          <CardHeader className="bg-purple-100 flex flex-row justify-between items-center">
            <CardTitle className="text-2xl text-purple-700">
              {currentPage <= 4 ? "Department Questions" : "Aptitude Questions"}
            </CardTitle>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Test
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="mb-8">
                  <h3 className="font-semibold mb-3 text-lg text-purple-700">
                    {`Q${(currentPage - 1) * questionsPerPage + index + 1}. ${
                      question.text
                    }`}
                  </h3>
                  <RadioGroup
                    className="space-y-2"
                    value={selectedOptions[question.id] || ""}
                    onValueChange={(value) =>
                      handleOptionChange(question.id, value)
                    }
                  >
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-purple-50 transition-colors"
                      >
                        <RadioGroupItem
                          value={String.fromCharCode(97 + idx)} // Changed to lowercase a, b, c, d
                          id={`q${question.id}-${idx}`}
                          className="border-purple-300 text-purple-600"
                        />
                        <Label
                          htmlFor={`q${question.id}-${idx}`}
                          className="flex-grow cursor-pointer text-purple-800"
                        >{`(${String.fromCharCode(65 + idx)}) ${option}`}</Label>
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
              indicatorclassname="bg-purple-500"
            />
            <div className="flex justify-between items-center w-full">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                className="w-24 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-purple-600">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage === totalPages ? (
                <Button
                  onClick={handleSubmit}
                  className="w-24 bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit
                </Button>
              ) : (
                <Button
                  onClick={handleNextPage}
                  className="w-24 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Next
                </Button>
              )}
            </div>
          </CardFooter>
          <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <AlertDialogContent className="bg-purple-50 border-purple-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-purple-800">Confirm Submission</AlertDialogTitle>
                <AlertDialogDescription className="text-purple-600">
                  You have answered {Object.keys(selectedOptions).length} out of {totalQuestions} questions.
                  Are you sure you want to submit your test?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-purple-300 text-purple-700 hover:bg-purple-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmSubmit}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </div>
    </div>
  );
}
