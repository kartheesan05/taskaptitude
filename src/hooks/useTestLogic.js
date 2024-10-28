import { useState, useEffect } from "react";
import { fetchQuestions, saveTestAnswers } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { TEST_CONFIG } from "@/lib/constants";

export function useTestLogic() {
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionSection, setQuestionSection] = useState(TEST_CONFIG.SECTIONS.DEPARTMENT);
  const [selectedOptions, setSelectedOptions] = useState({
    [TEST_CONFIG.SECTIONS.DEPARTMENT]: {},
    [TEST_CONFIG.SECTIONS.APTITUDE]: {},
  });
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const router = useRouter();

  const totalPages = Math.ceil(TEST_CONFIG.TOTAL_QUESTIONS / TEST_CONFIG.QUESTIONS_PER_PAGE);

  useEffect(() => {
    const savedOptions = localStorage.getItem("selectedOptions");
    if (savedOptions) {
      setSelectedOptions(JSON.parse(savedOptions));
    }
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const fetchedQuestions = await fetchQuestions({
          page: currentPage > TEST_CONFIG.DEPARTMENT_PAGES ? currentPage - TEST_CONFIG.DEPARTMENT_PAGES : currentPage,
          section: questionSection,
        });
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [currentPage, questionSection]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (newPage === TEST_CONFIG.DEPARTMENT_PAGES) {
        setQuestionSection(TEST_CONFIG.SECTIONS.DEPARTMENT);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (newPage === TEST_CONFIG.DEPARTMENT_PAGES + 1) {
        setQuestionSection(TEST_CONFIG.SECTIONS.APTITUDE);
      }
    }
  };

  const handleOptionChange = (questionId, option) => {
    const section = currentPage <= TEST_CONFIG.DEPARTMENT_PAGES ? TEST_CONFIG.SECTIONS.DEPARTMENT : TEST_CONFIG.SECTIONS.APTITUDE;
    const updatedOptions = {
      ...selectedOptions,
      [section]: {
        ...selectedOptions[section],
        [questionId]: option,
      },
    };
    setSelectedOptions(updatedOptions);
    localStorage.setItem("selectedOptions", JSON.stringify(updatedOptions));
  };

  const handleSubmit = () => setIsSubmitDialogOpen(true);

  const confirmSubmit = async () => {
    try {
      await saveTestAnswers(selectedOptions);
      setIsSubmitDialogOpen(false);
      router.push("/result");
    } catch (error) {
      console.error("Error saving test answers:", error);
    }
  };

  return {
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
  };
}
