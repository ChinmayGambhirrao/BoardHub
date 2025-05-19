import { useFormValidation } from "../hooks/useFormValidation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useError } from "../contexts/ErrorContext";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../contexts/ToastContext";

export default function CardForm({
  columnId,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const { registerField, handleSubmit, errors, reset } =
    useFormValidation("card");
  const { setError } = useError();
  const { setComponentLoading, getComponentState } = useLoading();
  const { showSuccess, showError } = useToast();

  const formState = getComponentState(`card-form-${columnId}`);

  const handleFormSubmit = async (data) => {
    setComponentLoading(`card-form-${columnId}`, true, "Saving card...");
    try {
      await onSubmit(data);
      showSuccess(
        initialData ? "Card updated successfully" : "Card created successfully"
      );
      reset();
      onClose();
    } catch (error) {
      setError("FORM_SUBMISSION_ERROR", "Failed to save card");
      showError("Failed to save card");
    } finally {
      setComponentLoading(`card-form-${columnId}`, false);
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
          placeholder="Enter card title"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...registerField("description")}
          defaultValue={initialData?.description}
          placeholder="Enter card description"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
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
            "Update Card"
          ) : (
            "Create Card"
          )}
        </Button>
      </div>
    </form>
  );
}
