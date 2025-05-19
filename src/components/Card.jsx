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

  // Checklist progress
  const checklistTotal = card.checklist?.total || 0;
  const checklistCompleted = card.checklist?.completed || 0;
  const checklistProgress = checklistTotal
    ? Math.round((checklistCompleted / checklistTotal) * 100)
    : 0;

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
          }`}
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
          <span className="text-white text-sm md:text-base pr-2">
            {card.title}
          </span>
          {card.description && card.description.trim() !== "" && (
            <span className="text-gray-300 text-xs mt-1 line-clamp-2">
              {card.description}
            </span>
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
