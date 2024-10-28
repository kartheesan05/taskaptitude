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
import { TEST_CONFIG } from "@/lib/constants";

export function SubmitDialog({
  isOpen,
  onOpenChange,
  selectedOptions,
  onConfirm,
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-blue-50 border-blue-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-black">
            Confirm Submission
          </AlertDialogTitle>
          <AlertDialogDescription className="text-black">
            You have answered{" "}
            {Object.keys(selectedOptions[TEST_CONFIG.SECTIONS.DEPARTMENT]).length +
              Object.keys(selectedOptions[TEST_CONFIG.SECTIONS.APTITUDE]).length}{" "}
            out of {TEST_CONFIG.TOTAL_QUESTIONS} questions. Are you sure you want to
            submit your test?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-blue-300 text-blue-700 hover:bg-blue-100">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
