import React, { useState, useRef } from "react";
import { useFormValidation } from "../hooks/useFormValidation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useError } from "../contexts/ErrorContext";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../contexts/ToastContext";
import { DayPicker } from "react-day-picker";

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

  // New fields for details
  const [showDetails, setShowDetails] = useState(false);
  const [labels, setLabels] = useState(initialData?.labels || []);
  const [labelInput, setLabelInput] = useState("");
  const [labelColor, setLabelColor] = useState("#1976d2");
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate || { start: null, end: null }
  );
  const [checklists, setChecklists] = useState(initialData?.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const titleInputRef = useRef(null);

  React.useEffect(() => {
    if (titleInputRef.current) titleInputRef.current.focus();
  }, []);

  // Label handlers
  const handleAddLabel = () => {
    if (!labelInput.trim()) return;
    setLabels([...labels, { name: labelInput, color: labelColor }]);
    setLabelInput("");
    setLabelColor("#1976d2");
  };
  const handleDeleteLabel = (idx) => {
    setLabels(labels.filter((_, i) => i !== idx));
  };

  // Due date handlers
  const handleDateChange = (type, date) => {
    setDueDate({ ...dueDate, [type]: date });
  };

  // Checklist handlers
  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    setChecklists([
      ...checklists,
      {
        id: Date.now().toString(),
        title: newChecklistTitle,
        items: [],
        order: checklists.length,
      },
    ]);
    setNewChecklistTitle("");
  };
  const handleDeleteChecklist = (id) => {
    setChecklists(checklists.filter((cl) => cl.id !== id));
  };
  const handleChecklistTitleChange = (id, newTitle) => {
    setChecklists(
      checklists.map((cl) => (cl.id === id ? { ...cl, title: newTitle } : cl))
    );
  };
  const handleAddChecklistItem = (clId, text) => {
    setChecklists(
      checklists.map((cl) =>
        cl.id === clId
          ? {
              ...cl,
              items: [
                ...cl.items,
                { id: Date.now().toString(), text, checked: false },
              ],
            }
          : cl
      )
    );
  };
  const handleDeleteChecklistItem = (clId, itemId) => {
    setChecklists(
      checklists.map((cl) =>
        cl.id === clId
          ? { ...cl, items: cl.items.filter((item) => item.id !== itemId) }
          : cl
      )
    );
  };
  const handleToggleChecklistItem = (clId, itemId) => {
    setChecklists(
      checklists.map((cl) =>
        cl.id === clId
          ? {
              ...cl,
              items: cl.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : cl
      )
    );
  };

  const handleFormSubmit = async (data) => {
    setComponentLoading(`card-form-${columnId}`, true, "Saving card...");
    try {
      await onSubmit({
        ...data,
        labels,
        dueDate,
        checklists,
      });
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
          ref={titleInputRef}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {!showDetails && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDetails(true)}
        >
          + Add details
        </Button>
      )}

      {showDetails && (
        <>
          {/* Labels */}
          <div className="mb-2">
            <div className="flex gap-2 mb-2 flex-wrap">
              {labels.map((label, i) => (
                <span
                  key={label.name + i}
                  className="px-2 py-0.5 rounded text-xs font-semibold flex items-center"
                  style={{ backgroundColor: label.color, color: "#fff" }}
                >
                  {label.name}
                  <button
                    className="ml-2 text-xs text-white hover:text-gray-200"
                    onClick={() => handleDeleteLabel(i)}
                    title="Remove label"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="border rounded px-2 py-1 text-xs"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Label name"
              />
              <input
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="w-8 h-8 p-0 border-none bg-transparent"
                title="Pick label color"
              />
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                onClick={handleAddLabel}
                type="button"
              >
                Add label
              </button>
            </div>
          </div>
          {/* Due Date */}
          <div className="mb-2 flex gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold mb-1">Start Date</div>
              <DayPicker
                mode="single"
                selected={dueDate.start ? new Date(dueDate.start) : undefined}
                onSelect={(date) => handleDateChange("start", date)}
              />
              {dueDate.start && (
                <div className="text-xs mt-1">
                  {dueDate.start.toLocaleDateString()}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold mb-1">End Date</div>
              <DayPicker
                mode="single"
                selected={dueDate.end ? new Date(dueDate.end) : undefined}
                onSelect={(date) => handleDateChange("end", date)}
              />
              {dueDate.end && (
                <div className="text-xs mt-1">
                  {dueDate.end.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          {/* Checklists */}
          <div className="mb-2">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border rounded px-2 py-1 text-xs"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Checklist title"
              />
              <button
                className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                onClick={handleAddChecklist}
                type="button"
              >
                Add Checklist
              </button>
            </div>
            {checklists.map((cl, clIdx) => (
              <div key={cl.id} className="bg-gray-100 rounded p-2 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    className="font-semibold text-xs border-b border-gray-300 bg-transparent flex-1"
                    value={cl.title}
                    onChange={(e) =>
                      handleChecklistTitleChange(cl.id, e.target.value)
                    }
                  />
                  <button
                    className="text-xs text-red-500 ml-2"
                    onClick={() => handleDeleteChecklist(cl.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
                {/* Checklist items */}
                {cl.items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleChecklistItem(cl.id, item.id)}
                    />
                    <input
                      className="flex-1 text-xs border-b border-gray-200 bg-transparent"
                      value={item.text}
                      onChange={(e) => {
                        const newText = e.target.value;
                        setChecklists(
                          checklists.map((c) =>
                            c.id === cl.id
                              ? {
                                  ...c,
                                  items: c.items.map((it) =>
                                    it.id === item.id
                                      ? { ...it, text: newText }
                                      : it
                                  ),
                                }
                              : c
                          )
                        );
                      }}
                    />
                    <button
                      className="text-xs text-red-400"
                      onClick={() => handleDeleteChecklistItem(cl.id, item.id)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {/* Add item input */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    className="flex-1 text-xs border-b border-gray-200 bg-transparent"
                    placeholder="Add item..."
                    value={cl._newItem || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChecklists(
                        checklists.map((c) =>
                          c.id === cl.id ? { ...c, _newItem: val } : c
                        )
                      );
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        cl._newItem &&
                        cl._newItem.trim()
                      ) {
                        handleAddChecklistItem(cl.id, cl._newItem.trim());
                        setChecklists(
                          checklists.map((c) =>
                            c.id === cl.id ? { ...c, _newItem: "" } : c
                          )
                        );
                      }
                    }}
                  />
                  <button
                    className="text-xs text-green-600"
                    type="button"
                    onClick={() => {
                      if (cl._newItem && cl._newItem.trim()) {
                        handleAddChecklistItem(cl.id, cl._newItem.trim());
                        setChecklists(
                          checklists.map((c) =>
                            c.id === cl.id ? { ...c, _newItem: "" } : c
                          )
                        );
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
