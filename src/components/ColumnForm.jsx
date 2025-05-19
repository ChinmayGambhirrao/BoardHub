import { useFormValidation } from "../hooks/useFormValidation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useError } from "../contexts/ErrorContext";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../contexts/ToastContext";

export default function ColumnForm({ onClose, onSubmit, initialData = null }) {
  const { registerField, handleSubmit, errors, reset } =
    useFormValidation("column");
  const { setError } = useError();
  const { setComponentLoading, getComponentState } = useLoading();
  const { showSuccess, showError } = useToast();

  const formState = getComponentState("column-form");

  const handleFormSubmit = async (data) => {
    setComponentLoading("column-form", true, "Saving column...");
    try {
      await onSubmit(data);
      showSuccess(
        initialData
          ? "Column updated successfully"
          : "Column created successfully"
      );
      reset();
      onClose();
    } catch (error) {
      setError("FORM_SUBMISSION_ERROR", "Failed to save column");
      showError("Failed to save column");
    } finally {
      setComponentLoading("column-form", false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...registerField("title")}
          defaultValue={initialData?.title}
          placeholder="Enter column title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : initialData ? (
            "Update Column"
          ) : (
            "Create Column"
          )}
        </Button>
      </div>
    </form>
  );
}
