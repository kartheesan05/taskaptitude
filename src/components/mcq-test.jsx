"use client";
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
import { Loader2 } from "lucide-react";
import { TEST_CONFIG } from "@/lib/constants";
import { useTestLogic } from "@/hooks/useTestLogic";
import { SubmitDialog } from "@/components/test/submit-dialog";

export default function McqTest() {
  const {
    currentPage,
    questions,
    loading,
    questionSection,
    selectedOptions,
    isSubmitDialogOpen,
    totalPages,
    handlePrevPage,
    handleNextPage,
    handleOptionChange,
    handleSubmit,
    confirmSubmit,
    setIsSubmitDialogOpen,
    isSubmitting,
  } = useTestLogic();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          MCQ Test Software
        </h1>
        <Card className="mb-4 shadow-lg border-blue-200">
          <CardHeader className="bg-blue-100 flex flex-row justify-between items-center rounded-t-xl">
            <CardTitle className="text-2xl text-black">
              {currentPage <= TEST_CONFIG.DEPARTMENT_PAGES ? "Department Section" : "Aptitude Section"}
            </CardTitle>
            <Button
              onClick={handleSubmit}
              className="bg-blue-800 hover:bg-blue-900 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Test"
              )}
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="mb-8">
                  <h3 className="font-semibold mb-3 text-lg text-black">
                    {`Q${(currentPage - 1) * TEST_CONFIG.QUESTIONS_PER_PAGE + index + 1}. ${
                      question.text
                    }`}
                  </h3>
                  <RadioGroup
                    className="space-y-2"
                    value={selectedOptions[questionSection][question.id] || ""}
                    onValueChange={(value) =>
                      handleOptionChange(question.id, value)
                    }
                  >
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <RadioGroupItem
                          value={String.fromCharCode(97 + idx)}
                          id={`q${question.id}-${idx}`}
                          className="border-blue-300 text-blue-600"
                        />
                        <Label
                          htmlFor={`q${question.id}-${idx}`}
                          className="flex-grow cursor-pointer text-black"
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
              className="w-full bg-blue-100"
              indicatorclassname="bg-blue-500"
            />
            <div className="flex justify-between items-center w-full">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                className="w-24 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-black">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage === totalPages ? (
                <Button
                  onClick={handleSubmit}
                  className="w-24 bg-blue-800 hover:bg-blue-900 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextPage}
                  className="w-24 bg-blue-800 hover:bg-blue-900 text-white"
                >
                  Next
                </Button>
              )}
            </div>
          </CardFooter>
          <SubmitDialog
            isOpen={isSubmitDialogOpen}
            onOpenChange={setIsSubmitDialogOpen}
            selectedOptions={selectedOptions}
            onConfirm={confirmSubmit}
          />
        </Card>
      </div>
    </div>
  );
}
