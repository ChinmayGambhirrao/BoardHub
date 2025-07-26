import React, { useState, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Calendar, Users, Paperclip, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import useSwipe from "../hooks/useSwipe";

// Mobile-optimized card component
const Card = ({ card, index, listId, onOpenCard, onDeleteCard }) => {
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // Handle swipe left to reveal delete button
  const handleSwipeLeft = () => {
    // Only on mobile devices
    if (window.innerWidth <= 768) {
      setSwipeOffset(-60); // Reveal delete button
      setShowActions(true);
    }
  };

  // Handle swipe right to hide delete button
  const handleSwipeRight = () => {
    if (swipeOffset < 0) {
      setSwipeOffset(0); // Hide delete button
      setShowActions(false);
    }
  };

  // Reset swipe state on touch end
  const handleTouchEnd = () => {
    // If not swiped far enough, reset
    if (swipeOffset > -30 && swipeOffset < 0) {
      setSwipeOffset(0);
      setShowActions(false);
    }
  };

  // Use our swipe hook
  useSwipe(handleSwipeLeft, handleSwipeRight);

  // Checklist progress (for new structure)
  let checklistTotal = 0;
  let checklistCompleted = 0;
  if (Array.isArray(card.checklists) && card.checklists.length > 0) {
    card.checklists.forEach((cl) => {
      checklistTotal += cl.items.length;
      checklistCompleted += cl.items.filter((item) => item.checked).length;
    });
  }
  const checklistProgress = checklistTotal
    ? Math.round((checklistCompleted / checklistTotal) * 100)
    : 0;

  // Overdue check
  const isOverdue =
    card.dueDate && card.dueDate.end && new Date(card.dueDate.end) < new Date();

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={(el) => {
            provided.innerRef(el);
            cardRef.current = el;
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`relative bg-gray-800 rounded p-2 md:p-3 mb-2 flex flex-col gap-1 md:gap-2 cursor-pointer hover:bg-gray-700 transition touch-manipulation ${
            snapshot.isDragging ? "opacity-70" : ""
          } ${isOverdue ? "ring-2 ring-red-500" : ""}`}
          style={{
            ...provided.draggableProps.style,
            transform: `${
              provided.draggableProps.style?.transform || ""
            } translateX(${swipeOffset}px)`,
          }}
          onClick={(e) => {
            if (!snapshot.isDragging && !showActions) {
              onOpenCard(card, { _id: listId });
            }
          }}
          onTouchEnd={handleTouchEnd}
        >
          {/* Labels */}
          {Array.isArray(card.labels) && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {card.labels.map((label, i) => (
                <span
                  key={label.name + i}
                  className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ backgroundColor: label.color, color: "#fff" }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <span className="text-white text-sm md:text-base pr-2">
            {card.title}
          </span>
          {card.description && card.description.trim() !== "" && (
            <span className="text-gray-300 text-xs mt-1 line-clamp-2">
              {card.description}
            </span>
          )}

          {/* Due Date */}
          {card.dueDate && card.dueDate.end && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar
                size={14}
                className={isOverdue ? "text-red-400" : "text-blue-400"}
              />
              <span
                className={`text-xs ${
                  isOverdue ? "text-red-400" : "text-blue-200"
                }`}
              >
                {format(new Date(card.dueDate.end), "MMM d, yyyy")}
              </span>
            </div>
          )}

          {/* Checklist Progress */}
          {checklistTotal > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <CheckSquare size={14} className="text-green-400" />
              <span className="text-xs text-green-200">
                ✓ {checklistCompleted}/{checklistTotal}
              </span>
            </div>
          )}

          {/* Mobile swipe action */}
          <div
            className="absolute right-0 top-0 bottom-0 bg-red-500 rounded-r flex items-center justify-center w-12 opacity-0 md:hidden"
            style={{ opacity: showActions ? 1 : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onDeleteCard) {
                onDeleteCard(card._id, listId);
                setSwipeOffset(0);
                setShowActions(false);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
