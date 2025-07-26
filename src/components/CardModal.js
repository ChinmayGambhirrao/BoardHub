import React, { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "react-day-picker/dist/style.css"; // Import default calendar styles

const CardModal = ({ card, onClose, onUpdate, onDelete }) => {
  // Local state for editing
  const [title, setTitle] = useState(card.title || "");
  const [description, setDescription] = useState(card.description || "");
  const [labels, setLabels] = useState(card.labels || []);
  const [labelInput, setLabelInput] = useState("");
  const [labelColor, setLabelColor] = useState("#1976d2");
  const [dueDate, setDueDate] = useState(
    card.dueDate || { start: null, end: null }
  );
  const [checklists, setChecklists] = useState(card.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");

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
  // Checklist item reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const [clId, type] = result.type.split(":");
    if (type === "item") {
      const cl = checklists.find((c) => c.id === clId);
      if (!cl) return;
      const items = Array.from(cl.items);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      setChecklists(
        checklists.map((c) => (c.id === clId ? { ...c, items } : c))
      );
    } else if (type === "checklist") {
      const newChecklists = Array.from(checklists);
      const [removed] = newChecklists.splice(result.source.index, 1);
      newChecklists.splice(result.destination.index, 0, removed);
      setChecklists(newChecklists.map((cl, i) => ({ ...cl, order: i })));
    }
  };

  // Save handler
  const handleSave = () => {
    onUpdate({
      ...card,
      title,
      description,
      labels,
      dueDate,
      checklists,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-[#22272b] rounded-lg shadow-xl max-w-2xl w-full mx-auto p-0 relative border border-gray-700 max-h-[90vh] flex flex-col">
        {/* Fixed close button */}
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white z-20"
          onClick={onClose}
          style={{ zIndex: 2 }}
        >
          <X className="h-6 w-6" />
        </button>
        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <input
              className="w-full text-2xl font-bold mb-2 border-b border-gray-700 focus:outline-none focus:border-blue-500 bg-transparent text-white placeholder:text-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              autoFocus
            />
            <textarea
              className="w-full text-base border-b border-gray-700 focus:outline-none focus:border-blue-500 bg-transparent resize-none mb-2 text-white placeholder:text-gray-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={2}
            />
          </div>
          {/* Labels */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2 flex-wrap">
              {labels.map((label, i) => (
                <span
                  key={label.name + i}
                  className="px-2 py-0.5 rounded text-xs font-semibold flex items-center bg-gray-800"
                  style={{ backgroundColor: label.color, color: "#fff" }}
                >
                  {label.name}
                  <button
                    className="ml-2 text-xs text-white hover:text-gray-300"
                    onClick={() => handleDeleteLabel(i)}
                    title="Remove label"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="border border-gray-700 rounded px-2 py-1 text-xs bg-gray-900 text-white placeholder:text-gray-400"
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
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                onClick={handleAddLabel}
                type="button"
              >
                Add label
              </button>
            </div>
          </div>
          {/* Due Date */}
          <div className="mb-4 flex gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold mb-1 text-white">
                Start Date
              </div>
              <DayPicker
                mode="single"
                selected={dueDate.start ? new Date(dueDate.start) : undefined}
                onSelect={(date) => handleDateChange("start", date)}
              />
              {dueDate.start && (
                <div className="text-xs mt-1 text-gray-300">
                  {format(new Date(dueDate.start), "MMM d, yyyy")}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold mb-1 text-white">
                End Date
              </div>
              <DayPicker
                mode="single"
                selected={dueDate.end ? new Date(dueDate.end) : undefined}
                onSelect={(date) => handleDateChange("end", date)}
              />
              {dueDate.end && (
                <div className="text-xs mt-1 text-gray-300">
                  {format(new Date(dueDate.end), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
          {/* Checklists */}
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border border-gray-700 rounded px-2 py-1 text-xs bg-gray-900 text-white placeholder:text-gray-400"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Checklist title"
              />
              <button
                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                onClick={handleAddChecklist}
                type="button"
              >
                Add Checklist
              </button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="checklists" type="checklist">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {checklists.map((cl, clIdx) => (
                      <Draggable key={cl.id} draggableId={cl.id} index={clIdx}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gray-800 rounded p-2 mb-2 border border-gray-700"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-move text-gray-400"
                              >
                                ☰
                              </span>
                              <input
                                className="font-semibold text-xs border-b border-gray-700 bg-transparent flex-1 text-white placeholder:text-gray-400"
                                value={cl.title}
                                onChange={(e) =>
                                  handleChecklistTitleChange(
                                    cl.id,
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                className="text-xs text-red-400 ml-2 hover:text-red-300"
                                onClick={() => handleDeleteChecklist(cl.id)}
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                            {/* Checklist items */}
                            <Droppable droppableId={cl.id} type={`${cl.id}:item`}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {cl.items.map((item, idx) => (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={idx}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="flex items-center gap-2 mb-1"
                                        >
                                          <span
                                            {...provided.dragHandleProps}
                                            className="cursor-move text-gray-400"
                                          >
                                            ⋮
                                          </span>
                                          <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() =>
                                              handleToggleChecklistItem(
                                                cl.id,
                                                item.id
                                              )
                                            }
                                          />
                                          <input
                                            className="flex-1 text-xs border-b border-gray-700 bg-transparent text-white placeholder:text-gray-400"
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
                                                            ? {
                                                                ...it,
                                                                text: newText,
                                                              }
                                                            : it
                                                        ),
                                                      }
                                                    : c
                                                )
                                              );
                                            }}
                                          />
                                          <button
                                            className="text-xs text-red-400 hover:text-red-300"
                                            onClick={() =>
                                              handleDeleteChecklistItem(
                                                cl.id,
                                                item.id
                                              )
                                            }
                                            type="button"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  {/* Add item input */}
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      className="flex-1 text-xs border-b border-gray-700 bg-transparent text-white placeholder:text-gray-400"
                                      placeholder="Add item..."
                                      value={cl._newItem || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setChecklists(
                                          checklists.map((c) =>
                                            c.id === cl.id
                                              ? { ...c, _newItem: val }
                                              : c
                                          )
                                        );
                                      }}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" &&
                                          cl._newItem &&
                                          cl._newItem.trim()
                                        ) {
                                          handleAddChecklistItem(
                                            cl.id,
                                            cl._newItem.trim()
                                          );
                                          setChecklists(
                                            checklists.map((c) =>
                                              c.id === cl.id
                                                ? { ...c, _newItem: "" }
                                                : c
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <button
                                      className="text-xs text-green-400 hover:text-green-300"
                                      type="button"
                                      onClick={() => {
                                        if (cl._newItem && cl._newItem.trim()) {
                                          handleAddChecklistItem(
                                            cl.id,
                                            cl._newItem.trim()
                                          );
                                          setChecklists(
                                            checklists.map((c) =>
                                              c.id === cl.id
                                                ? { ...c, _newItem: "" }
                                                : c
                                            )
                                          );
                                        }
                                      }}
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSave}
              type="button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
